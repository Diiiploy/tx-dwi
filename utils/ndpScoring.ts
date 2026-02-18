import { PaperworkData } from '../types';

interface NdpResult {
    ndpScore: number;
    category: string;
    mastScore: number;
}

export const calculateNdpScore = (paperworkData?: PaperworkData): NdpResult | null => {
    const ndpData = paperworkData?.ndpScreening;
    if (!ndpData) {
        return null;
    }

    const S = (val: string | undefined): string => (val ? val.trim().toUpperCase() : '');
    const N = (val: number | undefined): number | null => (val !== undefined ? val : null);

    // Q1–Q5
    const q1 = N(ndpData.q1);
    const q2 = S(ndpData.q2);
    const q3 = S(ndpData.q3);
    const q4 = S(ndpData.q4);
    const q5 = S(ndpData.q5);

    // MAST key (Q6–Q30)
    const mastKey: { [key: number]: string } = {
        6: "NO", 7: "YES", 8: "YES", 9: "NO", 10: "YES",
        11: "NO", 12: "YES", 13: "NO", 14: "YES", 15: "YES",
        16: "YES", 17: "YES", 18: "YES", 19: "YES", 20: "YES",
        21: "YES", 22: "YES", 23: "YES", 24: "YES", 25: "YES",
        26: "YES", 27: "YES", 28: "YES", 29: "YES", 30: "YES"
    };

    let mastScore = 0;
    const mastAnswers = ndpData.mast_q6_30 || {};
    for (let q = 6; q <= 30; q++) {
        const resp = S(mastAnswers[q]);
        if (resp === mastKey[q]) {
            mastScore++;
        }
    }

    // Category checks
    let evident = 0;
    let potential = 0;
    let noProb = 0;
    
    if (q1 !== null && q1 >= 2) evident++;
    if (q5 === "YES") evident++;
    if (mastScore >= 7) evident++;

    if (q1 === 1) potential++;
    if (q2 === "YES") potential++;
    if (q3 === "STRANGER" || q3 === "ALONE") potential++;
    if (q4 === "YES" || q4 === "NOT SURE") potential++;
    if (q5 === "NOT SURE") potential++;
    if (mastScore >= 4 && mastScore <= 6) potential++;

    if (q1 === 0) noProb++;
    if (q2 === "NO") noProb++;
    if (mastScore >= 0 && mastScore <= 3) noProb++;

    // Category + NDP
    let category = "";
    let ndpScore = 0;
    if (evident > 0) {
        category = "Evident Problem";
        ndpScore = (evident >= 2) ? 7 : 6;
    } else if (potential > 0) {
        category = "Potential Problem";
        ndpScore = (potential === 1) ? 2 : (potential === 2) ? 3 : (potential === 3) ? 4 : 5;
    } else {
        category = "No Problem";
        ndpScore = 1;
    }

    return { ndpScore, category, mastScore };
};
