import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

// SLICES
import authReducer from "../features/auth/authSlice";
import customerReducer from "../features/customer/customerSlice"; // 1. Customer Reducer Import

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer, // 2. Add Customer here
});

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only auth saved in localStorage (Customer data refresh aana thappu illa)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist kaga idhu compulsory
    }),
});