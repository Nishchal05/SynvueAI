import { useEffect, useState } from 'react';

const useWebSocket = (url) => {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(url);
    setWs(socket);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsReady(true);
    };

    socket.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setMessages((prev) => [...prev, parsed.message]);
    };

    socket.onclose = () => {
      console.warn("🛑 WebSocket closed");
      setIsReady(false);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setIsReady(false);
    };

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ result: message, type: 'userdata' }));
    }
  };

  const sendUserResponse = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ userresponse: message, type: 'response' }));
    }
  };

  return { messages, sendMessage, sendUserResponse, isReady };
};

export default useWebSocket;
