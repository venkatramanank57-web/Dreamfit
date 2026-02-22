import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

// SLICES
import authReducer from "../features/auth/authSlice";
import customerReducer from "../features/customer/customerSlice";
import userReducer from "../features/user/userSlice";
import fabricReducer from "../features/fabric/fabricSlice";      // ✅ Fabric Reducer
import categoryReducer from "../features/category/categorySlice"; // ✅ Category Reducer
import itemReducer from "../features/item/itemSlice";            // ✅ Item Reducer
import sizeTemplateReducer from "../features/sizeTemplate/sizeTemplateSlice";
import sizeFieldReducer from "../features/sizeField/sizeFieldSlice";


// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  user: userReducer,
  fabric: fabricReducer,      // ✅ Add Fabric Reducer
  category: categoryReducer,  // ✅ Add Category Reducer
  item: itemReducer,          // ✅ Add Item Reducer
  sizeTemplate: sizeTemplateReducer,
sizeField: sizeFieldReducer,
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