import express from "express";
import Message from "../model/messageModal.js";
import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

const router = express.Router();

router.get("/:selectedUserId?", async (req, res) => {
  const token = req.cookies?.token;
  const { selectedUserId } = req.params;
  try {
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token has expired" });
        }
        console.error("JWT verification error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      const { userId } = userData;
      let messages;
      if (selectedUserId) {
        messages = await Message.find({
          $or: [
            { sender: userId, recipient: selectedUserId },
            { sender: selectedUserId, recipient: userId },
          ],
        }).sort({ createdAt: -1 });
      } else {
        const messageResponse = await Message.find(
          {
            $or: [{ sender: userId }, { recipient: userId }],
          },
          { sender: 1, recipient: 1, _id: 1 }
        );

        const uniqueUserId = [];
        messageResponse.forEach((message) => {
          const { sender, recipient } = message;
          if (!uniqueUserId.includes(sender.toString())) {
            if (sender != userId) uniqueUserId.push(sender.toString());
          }
          if (!uniqueUserId.includes(recipient.toString())) {
            if (recipient != userId) uniqueUserId.push(recipient.toString());
          }
        });
        const userDetailsFromDb = await Promise.all(
          uniqueUserId?.map(async (_id) => {
            const user = await User.findOne({ _id }).select(
              "username _id email"
            );
            return user;
          })
        );
        messages = userDetailsFromDb.filter((user) => user);
      }
      if (messages?.length > 0) {
        return res.status(200).json(messages);
      } else {
        return res.status(404).json({ message: "No messages found" });
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
