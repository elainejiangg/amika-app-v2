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
    <div className="flex flex-col h-[calc(100vh-4rem)] pb-6 rounded-2xl bg-gradient-to-t from-indigo-200 from-10% via-blue-50 to-sky-50">
      <div
        className="flex flex-row bg-sky-950 rounded-t-2xl text-white text-4xl pl-2 h-16 align-items "
        style={{ fontFamily: "Wildly Sans, sans-serif" }}
      >
        <svg
          width="60"
          height="64"
          fill="white"
          viewbox="0 0 64 12 64"
          xmlns="http://www.w3.org/2000/svg"
          className="pt-1"
        >
          <circle cx="32" cy="28" r="21" />
        </svg>
        <h1 className="pt-2">Amika</h1>
      </div>
      <div className="flex-grow mb-4 p-4 overflow-y-scroll whitespace-normal ">
        {[...chatHistory].reverse().map((chat, index) => (
          <div key={index} className="mb-2 text-xs ">
            <div className="relative">
              <ReactMarkdown
                className={`whitespace-pre-wrap bg-white  rounded-lg px-3 py-2 w-1/2  mx-3 ${
                  chat.role === "user" ? "ml-auto" : "mr-auto"
                }`}
              >
                {chat.role === "user"
                  ? chat.content
                  : console.log(chat.content) ||
                    chat.content.replace(/^(NULL|UPDATE)\s*\n/, "")}
              </ReactMarkdown>
              <div className="text-sm font-semibold py-1">
                {chat.role === "user" ? (
                  <div className="text-right mr-5 flex flex-row justify-end ">
                    <p>You</p>
                  </div>
                ) : (
                  <div className="text-left ml-5 ">Amika</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {pendingMessage && (
          <>
            <div className="relative">
              <div className="whitespace-pre-wrap bg-white text-xs  rounded-lg px-3 py-2 w-1/2  mx-3  ml-auto">
                {pendingMessage}
              </div>

              <div className="text-sm font-semibold py-1">
                <div className="text-right mr-5 flex flex-row justify-end ">
                  <p>You</p>
                </div>

                <div className="text-left ml-5 ">
                  <div className="w-12 bg-white px-3 pb-1 rounded-full mb-1">
                    <TypingIndicator />
                  </div>
                  Amika
                </div>
              </div>
            </div>
            {/* <div className="mb-2 text-xs">
              <div>
                <div className="text-right mr-5 flex flex-row justify-end ">
                  <p>You</p>
                </div>
                {pendingMessage}
              </div>
            </div>
            <div className="pt-4">
              <div className="text-left ml-5 ">
                Amika: <TypingIndicator />
              </div>
            </div> */}
          </>
        )}

        <div ref={chatEndRef} />
      </div>
      <div className="relative block text-sm h-1/3 text-left align-top mx-6">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className=" text-left align-top p-2 w-full h-full flex-grow rounded-xl min-h-10"
          placeholder="Type Message..."
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className={`absolute right-1 bottom-1 lg:right-2  py-0.5 bg-sky-950 rounded-lg px-1 pl-2 bg-sky-950  z-50 ${
            isLoading
              ? "bg-opacity-30 text-slate-100"
              : "bg-opacity-100 text-white"
          }`}
          disabled={isLoading}
        >
          <span
            className="material-icons"
            style={{ transform: "rotate(320deg)" }}
          >
            send
          </span>
        </button>
      </div>
    </div>
  );
}
