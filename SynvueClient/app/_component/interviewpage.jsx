"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";
import { DataContext } from "../DataProvider";
export default function InterviewRoom() {
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const convertTextRef = useRef(null);
  const socketRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const params = useSearchParams();
  const interviewId = params.get("id");
  const email = params.get("mail");
  const [interviewdel, setInterviewdel] = useState(null);
  const router = useRouter();
  const {minutes,setminutes,userprofile}=useContext(DataContext);
  const speakText = (text, onEndCallback) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (isSpeakingRef.current) return;
    isSpeakingRef.current = true;

    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;

    utter.onend = () => {
      isSpeakingRef.current = false;
      setTimeout(() => onEndCallback?.(), 100);
    };

    utter.onerror = (e) => {
      console.error("❌ TTS error", e.error);
      isSpeakingRef.current = false;
      setTimeout(() => onEndCallback?.(), 100);
    };

    setTimeout(() => synth.speak(utter), 100);
  };

  const connectWebSocket = (retryCount = 0) => {
    if (retryCount > 3) {
      console.error("❌ WebSocket failed after 3 retries");
      return;
    }

    const socket = new WebSocket("wss://synvueai.onrender.com");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      if (interviewdel) {
        socket.send(JSON.stringify({
          type: "init",
          interviewDetails: interviewdel,
        }));
      }
    };

    socket.onerror = () => {
      console.warn("⚠️ WebSocket error. Retrying...");
      setTimeout(() => connectWebSocket(retryCount + 1), 1000 * (retryCount + 1));
    };

    socket.onmessage = (event) => {
      const message = event.data;
      if (message.startsWith("🤖 AI: ")) {
        const aiMessage = message.replace("🤖 AI: ", "").trim();

        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        speakText(aiMessage, () => {
          try {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              recognitionRef.current?.start();
              console.log("🎙️ Mic restarted after AI");
            }
          } catch (err) {
            console.error("❌ Error restarting mic:", err);
          }
        });
      }
    };
  };

  const startInterview = async () => {
    try {
      if (!interviewdel) {
        console.warn("No interview details available.");
        return;
      }
  
      const socket = new WebSocket("wss://synvueai.onrender.com");
      socketRef.current = socket;
  
      socket.onopen = () => {
        console.log("✅ WebSocket connected");
  
        socket.send(JSON.stringify({
          type: "init",
          interviewDetails: interviewdel,
        }));
      };
  
      socket.onmessage = (event) => {
        const message = event.data;
        if (message.startsWith("🤖 AI: ")) {
          const aiMessage = message.replace("🤖 AI: ", "").trim();
  
          if (recognitionRef.current) {
            recognitionRef.current.abort();
          }
  
          speakText(aiMessage, () => {
            try {
              if (socketRef.current?.readyState === WebSocket.OPEN) {
                recognitionRef.current?.start();
                console.log("🎙️ Mic restarted after AI");
              }
            } catch (err) {
              console.error("❌ Error restarting mic:", err);
            }
          });
        }
      };
  
      socket.onerror = () => {
        console.warn("⚠️ WebSocket error.");
      };
  
      window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
  
      const recognition = new window.SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
  
      recognition.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((result) => result[0].transcript)
          .join(" ")
          .trim();
  
        setTranscript(transcript);
        if (convertTextRef.current) {
          convertTextRef.current.innerText = transcript;
        }
  
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              type: "transcript",
              message: transcript,
            })
          );
        }
  
        setTimeout(() => {
          setTranscript("");
          if (convertTextRef.current) {
            convertTextRef.current.innerText = "Listening...";
          }
        }, 1000);
      };
  
      recognition.onerror = (e) => {
        console.error("🎤 Recognition error:", e.error);
      };
  
      recognition.onend = () => {
        console.log("🛑 Mic ended. Will restart after TTS.");
      };
  
      recognition.start();
      setStarted(true);
    } catch (error) {
      console.error("Speech recognition setup failed:", error);
    }
  };
  

  const stopInterview = () => {
    try {
      recognitionRef.current?.stop();
      socketRef.current?.close();
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
  
      const timetaken = Math.ceil(seconds / 60);
      setminutes(Math.max(0, minutes - timetaken));
  
      setStarted(false);
      if(userprofile?.interviews?.
        totalCreated==1){
          router.push('/Feedback')
        }else{
          router.push('/')
        }
    } catch (err) {
      console.error("Error stopping interview:", err);
    }
  };
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  const interviewData = async () => {
    try {
      const response = await fetch(
        `/api/interviewdata?mail=${email}&interviewid=${interviewId}`
      );
      const result = await response.json();
      if (result?.interviewdetails) {
        setminutes(result.minutes)
        console.log(result)
        setInterviewDetails(result.interviewdetails);
        setInterviewdel(result);
      } else {
        console.warn("⚠️ No interview data found");
      }
    } catch (error) {
      console.error("Error fetching interview data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId && email) {
      interviewData();
    }
  }, [interviewId, email]);


  const formatTime = (s) => {
    const mins = String(Math.floor(s / 60)).padStart(2, "0");
    const secs = String(s % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="min-h-screen bg-blue-50 text-blue-900 font-sans flex flex-col items-center justify-center px-4 py-10 w-full">
        {!started ? (
          <div className="bg-cyan-950 animate-pulse shadow-xl flex flex-col items-center rounded-xl w-full max-w-3xl p-10 text-center space-y-6 text-white border border-blue-500">
            <div className="text-3xl font-bold flex flex-col items-center gap-3">
              <img src="/IntervueLogo.png" alt="logo" className="h-60" />
              SynvueAI is Ready. Are You??
            </div>
            {loading ? (
              <p className="text-lg text-gray-300">Loading interview details...</p>
            ) : (
              <p className="text-lg text-gray-300 flex flex-col items-center justify-center">
                <span>
                  Domain:{" "}
                  <strong className="text-white">
                    {interviewDetails?.domain || "Full Stack Web Development"}
                  </strong>
                </span>
                <span>
                  Duration:{" "}
                  <strong className="text-white">
                    {interviewDetails?.duration || "10 minutes"}
                  </strong>
                </span>
              </p>
            )}
            <button
              onClick={startInterview}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-6">
            <div className="flex items-center justify-evenly mt-[50px] text-gray-700 mb-2">
              <h1 className="text-3xl text-blue-500 font-semibold">SynvueAI</h1>
              <span className="text-sm font-medium">⏱ {formatTime(seconds)}</span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="bg-cyan-950 rounded-xl shadow-md w-full max-w-sm aspect-square flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-blue-200 overflow-hidden">
                  <img
                    src="/IntervueLogo.png"
                    alt="AI"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-gray-700">
                  SynvueAI
                </div>
              </div>

              <div className="bg-cyan-950 rounded-xl shadow-md w-full max-w-sm aspect-square flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center">
                  AI
                </div>
                <div className="mt-2 text-sm font-medium text-gray-700">
                  SynvueAI
                </div>
              </div>
            </div>

            <div className="bg-white shadow p-4 rounded-xl mx-auto max-w-2xl text-gray-800 text-center min-h-[100px]">
              <p ref={convertTextRef} className="text-base whitespace-pre-line">
                {transcript || "Listening..."}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 mt-6">
              <button
                onClick={stopInterview}
                className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500"
              >
                <CallOutlinedIcon />
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              Interview in Progress...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
