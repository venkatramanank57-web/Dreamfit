import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

// SLICES
import authReducer from "../features/auth/authSlice";
import customerReducer from "../features/customer/customerSlice";
import userReducer from "../features/user/userSlice"; // ✅ 1. Import User Reducer

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  user: userReducer, // ✅ 2. Add User Reducer here
});

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only auth saved in localStorage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});