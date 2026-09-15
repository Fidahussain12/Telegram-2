import React, { useEffect, useRef } from "react";
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

  // 2. Instant Auto-scroll to Bottom when messages or selectedUser change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isMessagesLoading, selectedUser?._id]);

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-slate-900/50 relative">
      <ChatHeader />

      {/* Messages List Area with Ref */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 px-4 sm:px-6 overflow-y-auto py-4 sm:py-6"
      >
        {messages?.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg._id || `msg-${index}`}
                className={`chat ${msg.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative max-w-[85%] sm:max-w-[70%] ${
                    msg.senderId === authUser?._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg max-h-48 w-full object-cover mb-2"
                      onLoad={() => {
                        // Image load hone ke baad dubara scroll bottom par adjust kar de
                        if (scrollContainerRef.current) {
                          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                        }
                      }}
                    />
                  )}
                  {msg.text && <p className="break-words text-sm sm:text-base">{msg.text}</p>}
                  <p className="text-[10px] sm:text-xs mt-1 opacity-70 text-right">
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