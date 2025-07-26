import axios from "axios";
import dotenv from "dotenv";
import Challenge from "../model/challengeModel.js";
import tokenHandler from "../middleware/tokenHandler.js";
dotenv.config();

const SYSTEM_TOKEN = process.env.ADMIN_TOKEN;

function getProblemKey(problem) {
  const { problemId, contestId } = problem;
  if (contestId) {
    return `${contestId}-${problemId}`;
  }
  return problemId;
  
}

async function checkIfUserSolvedAll(userHandle, challenge) {
  
}

async function trackChallengeCompletion(challenge) {
  
}

async function runProblemTracker() {
   
}

// setInterval(() => {
//   runProblemTracker();
// }, 2 * 1000);
// setInterval(() => {