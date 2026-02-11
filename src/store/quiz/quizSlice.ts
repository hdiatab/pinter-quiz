import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export type QuizQuestion = {
  id: string; // generated
  question: string;
  category: string;
  difficulty: string;
  correct_answer: string;
  incorrect_answers: string[];
  answers: string[]; // shuffled
};

type QuizState = {
  status: "idle" | "loading" | "in_progress" | "finished";
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, { selected: string; correct: boolean }>;
  totalCount: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;

  // timer
  startedAt: number | null; // Date.now()
  durationSec: number; // bebas, misal 120
  finishedAt: number | null;
  pausedAt: number | null; // Date.now() saat pause dimulai
  pausedMsTotal: number; // akumulasi durasi pause dalam ms
};

const initialState: QuizState = {
  status: "idle",
  questions: [],
  currentIndex: 0,
  answers: {},
  totalCount: 0,
  answeredCount: 0,
  correctCount: 0,
  wrongCount: 0,
  startedAt: null,
  durationSec: 120,
  finishedAt: null,
  pausedAt: null,
  pausedMsTotal: 0,
};

// helper
const shuffle = (arr: string[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// decode HTML entities dari OpenTDB
const decodeHtml = (s: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = s;
  return txt.value;
};

// di quizSlice.ts
export const fetchQuiz = createAsyncThunk(
  "quiz/fetchQuiz",
  async ({
    amount = 10,
    type = "multiple",
    difficulty,
    category,
  }: {
    amount?: number;
    type?: "multiple" | "boolean";
    difficulty?: "easy" | "medium" | "hard";
    category?: number; // OpenTDB category id
  }) => {
    const params = new URLSearchParams();
    params.set("amount", String(amount));
    params.set("type", type);
    if (difficulty) params.set("difficulty", difficulty);
    if (category) params.set("category", String(category));

    const res = await fetch(`https://opentdb.com/api.php?${params.toString()}`);
    const json = await res.json();

    const mapped: QuizQuestion[] = (json.results || []).map((q: any, idx: number) => {
      const correct = decodeHtml(q.correct_answer);
      const incorrect = (q.incorrect_answers || []).map(decodeHtml);
      const answers = shuffle([correct, ...incorrect]);

      return {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${idx}`,
        question: decodeHtml(q.question),
        category: decodeHtml(q.category),
        difficulty: decodeHtml(q.difficulty),
        correct_answer: correct,
        incorrect_answers: incorrect,
        answers,
      };
    });

    return mapped;
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    hydrateFromStorage: (state, action: PayloadAction<QuizState>) => {
      return action.payload;
    },
    startQuiz: (state, action: PayloadAction<{ durationSec?: number } | undefined>) => {
      state.status = "in_progress";
      state.currentIndex = 0;
      state.answers = {};
      state.answeredCount = 0;
      state.correctCount = 0;
      state.wrongCount = 0;
      state.startedAt = Date.now();
      state.finishedAt = null;
      state.startedAt = Date.now();
      state.finishedAt = null;
      state.pausedAt = null;
      state.pausedMsTotal = 0;
      if (action.payload?.durationSec) state.durationSec = action.payload.durationSec;
      state.totalCount = state.questions.length;
    },
    answerCurrent: (state, action: PayloadAction<{ selected: string; advance?: boolean }>) => {
      const q = state.questions[state.currentIndex];
      if (!q) return;

      // prevent double answer
      if (state.answers[q.id]) return;

      const correct = action.payload.selected === q.correct_answer;

      state.answers[q.id] = { selected: action.payload.selected, correct };
      state.answeredCount += 1;
      state.correctCount += correct ? 1 : 0;
      state.wrongCount += correct ? 0 : 1;

      // advance default = true (biar behaviour lama tetap)
      const shouldAdvance = action.payload.advance ?? true;
      if (!shouldAdvance) return;

      const next = state.currentIndex + 1;
      if (next >= state.questions.length) {
        state.status = "finished";
        state.finishedAt = Date.now();
      } else {
        state.currentIndex = next;
      }
    },
    nextQuestion: (state) => {
      if (state.status !== "in_progress") return;

      const next = state.currentIndex + 1;
      if (next >= state.questions.length) {
        state.status = "finished";
        state.finishedAt = Date.now();
      } else {
        state.currentIndex = next;
      }
    },
    finishQuiz: (state) => {
      state.status = "finished";
      state.finishedAt = Date.now();
    },
    resetQuiz: () => initialState,
    pauseTimer: (state) => {
      if (state.status !== "in_progress") return;
      if (state.pausedAt) return; // already paused
      state.pausedAt = Date.now();
    },
    resumeTimer: (state) => {
      if (state.status !== "in_progress") return;
      if (!state.pausedAt) return;
      state.pausedMsTotal += Date.now() - state.pausedAt;
      state.pausedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuiz.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuiz.fulfilled, (state, action) => {
        state.questions = action.payload;
        state.totalCount = action.payload.length;
        state.status = "idle";
      })
      .addCase(fetchQuiz.rejected, (state) => {
        state.status = "idle";
      });
  },
});

export const {
  startQuiz,
  answerCurrent,
  finishQuiz,
  resetQuiz,
  hydrateFromStorage,
  nextQuestion,
  pauseTimer,
  resumeTimer,
} = quizSlice.actions;

const { reducer: quizReducer } = quizSlice;

export default quizReducer;
