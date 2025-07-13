const { createServer } = require('http');
const WebSocket = require('ws');
const OpenAI = require('openai');
require('dotenv').config();

const clientConversations = new Map(); // Map<ws, { history, index, questions, jobrole, username }>

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://synvue-ai.vercel.app/', // Your frontend URL
    'X-Title': 'Mock Interview AI',
  },
});

const server = createServer();
const wss = new WebSocket.Server({ server });

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
              content: `You are a professional virtual interviewer for a ${jobrole} position. Your task is to conduct a mock interview.
              1. Start by greeting the candidate by their name, '${username}'.
              2. Ask one question at a time from the provided list. Do not make up your own questions.
              3. After the candidate answers, provide brief, constructive feedback on their response.
              4. Then, seamlessly ask the next question.
              5. Keep your responses concise and professional.
              6. When all questions are asked, provide a concluding remark and end the interview.`
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
        model: "meta-llama/llama-3.3-70b-instruct:free", // Corrected and valid model name
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
server.listen(PORT, () => {
  console.log(`✅ WebSocket server ready on port ${PORT}`);
});
