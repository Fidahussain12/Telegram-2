import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ChatContainer from "./ChatContainer";
import ChatsList from "./ChatsList";
import ActiveTabSwitch from "./ActiveTabSwitch";
import NoConversationPlaceholder from "./NoConversationPlaceholder";
import ContactList from "./ContactList";
import ProfileHeader from "./ProfileHeader";

function ChatPage() {
  const {
    activeTab,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="relative w-full max-w-6xl h-[100dvh] sm:h-[800px] overflow-hidden">
      <BorderAnimatedContainer>
        {/* Left Side: Mobile par hidden jab selectedUser true ho */}
        <div
          className={`w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col ${
            selectedUser ? "hidden md:flex" : "flex"
          }`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* Right Side: Mobile par hidden jab selectedUser null ho */}
        <div
          className={`flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm overflow-hidden ${
            !selectedUser ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}

export default ChatPage;