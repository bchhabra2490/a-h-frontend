'use client';

import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface AudioRecorderProps {
  onSoapNoteUpdate: (soapNote: string) => void;
}

interface TranscriptEvent {
  text: string;
  startInterval: number;
  endInterval: number;
}

interface SoapNoteEvent {
  text: string;
}

interface ErrorEvent {
  message: string;
}

export default function AudioRecorder({ onSoapNoteUpdate }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('transcript', ({ text, startInterval, endInterval }: TranscriptEvent) => {
      console.log('Received transcript:', { text, startInterval, endInterval });
      setTranscript(prev => prev + (prev ? ' ' : '') + text);
    });

    socket.on('soap-notes', ({ text }: SoapNoteEvent) => {
      console.log('Received SOAP note:', text);
      onSoapNoteUpdate(text);
    });

    socket.on('error', ({ message }: ErrorEvent) => {
      console.error('WebSocket error:', message);
    });

    return () => {
      socket.disconnect();
    };
  }, [onSoapNoteUpdate]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      audioChunksRef.current = [];

      // Initialize audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Get audio stream from microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      streamRef.current = stream;
      
      // Create MediaRecorder instance with specific options
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          socketRef.current?.emit('audio-data', event.data);
        }
      };

      // Start recording with a smaller timeslice for more frequent updates
      mediaRecorder.start(5000); // Collect data every 5 seconds

      // Notify server to start transcription
      socketRef.current?.emit('start-recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        await audioContextRef.current.close();
      }
      
      socketRef.current?.emit('stop-recording');
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex space-x-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-lg ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-semibold transition-colors`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
      
      <div className="w-full max-w-2xl">
        <div className="bg-gray-100 p-4 rounded-lg min-h-[200px]">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Live Transcript</h3>
          <div className="whitespace-pre-wrap bg-white p-4 rounded shadow text-gray-800">
            {transcript || 'No transcript available yet...'}
          </div>
        </div>
      </div>
    </div>
  );
}
