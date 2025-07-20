const { createServer } = require('http');
const WebSocket = require('ws');
const OpenAI = require('openai');
require('dotenv').config();
const express = require('express');

const app = express();
app.get('/ws', (req, res) => res.send('WebSocket server is running'));
const clientConversations = new Map();
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://synvue-ai.vercel.app/', // Your frontend URL
    'X-Title': 'Mock Interview AI',
  },
});

const server = createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on('connection', (ws) => {
  console.log('👤 Client connected');

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      let context = clientConversations.get(ws);

      // 1. Initial setup when user data is first received
      if (message.type === 'userdata' && message.result) {
        const { username, jobrole, questions } = message.result;
        
        context = {
          history: [
            {
              role: "system",
              content: `You are a professional virtual interviewer for a ${jobrole} position.
              
            Conduct a mock interview with '${username}' using the following strict rules:
            
            1. Greet '${username}' very briefly (1 sentence max).
            2. Ask one question at a time from the provided list only.
            3. After each answer, give short feedback (1 sentence only).
            4. Then, immediately ask the next question.
            5. Do not introduce yourself or repeat the job role again.
            6. Keep your language formal, clear, and extremely concise.
            7. Do not add extra commentary or explanations.
            8. After the final question, thank the candidate in one line and end the session.`
            }            
          ],
          index: 0,
          questions: questions.map((q) => q.question),
          jobrole,
          username,
        };
        clientConversations.set(ws, context);

        // First message to the AI to kick things off
        const firstQuestion = context.questions[context.index];
        context.history.push({ role: "user", content: `Start the interview and ask the first question: "${firstQuestion}"` });
      
      // 2. Handling user's response to a question
      } else if (message.type === 'response' && context) {
        const userReply = message.userresponse;
        context.history.push({ role: "user", content: userReply });

        // Check if the interview is over
        if (context.index >= context.questions.length -1) {
          context.history.push({ role: "user", content: "The user has answered the final question. Provide final feedback and conclude the interview." });
        } else {
            context.index += 1;
            const nextQuestion = context.questions[context.index];
            context.history.push({ role: "user", content: `The user has replied. Provide feedback on their answer and then ask the next question: "${nextQuestion}"` });
        }
      } else {
          // If message type is unknown or context is missing, do nothing.
          return;
      }
      
      // 3. Common logic: Call OpenAI and send response
      const completion = await openai.chat.completions.create({
        // 👇 FIX: Replace the model name here
        model: "google/gemini-2.0-flash-exp:free", 
        messages: context.history,
      });

      const aiResponse = completion.choices[0].message.content;
      context.history.push({ role: "assistant", content: aiResponse }); // Save AI's response to history
      
      clientConversations.set(ws, context); // Update context
      
      ws.send(JSON.stringify({ from: "ai", message: aiResponse }));

    } catch (err) {
      console.error("❌ Error:", err);
      ws.send(JSON.stringify({ from: "server", message: "An internal error occurred." }));
    }
  });

  ws.on('close', () => {
    console.log("🔌 Client disconnected");
    clientConversations.delete(ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WebSocket server ready on 0.0.0.0:${PORT}`);
});
