import React, { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { BASE_URL } from '../constants/helperConstants';

interface VoiceAssistantContextType {
  connect: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  isConnected: boolean;
  isPlaying: boolean;
  isSessionActive: boolean;
  audioBuffer: Blob[];
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | null>(null);

export const VoiceAssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<Blob[]>([]);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // --- Helper: Setup Audio Element ---
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.autoplay = true;
    audio.style.display = "none";
    document.body.appendChild(audio);
    audioRef.current = audio;
    console.log("VoiceAssistantProvider: Audio element created");

    return () => {
      console.log("VoiceAssistantProvider: UNMOUNT - Cleanup");
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current && document.body.contains(audioRef.current)) {
        document.body.removeChild(audioRef.current);
      }
      audioRef.current = null;
      pcRef.current?.close();
    };
  }, []);

  // --- Helper: Setup Recording ---
  const setupRecording = useCallback((stream: MediaStream) => {
    try {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          setAudioBuffer(prev => [...prev, e.data]);
        }
      };

      recorder.start(1000); // 1-second chunks
      console.log("VoiceAssistantProvider: Recording started");
    } catch (err) {
      console.error("VoiceAssistantProvider: Recording setup failed", err);
    }
  }, []);

  // --- Helper: Setup Silence Detection ---
  const setupSilenceDetection = useCallback((stream: MediaStream) => {
    try {
      if (!audioContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.1;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Analysis Loop
      let silenceStart = 0;
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // CRITICAL: If audio is manually paused, ignoring incoming stream data
        if (audioRef.current && audioRef.current.paused) {
          setIsPlaying(false);
          // Keep isSessionActive true (implicit, since we don't set it to false)
        }
        else if (average > 10) {
          silenceStart = 0; // Reset silence timer
          setIsPlaying(true);
          setIsSessionActive(true);
        } else {
          if (silenceStart === 0) {
            silenceStart = Date.now();
          } else if (Date.now() - silenceStart > 1000) {
            // If silent for > 1 second, consider it stopped
            setIsPlaying(false);
            setIsSessionActive(false);
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };

      // Cancel old loop if any
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      checkAudioLevel();
      console.log("VoiceAssistantProvider: Analysis Loop Started");

    } catch (e) {
      console.error("VoiceAssistantProvider: Analysis Setup Failed", e);
    }
  }, []);

  // --- Helper: Handle Incoming Track ---
  const handleTrack = useCallback((event: RTCTrackEvent) => {
    console.log("Received track", event.track.kind);
    const stream = event.streams[0] || new MediaStream([event.track]);

    // 1. Playback via DOM element
    if (audioRef.current) {
      // Prevent re-attaching the same stream if ontrack fires multiple times
      if (audioRef.current.srcObject === stream) {
        audioRef.current.play().catch(e => console.error("Auto-play failed", e));
        console.log("VoiceAssistantProvider: Stream already attached, skipping.");
        setIsPlaying(true);
        return;
      }
      audioRef.current.srcObject = stream;
      // User requested: audioRef.current.play().catch(e => console.error("Auto-play failed", e));
    }

    // 2. Setup Recording
    setupRecording(stream);

    // 3. Setup Silence Detection
    setupSilenceDetection(stream);

  }, [setupRecording, setupSilenceDetection]);

  // --- Helper: Perform Signaling ---
  const performSignaling = useCallback(async (pc: RTCPeerConnection) => {
    // Wait for ICE gathering to complete
    await new Promise<void>((resolve) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkIce = () => {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkIce);
            resolve();
          }
        };
        pc.addEventListener('icegatheringstatechange', checkIce);
      }
    });

    const localSdp = pc.localDescription;
    if (!localSdp) {
      console.error("Failed to gather ICE candidates");
      return;
    }

    // Send Offer to Server
    const apiUrl = import.meta.env.VITE_PIPECAT_API_URL || BASE_URL;
    const baseUrl = apiUrl.replace(/\/$/, "");
    const endpoint = `${baseUrl}/speech/connect`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: localSdp.sdp,
          type: localSdp.type
        })
      });

      if (!response.ok) {
        throw new Error(`Signaling failed: ${response.status}`);
      }

      const answer = await response.json();
      await pc.setRemoteDescription(answer);

    } catch (e) {
      console.error("WebRTC Connection failed", e);
      pc.close();
      pcRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // --- Main: Connect ---
  const connect = useCallback(async () => {
    if (pcRef.current && (pcRef.current.connectionState === 'connected' || pcRef.current.connectionState === 'connecting')) {
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    // Create Data Channel for sending text
    const dc = pc.createDataChannel("text");
    dcRef.current = dc;

    dc.onopen = () => {
      console.log("Data Channel Open");
      setIsConnected(true);
    };
    dc.onmessage = (event) => console.log("Data channel message", event.data);
    dc.onclose = () => {
      console.log("Data Channel Closed");
      setIsConnected(false);
    };

    pc.onconnectionstatechange = () => console.log("VoiceAssistantProvider: Connection State Change:", pc.connectionState);
    pc.oniceconnectionstatechange = () => console.log("VoiceAssistantProvider: ICE Connection State Change:", pc.iceConnectionState);
    pc.ontrack = handleTrack;
    pc.addTransceiver('audio', { direction: 'recvonly' });

    // Create Offer & Start Signaling
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await performSignaling(pc);

  }, [handleTrack, performSignaling]);


  const speak = useCallback(async (text: string) => {
    // Clear previous buffer
    setAudioBuffer([]);

    // Resume Audio element logic
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error("Auto-play failed", e));
      // We don't force setIsPlaying(true) here; let silence detection handle it when audio arrives
    }

    // Connect if needed
    if (!dcRef.current || dcRef.current?.readyState !== 'open') {
      await connect();
      // Wait for connection
      let retries = 0;
      while (retries < 20 && (!dcRef.current || dcRef.current.readyState !== 'open')) {
        await new Promise(r => setTimeout(r, 100));
        retries++;
      }
    }

    if (dcRef.current?.readyState === 'open') {
      const payload = { type: "message", text: text };
      dcRef.current.send(JSON.stringify(payload));
    } else {
      console.warn("VoiceAssistantProvider: Voice Assistant not connected");
    }
  }, [connect]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    // Do NOT set isSessionActive to false, so we know we can resume
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error("Resume failed", e));
      setIsPlaying(true);
    }
  }, []);


  return (
    <VoiceAssistantContext.Provider value={{ connect, speak, pause, resume, isConnected, isPlaying, isSessionActive, audioBuffer }}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};
