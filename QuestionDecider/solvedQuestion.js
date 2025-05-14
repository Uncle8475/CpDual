import axios from 'axios';

const getSolvedProblemsSet = async (handle) => {
  try {
    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
    
    if (response.data.status !== 'OK') {
      throw new Error('Codeforces API error');
    }

    const submissions = response.data.result;

    const solvedSet = new Set();
    for (const submission of submissions) {
      if (submission.verdict === 'OK') {
        const problem = submission.problem;
        const key = `${problem.contestId}-${problem.index}`;
        solvedSet.add(key);
      }
    }

    return solvedSet;
  } catch (error) {
    console.error(`Failed to fetch submissions for ${handle}:`, error.message);
    return new Set(); 
  }
};

export default getSolvedProblemsSet;
