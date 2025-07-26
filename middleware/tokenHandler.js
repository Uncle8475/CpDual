import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

// Middleware 
const tokenHandler = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401);
    throw new Error("ACCESS DENIED: No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.user; // contains { handle, email, id }
    next();
  } catch (err) {
    res.status(403);
    throw new Error("ACCESS DENIED: Invalid or expired token");
  }
});

export default tokenHandler;
