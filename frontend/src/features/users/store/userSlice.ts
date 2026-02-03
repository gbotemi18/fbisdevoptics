import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import client from '@core/api/client'

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

interface UserState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await client.get<User[]>('/users')
      return response.data
    } catch (error) {
      return rejectWithValue('Failed to fetch users')
    }
  },
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default userSlice.reducer
