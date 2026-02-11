const KEY = "quiz_state";

export const saveQuizState = (state: any) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state.quiz));
  } catch {}
};

export const loadQuizState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
