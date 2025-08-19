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
Goal: Evaluate how well the candidate’s resume aligns with the provided job description (JD). Focus ONLY on content, formatting, structure, and keyword alignment. 🛑 Ignore all timeline/date information (years, months, durations).
Scoring (0–100). Use this exact weighted rubric:
- Keyword & Skills Alignment: up to 40 pts
  • Match hard skills, tools, frameworks, and role-specific keywords from the JD.
  • Fewer relevant skills = fewer points.
- Profile Summary Presence: 5 pts
  • +5 if a profile/summary/objective/about section exists; else 0.
- Education Quality: up to 10 pts
  • Look for a clear Education section with degree/qualification and institution (program/major optional).
  • Full 10 if clearly written; partial if missing key elements; 0 if absent.
- Projects Count & Relevance: up to 15 pts
  • Require ≥2 projects. If 0–1 project, cap at 5; if ≥2 but weakly relevant, 8–12; strong and relevant, 13–15.
- Experience Presence & Relevance: up to 15 pts
  • Require ≥1 experience (job/internship/freelance). If none, 0. If present but weakly relevant, 6–10; strong and relevant, 11–15.
- Length & Brevity (early-career target = 1 page): up to 10 pts
  • Estimate pages by words (≈600 words/page). estimatedPages = round((wordCount/600)*10)/10.
  • 1.0 page or less → 10 pts. 1.1–1.5 pages → 5–8 pts. ≥2 pages → 0–3 pts and advise one page.
- Role Consistency (no mixed roles): up to 5 pts
  • Deduct if resume mixes unrelated roles (e.g., applying for Software but listing VLSI/ASIC/RTL/Verilog/Cadence/Synopsys-heavy content). 
  • 5 = fully consistent; 0–3 if off-role content appears; call it out and advise removal.

Additional Rules:
- Be strict. Reserve 95+ only for exceptional alignment across all dimensions.
- If resume spans 2–3 pages, explicitly advise compressing to 1 page and reduce Length score accordingly.
- If skills are sparse or generic versus JD, reduce Keyword & Skills Alignment.
- Detect sections by common headings/synonyms:
  • Summary/Profile/Objective/About = profile summary
  • Education/Academics
  • Projects/Personal Projects/Academic Projects/Portfolio
  • Experience/Work Experience/Professional Experience/Internship
- Identify and list:
  • missingKeywords (important JD terms absent from resume)
  • offRoleItems (skills/projects clearly from another job family)
- Do not penalize or reward anything related to dates or recency.

Output format: return ONLY strict JSON (no markdown, no extra text). Use this schema exactly:

{
  "atsScore": number,                        // 0–100 final score using the rubric above
  "breakdown": {
    "keywordAlignment": number,              // 0–40
    "profileSummary": number,                // 0 or 5
    "educationQuality": number,              // 0–10
    "projects": number,                      // 0–15
    "experience": number,                    // 0–15
    "lengthBrevity": number,                 // 0–10
    "roleConsistency": number                // 0–5
  },
  "checks": {
    "hasProfileSummary": boolean,
    "educationPresent": boolean,
    "projectCount": number,
    "experienceCount": number,
    "estimatedPages": number,                // e.g., 1.3
    "mixedRolesDetected": boolean
  },
  "missingKeywords": [ "string", ... ],
  "offRoleItems": [ "string", ... ],
  "feedback": [
    { "title": "string", "suggestion": "string", "isPositive": boolean },
    { "title": "string", "suggestion": "string", "isPositive": boolean },
    { "title": "string", "suggestion": "string", "isPositive": boolean },
    { "title": "string", "suggestion": "string", "isPositive": boolean }
  ]
}

Feedback requirements:
- Provide 4–6 bullet points total (mix of positive and critical).
- Always include:
  • Advice to compress to one page if estimatedPages > 1.0 (especially if ≥2.0).
  • If mixedRolesDetected = true, explicitly say which items to remove (e.g., “VLSI/RTL/Verilog projects/skills”).
  • At least one concrete keyword gap with examples to add naturally.
  • One formatting/structure improvement tip (headings, bullet clarity, quantification, action verbs).
- Keep suggestions actionable and concise.

Inputs:
👨‍💼 Job Description:
"""${jobDescription}"""

📄 Resume Text:
"""${resumeText}"""

Process:
1) Extract JD keywords (skills, tools, responsibilities) → compare to resume → compute keywordAlignment.
2) Detect sections and counts (summary, education, projects, experience).
3) Estimate pages from word count (≈600 words/page).
4) Detect off-role items versus the JD’s primary role.
5) Fill JSON with the rubric scores that sum to 100 and detailed checks/feedback.

Return only the JSON object. If resumeText is empty, return a valid JSON with atsScore=0 and feedback explaining missing input.
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