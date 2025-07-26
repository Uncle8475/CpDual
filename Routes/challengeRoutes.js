import express from "express";
import {
  SendChallenge,
  AcceptChallenge,
  RejectChallenge,
  CompleteChallenge,
  GetIncomingChallenges,
  GetDuelDetails,
} from "../Controller/challengeController.js";

import tokenHandler from "../middleware/tokenHandler.js";

const router = express.Router();

router.post("/send", tokenHandler, SendChallenge);
router.post("/accept", tokenHandler, AcceptChallenge);
router.post("/reject", tokenHandler, RejectChallenge);
router.post("/complete", tokenHandler, CompleteChallenge);
router.get("/incoming", tokenHandler, GetIncomingChallenges);
router.get("/duel/:challengeId", tokenHandler, GetDuelDetails);

export default router;
