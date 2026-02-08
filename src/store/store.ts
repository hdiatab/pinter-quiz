import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/auth/authSlice";
import quizReducer, { hydrateFromStorage } from "./quiz/quizSlice";
import { loadQuizState, saveQuizState } from "./quiz/quizPersistence";

export const store = configureStore({
  reducer: { auth: authReducer, quiz: quizReducer },
});

const persistedQuiz = loadQuizState();
if (persistedQuiz) {
  store.dispatch(hydrateFromStorage(persistedQuiz));
}

store.subscribe(() => {
  saveQuizState(store.getState());
});

export default store;
