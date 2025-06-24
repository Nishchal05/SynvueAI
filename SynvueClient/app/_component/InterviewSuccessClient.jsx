'use client';

import React, { useState } from 'react';
import { FaCheckCircle, FaCopy } from 'react-icons/fa';
import Image from 'next/image';

const InterviewSuccessClient = ({ interviewId, email, jobPosition, duration}) => {
  const [copied, setCopied] = useState(false);

  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/interview?mail=${email}&id=${interviewId}`;
  const logoUrl='/IntervueLogo.png'
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4 py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-10 max-w-md w-full text-center space-y-6">
        {logoUrl && (
          <div className="flex justify-center">
            <Image
              src='/IntervueLogo.png'
              alt="Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
        )}

        <FaCheckCircle className="text-green-500 text-5xl mx-auto animate-pulse" />

        <h1 className="text-2xl font-semibold text-gray-800">
          Your AI-Powered Mock Interview is Ready!
        </h1>

        <p className="text-sm text-gray-600">
          Click the link below to start your mock interview. Share it with others or come back to practice.
        </p>

        {/* Interview Info */}
        <div className="text-left text-sm text-gray-700 space-y-1 bg-blue-50 p-3 rounded-md">
          <p><strong>Domain:</strong> {jobPosition}</p>
          <p><strong>Duration:</strong> {duration} minutes</p>
        </div>

        {/* Link Copy Box */}
        <div className="bg-gray-100 rounded-md px-4 py-2 flex items-center justify-between overflow-x-auto">
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
            className="ml-2 text-gray-600 hover:text-blue-600 transition"
          >
            {copied ? (
              <span className="text-green-600 text-sm font-medium">Copied!</span>
            ) : (
              <FaCopy className="text-lg" />
            )}
          </button>
        </div>

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition"
        >
          Start Mock Interview
        </a>
      </div>
    </div>
  );
};

export default InterviewSuccessClient;
