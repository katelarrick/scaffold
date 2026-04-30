const API_URL = import.meta.env.VITE_API_URL as string;

export interface Assessment {
  id: string;
  pl_assessment_id: string;
  name: string;
}

export interface Question {
  id: string;
  assessment_id: string;
  pl_question_uuid: string;
  title: string;
}

export interface QuestionConcept {
  id: string;
  question_id: string;
  concept_id: string;
  subconcept_label: string | null;
}

export async function fetchAssessments(): Promise<Assessment[]> {
  const res = await fetch(`${API_URL}/assessments`);
  return res.json();
}

export async function fetchQuestions(assessmentId: string): Promise<Question[]> {
  const res = await fetch(`${API_URL}/assessments/${assessmentId}/questions`);
  return res.json();
}

export async function fetchQuestionConcepts(questionId: string): Promise<QuestionConcept[]> {
  const res = await fetch(`${API_URL}/questions/${questionId}/concepts`);
  return res.json();
}

export async function validatePin(pin: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/validate-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  const data = await res.json();
  return data.valid;
}