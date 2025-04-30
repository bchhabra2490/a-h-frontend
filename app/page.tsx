'use client';

import { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';

export default function Home() {
  const [soapNote, setSoapNote] = useState('');

  const handleSoapNoteUpdate = (newSoapNote: string) => {
    setSoapNote(newSoapNote);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Medical Transcription & SOAP Note Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Audio Recorder</h2>
          <AudioRecorder 
            onSoapNoteUpdate={handleSoapNoteUpdate}
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">SOAP Note</h2>
          <div className="bg-white p-4 rounded-lg shadow min-h-[200px]">
            {soapNote ? (
              <div className="whitespace-pre-wrap text-gray-800">{soapNote}</div>
            ) : (
              <p className="text-gray-500">Start recording to generate a SOAP note</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 