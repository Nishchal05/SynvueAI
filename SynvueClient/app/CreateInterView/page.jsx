"use client";

import React, { useContext, useState, useEffect } from "react";
import Sidebar from "../_component/Sidebar";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import { Dot } from "lucide-react";
import InterviewSuccessClient from "../_component/InterviewSuccessClient";
import { Suspense } from "react";
import { DataContext } from "../DataProvider";
import { toast } from "sonner";
const Page = () => {
  const [loading, setloading] = useState(false);
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33.33);
  const [interviewid, setinterviewid] = useState();
  const { minutes, setinterviewduration, setminutes } = useContext(DataContext);
  const [useremail, setuseremail] = useState();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    jobPosition: "",
    description: "",
    duration: "",
    interviewType: "",
    useremail: user?.primaryEmailAddress?.emailAddress,
    username: user?.fullName,
  });
  console.log(user?.primaryEmailAddress?.emailAddress);
  const userdata = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    try {
      const response = await fetch(
        `/api/createuser?email=${user.primaryEmailAddress.emailAddress}`
      );
      const result = await response.json();
      setminutes(result?.user?.minutes || 7);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    console.log("hp:", user?.primaryEmailAddress?.emailAddress);
    if (user?.primaryEmailAddress?.emailAddress) {
      userdata();
    }
  }, [user]);
  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3));
    setProgress((prev) => Math.min(prev + 33.33, 100));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setProgress((prev) => Math.max(prev - 33.33, 33.33));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "duration") {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
      }
      const numericValue = Number(value);

      if (!isNaN(numericValue)) {
        if (numericValue > minutes) {
          toast(`You only have ${minutes} minutes left!`);
          return;
        }
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
        setinterviewduration(numericValue);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInterviewLink = async () => {
    setloading(true);
    try {
      const response = await fetch("/api/ai_modal", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result) {
        setinterviewid(result.interviewId);
        setuseremail(result.useremail);
        setloading(false);
        nextStep();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="md:ml-64 mt-4 w-full p-6 flex justify-center items-start bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <div className="w-full max-w-3xl mt-10 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-indigo-700 mb-6">
            Create New Interview
          </h2>

          <Progress value={progress} className="mb-6" />
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Job Position
                </label>
                <input
                  name="jobPosition"
                  value={formData.jobPosition}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Job responsibilities, role requirements..."
                  rows={4}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Duration (in minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min={1}
                  placeholder="e.g. 30"
                  className={`w-full border px-4 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 
    ${formData.duration > minutes ? "border-red-500" : "border-gray-300"}`}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={
                    !formData.jobPosition ||
                    !formData.description ||
                    !formData.duration
                  }
                  className={`px-6 py-2 rounded-md transition text-white ${
                    !formData.jobPosition ||
                    !formData.description ||
                    !formData.duration
                      ? "bg-indigo-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Interview Type
                </label>
                <select
                  name="interviewType"
                  value={formData.interviewType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a type</option>
                  <option value="Experience">📞 Phone Screening</option>
                  <option value="Technical Round">💻 Technical Round</option>
                  <option value="HR Round">🧑‍💼 HR Round</option>
                  <option value="Behavioral">🧠 Behavioral Round</option>
                  <option value="Problem Solving">🧩 Problem Solving</option>
                  <option value="System Design Round">📐 System Design</option>
                  <option value="Coding Challenge">⌨️ Coding Challenge</option>
                </select>
              </div>
              <div className=" flex-col">
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="border border-indigo-500 text-indigo-600 px-6 py-2 rounded-md hover:bg-indigo-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleInterviewLink}
                    disabled={loading || !formData.interviewType}
                    className={` text-white px-6 py-2 rounded-md transition ${
                      !formData.interviewType || loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {loading ? (
                      <span className="flex">
                        <span className="animate-bounce">
                          <Dot />
                        </span>
                        <span className="animate-bounce">
                          <Dot />
                        </span>
                        <span className="animate-bounce">
                          <Dot />
                        </span>
                      </span>
                    ) : (
                      "Generate Link"
                    )}
                  </button>
                </div>
                <div className="bg-yellow-100 mt-5 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg max-w-xl mx-auto flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 flex-shrink-0 mt-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                  <div className="text-sm">
                    <strong>⚠️ Note:</strong> Speech recognition might{" "}
                    <span className="font-semibold">
                      not work properly in Safari or Firefox.
                    </span>
                    <br />
                    For best experience, use{" "}
                    <span className="font-semibold">Google Chrome</span> or{" "}
                    <span className="font-semibold">Microsoft Edge</span>.
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <Suspense>
              <InterviewSuccessClient
                interviewId={interviewid}
                email={useremail}
                jobPosition={formData.jobPosition}
                duration={formData.duration}
              />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;
