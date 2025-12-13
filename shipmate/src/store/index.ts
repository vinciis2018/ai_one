import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import authReducer, { logout } from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import assistantReducer from './slices/assistantSlice';
import documentsReducer from './slices/documentsSlice';
import conversationsReducer from './slices/conversationsSlice';
import shipmentReducer from './slices/shipmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    shipment: shipmentReducer,

    assistant: assistantReducer,
    documents: documentsReducer,
    conversations: conversationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});


export const userInfoFromLocalStorage = () => {
  const userToken = localStorage.getItem('token');
  const tokenExpiresAt = localStorage.getItem('expires_at');
  if (!userToken || (tokenExpiresAt && parseInt(tokenExpiresAt) < new Date().getTime())) {
    store.dispatch(logout());
    // window.location.reload();
  }
}


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
