import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/redux/auth/authSlice";

export default configureStore({
  reducer: {
    auth: authReducer,
  },
});
