// wsHandler.js
const { getAIReply } = require("./aiHandler");

function handleWebSocketConnection(ws) {
  let initialized = false;
  let questionList = [];
  let userName = "Candidate";
  let jobPosition = "Developer";
  let questionIndex = 0;

  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.type === "init") {
        const details = parsed.interviewDetails || {};
        userName = details?.name || "Candidate";
        jobPosition = details?.interviewdetails?.domain || "Developer";
        questionList = details?.interviewdetails?.questionsa || [];

        initialized = true;

        const greeting = `Hi ${userName}, great to have you here! Let's get started.`;
        const firstQuestion = questionList[0] || "Tell me about yourself.";
        ws.send("🤖 AI: " + greeting + " " + firstQuestion);
        return;
      }

      if (parsed.type === "transcript" && initialized) {
        const transcript = parsed.message.trim();
        if (!transcript) return;

        const reply = await getAIReply({
          userName,
          jobPosition,
          questionList,
          transcript,
        });

        let fullReply = `💬 ${reply.trim()}\n\n`;

        questionIndex++;
        if (questionIndex < questionList.length) {
          fullReply += `👉 Next question: ${questionList[questionIndex]}`;
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

  ws.on("close", () => {
    console.log("❌ WebSocket closed");
  });
}

module.exports = { handleWebSocketConnection };
