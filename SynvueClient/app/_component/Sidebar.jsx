"use client";
import React, { useState,useContext,useEffect} from "react";
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
import HandshakeIcon from '@mui/icons-material/Handshake';
import FeedbackIcon from '@mui/icons-material/Feedback';
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    SignOutButton,
    UserButton,
    useUser
  } from '@clerk/nextjs';  
import { useRouter } from "next/navigation";
import { DataContext } from "../DataProvider";
const Sidebar = () => {
  const { view, setView, minutes,setminutes, setuserprofile} = useContext(DataContext);
  const user=useUser();
  const router=useRouter();
  const userdata = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    try {
      const response = await fetch(`/api/createuser?email=${user.primaryEmailAddress.emailAddress}`);
      const result = await response.json();
      setminutes(result?.user?.minutes || 7);
      setuserprofile(result);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      userdata();
    }
  }, []);
  
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
              className="flex items-center gap-3 hover:text-indigo-600 transition cursor-pointer"
            >
              <FaMicrophoneAlt className="text-xl bg-gradient-to-r text-indigo-700  bg-clip-text" />
              Create Interview
            </div>
            <div
              onClick={()=>{!UserButton ? router.push('/Billing') : router.push('https://harmless-civet-15.accounts.dev/sign-up?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F')}}
              className="flex items-center gap-3 hover:text-indigo-600 transition"
            >
              <FaCreditCard className="text-xl bg-gradient-to-r text-indigo-700 bg-clip-text" />
              Billing
            </div>
            <div
            onClick={()=>{!UserButton ? router.push('/Contact') : router.push('https://harmless-civet-15.accounts.dev/sign-up?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F')}}
              className="flex items-center gap-3 hover:text-indigo-600 transition"
            >
            <HandshakeIcon className="text-xl bg-gradient-to-r text-indigo-700 bg-clip-text"/>
              Contact Us
            </div>
            <div
              onClick={()=>{!UserButton ? router.push('/Feedback') : router.push('https://harmless-civet-15.accounts.dev/sign-up?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F')}}
              className="flex items-center gap-3 hover:text-indigo-600 transition"
            >
             <FeedbackIcon className="text-xl bg-gradient-to-r text-indigo-700 bg-clip-text"/>
              FeedBack
            </div>
          </nav>
        </div>
        <div className="text-gray-700">
          <div className="mb-4">
            🎯 <span className="font-semibold">Synvue Coin:</span> {minutes}
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
