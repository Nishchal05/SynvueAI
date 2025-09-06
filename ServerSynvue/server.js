const { createServer } = require('http');
const WebSocket = require('ws');
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.get('/ws', (req, res) => res.send('WebSocket server is running'));
const clientConversations = new Map();
const genAI = new GoogleGenerativeAI(process.env.Gemini_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const server = createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('👤 Client connected');

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      let context = clientConversations.get(ws);

      // Step 1: Setup when user data is received
      if (message.type === 'userdata' && message.result) {
        const { username, jobrole, questions } = message.result;

        context = {
          history: [
            {
              role: 'user',
              content: `You are a professional virtual interviewer for a ${jobrole} position.
Conduct a mock interview with '${username}' using the following rules:
Greet '${username}' briefly (1 sentence max).
Ask one question at a time from the provided list only.
After each answer, give short feedback (1 sentence).
If '${username}' clearly does not know the answer or seems confused, explain it in a clear and concise way.
If needed, provide a simple real-life example to help '${username}' understand better. Only do this if it's truly necessary.
Then, immediately ask the next question.
Do not introduce yourself or repeat the job role again.
Keep your tone formal, respectful, and supportive — but still concise.
Do not add unrelated commentary or explanations.
After the final question, thank the candidate in one line and end the session.
After ending the session, also give constructive feedback highlighting strengths, areas for improvement, and words of encouragement.
If '${username}' replies after the session with questions or doubts, always continue the conversation kindly, answering queries clearly, and staying supportive like a mentor.
`
            }
          ],
          index: 0,
          questions: questions.map((q) => q.question),
          jobrole,
          username
        };
        clientConversations.set(ws, context);

        const firstQuestion = context.questions[context.index];
        context.history.push({ role: 'user', content: `Start the interview and ask the first question: "${firstQuestion}"` });

      } else if (message.type === 'response' && context) {
        const userReply = message.userresponse;
        context.history.push({ role: 'user', content: userReply });

        if (context.index >= context.questions.length - 1) {
          context.history.push({
            role: 'user',
            content: 'The user has answered the final question. Provide final feedback and conclude the interview.'
          });
        } else {
          context.index += 1;
          const nextQuestion = context.questions[context.index];
          context.history.push({
            role: 'user',
            content: `The user has replied. Provide feedback on their answer and then ask the next question: "${nextQuestion}"`
          });
        }
      } else {
        return;
      }

      // Gemini expects message list as array of {role, parts: [{text}]}
      const formattedMessages = context.history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const result = await model.generateContent({
        contents: formattedMessages
      });

      const text = result.response.text();
      context.history.push({ role: 'model', content: text });
      clientConversations.set(ws, context);

      ws.send(JSON.stringify({ from: 'ai', message: text }));

    } catch (err) {
      console.error('❌ Gemini Error:', err);
      ws.send(JSON.stringify({ from: 'server', message: 'An internal error occurred.' }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected');
    clientConversations.delete(ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WebSocket server ready on 0.0.0.0:${PORT}`);
});
