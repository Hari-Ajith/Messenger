import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
