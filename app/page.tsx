'use client';

import { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import SoapNote from './types';

export default function Home() {
  const [soapNotes, setSoapNotes] = useState<SoapNote[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleSoapNoteUpdate = (newSoapNotes: SoapNote[]) => {
    setSoapNotes(newSoapNotes);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Medical Transcription & SOAP Note Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Audio Recorder</h2>
          <AudioRecorder 
            onSoapNoteUpdate={handleSoapNoteUpdate}
            selectedIndices={selectedIndices}
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">SOAP Note</h2>
          <div className="bg-white p-4 rounded-lg shadow min-h-[200px]">
            {soapNotes.length > 0 ? (
              soapNotes.map((note, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{note.category}</h3>
                  {note.notes.map((note, index) => (
                    <div key={index} className="whitespace-pre-wrap text-gray-800"
                    onMouseEnter={() => setSelectedIndices(note.transcriptIndices)}
                    onMouseLeave={() => setSelectedIndices([])}
                    >{note.content}</div>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Start recording to generate a SOAP note</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 