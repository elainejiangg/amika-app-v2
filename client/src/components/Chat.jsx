import React, { useState, useEffect, useRef, useContext } from "react";
import TypingIndicator from "./TypingIndicator";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../AuthContext";

export default function Chat() {
  const [message, setMessage] = useState(""); // user input message
  const [chatHistory, setChatHistory] = useState(() => {
    // Retrieve chat history from sessionStorage if it exists
    const savedChatHistory = sessionStorage.getItem("chatHistory");
    return savedChatHistory ? JSON.parse(savedChatHistory) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const chatEndRef = useRef(null);
  const { profile } = useContext(AuthContext);

  useEffect(() => {
    // Save chat history to sessionStorage whenever it updates
    sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      console.log("Message is empty, not sending");
      return;
    }

    console.log("Sending message:", message);

    setPendingMessage(message);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5050/chat/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          googleId: profile.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      console.log("Received response:", data);

      setChatHistory(data.messages);
      setMessage("");
    } catch (error) {
      console.error("Error:", error);
      // Handle error (e.g., display error message to user)
    } finally {
      setPendingMessage(null);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, pendingMessage]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 pb-6">
      <h3 className="text-lg font-semibold mb-4">Chat</h3>
      <div className="flex-grow mb-4 border p-4 overflow-y-scroll whitespace-normal">
        {[...chatHistory].reverse().map((chat, index) => (
          <div key={index} className="mb-2 text-xs">
            <div>
              <strong className="text-sm">
                {chat.role === "user" ? "You" : "Amika"}:{" "}
              </strong>
              <ReactMarkdown className="whitespace-pre-wrap">
                {chat.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {pendingMessage && (
          <>
            <div className="mb-2 text-xs">
              <div>
                <strong className="text-sm">You: </strong>
                <pre className="break-words">{pendingMessage}</pre>
              </div>
            </div>
            <div className="pt-4">
              <strong className="text-sm">
                Amika: <TypingIndicator />
              </strong>
            </div>
          </>
        )}

        <div ref={chatEndRef} />
      </div>
      <div className="flex text-sm">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="border p-2 flex-grow"
          placeholder="Send a Message"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 rounded px-4 text-white ml-2"
          disabled={isLoading}
        >
          <strong>Send</strong>
        </button>
      </div>
    </div>
  );
}
