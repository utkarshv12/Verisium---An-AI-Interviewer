import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

export async function generateInterviewQuestions(
  role: string,
  techStack: string,
  level: string,
  numQuestions: number
): Promise<string[]> {
  const prompt = `You are an expert technical interviewer. Generate exactly ${numQuestions} technical interview questions for the following:

Role: ${role}
Tech Stack: ${techStack}
Experience Level: ${level}

Requirements:
- Questions must be specific, technical, and relevant to the role and tech stack
- Mix of conceptual and practical questions appropriate for ${level} level
- No numbering, no bullet points in the questions themselves
- Return ONLY a valid JSON array of strings, nothing else
- Example format: ["Question 1?", "Question 2?", "Question 3?"]

Generate the ${numQuestions} questions now:`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: MODEL,
    temperature: 0.7,
    max_tokens: 2048,
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";

  // Extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse questions from AI response");

  const questions: string[] = JSON.parse(jsonMatch[0]);
  return questions.slice(0, numQuestions);
}

export interface MultiAgentReport {
  overallScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  communicationScore: number;
  confidenceScore: number;
  eyeContactScore: number;
  industryBenchmark: string;
  performanceSummary: string;
  technicalAssessment: string;
  problemSolvingAnalysis: string;
  communicationAssessment: string;
  behavioralAnalysis: string;
  strategicAssessment: string;
  keyStrengths: string[];
  improvementAreas: string[];
  coachingRecommendations: string[];
  verdict: "Not Ready" | "Needs Improvement" | "Borderline Hire" | "Hire";
  verdictExplanation: string;
}

export interface GrowthComparison {
  previousScore: number;
  currentScore: number;
  technicalImprovement: number;
  communicationImprovement: number;
  confidenceImprovement: number;
}

export async function conductMultiAgentAnalysis(
  role: string,
  techStack: string,
  level: string,
  transcript: string,
  previousSession?: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
  }
): Promise<{ report: MultiAgentReport; growth?: GrowthComparison }> {
  const prompt = `You are a high-end Multi-Agent AI Interview Evaluation System. Conduct a deep analysis of this ${level} ${role} interview using five specialized virtual agents.

AGENT PROFILES:
1. TECHNICAL SPECIALIST: Evaluates depth of knowledge, correctness, and architectural understanding.
2. BEHAVIORAL ANALYST: Analyzes confidence, hesitation, filler words, and presence.
3. COMMUNICATION EXPERT: Evaluates clarity, structure, and ability to explain complex ideas.
4. PROBLEM SOLVING EVALUATOR: Analyzes logical reasoning and approach to challenges.
5. GROWTH COACH: Identifies trends and actionable study paths.

INTERVIEW DETAILS:
Role: ${role}
Tech Stack: ${techStack}
Experience Level: ${level}

TRANSCRIPT:
${transcript}

${previousSession ? `PREVIOUS PERFORMANCE DATA:
- Overall: ${previousSession.overallScore}/10
- Technical: ${previousSession.technicalScore}/10
- Communication: ${previousSession.communicationScore}/10
- Confidence: ${previousSession.confidenceScore}
` : ""}

-------------------------------------
OUTPUT REQUIREMENTS:
- Use a professional, senior-interviewer tone.
- In the "strategicAssessment", use high-end, sophisticated metaphors (e.g., "astronomical", "gravitational pull", "dark matter").
- Be honest and realistic. Do not sugarcoat failures.
- Return ONLY a valid JSON object.

JSON STRUCTURE:
{
  "report": {
    "overallScore": <0-10>,
    "technicalScore": <0-10>,
    "problemSolvingScore": <0-10>,
    "communicationScore": <0-10>,
    "confidenceScore": <0-100>,
    "eyeContactScore": <0-100>,
    "industryBenchmark": "Below Average | Average | Above Average",
    "performanceSummary": "<concise overview>",
    "technicalAssessment": "<Depth, correctness, fundamentals>",
    "problemSolvingAnalysis": "<Reasoning, structure, approach>",
    "communicationAssessment": "<Clarity, structure, complex ideas>",
    "behavioralAnalysis": "<Hesitation, filler words, engagement>",
    "strategicAssessment": "<The high-end "astronomical" themed interviewer paragraph>",
    "keyStrengths": ["<3-5 strings>"],
    "improvementAreas": ["<3-5 strings>"],
    "coachingRecommendations": ["<3-5 actionable tips>"],
    "verdict": "Not Ready | Needs Improvement | Borderline Hire | Hire",
    "verdictExplanation": "<Brief explanation>"
  }
}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: MODEL,
    temperature: 0.3,
    max_tokens: 4000,
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse multi-agent analysis");

  let parsedData: any;
  try {
    parsedData = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Text:", text);
    throw new Error("Failed to parse AI response into JSON");
  }

  // Handle case where AI might not wrap it in a "report" key
  const report: MultiAgentReport = parsedData.report || parsedData;
  
  // Strict sanitization of scores
  report.overallScore = Number(report.overallScore) || 5;
  report.technicalScore = Number(report.technicalScore) || 5;
  report.communicationScore = Number(report.communicationScore) || 5;
  report.confidenceScore = Number(report.confidenceScore) || 70;
  report.problemSolvingScore = Number(report.problemSolvingScore) || 5;
  report.eyeContactScore = Number(report.eyeContactScore) || 80;

  // Ensure arrays exist
  report.keyStrengths = Array.isArray(report.keyStrengths) ? report.keyStrengths : ["Communication", "Domain Knowledge", "Response Time"];
  report.improvementAreas = Array.isArray(report.improvementAreas) ? report.improvementAreas : ["Technical Depth", "Structure", "Examples"];
  report.coachingRecommendations = Array.isArray(report.coachingRecommendations) ? report.coachingRecommendations : ["Study advanced patterns", "Practice articulation", "Mock sessions"];

  let growth: GrowthComparison | undefined;
  if (previousSession) {
    growth = {
      previousScore: previousSession.overallScore,
      currentScore: report.overallScore,
      technicalImprovement: Number((report.technicalScore - previousSession.technicalScore).toFixed(1)),
      communicationImprovement: Number((report.communicationScore - previousSession.communicationScore).toFixed(1)),
      confidenceImprovement: Math.round(report.confidenceScore - previousSession.confidenceScore),
    };
  }

  return { report, growth };
}

// Keep generateProfessionalFeedback for backward compatibility during transition if needed
export async function generateProfessionalFeedback(
  role: string,
  techStack: string,
  level: string,
  transcript: string
) {
  const { report } = await conductMultiAgentAnalysis(role, techStack, level, transcript);
  return {
    performanceSummary: report.performanceSummary,
    overallScore: report.overallScore,
    industryBenchmark: report.industryBenchmark,
    technicalScore: report.technicalScore,
    technicalAssessment: report.technicalAssessment,
    communicationScore: report.communicationScore,
    communicationAssessment: report.communicationAssessment,
    confidenceScorePercentage: report.confidenceScore,
    behavioralAnalysis: report.behavioralAnalysis,
    strategicAssessment: report.strategicAssessment,
    keyStrengths: report.keyStrengths,
    improvementAreas: report.improvementAreas,
    coachingRecommendations: report.coachingRecommendations,
    finalVerdict: report.verdict === "Not Ready" ? "Not Ready for Role" : report.verdict as any,
    finalVerdictExplanation: report.verdictExplanation,
  };
}

export async function generateFeedback(
  role: string,
  techStack: string,
  level: string,
  questionsAndAnswers: { question: string; answer: string }[]
) {
  const qaText = questionsAndAnswers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer || "[No answer provided]"}`)
    .join("\n\n");

  const { report, growth } = await conductMultiAgentAnalysis(role, techStack, level, qaText);

  return {
    score: report.overallScore * 10,
    strengths: report.keyStrengths,
    improvements: report.improvementAreas,
    summary: report.performanceSummary,
    questionFeedback: {
      communicationScore: report.communicationScore,
      technicalScore: report.technicalScore,
      confidenceScore: report.confidenceScore / 10,
      fluencyScore: report.communicationScore,
      suggestions: report.coachingRecommendations,
      isConversational: true,
      detailedAnalysis: {
        ...report,
        growthData: growth
      }
    },
  };
}
