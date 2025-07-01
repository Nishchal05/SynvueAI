const express = require("express");
const { WebSocketServer } = require("ws");
const OpenAI = require("openai");
const path = require("path");
require("dotenv").config();
const app = express();
const assistantOptions = require("./assistance");
const cors = require("cors");
app.use(cors()); 
const port = 8080;
app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});
const server = app.listen(port, () => {
  console.log("✅ Server is listening on", `http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTE_API,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000/",
    "X-Title": "Mock Interview App",
  },
});

wss.on("connection", (ws) => {
  console.log("🎧 Client connected");

  let initialized = false;
  let questionList = [];
  let userName = "Candidate";
  let jobPosition = "Developer";
  let questionIndex = 0;
  let chatHistory = [];

  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      console.log(parsed);

      // 🔹 INIT
      if (parsed.type === "init") {
        const details = parsed.interviewDetails || {};
        userName = details?.name || "Candidate";
        jobPosition = details?.interviewdetails?.domain || "Developer";
        questionList = details?.interviewdetails?.questions || [];
        initialized = true;
        questionIndex = 0;

        const greeting = `Hi ${userName}, great to have you here! Let's get started.`;
        const firstQuestion = questionList[0]?.question || "Tell me about yourself.";

        const systemPrompt = assistantOptions.model.messages[0].content
          .replace("{{userName}}", userName)
          .replace(
            "{{questionList}}",
            questionList.map((q, i) => `${i + 1}. ${q}`).join("\n")
          )
          .replace("{{jobPosition}}", jobPosition);

        chatHistory = [{ role: "system", content: systemPrompt }];

        ws.send("🤖 AI: " + greeting + " " + firstQuestion);
        return;
      }

      // 🔸 TRANSCRIPT
      if (parsed.type === "transcript" && initialized) {
        const transcript = parsed.message.trim();
        if (!transcript) return;

        // Handle "I don't know" type responses
        if (/don't know|explain|hint|help/i.test(transcript.toLowerCase())) {
          const hintResponse = `That's okay! Let me try rephrasing: ${
            questionList[questionIndex]?.question || "Could you elaborate?"
          }`;
          ws.send("🤖 AI: " + hintResponse);
          return;
        }

        chatHistory.push({ role: "user", content: transcript });

        const completion = await openai.chat.completions.create({
          model: assistantOptions.model.model,
          messages: chatHistory,
        });

        const reply = completion.choices[0].message.content;
        chatHistory.push({ role: "assistant", content: reply });

        let fullReply = `💬 ${reply.trim()}\n\n`;

        questionIndex++;
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
