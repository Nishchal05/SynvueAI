'use client';

import React, { useState } from 'react';
import { FaCheckCircle, FaCopy } from 'react-icons/fa';
import Image from 'next/image';

const InterviewSuccessClient = ({ interviewId, email, jobPosition, duration }) => {
  const [copied, setCopied] = useState(false);
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/interview?mail=${email}&id=${interviewId}`;
  const logoUrl = '/IntervueLogo.png';
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-4 py-6">
      <div className="bg-white shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-xl text-center space-y-6">
        {logoUrl && (
          <div className="flex justify-center">
            <Image
              src={logoUrl}
              alt="Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
        )}
        <FaCheckCircle className="text-green-500 text-5xl mx-auto animate-bounce" />

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Your AI-Powered Mock Interview is Ready!
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600">
          Click the link below to start your mock interview. Share it with others or return later to practice.
        </p>

        {/* Interview Info */}
        <div className="text-left text-sm text-gray-700 space-y-1 bg-blue-50 p-4 rounded-md">
          <p><strong>Domain:</strong> {jobPosition}</p>
          <p><strong>Duration:</strong> {duration} minutes</p>
        </div>

        {/* Link Copy Section */}
        <div className="bg-gray-100 rounded-md px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto text-left">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm break-all"
          >
            {link}
          </a>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 px-2 py-1 text-gray-600 hover:text-blue-600 transition text-sm"
          >
            {copied ? (
              <span className="text-green-600 font-medium">Copied!</span>
            ) : (
              <FaCopy className="text-base" />
            )}
          </button>
        </div>

        {/* CTA Button */}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition duration-200"
        >
          Start Mock Interview
        </a>
      </div>
    </div>
  );
};

export default InterviewSuccessClient;
