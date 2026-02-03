import { configureStore } from '@reduxjs/toolkit'
import userReducer from '@features/users/store/userSlice'
import billingReducer from '@features/billing/store/billingSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    billing: billingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
