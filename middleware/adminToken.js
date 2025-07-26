import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const payload = {
  role: "system",
  internal: true,
  purpose: "tracker",
};

// Check if the secret is defined
if (!process.env.SYSTEM_JWT_SECRET) {
  throw new Error("SYSTEM_JWT_SECRET is not defined in the environment variables.");
}

const token = jwt.sign(payload, process.env.SYSTEM_JWT_SECRET, {
  expiresIn: "30d",
});

console.log("System JWT Token:", token);
