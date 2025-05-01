// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./reducers/user";
import notificationReducer from "./reducers/notification";

const persistConfig = {
  key: "root",
  storage,
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

// Pas besoin de persister les notifications car c'est un état éphémère
const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
