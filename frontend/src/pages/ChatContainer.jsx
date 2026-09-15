import React, { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "../components/ChatHeader";
import NoChatHistoryPlaceholder from "../components/NoChatHistoryPlaceholder.jsx";
import MessageInput from "../components/MessageInput.jsx";
import MessagesLoadingSkeleton from "../components/MessagesLoadingSkeleton.jsx";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const scrollContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // rAF: layout settle hone ke baad scroll karo (mobile par zyada reliable)
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  // 1. Fetch messages & subscribe to socket on user select
  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser?._id]);

  // 2. Auto-scroll to bottom when messages or selectedUser change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isMessagesLoading, selectedUser?._id, scrollToBottom]);

  // 3. Mobile keyboard khulne/band hone par view ko bottom par rakho
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    vv.addEventListener("resize", scrollToBottom);
    return () => vv.removeEventListener("resize", scrollToBottom);
  }, [scrollToBottom]);

  return (
    <div className="flex-1 flex flex-col h-[100dvh] md:h-full w-full min-h-0 overflow-hidden bg-slate-900/50 relative">
      <ChatHeader />

      {/* Messages List Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 px-3 sm:px-6 py-3 sm:py-6 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]"
      >
        {messages?.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-2.5 sm:space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg._id || `msg-${index}`}
                className={`chat ${msg.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative max-w-[80vw] sm:max-w-[70%] px-3 py-2 ${
                    msg.senderId === authUser?._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      loading="lazy"
                      decoding="async"
                      className="rounded-lg w-full max-w-[220px] sm:max-w-[260px] max-h-64 object-cover mb-2"
                      onLoad={scrollToBottom}
                    />
                  )}
                  {msg.text && (
                    <p className="break-words whitespace-pre-wrap text-[15px] sm:text-base leading-snug">
                      {msg.text}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs mt-1 opacity-70 text-right tabular-nums">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      <MessageInput />
    </div>
  );
}

export default ChatContainer;