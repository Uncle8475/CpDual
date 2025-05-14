import cron from "node-cron";
import axios from "axios";
import mongoose from "mongoose";
import AllQuestions from "../model/allCodeforces.js";  


const fetchAndStoreProblems = async () => {
  try {
    
    const response = await axios.get('https://codeforces.com/api/problemset.problems');
    const problems = response.data.result.problems;

    
    const problemsToInsert = problems.map((problem) => ({
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
      rating: problem.rating || null,  
      tags: problem.tags || [],
      url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
    }));

    
    await AllQuestions.insertMany(problemsToInsert, { ordered: false });

    console.log("Problems stored successfully!");
  } catch (error) {
    console.error("Error fetching and storing problems:", error);
  }
};

// Schedule the task to run once a day at midnight (00:00)
cron.schedule('0 0 * * *', fetchAndStoreProblems);
export default fetchAndStoreProblems;