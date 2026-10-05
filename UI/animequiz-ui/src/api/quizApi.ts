import axios from 'axios';

// const api = axios.create({ baseURL: 'http://localhost:5199/api' });
const api = axios.create({ baseURL: 'https://animequizapi-d7gvh5aqe9bacqgb.westus3-01.azurewebsites.net/api' });

export interface ParticipantResponse {
  id: number;
  name: string;
  email: string;
}

export interface QuestionDto {
  id: number;
  questionOrder: number;
  questionText: string;
  category: string;
  difficulty: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface QuizQuestionsResponse {
  participantId: number;
  questions: QuestionDto[];
}

export interface AnswerResultDto {
  questionId: number;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
}

export interface QuizResultResponse {
  participantId: number;
  participantName: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  answerResults: AnswerResultDto[];
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  completedAt: string;
}

export const quizApi = {
  createParticipant: (data: { name: string; mobile: string; email: string }) =>
    api.post<ParticipantResponse>('/participants', data).then(r => r.data),

  getQuestions: (participantId: number) =>
    api.get<QuizQuestionsResponse>(`/quiz/${participantId}/questions`).then(r => r.data),

  submitQuiz: (participantId: number, answers: { questionId: number; selectedAnswer: string }[]) =>
    api.post<QuizResultResponse>('/quiz/submit', { participantId, answers }).then(r => r.data),

  getResult: (participantId: number) =>
    api.get<QuizResultResponse>(`/quiz/${participantId}/result`).then(r => r.data),

  getLeaderboard: (top = 10) =>
    api.get<LeaderboardEntry[]>('/leaderboard', { params: { top } }).then(r => r.data),
};
