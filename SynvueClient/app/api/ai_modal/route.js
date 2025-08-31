import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import User from '@/app/modal/usermodal';
import dbconnect from "@/app/DBConnection";

export async function POST(req) {
  try {
    await dbconnect();
    const { jobPosition, description, duration, interviewType, useremail, username } = await req.json();

    if (!jobPosition || !description || !duration || !interviewType || !useremail) {
      return NextResponse.json({ error: "Missing input fields" }, { status: 400 });
    }

    const prompt = `You are an expert interviewer. Based on the following inputs, generate a concise and high-quality list of interview questions: 
Job Title: {{jobTitle}} 
Job Description: {{jobDescription}} 
Interview Duration: {{duration}} 
Interview Type: {{type}} 
Your task: 
1. Analyze the job description to identify key responsibilities, required skills, and expected experience.  
2. Based on the interview duration, generate exactly 2 × {{duration}} number of questions. For example, for a 5-minute interview, create 10 concise and focused questions.  
3. Adjust the depth, sequencing, and mix of questions (technical, behavioral, problem-solving, HR, etc.) appropriately for the given interview type and duration.  
4. Ensure the questions reflect the tone and structure of a real-life {{type}} interview.  
🧩 Format your response in RAW JSON only (no Markdown, no code block):  
{"interviewQuestions": [{"question": "...", "type": "Technical/Behavioral/Experience/Problem Solving/HR ROUND"}]}  
🎯 Goal: Create a structured, relevant, and time-balanced interview plan for the {{jobTitle}} role.`;
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not set in environment" }, { status: 500 });
    }
    const finalprompt = prompt
      .replace('{{jobTitle}}', jobPosition)
      .replace('{{type}}', interviewType)
      .replace('{{duration}}', duration)
      .replace('{{jobDescription}}', description);
    if (!process.env.GEMINI_API_KEY) {
      console.log(!process.env.GEMINI_API_KEY);
      return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(finalprompt);
    const text = result.response.text();

    // Parse the response
    let content = text.trim();
    if (content.startsWith("```json") || content.startsWith("```")) {
      content = content.replace(/```json|```/g, "").trim();
    }

    let parsedQuestions = [];
    try {
      const parsed = JSON.parse(content);
      parsedQuestions = parsed.interviewQuestions || [];
    } catch (err) {
      console.error("Failed to parse model response JSON:", err);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const interviewDurationMinutes = parseInt(duration);
    const expiryDate = new Date(Date.now() + (interviewDurationMinutes + 10) * 60 * 1000);

    const interviewData = {
      domain: jobPosition,
      questions: parsedQuestions,
      duration: parseInt(duration),
      createdAt: new Date(),
      linkExpiry: expiryDate
    };

    let user = await User.findOne({ email: useremail });
    let interviewId = uuidv4();

    if (!user) {
      user = await User.create({
        name: username,
        email: useremail,
        interviews: {
          totalCreated: 1,
          interviewData: {
            [interviewId]: interviewData
          }
        }
      });
    } else {
      const total = user?.interviews?.totalCreated || 0;
      const currentData = user.interviews.interviewData || {};
      const updatedData = {
        ...Object.fromEntries(currentData instanceof Map ? currentData : Object.entries(currentData)),
        [interviewId]: interviewData
      };
      user.interviews.interviewData = new Map(Object.entries(updatedData));
      user.interviews.totalCreated = total + 1;
      user.markModified("interviews");

      await user.save();
    }

    return NextResponse.json({
      success: true,
      interview: parsedQuestions,
      interviewId,
      useremail
    });

  } catch (error) {
    console.error("Gemini Modal Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
