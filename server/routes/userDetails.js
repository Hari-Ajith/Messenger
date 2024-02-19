import express from "express";
import User from "../model/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/getAllUsers", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/verifyUser", async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          res.status(401).json({ error: "Token expired" });
        } else {
          console.error("JWT verification error:", err);
          res.status(500).json({ error: "Internal server error" });
        }
      } else {
        res.json(userData);
      }
    });
  } else {
    res.status(401).json({ error: "No user found" });
  }
});

router.get("/getUserByUsername/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("username _id email");
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getUserByEmail/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email }).select("username _id email");
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/createNew", async (req, res) => {
  console.log(req);
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log("USER CREATED ", createdUser);
    if (createdUser) {
      jwt.sign(
        {
          userId: createdUser._id,
          userEmail: createdUser.email,
          userName: createdUser.username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        },
        (err, token) => {
          if (err) throw err;
          res
            .status(201)
            .cookie("token", token, { sameSite: "none", secure: true })
            .json({
              message: "User created successfully",
              user: {
                userId: createdUser._id,
                userName: createdUser.username,
                userEmail: createdUser.email,
              },
            });
        }
      );
    } else {
      res.status(500).json({ message: "Failed to create user" });
    }
  } catch (error) {
    console.log("USER CREATION FAILED ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "No user found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    jwt.sign(
      {
        userId: user._id,
        userEmail: user.email,
        userName: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
      (err, token) => {
        if (err) throw err;
        res
          .status(200)
          .cookie("token", token, { sameSite: "none", secure: true })
          .json({
            message: "Login successful",
            user: {
              userId: user._id,
              userName: user.username,
              userEmail: user.email,
            },
          });
      }
    );
  } catch (error) {
    console.log("Login failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signout", async (req, res) => {
  res.clearCookie("token").sendStatus(200);
});

export default router;
