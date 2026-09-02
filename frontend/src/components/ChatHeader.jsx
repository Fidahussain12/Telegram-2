import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { XIcon } from "lucide-react";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers = [] } = useAuthStore();
  

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [setSelectedUser]);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 h-[84px] px-6">
      <div className="flex items-center gap-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img
              src={selectedUser?.profilePic || "/avatar.png"}
              alt={selectedUser?.fullName || "User"}
            />
          </div>
        </div>
        <div>
          <h3 className="text-slate-200 font-medium">
            {selectedUser?.fullName}
          </h3>
          <p className="text-slate-400 text-xs">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Close/Back button to unselect user on mobile or desktop */}
      <button
        type="button"
        onClick={() => setSelectedUser(null)}
        className="text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Close chat"
      >
        <XIcon className="size-6" />
      </button>
    </div>
  );
}

export default ChatHeader;