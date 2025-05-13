import asyncHandler from "express-async-handler";

const SendChallenge = asyncHandler(async (req, res) => {
  res.send("challenge sent");
});

const AcceptChallenge = asyncHandler(async (req, res) => {
  res.send("challenge accepted");
});

const RejectChallenge = asyncHandler(async (req, res) => {
  res.send("challenge rejected");
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
  GetIncomingChallenges,
  GetDuelDetails
};
