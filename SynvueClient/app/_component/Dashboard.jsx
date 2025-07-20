"use client";

import React, { useEffect, useState, useContext } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { FaMicrophoneAlt, FaHistory } from "react-icons/fa";
import { useRouter } from "next/navigation";
import InsightsIcon from "@mui/icons-material/Insights";
import { DataContext } from "../DataProvider";
import { FaLeftLong, FaRightLong } from "react-icons/fa6";

const Dashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  const { setminutes } = useContext(DataContext);
  const [interviewArray, setInterviewArray] = useState([]);
  const [openCardId, setOpenCardId] = useState(null);
  
  // No changes to state or data fetching
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  const fetchUserData = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    try {
      const createUserResponse = await fetch("/api/createuser", {
        method: "POST",
        body: JSON.stringify({ user }),
        headers: { "Content-Type": "application/json" },
      });
      const createUserData = await createUserResponse.json();
      if (createUserData?.user) {
        setminutes(createUserData.user.minutes);
      }

      const interviewHistoryResponse = await fetch(`/api/createuser?email=${user.primaryEmailAddress.emailAddress}`);
      const interviewHistoryData = await interviewHistoryResponse.json();
      const interviews = Object.values(interviewHistoryData?.user?.interviews?.interviewData || {});
      setInterviewArray(interviews);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < interviewArray.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const paginatedInterviews = interviewArray.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="h-100vh w-full bg-gradient-to-br mt-[264px] md:mt-[160px]  from-indigo-100 via-purple-100 to-pink-100 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-xl shadow-md p-4 sm:p-6 mb-8">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">
            Welcome, {user?.firstName || "User"} 👋
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Let’s help you crack your next interview! 🚀
          </p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* These cards are already responsive and remain unchanged */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition">
          <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-2 flex items-center gap-2">
            <FaMicrophoneAlt /> Create Interview
          </h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Practice real-time interview questions customized for your role.
          </p>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition cursor-pointer"
            onClick={() => router.push("/CreateInterView")}
          >
            Create Now
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition">
          <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-2 flex items-center gap-2">
            <InsightsIcon /> Analyzer
          </h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Scan. Score. Stand Out — Instantly improve your resume with AI insights.
          </p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          onClick={()=>{
            router.push('/Insight')
          }}>
            Get Insights
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition">
        <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <FaHistory /> Previous Interviews
        </h3>
        {interviewArray.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">You haven’t taken any interviews yet.</p>
            <button
              onClick={() => router.push("/CreateInterView")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition cursor-pointer"
            >
              Create First Interview
            </button>
          </div>
        ) : (
          <div>
            {/* START: RESPONSIVE CAROUSEL/GRID CONTAINER */}
            <div className="flex snap-x snap-mandatory overflow-x-auto space-x-4 pb-4 md:grid md:grid-cols-2 md:gap-6 md:space-x-0 xl:grid-cols-3">
              {paginatedInterviews.map((val) => (
                <div 
                  key={val.createdAt} 
                  className="flex-shrink-0 w-4/5 snap-start rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm md:w-auto"
                >
                  <h4 className="font-semibold text-indigo-700 truncate">
                    {val.domain} Interview
                  </h4>
                  <p className="text-gray-600 text-sm">Duration: <span className="font-medium">{val.duration} minutes</span></p>
                  <p className="text-gray-600 text-sm">
                    Created:{" "}
                    <span className="font-medium">
                      {new Date(val.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <button
                    onClick={() => setOpenCardId(openCardId === val.createdAt ? null : val.createdAt)}
                    className="mt-3 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700"
                  >
                    {openCardId === val.createdAt ? "Hide Questions" : "View Questions"}
                  </button>
                  {openCardId === val.createdAt && (
                    <div className="mt-4 border-t pt-3">
                      <h5 className="mb-2 text-sm font-semibold text-indigo-600">Questions:</h5>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                        {val.questions.map((q, idx) => (
                          <li key={idx}>{q?.question || "No question text"}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* END: RESPONSIVE CAROUSEL/GRID CONTAINER */}
            
            {interviewArray.length > itemsPerPage && (
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="rounded-md bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  <FaLeftLong />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={(currentPage + 1) * itemsPerPage >= interviewArray.length}
                  className="rounded-md bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  <FaRightLong />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;