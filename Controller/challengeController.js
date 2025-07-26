import asyncHandler from "express-async-handler";
import Challenge from "../model/challengeModel.js";
import User from "../model/userModel.js";
import { v4 as uuidv4 } from "uuid";
import getSolvedProblemsSet from "../QuestionDecider/solvedQuestion.js";
import AllCodeforces from "../model/allCodeforces.js";

const SendChallenge = asyncHandler(async (req, res) => {
  const sender = req.user.handle;
  const { receiver } = req.body;

  if (!receiver) {
    return res.status(400).json({ message: "Receiver handle is required" });
  }

  if (sender === receiver) {
    return res.status(400).json({ message: "You cannot challenge yourself" });
  }

  // Sender can't send multiple at once
  const existing = await Challenge.findOne({
    sender,
    status: { $in: ["pending", "accepted"] },
  });
  if (existing) {
    return res.status(400).json({
      message: "You already have a pending or active challenge.",
    });
  }

  // Prevent reverse challenges
  const reverseExisting = await Challenge.findOne({
    sender: receiver,
    receiver: sender,
    status: { $in: ["pending", "accepted"] },
  });
  if (reverseExisting) {
    return res.status(400).json({
      message: "This user already sent you a challenge. Respond to that first.",
    });
  }

  // Optional: prevent receiver from having multiple
  const receiverActive = await Challenge.findOne({
    receiver,
    status: { $in: ["pending", "accepted"] },
  });
  if (receiverActive) {
    return res.status(400).json({
      message: "Receiver is already engaged in another challenge.",
    });
  }

  const receiverUser = await User.findOne({ handle: receiver });
  const senderUser = await User.findOne({ handle: sender });

  if (!receiverUser || !senderUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const challenge = new Challenge({
    challengeId: uuidv4(),
    sender,
    receiver,
    senderRating: senderUser.cfRating,
    receiverRating: receiverUser.cfRating,
    status: "pending",
    timestamp: new Date(),
  });

  try {
    await challenge.save();
    res.status(200).json({
      message: "Challenge sent successfully",
      challenge,
    });
  } catch (error) {
    console.error("Error saving challenge:", error);
    return res.status(500).json({
      message: "Failed to save challenge",
      error: error.message,
    });
  }
});



const AcceptChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.body;
  if (!challengeId) {
    return res.status(400).json({ message: "Challenge ID is required" });
  }

  const challenge = await Challenge.findOne({ challengeId });
  if (!challenge) {
    return res.status(404).json({ message: "Challenge not found" });
  }
  if (challenge.status !== "pending") {
    return res.status(400).json({ message: "Already Accepted or Rejected the request" });
  }

  // Check if receiver already has an accepted challenge
  const existingAccepted = await Challenge.findOne({
    receiver: challenge.receiver,
    status: "accepted",
  });

  if (existingAccepted) {
    return res.status(400).json({
      message: "You already have an accepted challenge. Complete it before accepting another.",
    });
  }

  // ... rest of your code to select problems and accept the challenge

  const sender = challenge.sender;
  const receiver = challenge.receiver;
  const solvedSender = await getSolvedProblemsSet(sender);
  const solvedReceiver = await getSolvedProblemsSet(receiver);
  const solved = new Set([...solvedSender, ...solvedReceiver]);

  const allProblems = await AllCodeforces.find();

  const unsolved = allProblems.filter((p) => {
    const key = `${p.contestId}-${p.index}`;
    return !solved.has(key) && p.rating;
  });

  if (unsolved.length < 3) {
    return res.status(400).json({ message: "Not enough unsolved problems" });
  }

  const senderRating = challenge.senderRating;
  const receiverRating = challenge.receiverRating;
  const averageRating = Math.round((senderRating + receiverRating) / 2 / 100) * 100;

  let firstRating, secondRating, thirdRating;
  if (averageRating < 1000) {
    firstRating = 800;
    secondRating = 800;
    thirdRating = 900;
  } else {
    thirdRating = averageRating;
    secondRating = Math.max(100, averageRating - 100);
    firstRating = Math.max(100, averageRating - 200);
  }

  const getRandomProblem = (problems) => {
    const idx = Math.floor(Math.random() * problems.length);
    return problems[idx];
  };

  const firstRatedProblems = unsolved.filter((p) => p.rating === firstRating);
  const secondRatedProblems = unsolved.filter((p) => p.rating === secondRating);
  const thirdRatedProblems = unsolved.filter((p) => p.rating === thirdRating);

  if (
    firstRatedProblems.length === 0 ||
    secondRatedProblems.length === 0 ||
    thirdRatedProblems.length === 0
  ) {
    return res.status(400).json({ message: "Not enough problems with required ratings" });
  }

  const selected = [
    getRandomProblem(firstRatedProblems),
    getRandomProblem(secondRatedProblems),
    getRandomProblem(thirdRatedProblems),
  ];

  const questions = selected.map((p) => ({
    name: p.name,
    contestId: p.contestId,
    index: p.index,
    url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
    rating: p.rating,
  }));

  challenge.status = "accepted";
  challenge.questions = questions;
  challenge.startTime = new Date();
  challenge.endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

  await challenge.save();

  res.status(200).json({
    message: "Questions selected",
    questions,
  });
});

const RejectChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.body;

  if (!challengeId) {
    return res.status(400).json({ message: "Challenge ID is required" });
  }

  const challenge = await Challenge.findOne({ challengeId });

  if (!challenge) {
    return res.status(404).json({ message: "Challenge not found" });
  }

  if (challenge.status !== "pending") {
    return res.status(400).json({ message: "Challenge is already accepted, rejected, or completed." });
  }

  await Challenge.deleteOne({ challengeId });

  res.status(200).json({ message: "Challenge rejected and deleted successfully" });
});

const CompleteChallenge = asyncHandler(async (req, res) => {
  const { challengeId, reason, completedBy } = req.body;
  const challenge = await Challenge.findOne({ challengeId });
  if (!challenge) {
    return res.status(404).json({ message: "Challenge not found" });
  }
  if (challenge.status === 'completed' || challenge.status === 'rejected' || challenge.status === 'terminated') {
    return res.status(400).json({ message: "Challenge already ended" });
  }

  challenge.status = reason ? 'terminated' : 'completed';
  if (reason) challenge.terminationReason = reason;
  if (completedBy) challenge.winner = completedBy;
  challenge.endTime = new Date();
  await challenge.save();

  res.status(200).json({ message: "Challenge ended", status: challenge.status });
});

const GetIncomingChallenges = asyncHandler(async (req, res) => {
  res.send("incoming challenges");
});

const GetDuelDetails = asyncHandler(async (req, res) => {
  res.send(`duel details for challengeId: ${req.params.challengeId}`);
});

export {
  SendChallenge,
  AcceptChallenge,
  RejectChallenge,
  CompleteChallenge,
  GetIncomingChallenges,
  GetDuelDetails,
};