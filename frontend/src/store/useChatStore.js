import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") !== "false",

  toggleSound: () => {
    const newValue = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", newValue);
    set({ isSoundEnabled: newValue });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Updated setSelectedUser for Mobile Telegram Flow
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });

    if (selectedUser) {
      // 1. Direct UI Badge Clear
      set({
        chats: get().chats.map((chat) =>
          chat._id === selectedUser._id ? { ...chat, unreadCount: 0 } : chat
        ),
      });

      // 2. Auto-fetch messages for the selected user
      get().getMessagesByUserId(selectedUser._id);
    }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      await axiosInstance.put(`/messages/mark-as-read/${userId}`);

      // Active state chat array update
      set({
        chats: get().chats.map((chat) =>
          chat._id === userId ? { ...chat, unreadCount: 0 } : chat
        ),
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, chats } = get();
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set({
        messages: get().messages.map((m) =>
          m._id === tempId ? res.data : m
        ),
      });

      set({
        chats: chats.map((chat) =>
          chat._id === selectedUser._id
            ? { ...chat, lastMessage: res.data.text || "📷 Photo" }
            : chat
        ),
      });
    } catch (error) {
      set({ messages: messages.filter((m) => m._id !== tempId) });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessages");
    socket.on("newMessages", (newMessage) => {
      const { selectedUser, isSoundEnabled, chats, messages } = get();

      const isMessageFromSelectedUser =
        selectedUser && newMessage.senderId === selectedUser._id;

      if (isMessageFromSelectedUser) {
        set({ messages: [...messages, newMessage] });

        axiosInstance
          .put(`/messages/mark-as-read/${selectedUser._id}`)
          .catch((err) => console.log("Read mark failed:", err));
      }

      set({
        chats: chats.map((chat) => {
          if (chat._id === newMessage.senderId) {
            return {
              ...chat,
              lastMessage: newMessage.text || "📷 Photo",
              unreadCount: !isMessageFromSelectedUser
                ? (chat.unreadCount || 0) + 1
                : 0,
            };
          }
          return chat;
        }),
      });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) =>
          console.log("Audio play failed:", e)
        );
      }

      if (
        !isMessageFromSelectedUser &&
        Notification.permission === "granted"
      ) {
        new Notification("New Message", {
          body: newMessage.text || "Sent an image",
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessages");
  },
}));