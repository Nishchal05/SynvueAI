import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";


export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume");
    const jobDescription = formData.get("jobDescription");

    if (!resumeFile || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "Missing resume or job description" },
        { status: 400 }
      );
    }
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let resumeText;
    try {
      const data = await pdf(buffer,{});
      resumeText = data.text;
    } catch (pdfError) {
      console.error("PDF parsing error:", pdfError);
      return NextResponse.json(
        { success: false, error: "Failed to parse PDF file" },
        { status: 400 }
      );
    }

    const prompt = `
 You are an expert AI ATS (Applicant Tracking System) resume analyzer.
Evaluate how well the candidate’s resume aligns with the provided job description.
🛑 Ignore all timeline or date-related information. You do not have real-time data. Focus only on content, formatting, and keyword alignment.
🔧 Instructions:
Assign an ATS score between 0 and 100.
Be very strict:
Only assign 95+ if the resume is exceptionally aligned — excellent formatting, strong keyword match, clearly relevant experience.
Assign 70–90 for resumes with relevance but missing key elements like achievements, proper structure, or keyword variety.
Assign below 70 if:
Skills and experience do not align well
Important keywords are missing
Formatting is poor or too generic
📌 Provide 3 to 5 bullet points of feedback:
Mix of positive and negative points
Highlight keyword gaps, formatting flaws, and relevance
Be honest and critical, not lenient
📄 Format your answer strictly in JSON like this:

{
  "atsScore": number,
  "feedback": [
    { "title": "string", "suggestion": "string", "isPositive": boolean },
    ...
  ]
}
👨‍💼 Job Description:
"""${jobDescription}"""

📄 Resume Text:
"""${resumeText}"""
    `;    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to extract and parse JSON strictly
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const jsonString = text.slice(jsonStart, jsonEnd + 1);
    const data = JSON.parse(jsonString);

    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    console.error("ATS API Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}