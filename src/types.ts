export interface UserContext {
  age: number;
}

export interface MarkdownComponentProps {
  children: React.ReactNode;
  [key: string]: any;
}

export interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: {
    correct: string;
    key_point: string;
  };
  difficulty: number;
  topic: string;
  subtopic: string;
  questionType: string;
  ageGroup: string;
}

export interface ExploreResponse {
  content: string;
  relatedTopics: Array<{
    topic: string;
    type: string;
  }>;
  relatedQuestions: Array<{
    question: string;
    type: string;
    context: string;
  }>;
}

export interface PreFillFormProps {
  onSubmit: (context: UserContext) => void;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
} 

export interface StreamChunk {
  text: string;
  topics: any[];
  questions: any[];
}
export interface TopicInfo {
  topic: string;
  type: string;
  reason: string;
}

export interface QuestionInfo {
  question: string;
  type: string;
  context: string;
}
