import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

const extractErrorMessage = (payload, defaultMsg = 'Something went wrong') => {
  if (!payload) return defaultMsg;
  if (typeof payload === 'string') return payload;
  if (payload.message) return payload.message;
  if (payload.error) return payload.error;
  if (payload.details && Array.isArray(payload.details)) return payload.details.join(', ');
  return defaultMsg;
};

const toRejectPayload = (error) => {
  if (error.code === 'ERR_NETWORK') {
    return { message: 'Cannot reach the server. Please make sure the backend is running.' };
  }
  return error.response?.data || { message: error.message };
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(toRejectPayload(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(toRejectPayload(error));
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      return data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue(null);
      }
      return rejectWithValue(toRejectPayload(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (error) {
      return rejectWithValue(toRejectPayload(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    // true once the initial session check has finished (success or failure)
    initialized: false,
    // true while a login/register/logout request is in flight
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // merge fresh profile data (e.g. after editing the profile)
    updateUser: (state, action) => {
      if (state.user && action.payload) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    addSolvedProblemId: (state, action) => {
      if (state.user) {
        if (!state.user.problemSolved) {
          state.user.problemSolved = [];
        }
        const payload = action.payload;
        const problemId = String(typeof payload === "object" && payload !== null ? (payload._id || payload) : payload);
        const exists = state.user.problemSolved.some(
          (p) => String(typeof p === "object" && p !== null ? (p._id || p) : p) === problemId
        );
        if (!exists) {
          state.user.problemSolved.push(payload);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload, 'Registration failed. Please check your details.');
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload, 'Login failed. Please check your credentials.');
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(checkAuth.pending, (state) => {
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.initialized = true;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.initialized = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError, addSolvedProblemId, updateUser } = authSlice.actions;
export default authSlice.reducer;
