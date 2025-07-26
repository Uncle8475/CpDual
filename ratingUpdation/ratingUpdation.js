function calculateRatings(outcomes, initialRatings, K = 32) {
    let ra = initialRatings.A;
    let rb = initialRatings.B;
    const ratingChanges = { A: 0, B: 0 };
    
    // Calculate total weight of attempted questions
    let totalWeight = 0;
    for (let i = 0; i < 3; i++) {
        if (outcomes[i] !== null) {
            totalWeight += (i + 1);
        }
    }
    
    // Skip calculation if no questions attempted
    if (totalWeight === 0) {
        return {
            newRatings: { A: ra, B: rb },
            ratingChanges: { A: 0, B: 0 }
        };
    }

    for (let i = 0; i < 3; i++) {
        const outcome = outcomes[i];
        if (outcome === null) continue;

        const weight = (i + 1) / totalWeight; // Normalized weight

        // Calculate expected scores
        const expectedA = 1 / (1 + Math.pow(10, (rb - ra) / 400));
        const expectedB = 1 - expectedA;

        // Determine actual scores
        let actualA, actualB;
        switch (outcome) {
            case 'A':
                actualA = 1;
                actualB = 0;
                break;
            case 'B':
                actualA = 0;
                actualB = 1;
                break;
            case 'Draw':
                actualA = 0.5;
                actualB = 0.5;
                break;
            default:
                throw new Error(`Invalid outcome '${outcome}' at index ${i}`);
        }

        // Calculate rating changes
        const deltaA = K * weight * (actualA - expectedA);
        const deltaB = K * weight * (actualB - expectedB);

        // Update ratings
        ra += deltaA;
        rb += deltaB;
        ratingChanges.A += deltaA;
        ratingChanges.B += deltaB;
    }

    return {
        newRatings: { 
            A: Math.round(ra), 
            B: Math.round(rb) 
        },
        ratingChanges: {
            A: Math.round(ratingChanges.A),
            B: Math.round(ratingChanges.B)
        }
    };
}

// Example usage:
const results = ['A', null, 'Draw'];
const initial = { A: 1400, B: 1000 };
const result = calculateRatings(results, initial);
console.log("New Ratings:", result.newRatings);
console.log("Rating Changes:", result.ratingChanges);