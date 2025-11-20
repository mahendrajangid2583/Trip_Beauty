import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. The Async Thunk
export const fetchUserOnLoad = createAsyncThunk(
  'auth/fetchUser',
  async (_, thunkAPI) => { // Use _ if you don't need the first arg
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        withCredentials: true,
      });
      return response.data; // This will be action.payload
    } catch (err) {
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        err.toString();
      return thunkAPI.rejectWithValue(message);
      
    }
  }
);

// 2. The Slice
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as 'true'
};

export const userSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer for manual logout
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    // Reducer for manual login
    loginSuccess: (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOnLoad.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserOnLoad.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(fetchUserOnLoad.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { logoutUser, loginSuccess } = userSlice.actions;
export default userSlice.reducer;
