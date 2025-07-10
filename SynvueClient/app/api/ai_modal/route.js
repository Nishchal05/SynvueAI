import { NextResponse } from "next/server";
import OpenAI from "openai";
import User from '@/app/modal/usermodal'
import dbconnect from "@/app/DBConnection";

import { v4 as uuidv4 } from 'uuid';
export async function POST(req) {
  try {
    await dbconnect();
    const { jobPosition, description, duration, interviewType, useremail, username } = await req.json();

    if (!jobPosition || !description || !duration || !interviewType || !useremail || !username) {
      console.log( jobPosition, description, duration, interviewType, useremail, username)
      return NextResponse.json({ error: "Missing input fields" }, { status: 400 });
    }
    if (!process.env.OPENROUTE_API) throw new Error("Missing OPENROUTE_API env var");
    const prompt = process.env.NEXT_PUBLIC_PROMPT;
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not set in environment" }, { status: 500 });
    }

    const finalprompt = prompt
      .replace('{{jobTitle}}', jobPosition)
      .replace('{{type}}', interviewType)
      .replace('{{duration}}', duration)
      .replace('{{jobDescription}}', description);

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTE_API,
    });

    const completion = await openai.chat.completions.create({
      model: "google/gemma-3n-e4b-it:free",
      messages: [{ role: "user", content: finalprompt }],
    });

    const message = completion?.choices?.[0]?.message;
    if (!message || !message.content) {
      return NextResponse.json({ error: "No response from model" }, { status: 500 });
    }

    let content = message.content.trim();

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
    console.error("AI Modal Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
