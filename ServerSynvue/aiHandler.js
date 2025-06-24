// aiHandler.js
const OpenAI = require("openai");
const assistantOptions = require("./assistance");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTE_API,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000/",
    "X-Title": "Mock Interview App",
  },
});

async function getAIReply({ userName, jobPosition, questionList, transcript }) {
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

  const completion = await openai.chat.completions.create({
    model: assistantOptions.model.model,
    messages,
  });

  return completion.choices[0].message.content;
}

module.exports = { getAIReply };
