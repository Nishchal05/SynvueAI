"use client";

import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import useWebSocket from '@/hooks/usewebsocket';
import { DataContext } from '../DataProvider';
import { Mic, PhoneOff } from 'lucide-react';
import Sidebar from './Sidebar';

const InterviewPage = () => {
  const { messages, sendMessage, sendUserResponse, isReady } = useWebSocket('wss://synvueai.onrender.com/ws');
  const params = useSearchParams();
  const { setminutes, userprofile } = useContext(DataContext);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [interviewState, setInterviewState] = useState('loading');
  const [startUserResponse, setStartUserResponse] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const interviewId = params.get("id");
  const email = params.get("mail");

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      let voiceToUse = voices.find(v => v.name === 'Google US English') || voices.find(v => v.lang === 'en-US') || voices[0];
      setSelectedVoice(voiceToUse);
    };

    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    loadVoices();
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!interviewId || !email || !isReady) return;
      try {
        const response = await fetch(`/api/interviewdata?mail=${email}&interviewid=${interviewId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();

        if (result?.interviewdetails) {
          setminutes(result.minutes);
          sendMessage({
            username: result.name || userprofile.name || "Candidate",
            jobrole: result.interviewdetails.domain || "Software Engineer",
            questions: result.interviewdetails.questions || []
          });
          setInterviewState('ready');
        } else {
          setInterviewState('error');
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setInterviewState('error');
      }
    };

    fetchInterviewData();
  }, [interviewId, email, isReady]);

  useEffect(() => {
    if (!messages.length) return;
    const latestMessage = messages[messages.length - 1];

    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const utterance = new SpeechSynthesisUtterance(latestMessage);
    utterance.voice = selectedVoice;
    utterance.onend = () => setStartUserResponse(true);
    window.speechSynthesis.speak(utterance);
  }, [messages]);

  useEffect(() => {
    if (!startUserResponse || recognitionRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return console.error("SpeechRecognition not supported");

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.addEventListener('result', (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(text);
      debounceSend(text);
    });

    recognition.start();
    recognitionRef.current = recognition;
  }, [startUserResponse]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const debounceSend = debounce((text) => {
    sendUserResponse(text);
    setStartUserResponse(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, 4000);

  if (!isReady || interviewState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
        <h2 className="text-xl font-semibold">Connecting to AI Recruiter...</h2>
        <p className="text-sm text-gray-500 mt-2">Please wait while we set up your interview session.</p>
      </div>
    );
  }
  
  if (interviewState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-red-600">
        <h2 className="text-xl font-semibold">Error starting interview</h2>
        <p className="text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row">
    
    {/* Sidebar */}
    <Sidebar/>

    {/* Main Interview Section */}
    <main className="flex-1 flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-semibold mb-6 text-center md:text-left">AI Interview Session</h2>
      
      <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 mb-6 items-center">
        <div className="w-40 h-40 bg-white shadow rounded-xl flex items-center justify-center flex-col">
          <img src="/ai-profile.png" className="w-16 h-16 rounded-full mb-2" alt="AI Recruiter" />
          <p className="font-medium">AI Recruiter</p>
        </div>
        <div className="w-40 h-40 bg-white shadow rounded-xl flex items-center justify-center flex-col">
          <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl mb-2">T</div>
          <p className="font-medium">Tubeguruji</p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <button className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <Mic className="text-gray-700" />
        </button>
        <button className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center">
          <PhoneOff />
        </button>
      </div>

      <p className="text-gray-500 text-sm mb-4">Interview in Progress...</p>

      <div className="bg-white max-w-2xl w-full rounded p-4 shadow overflow-y-auto max-h-64">
        {messages.map((msg, index) => (
          <p key={index} className="text-sm mb-2">{msg}</p>
        ))}
      </div>

      <p className="italic text-sm text-gray-700 mt-4">🎙️ Listening: {transcript}</p>
    </main>
  </div>
  );
};

// Debounce
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default InterviewPage;
