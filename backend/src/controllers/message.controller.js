import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// 1. All Users (Contacts) Fetch
export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Specific User Ke Messages Fetch
export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 3. Send Message Controller (Optimized Realtime Emit)
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required" });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      isRead: false,
    });

    await newMessage.save();

    // Direct emit on both event names for 100% real-time delivery
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("newMessages", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 4. Chat Partners (Sidebar Data)
export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    }).sort({ createdAt: -1 });

    const partnersMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.senderId.toString() === loggedInUserId.toString();
      const partnerId = isSender ? msg.receiverId.toString() : msg.senderId.toString();

      if (!partnersMap.has(partnerId)) {
        partnersMap.set(partnerId, {
          lastMessage: msg.text || (msg.image ? "📷 Photo" : ""),
          lastMessageTime: msg.createdAt,
          unreadCount: (!isSender && msg.isRead === false) ? 1 : 0,
        });
      } else {
        if (!isSender && msg.isRead === false) {
          const currentData = partnersMap.get(partnerId);
          currentData.unreadCount += 1;
        }
      }
    });

    const partnerIds = Array.from(partnersMap.keys());
    const users = await User.find({ _id: { $in: partnerIds } }).select("-password");

    const chatPartners = users.map((user) => {
      const extraData = partnersMap.get(user._id.toString());
      return {
        ...user.toObject(),
        lastMessage: extraData?.lastMessage || "",
        lastMessageTime: extraData?.lastMessageTime || null,
        unreadCount: extraData?.unreadCount || 0,
      };
    });

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 5. Unread Messages Ko Read Mark Karne Ki Controller
export const markAsRead = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: senderId } = req.params;

    await Message.updateMany(
      { senderId: senderId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.log("Error in markAsRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};