import React, { useState, useEffect, useRef } from "react";
import TypingIndicator from "./TypingIndicator";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const [message, setMessage] = useState(""); // user input message
  const [chatHistory, setChatHistory] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // whether initial chat history has been fetched from localStorage
  const [pendingMessage, setPendingMessage] = useState(null); // set to user message if user message is just sent and is awaiting bot response, null otherwise
  const chatEndRef = useRef(null); // Reference to the end of the chat for auto-scrolling

  // Load chat history from local storage when the component mounts
  useEffect(() => {
    console.log("Component mounted");
    const savedChatHistory = localStorage.getItem("chatHistory");
    if (savedChatHistory) {
      console.log("Loaded chat history from local storage:", savedChatHistory);
      setChatHistory(JSON.parse(savedChatHistory));
    } else {
      console.log("No chat history found in local storage");
    }
    setIsInitialLoading(false); // Set loading to false after loading initial chat history
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (!isInitialLoading) {
      // Avoid saving to local storage on initial load
      console.log("Chat history updated:", chatHistory);
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory, isInitialLoading]);

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      console.log("Message is empty, not sending");
      return;
    }

    console.log("Sending message:", message);

    // Set the pending message
    setPendingMessage(message);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5050/chat/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Wait for the bot's response
      const botResponse = await response.json();
      console.log("Received response:", botResponse);

      // Update the chat history with the user's message and bot's response
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { user: message, bot: botResponse.reply },
      ]);
    } catch (error) {
      console.error("Error:", error);
      // Handle error (e.g., display error message to user)
    } finally {
      // Clear the pending message
      setPendingMessage(null);
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

  if (isInitialLoading) {
    return <div>Loading...</div>; // Show loading indicator while loading
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 pb-6">
      <h3 className="text-lg font-semibold mb-4">Chat</h3>
      <div className="flex-grow mb-4 border p-4 overflow-y-scroll whitespace-normal">
        {chatHistory.map((chat, index) => (
          <div key={index} className="mb-2 text-xs">
            <div>
              <strong className="text-sm">You: </strong>
              {chat.user}
            </div>
            <div className="pt-4">
              <strong className="text-sm">Amika:</strong>
              <ReactMarkdown className="whitespace-pre-wrap">
                {/* <div className="whitespace-pre-wrap markdown-content"> */}
                {chat.bot}
                {/* </div> */}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {pendingMessage && (
          <>
            <div className="mb-2 text-xs">
              <div>
                <strong className="text-sm">Amika:</strong>
                <pre className="break-words">{pendingMessage}</pre>
              </div>
            </div>
            <div className="pt-4">
              <strong className="text-sm">
                Bot: <TypingIndicator />
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
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 rounded px-4 text-white ml-2"
        >
          <strong>Send</strong>
        </button>
      </div>
    </div>
  );
}
