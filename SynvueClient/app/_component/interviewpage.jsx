"use client";

import React, { useEffect, useState, useContext, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useWebSocket from "@/hooks/usewebsocket";
import { DataContext } from "../DataProvider";
import { Mic, PhoneOff } from "lucide-react";
import Sidebar from "./Sidebar";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

const InterviewPage = () => {
  const { messages, sendMessage, sendUserResponse, isReady } = useWebSocket(
    "wss://synvueai.onrender.com/ws"
  );
  const params = useSearchParams();
  const { minutes, setminutes, userprofile, interviewduration } = useContext(DataContext);
  const [timeLeft, setTimeLeft] = useState(() => (interviewduration ? interviewduration * 60 : 0));
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [callEnded, setCallEnded] = useState(false);
  const [callendprocess, setcallendprocess] = useState(false);
  const [interviewState, setInterviewState] = useState("loading");
  const [startUserResponse, setStartUserResponse] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const router = useRouter();

  const interviewId = params.get("id");
  const email = params.get("mail");

  // Load Google voice
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const voiceToUse =
        voices.find((v) => v.name === "Google US English") ||
        voices.find((v) => v.lang === "en-US") ||
        voices[0];
      setSelectedVoice(voiceToUse);
    };

    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    loadVoices();

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Countdown timer with toast warning
  useEffect(() => {
    if (interviewState !== "ready") return;
  
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          endCall(); 
          return 0;
        }
  
        // Show warning at 2 minutes left
        if (prevTime === 121) {
          toast("⏳ Hurry up! Only 2 minutes left!");
        }
  
        return prevTime - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer); 
  }, [interviewState]); 
  

  const endCall = () => {
    handlecallend();
    setcallendprocess(true);
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  };

  // Fetch Interview Data from DB
  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!interviewId || !email || !isReady) return;
      try {
        const response = await fetch(
          `/api/interviewdata?mail=${email}&interviewid=${interviewId}`
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();

        if (result?.interviewdetails) {
          setminutes(result.minutes);
          sendMessage({
            username: result.name || userprofile.name || "Candidate",
            jobrole: result.interviewdetails.domain || "Software Engineer",
            questions: result.interviewdetails.questions || [],
          });
          setInterviewState("ready");
        } else {
          setInterviewState("error");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setInterviewState("error");
      }
    };

    fetchInterviewData();
  }, [interviewId, email, isReady]);

  // Text-to-speech on AI response
  useEffect(() => {
    if (!messages.length) return;
    const latestMessage = messages[messages.length - 1];

    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    const utterance = new SpeechSynthesisUtterance(latestMessage);
    utterance.voice = selectedVoice;
    utterance.onend = () => setStartUserResponse(true);
    window.speechSynthesis.speak(utterance);
  }, [messages]);

  // Start speech recognition after voice finishes
  useEffect(() => {
    if (!startUserResponse || recognitionRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.addEventListener("result", (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(text);
      debounceSend(text);
    });

    recognition.start();
    recognitionRef.current = recognition;
  }, [startUserResponse]);

  // Cleanup on unmount
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

  const handlecallend = async () => {
    const profileminutesleft = minutes - (interviewduration-timeLeft);
    try {
      const response = await fetch("/api/createuser", {
        method: "PUT",
        body: JSON.stringify({
          minutes: profileminutesleft,
          email: email,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setCallEnded(true);
        setcallendprocess(false);
        router.push("/");
      }
    } catch (error) {
      toast(error.message || "Error ending interview");
    }
  };

  const candidatename = userprofile?.name || "Candidate";
  const firstletter = candidatename[0];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (!isReady || interviewState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
        <FaSpinner className="animate-spin text-blue-600" />
        <h2 className="text-xl font-semibold">Connecting to AI Recruiter...</h2>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we set up your interview session.
        </p>
      </div>
    );
  }

  if (interviewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-red-600">
        <h2 className="text-xl font-semibold">Error starting interview</h2>
        <p className="text-sm">Please try again later.</p>
      </div>
    );
  }

  return callendprocess ? (
    <div className="flex flex-col items-center justify-center h-screen text-center text-red-600">
      <FaSpinner className="animate-spin" />
      <h2 className="text-xl font-semibold">Ending Interview...</h2>
      <p className="text-sm">
        Hold tight! We hope you enjoyed the interview session — your feedback is always welcome.
      </p>
    </div>
  ) : (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-blue-800">🎯 AI Interview Session</h2>
          <div className="text-sm md:text-base text-gray-700 bg-blue-100 px-4 py-2 rounded-full shadow">
            ⏳ Time Remaining: <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Avatars */}
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 mb-6 items-center justify-center">
          {/* AI Avatar */}
          <div className="w-44 h-44 bg-white shadow-xl rounded-2xl flex flex-col items-center justify-center px-4 py-6 hover:scale-105 transition">
            <div className={`w-16 h-16 rounded-full mb-3 overflow-hidden ${messages.length ? "animate-pulse" : ""}`}>
              <img src="/IntervueLogo.png" alt="AI Recruiter" className="w-full h-full object-cover" />
            </div>
            <p className="font-medium text-gray-800">SynvueAI</p>
          </div>

          {/* Candidate Avatar */}
          <div className="w-44 h-44 bg-white shadow-xl rounded-2xl flex flex-col items-center justify-center px-4 py-6 hover:scale-105 transition">
            <div className={`w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl mb-3 ${startUserResponse ? "animate-pulse" : ""}`}>
              {firstletter}
            </div>
            <p className="font-medium text-gray-800">{candidatename}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-300 transition">
            <Mic className="text-gray-700" />
          </button>
          <button
            className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition"
            onClick={endCall}
          >
            <PhoneOff />
          </button>
        </div>

        <p className="text-gray-600 text-center text-sm mb-4 italic">Interview in Progress...</p>

        {/* Message Box */}
        <div className="bg-white max-w-3xl mx-auto w-full rounded-lg p-4 shadow-md overflow-y-auto max-h-64">
          {messages.map((msg, index) => (
            <p key={index} className="text-sm text-gray-800 mb-2">{msg}</p>
          ))}
        </div>

        {/* Live Transcript */}
        {startUserResponse && (
          <p className="italic text-sm text-blue-600 mt-4 text-center">
            🎙️ Listening: {transcript}
          </p>
        )}
      </main>
    </div>
  );
};

// Debounce function
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default InterviewPage;
