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
          <button
            key={chat._id}
            type="button"
            onClick={() => setSelectedUser(chat)}
            className={`w-full text-left p-3 rounded-lg cursor-pointer select-none touch-manipulation transition-colors flex items-center justify-between gap-2 min-h-[60px] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              isSelected
                ? "bg-cyan-500/20 border border-cyan-500/40"
                : "bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/25 border border-transparent"
            }`}
          >
            {/* Left Side: Avatar & Details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`avatar shrink-0 ${
                  onlineUsers.includes(chat._id) ? "online" : "offline"
                }`}
              >
                <div className="size-10 rounded-full overflow-hidden">
                  <img
                    src={chat.profilePic || "/avatar.png"}
                    alt={chat.fullName}
                    loading="lazy"
                    className="w-full h-full object-cover"
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
              <span className="bg-cyan-500 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}

export default ChatsList;