import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import userDetailsRoute from "./routes/userDetails.js";
import messageDetailsRoute from "./routes/userMessages.js";
import jwt from "jsonwebtoken";
import Message from "./model/messageModal.js";
import { WebSocketServer } from "ws";

dotenv.config();

const app = express();
const { PORT, MONGODB_URL, LOCAL } = process.env;

// Middleware
app.use(cors({ credentials: true, origin: LOCAL }));
app.use(cookieParser());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", userDetailsRoute);
app.use("/getMessages", messageDetailsRoute);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });
const userConnections = new Map();

wss.on("connection", (connection, req) => {
  let heartbeatInterval;
  const startHeartbeat = () => {
    heartbeatInterval = setInterval(() => {
      connection.ping();
    }, 30000);
  };

  const stopHeartbeat = () => {
    clearInterval(heartbeatInterval);
  };

  connection.on("pong", () => {
    console.log(`Client ${connection.userName} is active.`);
  });

  connection.on("message", async (message) => {
    try {
      const textMessage = new TextDecoder().decode(message);
      console.log("Received message:", textMessage);
      const parsedMessage = JSON.parse(textMessage);
      const { recipient, message: messageContent } = parsedMessage;

      const messageDataForDb = {
        sender: connection.userId,
        recipient,
        message: messageContent,
      };
      const messageResponse = await saveMessageToDb(messageDataForDb);

      const messageSender = {
        senderId: connection.userId,
        senderName: connection.userName,
        messageId: messageResponse._id,
      };
      sendMessageToRecipient(recipient, messageContent, messageSender);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  connection.on("close", () => {
    console.log(`Connection closed for user ${connection.userName}`);
    stopHeartbeat();
  });

  // Validate user token and set up connection
  const token = extractTokenFromCookie(req.headers.cookie);
  jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        console.log("Token has expired");
        connection.close();
      } else {
        console.error("JWT verification error:", err);
        connection.close();
      }
    } else {
      const { userId, userName, userEmail } = userData;
      connection.userId = userId;
      connection.userName = userName;
      connection.userEmail = userEmail;
      
      userConnections.set(userId, connection);

      broadcastActiveUsers();
      startHeartbeat();
    }
  });
});

async function saveMessageToDb(dataBaseObject) {
  try {
    const messageResponse = await Message.create(dataBaseObject);
    console.log("Message Post", messageResponse);
    return messageResponse;
  } catch (error) {
    console.log(error);
  }
}

function sendMessageToRecipient(recipientId, message, messageSender) {
  const recipientConnection = userConnections.get(recipientId);
  if (recipientConnection) {
    recipientConnection.send(
      JSON.stringify({
        messageType: "Text Message",
        messageBody: { sender: messageSender, message },
      })
    );
  } else {
    console.log(`Recipient ${recipientId} is not connected.`);
  }
}

function extractTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const tokenCookieString = cookieHeader
    .split(";")
    .find((str) => str.trim().startsWith("token="));
  if (!tokenCookieString) return null;
  return tokenCookieString.split("=")[1];
}

function broadcastActiveUsers() {
  const activeUsers = Array.from(wss.clients).map((client) => ({
    userId: client.userId,
    userName: client.userName,
    userEmail: client.userEmail,
  }));

  const sendAciveStatus = {
    messageType: "Online",
    messageBody: activeUsers,
  };
  const activeUsersJSON = JSON.stringify(sendAciveStatus);
  wss.clients.forEach((client) => {
    client.send(activeUsersJSON);
  });
}

// MongoDB connection
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Connection to MongoDB Failed:", error.message);
    process.exit(1);
  }
};

connectToMongoDB();

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});
