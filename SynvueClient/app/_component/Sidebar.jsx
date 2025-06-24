"use client";

import React, { useState, useContext } from "react";
import Link from "next/link";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUser,
  FaMicrophoneAlt,
  FaCreditCard,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    SignOutButton,
    UserButton
  } from '@clerk/nextjs';  
import { useRouter } from "next/navigation";
import { DataContext } from "../DataProvider";
const Sidebar = () => {
  const { view, setView } = useContext(DataContext);
  const router=useRouter();
  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 p-6 flex flex-col justify-between transform transition-transform duration-300 ${
          view ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <h1 className="text-2xl font-bold text-indigo-700 mb-10">
            InterviewPrep
          </h1>
          <nav className="flex flex-col gap-5 text-gray-800 font-medium">
            <Link
              href="/"
              className="flex items-center gap-3 hover:text-indigo-600 transition"
            >
              <FaHome className="text-xl bg-gradient-to-r text-indigo-700 bg-clip-text" />
              Home
            </Link>

            <div
              onClick={()=>{!UserButton ? router.push('/CreateInterView') : router.push('https://harmless-civet-15.accounts.dev/sign-up?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F')}}
              className="flex items-center gap-3 hover:text-indigo-600 transition"
            >
              <FaMicrophoneAlt className="text-xl bg-gradient-to-r text-indigo-700  bg-clip-text" />
              Create Interview
            </div>
            <Link
              href="/credits"
              className="flex items-center gap-3 hover:text-indigo-600 transition"
            >
              <FaCreditCard className="text-xl bg-gradient-to-r text-indigo-700 bg-clip-text" />
              Add Credits
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 hover:text-indigo-600 transition"
            >
              <FaUser className="text-xl bg-gradient-to-r text-indigo-700 bg-clip-text" />
              Contact Us
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 hover:text-indigo-600 transition"
            >
              <FaUser className="text-xl bg-gradient-to-r text-indigo-700 bg-clip-text" />
              FeedBack
            </Link>
          </nav>
        </div>

        {/* Credits & Auth */}
        <div className="text-gray-700">
          <div className="mb-4">
            🎯 <span className="font-semibold">Credits:</span> 10
          </div>
          <div className="flex items-center gap-3">
          <SignedOut>
    <div className="flex flex-col gap-2">
      <SignInButton>
        <button className="flex items-center cursor-pointer gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
          <FaSignInAlt /> Login
        </button>
      </SignInButton>
      <SignUpButton>
        <button className="flex cursor-pointer items-center gap-2 border border-indigo-600 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-50 transition">
          <FaUserPlus /> Sign Up
        </button>
      </SignUpButton>
    </div>
  </SignedOut>
  <SignedIn>
    <div className="flex flex-col gap-2">
      <SignOutButton>
        <button className="flex items-center gap-2 border border-blue-500 text-black bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-md hover:bg-red-50 transition cursor-pointer">
          🚪 Sign Out
        </button>
      </SignOutButton>
    </div>
  </SignedIn>
          </div>
        </div>
      </aside>
      {view && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-40 z-30 md:hidden"
          onClick={() => setView(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
