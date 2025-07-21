"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowRight, UploadCloud, FileText, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import Sidebar from '../_component/Sidebar';
  
const AtsScoreCircle = ({ score }) => {
    const sqSize = 160;
    const strokeWidth = 14;
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * score) / 100;

    const scoreColorClass = score > 85 ? 'text-cyan-400' : score > 70 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="relative flex items-center justify-center" style={{ width: sqSize, height: sqSize }}>
            <svg width={sqSize} height={sqSize} viewBox={viewBox}>
                <circle
                    className="fill-transparent stroke-slate-700"
                    cx={sqSize / 2}
                    cy={sqSize / 2}
                    r={radius}
                    strokeWidth={`${strokeWidth}px`}
                />
                <circle
                    className={`fill-transparent ${scoreColorClass} transition-all duration-1000 ease-in-out`}
                    cx={sqSize / 2}
                    cy={sqSize / 2}
                    r={radius}
                    strokeWidth={`${strokeWidth}px`}
                    transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                    style={{
                        strokeDasharray: dashArray,
                        strokeDashoffset: dashOffset,
                        strokeLinecap: 'round'
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                 <span className={`text-4xl font-bold ${scoreColorClass}`}>{score}</span>
                 <span className="text-sm text-slate-400">ATS Score</span>
            </div>
        </div>
    );
};


// Main Page Component
const ResumeAnalyzerPage = () => {
    const [jobDomain, setJobDomain] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
      
        if (!resumeFile || !jobDomain) {
          alert("Please upload resume and enter job description");
          return;
        }
      
        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("jobDescription", jobDomain);
        setIsLoading(true);
        setError('');
        
        try {
          const res = await fetch("/api/ai_analyzer", {
            method: "POST",
            body: formData,
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to analyze resume");
          }
          
          const result = await res.json();
          setAnalysisResult(result);
        } catch (err) {
          console.error("Error submitting form", err);
          setError(err.message || "Failed to analyze resume");
        } finally {
          setIsLoading(false);
        }
      };
    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            setResumeFile(acceptedFiles[0]);
            setError(''); 
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
    'application/pdf': ['.pdf'], // ✅ Only allow PDF files
  },
        multiple: false,
    });

    
    const handleReset = () => {
        setJobDomain('');
        setResumeFile(null);
        setAnalysisResult(null);
        setIsLoading(false);
        setError('');
    }

    return (
       <div className='flex min-h-screen bg-gray-100'>
        <Sidebar/>
        <div className="min-h-screen w-full md:ml-64 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-white font-sans mt-11">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-indigo-600 bg-gradient-to-r from-blue-400 to-cyan-300 pb-2">
                        AI Resume Analyzer
                    </h1>
                    <p className="text-slate-700 mt-2 max-w-2xl mx-auto">
                        Get an instant analysis of your resume against any job description. Optimize your resume, beat the ATS, and land your dream job.
                    </p>
                </header>

                <main className="max-w-4xl mx-auto">
                    {/* Conditional Rendering: Show Analyzer Form or Results */}
                    {!analysisResult && !isLoading && (
                        <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-blue-900/20">
                            <div className="mb-6">
                                <label htmlFor="jobDomain" className="block text-lg font-semibold mb-2 text-slate-700">
                                    Step 1: Enter Job Domain
                                </label>
                                <input
                                    type="text"
                                    id="jobDomain"
                                    value={jobDomain}
                                    onChange={(e) => setJobDomain(e.target.value)}
                                    placeholder="e.g., Senior Software Engineer, Product Manager"
                                    className="w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 border border-slate-600 rounded-lg px-4 py-3 text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                                />
                            </div>

                            {/* Step 2: Upload Resume */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold mb-2 text-slate-700">
                                    Step 2: Upload Your Resume
                                </label>
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'bg-slate-700 border-cyan-400' : 'hover:bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100'}`}
                                >
                                    <input {...getInputProps()}  />
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <UploadCloud className="w-12 h-12 mb-4 text-slate-500" />
                                        {isDragActive ? (
                                            <p className="text-lg font-semibold text-cyan-300">Drop the file here ...</p>
                                        ) : (
                                            <p>Drag & drop your resume here, or click to select a file</p>
                                        )}
                                        <p className="text-sm mt-1">Supported formats: PDF</p>
                                    </div>
                                </div>
                                {resumeFile && (
                                    <div className="mt-4 bg-slate-700 border border-slate-600 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-6 h-6 text-cyan-400" />
                                            <span className="font-medium">{resumeFile.name}</span>
                                        </div>
                                        <button onClick={() => setResumeFile(null)} className="text-slate-400 hover:text-white">&times;</button>
                                    </div>
                                )}
                            </div>
                            
                            {error && <p className="text-red-400 text-center mb-4">{error}</p>}

                            {/* Analyze Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!jobDomain || !resumeFile}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:shadow-none"
                            >
                                Analyze My Resume <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    
                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center p-8">
                            <div className="flex justify-center items-center mb-4">
                               <Loader className="w-16 h-16 text-cyan-400 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-300">Analyzing your resume...</h2>
                            <p className="text-slate-400 mt-2">Our AI is scanning for keywords, checking formatting, and scoring your resume.</p>
                        </div>
                    )}

                    {/* Results Display */}
                    {analysisResult && (
                        <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-blue-900/20 animate-fade-in">
                            <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">Analysis Complete</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                <div className="md:col-span-1 flex justify-center">
                                    <AtsScoreCircle score={analysisResult.atsScore} />
                                </div>
                                <div className="md:col-span-2">
                                    <h3 className="text-2xl font-semibold text-indigo-600 mb-4">Detailed Feedback</h3>
                                    <div className="space-y-4">
                                        {analysisResult.feedback.map((item, index) => (
                                            <div key={index} className="flex items-start gap-4 p-4 bg-slate-800 rounded-lg">
                                                <div>
                                                    {item.isPositive ? (
                                                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                                                    ) : (
                                                        <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-200">{item.title}</h4>
                                                    <p className="text-slate-400 text-sm">{item.suggestion}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                             <div className="text-center mt-10">
                                <button onClick={handleReset} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-6 rounded-lg transition">
                                    Analyze Another Resume
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
       </div>
    );
};

export default ResumeAnalyzerPage;

