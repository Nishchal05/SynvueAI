const express = require('express');
const { WebSocketServer } = require('ws');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

const assistantOptions = require('./assistance');

const app = express();
const port = 8080;

const server = app.listen(port, () => {
  console.log("✅ Server is listening on", `http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTE_API,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000/',
    'X-Title': 'Mock Interview App'
  }
});

wss.on("connection", (ws) => {
  console.log("🎧 Client connected");

  // 🔹 Variables per client connection
  let initialized = false;
  let questionList = [];
  let userName = "Candidate";
  let jobPosition = "Developer";
  let questionIndex = 0;

  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      console.log(parsed)
      // 🔸 1. Handle INIT (only once)
      if (parsed.type === "init") {
        const details = parsed.interviewDetails || {};
        userName = details?.name || "Candidate";
        jobPosition = details?.interviewdetails?.domain || "Developer";
        questionList = details?.interviewdetails?.questions || [];
        initialized = true;

        const greeting = `Hi ${userName}, great to have you here! Let's get started.`;
        const firstQuestion = questionList[0]?.question || "Tell me about yourself.";
        ws.send("🤖 AI: " + greeting + " " + firstQuestion);
        return;
      }

      // 🔸 2. Handle Transcript Messages
      if (parsed.type === "transcript" && initialized) {
        const transcript = parsed.message.trim();
        if (!transcript) return;

        // Build system prompt
        const systemPrompt = assistantOptions.model.messages[0].content
          .replace("{{userName}}", userName)
          .replace(
            "{{questionList}}",
            questionList.map((q, i) => `${i + 1}. ${q}`).join("\n")
          )
          .replace("{{jobPosition}}", jobPosition);

        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ];

        // Get AI reply
        const completion = await openai.chat.completions.create({
          model: assistantOptions.model.model,
          messages,
        });

        const reply = completion.choices[0].message.content;

        // 🔹 Combine AI feedback + next question
        let fullReply = `💬 ${reply.trim()}\n\n`;
        questionIndex++; // move to next question

        if (questionIndex < questionList.length) {
          fullReply += `👉 Next question: ${questionList[questionIndex]?.question}`;
        } else {
          fullReply += `✅ That concludes the interview. Thank you, ${userName}!`;
        }

        ws.send("🤖 AI: " + fullReply);
      }
    } catch (error) {
      console.error("❌ AI Error:", error.message);
      ws.send("❌ AI Error: " + error.message);
    }
  });
});
