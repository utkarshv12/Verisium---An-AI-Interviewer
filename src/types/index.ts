export type InterviewStatus = "pending" | "in_progress" | "completed";

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

export type JobRole =
  | "Frontend Developer"
  | "Backend Developer"
  | "Full Stack Developer"
  | "Data Scientist"
  | "DevOps Engineer"
  | "SRE"
  | "UI/UX Designer"
  | "Mobile Developer"
  | "AI/ML Engineer"
  | "Java Developer"
  | "Python Developer"
  | "Cloud Engineer"
  | "QA Engineer"
  | "System Design";

export interface InterviewWithDetails {
  id: string;
  userId: string;
  role: string;
  techStack: string;
  level: string;
  numQuestions: number;
  status: string;
  createdAt: Date;
  questions: QuestionWithAnswer[];
  feedback?: FeedbackData | null;
}

export interface QuestionWithAnswer {
  id: string;
  interviewId: string;
  questionText: string;
  order: number;
  answer?: {
    id: string;
    userAnswer: string;
  } | null;
}

export interface FeedbackData {
  id: string;
  interviewId: string;
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
  questionFeedback?: QuestionFeedbackItem[] | null;
}

export interface QuestionFeedbackItem {
  question: string;
  feedback: string;
  score: number;
}

export const JOB_ROLES: JobRole[] = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "SRE",
  "Java Developer",
  "Python Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile Developer",
  "AI/ML Engineer",
  "QA Engineer",
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export const TECH_STACKS: Record<string, string[]> = {
  "Frontend Developer": ["React", "JavaScript", "Next.js", "TypeScript"],
  "Backend Developer": ["Java", "Spring Boot", "REST APIs", "Databases"],
  "Full Stack Developer": ["MERN Stack", "Next.js + Prisma", "T3 Stack"],
  "UI/UX Designer": ["Figma", "Adobe XD", "User Research", "Prototyping", "Design Systems"],
  "SRE": ["Docker", "Kubernetes", "CI/CD", "Linux"],
  "Java Developer": ["Java", "Spring Boot", "REST APIs", "Databases"],
  "Python Developer": ["Django", "FastAPI", "Pandas", "Pytest", "PostgreSQL"],
  "Data Scientist": ["Python", "TensorFlow", "Pandas/NumPy", "SQL", "Scikit-learn"],
  "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "Linux"],
  "Mobile Developer": ["React Native", "Flutter", "iOS/Swift", "Android/Kotlin"],
  "AI/ML Engineer": ["PyTorch", "LangChain", "OpenAI API", "Hugging Face", "MLOps"],
  "QA Engineer": ["Selenium", "Cypress", "Jest", "Playwright", "Postman"],
};
