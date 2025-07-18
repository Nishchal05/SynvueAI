"use client";

import React, { useEffect, useState, useContext, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useWebSocket from "@/hooks/usewebsocket";
import { DataContext } from "../DataProvider";
import { Mic, PhoneOff } from "lucide-react";
import Sidebar from "./Sidebar";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { FaSpeakerDeck } from "react-icons/fa6";

const InterviewPage = () => {
  const { messages, sendMessage, sendUserResponse, isReady } = useWebSocket(
    "wss://synvueai.onrender.com/ws"
  );
  const params = useSearchParams();
  const {
    minutes,
    setminutes,
    userprofile,
    interviewduration,
    setinterviewduration,
  } = useContext(DataContext);

  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [callEnded, setCallEnded] = useState(false);
  const [callendprocess, setcallendprocess] = useState(false);
  const [interviewState, setInterviewState] = useState("loading");
  const [startUserResponse, setStartUserResponse] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micStarted, setMicStarted] = useState(false);

  const recognitionRef = useRef(null);
  const router = useRouter();

  const interviewId = params.get("id");
  const email = params.get("mail");

  // Voice setup
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

  // Permission check on mount
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        console.log("Mic permission granted.");
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((err) => {
        console.error("Mic access denied or unavailable:", err);
        toast.error(
          "Microphone access denied or unavailable. Please enable mic permission in your browser settings."
        );
      });
  }, []);

  useEffect(() => {
    if (interviewState !== "ready" || timeLeft === null || timeLeft <= 0)
      return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          endCall();
          return 0;
        }
        if (prevTime === 121) {
          toast("⏳ Hurry up! Only 2 minutes left!");
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewState, timeLeft]);

  const endCall = () => {
    handlecallend();
    setcallendprocess(true);
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

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
          setTimeLeft(result.interviewdetails.duration * 60);
          setinterviewduration(result.interviewdetails.duration * 60);
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

  // AI speaks
  useEffect(() => {
    if (!micStarted || !messages.length || !selectedVoice) return;
  
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;
  
    const utterance = new SpeechSynthesisUtterance(latestMessage);
    utterance.voice = selectedVoice;
  
    utterance.onend = () => {
      setStartUserResponse(true);
    };
    utterance.onerror = () => {
      setStartUserResponse(true);
      toast.error("Failed to speak the message.");
    };
  
    // Important for mobile browsers: delay slightly to allow buffer
    setTimeout(() => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }, 150);
  }, [messages, selectedVoice, micStarted]);
  const handleStartInterview = () => {
    // only triggers mic + allows useEffect to speak when message arrives
    setMicStarted(true);
  };  

  useEffect(() => {
    if (!startUserResponse || recognitionRef.current || !micStarted) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Speech recognition not supported. Please use Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setTranscript("");
    };

    recognition.onresult = (event) => {
      const interimTranscript = Array.from(event.results)
        .filter((result) => !result.isFinal)
        .map((result) => result[0].transcript)
        .join("");

      const finalTranscript = Array.from(event.results)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript)
        .join("");

      setTranscript(interimTranscript || finalTranscript);
      if (finalTranscript) debounceSend(finalTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error === "audio-capture") {
        toast.error(
          "🎙️ Microphone not found or not accessible. Please check your mic permissions."
        );
      } else {
        toast.error(`Mic Error: ${event.error}`);
      }
      setStartUserResponse(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };

    recognition.onend = () => {
      if (startUserResponse && !callEnded) {
        recognitionRef.current = null;
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      toast.error("Failed to start microphone.");
      recognitionRef.current = null;
    }
  }, [startUserResponse, micStarted]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const debounceSend = debounce((text) => {
    sendUserResponse(text);
    setStartUserResponse(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setTranscript("");
  }, 4000);

  const handlecallend = async () => {
    const profileminutesleft = parseFloat(
      (minutes - (interviewduration - timeLeft) / 60).toFixed(1)
    );
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const candidatename = userprofile?.name || "Candidate";
  const firstletter = candidatename[0];

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

  if (!micStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">
          👋 Please click below to start the Interview
        </h2>
        <button
  onClick={handleStartInterview}
  className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700"
>
  Start Interview
</button>

      </div>
    );
  }

  return callendprocess ? (
    <div className="flex flex-col items-center justify-center h-screen text-center text-red-600">
      <FaSpinner className="animate-spin" />
      <h2 className="text-xl font-semibold">Ending Interview...</h2>
      <p className="text-sm">
        Hold tight! We hope you enjoyed the interview session — your feedback is
        always welcome.
      </p>
    </div>
  ) : (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 relative md:ml-[270px] md:mt-[100px] ml-0 mt-[100px]">
        <div className="sticky top-0 z-10 bg-white shadow p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-blue-800">🎯Interview Session</h2>
          <div className="text-sm md:text-base text-gray-700 bg-blue-100 px-4 py-2 rounded-full shadow">
            ⏳ Time Remaining:{" "}
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Avatars */}
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 mb-6 items-center justify-center">
          <div className="w-44 h-44 bg-white shadow-xl rounded-2xl flex flex-col items-center justify-center px-4 py-6 hover:scale-105 transition">
            <div
              className={`w-16 h-16 rounded-full mb-3 overflow-hidden ${
                messages.length && !startUserResponse ? "animate-pulse" : ""
              }`}
            >
              <img
                src="/IntervueLogo.png"
                alt="AI Recruiter"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-medium text-gray-800">SynvueAI</p>
          </div>

          <div className="w-44 h-44 bg-white shadow-xl rounded-2xl flex flex-col items-center justify-center px-4 py-6 hover:scale-105 transition">
            <div
              className={`w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl mb-3 ${
                startUserResponse ? "animate-pulse" : ""
              }`}
            >
              {firstletter}
            </div>
            <p className="font-medium text-gray-800">{candidatename}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow hover:bg-gray-300 transition ${
              !startUserResponse ? " bg-[#00e786] animate-pulse" : "bg-gray-200"
            }`}
          >
            <FaSpeakerDeck className="text-gray-700" />
          </button>
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow hover:bg-gray-300 transition ${
              startUserResponse ? " bg-[#00e786] animate-pulse" : "bg-gray-200"
            }`}
          >
            <Mic className="text-gray-700" />
          </button>
          <button
            className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition"
            onClick={endCall}
          >
            <PhoneOff />
          </button>
        </div>

        <p className="text-gray-600 text-center text-sm mb-4 italic">
          Interview in Progress...
        </p>

        <div className="bg-white max-w-3xl mx-auto w-full rounded-lg p-4 shadow-md overflow-y-auto max-h-64">
          {messages.map((msg, index) => (
            <p key={index} className="text-sm text-gray-800 mb-2">
              {msg}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
};

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default InterviewPage;
