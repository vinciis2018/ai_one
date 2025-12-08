import os
import asyncio
from typing import Any, Dict

from fastapi import APIRouter
from pydantic import BaseModel

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.task import PipelineTask, PipelineParams
from pipecat.pipeline.runner import PipelineRunner
from pipecat.services.google.tts import GoogleTTSService
from pipecat.transcriptions.language import Language
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.frames.frames import TextFrame, EndFrame, ErrorFrame, TTSStartedFrame, TTSStoppedFrame
from pipecat.processors.logger import FrameLogger
from app.core.logger_middleware import logger

router = APIRouter()

# Global dict to hold active peer connections (for cleanup/debugging)
# In production, use a proper session manager
pcs = set()

class OfferRequest(BaseModel):
    sdp: str
    type: str

# @router.post("/connect/google-tts")
@router.post("/connect")
async def connect_webrtc(offer: OfferRequest):

    connection = SmallWebRTCConnection()
    
    # Initialize with SDP offer
    await connection.initialize(offer.sdp, offer.type)

    transport = SmallWebRTCTransport(
        webrtc_connection=connection,
        params=TransportParams(
            audio_out_enabled=True,
            audio_in_enabled=False,
            camera_out_enabled=False,
            vad_enabled=False
        )
    )

    # Google TTS Service
    # Use credentials from GOOGLE_APP_KEY.json in the backend root
    credentials_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../GOOGLE_APP_KEY.json"))
    
    if not os.path.exists(credentials_path):
        logger.error(f"Google credentials file not found at: {credentials_path}")
    else:
        logger.info(f"Using Google Credentials from: {credentials_path}")

    # Custom wrapper to force immediate TTS synthesis with interruption support
    class DirectGoogleTTS(GoogleTTSService):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)
            self._current_task_id = 0

        async def process_frame(self, frame, direction):
            if isinstance(frame, TextFrame):
                await self.start_processing_metrics()
                await self.push_frame(TTSStartedFrame())
                
                # Increment task ID to invalidate previous tasks
                self._current_task_id += 1
                my_task_id = self._current_task_id
                
                try:
                    # Manually trigger run_tts to bypass buffering
                    msg_generator = self.run_tts(frame.text)
                    async for audio_frame in msg_generator:
                        # Check for interruption
                        if self._current_task_id != my_task_id:
                            logger.info(f"TTS Interrupted for task {my_task_id}")
                            break
                        await self.push_frame(audio_frame)
                    
                    if self._current_task_id == my_task_id:
                        await self.push_frame(TTSStoppedFrame())
                        
                except Exception as e:
                    logger.error(f"TTS generation error: {e}")
                await self.stop_processing_metrics()
            else:
                await super().process_frame(frame, direction)

        def interrupt_current_stream(self):
            # Incrementing the ID effectively cancels the currently running loop
            self._current_task_id += 1
            logger.info("TTS Interruption signal sent")

    # Configure Voice and Speed here
    # Voices: https://cloud.google.com/text-to-speech/docs/voices
    # Supported: Journey voices (e.g. en-US-Journey-F, en-US-Journey-D) or Chirp voices
    # voice_id = "en-US-Journey-F"    
    voice_id = "en-IN-Chirp-HD-D"
    # voice_id = "hi-IN-Chirp3-HD-Iapetus"
    # voice_id="hi-IN-Chirp3-HD-Achird"
    # Speed: 0.25 to 4.0
    speaking_rate = 1.0

    tts = DirectGoogleTTS(
        credentials_path=credentials_path,
        voice_id=voice_id,
        params=GoogleTTSService.InputParams(
            language=Language.EN_IN,
            speaking_rate=speaking_rate
        ),
    )
    
    # Pipeline: Transport Input -> TTS -> Transport Output
    input_transport = transport.input()
    
    # Debug loggers
    logger_in = FrameLogger("FrameLogIn")
    logger_out = FrameLogger("FrameLogOut")
    
    pipeline = Pipeline([
        input_transport, 
        logger_in,   # Log frames entering TTS
        tts, 
        logger_out,  # Log frames exiting TTS
        transport.output()
    ])
    
    async def clear_audio_buffer(transport):
        try:
            if hasattr(transport, "_output") and transport._output:
                # 1. Clear MediaSender queues (High-level buffer)
                if hasattr(transport._output, "_media_senders"):
                    for sender in transport._output._media_senders.values():
                        if hasattr(sender, "_audio_queue") and sender._audio_queue:
                            q = sender._audio_queue
                            logger.info(f"Clearing {q.qsize()} frames from MediaSender queue")
                            while not q.empty():
                                try:
                                    q.get_nowait()
                                    q.task_done()
                                except asyncio.QueueEmpty:
                                    break
                
                # 2. Clear RawAudioTrack chunk queue (Low-level buffer)
                client = transport._output._client
                if hasattr(client, "_audio_output_track") and client._audio_output_track:
                    track = client._audio_output_track
                    if hasattr(track, "_chunk_queue") and track._chunk_queue:
                        q = track._chunk_queue
                        logger.info(f"Clearing {len(q)} chunks from RawAudioTrack buffer")
                        while q:
                            item = q.popleft()
                            # item is (chunk, future)
                            if len(item) > 1 and item[1] and not item[1].done():
                                item[1].set_result(True)
                        logger.info("Audio buffers cleared")
        except Exception as e:
            logger.error(f"Error clearing audio buffer: {e}")

    # Handle incoming data channel messages for TTS
    @transport.event_handler("on_app_message")
    async def on_app_message(transport, message, sender=None):
        logger.info(f"Received message: {message}")
        if isinstance(message, dict) and "text" in message:
            # Interrupt previous speech before processing new text
            tts.interrupt_current_stream()
            await clear_audio_buffer(transport)
            await input_transport.push_frame(TextFrame(text=message["text"]))

    task = PipelineTask(pipeline)
    runner = PipelineRunner()

    async def run_pipeline():
        await runner.run(task)

    # Get Answer from connection
    # SmallWebRTCConnection.initialize creates the answer stored internally
    answer_data = connection.get_answer()
    
    # Start pipeline
    asyncio.create_task(run_pipeline())

    return answer_data




from pipecat.services.elevenlabs import ElevenLabsHttpTTSService
from pipecat.frames.frames import InterruptionFrame
from pipecat.processors.frame_processor import FrameDirection
import aiohttp

@router.post("/connect/eleven-labs")
# @router.post("/connect")
async def connect_webrtc_elevenlabs(offer: OfferRequest):

    connection = SmallWebRTCConnection()
    
    # Initialize with SDP offer
    await connection.initialize(offer.sdp, offer.type)

    transport = SmallWebRTCTransport(
        webrtc_connection=connection,
        params=TransportParams(
            audio_out_enabled=True,
            audio_in_enabled=False,
            camera_out_enabled=False,
            vad_enabled=False
        )
    )

    # ElevenLabs TTS Service
    # Use API Key from .env
    eleven_labs_api_key = os.getenv("ELEVEN_LABS_API")
    if not eleven_labs_api_key:
        logger.error("ELEVEN_LABS_API not found in .env")
        # You might want to raise an HTTPException here
    
    # HTTP Session for ElevenLabs (Create per request for simplicity, or manage globally)
    # In production, use a global session
    session = aiohttp.ClientSession()

    # Voice ID
    # Default: "21m00Tcm4TlvDq8ikWAM" (Rachel)
    # voice_id = "21m00Tcm4TlvDq8ikWAM" 
    voice_id = "8sNEbeluclbr4u71MPb0" # Gaurav

    tts = ElevenLabsHttpTTSService(
        api_key=eleven_labs_api_key,
        voice_id=voice_id,
        aiohttp_session=session,
        model="eleven_flash_v2_5",
        params=ElevenLabsHttpTTSService.InputParams(
            language=Language.EN,
        ),
    )
    
    # Pipeline: Transport Input -> TTS -> Transport Output
    input_transport = transport.input()
    
    # Debug loggers
    logger_in = FrameLogger("FrameLogIn")
    logger_out = FrameLogger("FrameLogOut")
    
    pipeline = Pipeline([
        input_transport, 
        logger_in,   # Log frames entering TTS
        tts, 
        logger_out,  # Log frames exiting TTS
        transport.output()
    ])
    
    async def clear_audio_buffer(transport):
        try:
            if hasattr(transport, "_output") and transport._output:
                # 1. Clear MediaSender queues (High-level buffer)
                if hasattr(transport._output, "_media_senders"):
                    for sender in transport._output._media_senders.values():
                        if hasattr(sender, "_audio_queue") and sender._audio_queue:
                            q = sender._audio_queue
                            logger.info(f"Clearing {q.qsize()} frames from MediaSender queue")
                            while not q.empty():
                                try:
                                    q.get_nowait()
                                    q.task_done()
                                except asyncio.QueueEmpty:
                                    break
                
                # 2. Clear RawAudioTrack chunk queue (Low-level buffer)
                client = transport._output._client
                if hasattr(client, "_audio_output_track") and client._audio_output_track:
                    track = client._audio_output_track
                    if hasattr(track, "_chunk_queue") and track._chunk_queue:
                        q = track._chunk_queue
                        logger.info(f"Clearing {len(q)} chunks from RawAudioTrack buffer")
                        while q:
                            item = q.popleft()
                            # item is (chunk, future)
                            if len(item) > 1 and item[1] and not item[1].done():
                                item[1].set_result(True)
                        logger.info("Audio buffers cleared")
        except Exception as e:
            logger.error(f"Error clearing audio buffer: {e}")

    # Handle incoming data channel messages for TTS
    @transport.event_handler("on_app_message")
    async def on_app_message(transport, message, sender=None):
        logger.info(f"Received message: {message}")
        if isinstance(message, dict) and "text" in message:
            # Interrupt previous speech before processing new text
            # tts.interrupt_current_stream() # HTTP service might not have this method?
            # Standard interruption
            await tts.queue_frame(InterruptionFrame(), FrameDirection.DOWNSTREAM) # Or handle interruption logic manually?
            # Actually, WordTTSService handles interruption if we push InterruptionFrame to it?
            # No, interruption usually clears downstream.
            await clear_audio_buffer(transport)
            await input_transport.push_frame(TextFrame(text=message["text"]))

    task = PipelineTask(pipeline)
    runner = PipelineRunner()

    async def run_pipeline():
        await runner.run(task)
        await session.close() # Clean up session

    # Get Answer from connection
    answer_data = connection.get_answer()
    
    # Start pipeline
    asyncio.create_task(run_pipeline())

    return answer_data


