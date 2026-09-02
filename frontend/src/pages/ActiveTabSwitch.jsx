import React from 'react'
import { useChatStore } from '../store/useChatStore'

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2 grid grid-cols-2">
      <button 
        onClick={() => setActiveTab("chats")}
        className={`tab ${
          activeTab === "chats" ? "bg-cyan-400 text-slate-900 font-medium" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Chats
      </button>

      <button 
        onClick={() => setActiveTab("contacts")}
        className={`tab ${
          activeTab === "contacts" ? "bg-cyan-400 text-slate-900 font-medium" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}

export default ActiveTabSwitch;