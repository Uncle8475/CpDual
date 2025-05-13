import asyncHandler from "express-async-handler";
import userModel from "../model/userModel.js";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
const RegisterUser = asyncHandler(async (req, res) => {
  const { handle, email, password } = req.body;

  const userExists = await userModel.findOne({ handle });
  if (userExists) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  // Fetch Codeforces data
  let cfUser;
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    cfUser = response.data.result[0];
  } catch (err) {
    res.status(400);
    throw new Error("Invalid Codeforces handle");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create User
  const newUser = await userModel.create({
    handle,
    name: `${cfUser.firstName || handle} ${cfUser.lastName || ""}`.trim(),
    email,
    password: hashedPassword,
    cfRating: cfUser.rating || 0,
    profileImage:
      cfUser.titlePhoto ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    localRating: 1000,
    duelsWon: 0,
    duelsLost: 0,
    totalDuels: 0,
  });

  // Respond
  res.status(201).json({
    _id: newUser._id,
    handle: newUser.handle,
    name: newUser.name,
    email: newUser.email,
    cfRating: newUser.cfRating,
    profileImage: newUser.profileImage,
    localRating: newUser.localRating,
    duelsWon: newUser.duelsWon,
    duelsLost: newUser.duelsLost,
    totalDuels: newUser.totalDuels,
    joinedAt: newUser.joinedAt,
  });
});

// LOGIN
const LoginUser = asyncHandler(async (req, res) => {
  const { handle, password } = req.body;
  if (!handle || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const user = await userModel.findOne({ handle });

  if (user && (await bcrypt.compare(password, user.password))) {
    //  Fetch latest CF data
    let cfData;
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.info?handles=${handle}`
      );
      cfData = response.data.result[0];

      //  Update CF info in database
      user.cfRating = cfData.rating || 0;
      user.profileImage = cfData.titlePhoto || user.profileImage;
      user.name = (cfData.firstName || "") + " " + (cfData.lastName || "");

      await user.save();
    } catch (err) {
      console.error("Failed to update Codeforces info:", err.message);
    }
    //  jwt token making
    const accessToken = jwt.sign(
      {
        user: {
          handle: user.handle,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60m" }
    );

    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Handle or password is not valid");
  }
});

//dashboard
// get reuest
// GET Dashboard Info
const DashboardUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await userModel
    .findById(userId)
    .select(
      "handle name email profileImage cfRating localRating duelsWon duelsLost totalDuels"
    );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

export { RegisterUser, LoginUser, DashboardUser };
