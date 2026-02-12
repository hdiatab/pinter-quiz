import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/auth/authSlice";
import quizReducer, { hydrateFromStorage } from "./quiz/quizSlice";
import { loadQuizState, saveQuizState } from "./quiz/quizPersistence";
import settingsReducer, { STORAGE_KEY } from "./settings/settingsSlice";

export const store = configureStore({
  reducer: { auth: authReducer, quiz: quizReducer, settings: settingsReducer },
});

const persistedQuiz = loadQuizState();
if (persistedQuiz) {
  store.dispatch(hydrateFromStorage(persistedQuiz));
}

let lastSaved: string | null = null;

store.subscribe(() => {
  saveQuizState(store.getState());

  try {
    const settings = store.getState().settings;
    const next = JSON.stringify(settings);

    // biar nggak spam setItem kalau sama
    if (next === lastSaved) return;
    lastSaved = next;

    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore (mis. private mode / quota)
  }
});

export default store;
