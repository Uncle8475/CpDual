import cron from "node-cron";
import axios from "axios";
import AllQuestions from "../model/allCodeforces.js";
const fetchAndStoreProblems = async () => {
  try {
    const response = await axios.get(
      "https://codeforces.com/api/problemset.problems"
    );
    const problems = response.data.result.problems;

    // Filter out interactive problems
    const filteredProblems = problems.filter(
      (problem) => !problem.tags.includes("interactive")
    );

    const problemsToInsert = filteredProblems.map((problem) => ({
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
      rating: problem.rating || null,
      tags: problem.tags || [],
      url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
    }));

    // Delete all previous data and insert new set (clean replace)
    await AllQuestions.deleteMany({});
    await AllQuestions.insertMany(problemsToInsert, { ordered: false });

    console.log(
      "Updated Codeforces problems at midnight (excluding interactive ones)."
    );
  } catch (error) {
    console.error("Error fetching and storing problems:", error.message);
  }
};

// Run once daily at 00:00 (midnight)
cron.schedule("0 0 * * *", fetchAndStoreProblems);

export default fetchAndStoreProblems;
