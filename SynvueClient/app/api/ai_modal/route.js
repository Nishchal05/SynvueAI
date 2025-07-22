import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import User from '@/app/modal/usermodal';
import dbconnect from "@/app/DBConnection";

export async function POST(req) {
  try {
    await dbconnect();
    const { jobPosition, description, duration, interviewType, useremail, username } = await req.json();

    if (!jobPosition || !description || !duration || !interviewType || !useremail || !username) {
      return NextResponse.json({ error: "Missing input fields" }, { status: 400 });
    }

    const prompt = process.env.NEXT_PUBLIC_PROMPT;
    console.log(NEXT_PUBLIC_PROMPT);
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not set in environment" }, { status: 500 });
    }

    const finalprompt = prompt
      .replace('{{jobTitle}}', jobPosition)
      .replace('{{type}}', interviewType)
      .replace('{{duration}}', duration)
      .replace('{{jobDescription}}', description);
 console.log(!process.env.Gemini_API_KEY);
    if (!process.env.Gemini_API_KEY) {
     
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
