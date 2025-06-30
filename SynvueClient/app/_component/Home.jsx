"use client";

import React from "react";
import { SignUpButton } from "@clerk/nextjs";
import { FaPlay } from "react-icons/fa";

const Home = () => {
  return (
    <main className="relative w-full h-screen bg-gradient-to-br from-white to-blue-200 p-6 md:p-12 overflow-hidden">

      {/* Background Animated Star */}
      <img
        src="/Starimg.png"
        alt="Decorative Star"
        className="absolute top-0 left-0 w-full h-full object-contain opacity-10 animate-ping text-blue-700 pointer-events-none z-0"
      />

      {/* Main Content */}
      <div className=" relative z-10 flex flex-col md:flex-row-reverse items-center justify-center min-h-[80vh]">
        {/* Logo */}
        <div className="flex justify-center md:justify-end w-full md:w-1/2 animate-pulse md:mr-24">
          <img
            src="/IntervueLogo.png"
            alt="Intervue AI Logo"
            className="h-48 w-auto max-w-xs md:h-110"
          />
        </div>

        {/* Text & CTA */}
        <div className="text-center md:text-left w-full md:w-1/2 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 drop-shadow mb-6">
            Transform Your Interview Game with AI
          </h1>
          <p className="text-base md:text-lg text-gray-700 mb-8 leading-relaxed">
            Practice interviews in a real-world setting. Get AI-driven feedback,
            track your progress, and walk into your next interview with unbeatable
            confidence.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center md:justify-start">
            <SignUpButton className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-lg font-semibold shadow-xl hover:scale-105 transition duration-300 cursor-pointer focus:ring-2 focus:ring-indigo-400">
              <span className="flex items-center gap-2">
                <FaPlay />
                Start Preparation
              </span>
            </SignUpButton>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
