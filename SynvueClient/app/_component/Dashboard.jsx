'use client';

import React,{useEffect,useState,useContext} from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { FaMicrophoneAlt, FaPhoneAlt, FaHistory } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import InsightsIcon from '@mui/icons-material/Insights';
import { DataContext } from '../DataProvider';
const Dashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  const [member,setmember]=useState({});
  const {minutes,setminutes}=useContext(DataContext)
  const handleuser=async()=>{
    const response=await fetch('/api/createuser',{
      method:'POST',
      body:JSON.stringify({user}),
      headers: {
          "Content-Type": "application/json",
        },
    })
    const result=await response.json();
    setminutes(result?.user?.minutes)
    setmember(result?.user)
  }
  useEffect(() => {
    if (user) {
      handleuser();
    }
  }, [user]);
  
  return (
    <div className="h-100vh w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-4 mt-52 md:mt-[-100px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-xl shadow-md p-4 sm:p-6 mb-8">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">
            Welcome, {user?.firstName || 'User'} 👋
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Let’s help you crack your next interview! 🚀
          </p>
        </div>
        <UserButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition">
          <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-2 flex items-center gap-2">
            <FaMicrophoneAlt /> Create Interview
          </h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Practice real-time interview questions customized for your role.
          </p>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition cursor-pointer"
            onClick={() => {
              router.push('/CreateInterView');
            }}
          >
            Create Now
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition">
          <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-2 flex items-center gap-2">
            <InsightsIcon/> Analyzer
          </h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Scan. Score. Stand Out — Instantly improve your resume with AI insights.
          </p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
            Get Insights
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition">
        <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaHistory /> Previous Interviews
        </h3>
        <div className="text-center text-gray-500 py-8">
          <p className="mb-4">You haven’t taken any interviews yet.</p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition cursor-pointer">
            Create First Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
