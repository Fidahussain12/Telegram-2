import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UserLoadingSkeleton from "../components/UserLoadingSkeleton";
import NoChatFound from "../components/NoChatFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const {
    getMyChatPartners,
    chats,
    isUsersLoading,
    setSelectedUser,
    selectedUser,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UserLoadingSkeleton />;
  if (!chats || chats.length === 0) return <NoChatFound />;

  return (
    <>
      {chats.map((chat) => {
        const isSelected = selectedUser?._id === chat._id;

        return (
          <div
            key={chat._id}
            className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
              isSelected
                ? "bg-cyan-500/20 border border-cyan-500/40"
                : "bg-cyan-500/10 hover:bg-cyan-500/20"
            }`}
            onClick={() => setSelectedUser(chat)}
          >
            {/* Left Side: Avatar & Details */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`avatar ${
                  onlineUsers.includes(chat._id) ? "online" : "offline"
                }`}
              >
                <div className="size-10 rounded-full">
                  <img
                    src={chat.profilePic || "/avatar.png"}
                    alt={chat.fullName}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-slate-200 font-medium truncate text-sm">
                  {chat.fullName}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {chat.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>

            {/* Right Side: Unread Count Badge */}
            {chat.unreadCount > 0 && !isSelected && (
              <span className="bg-cyan-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}

export default ChatsList;