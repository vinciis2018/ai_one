import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.task import PipelineTask
from pipecat.pipeline.runner import PipelineRunner
from pipecat.services.elevenlabs import ElevenLabsTTSService
from pipecat.frames.frames import TextFrame, TTSStoppedFrame, EndFrame
from pipecat.processors.logger import FrameLogger
from pipecat.transcriptions.language import Language

load_dotenv()

async def main():
    api_key = os.getenv("ELEVEN_LABS_API") or "sk_65e031b02c2b0e6f75389419c7d4ddac01952100ef5e094e"
    print(f"Using API Key: {api_key[:5]}...{api_key[-5:]}")

    tts = ElevenLabsTTSService(
        api_key=api_key,
        voice_id="21m00Tcm4TlvDq8ikWAM", # Rachel
        model="eleven_flash_v2_5",
        params=ElevenLabsTTSService.InputParams(
            language=Language.EN,
            enable_logging=True
        )
    )

    logger = FrameLogger("TestLogger")

    pipeline = Pipeline([tts, logger])

    task = PipelineTask(pipeline)
    runner = PipelineRunner()

    async def run():
        await task.queue_frame(TextFrame(text="Hello world, this is a test of ElevenLabs TTS."))
        # Wait a bit for processing
        await asyncio.sleep(5)
        await task.queue_frame(EndFrame())

    await asyncio.gather(runner.run(task), run())

if __name__ == "__main__":
    asyncio.run(main())
