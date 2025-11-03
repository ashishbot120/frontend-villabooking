import { createSlice, createAsyncThunk, PayloadAction, isAnyOf } from '@reduxjs/toolkit';
import axios from 'axios'; // <-- FIX: Removed unused 'AxiosError' import

// Configure axios defaults for all requests
axios.defaults.withCredentials = true;

// --- INTERFACES ---
interface User {
  id: string;
  name: string;
  email: string;
  userType: 'user' | 'host';
}

interface AuthResponse {
  user: User;
  token?: string; // Made optional since we're using httpOnly cookies
}

// -- FIX: Define specific types for thunk arguments
interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
}
// ---------------------------------

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
};

// --- ASYNC THUNKS ---
export const loginUser = createAsyncThunk<AuthResponse, LoginData>( // <-- FIX 1
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting login...');
      const res = await axios.post('http://localhost:5000/api/login', userData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Login response:', res.data);
      console.log('✅ Cookies after login:', document.cookie);
      return res.data;
    } catch (error: unknown) { // <-- FIX 2
      console.error('❌ Login error:', error);
      // Use AxiosError type guard
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.msg || 'Login failed');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const signupUser = createAsyncThunk<AuthResponse, SignupData>( // <-- FIX 3
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📝 Attempting signup...');
      const res = await axios.post('http://localhost:5000/api/signup', userData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Signup response:', res.data);
      console.log('✅ Cookies after signup:', document.cookie);
      return res.data;
    } catch (error: unknown) { // <-- FIX 4
      console.error('❌ Signup error:', error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.msg || 'Signup failed');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const loginWithGoogle = createAsyncThunk<AuthResponse, string>(
  'auth/loginWithGoogle',
  async (code, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting Google login...');
      const response = await axios.post('http://localhost:5000/api/google', 
        { token: code }, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Google login response:', response.data);
      return response.data;
    } catch (error: unknown) { // <-- FIX 5
      console.error('❌ Google login error:', error); 
      
      let message = 'Google sign-in failed';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      return rejectWithValue(message);
    }
  }
);

export const updateUserRole = createAsyncThunk<User, 'user' | 'host'>(
  'auth/updateUserRole',
  async (userType, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating user role to:', userType);
      console.log('🍪 Cookies before role update:', document.cookie);
      
      const response = await axios.patch(
        'http://localhost:5000/api/users/update-role',
        { userType },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Role Update API Response:', response.data);
      return response.data.user;
    } catch (error: unknown) { // <-- FIX 6
      console.error('❌ Role Update Error:', error);
      
      let message = 'Failed to update role';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      return rejectWithValue(message);
    }
  }
);

// --- AUTH SLICE ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      console.log('👋 Logging out...');
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true })
        .then(() => console.log('✅ Logout successful'))
        .catch(err => console.error('❌ Logout error:', err));
    },
    updateUserState: (state, action: PayloadAction<User>) => {
      console.log('🔄 Manually updating user state with:', action.payload);
      state.user = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
      }
      console.log('✅ User state updated. New userType:', state.user?.userType);
    },
  },
  extraReducers: (builder) => {
    builder
      // Update user role cases
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        console.log('✅ Role updated in Redux. New userType:', state.user.userType);
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update role';
        console.error('❌ Role update rejected:', state.error);
      })
      // Login/Signup/Google matchers
      .addMatcher(
        isAnyOf(loginUser.pending, signupUser.pending, loginWithGoogle.pending),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(loginUser.fulfilled, signupUser.fulfilled, loginWithGoogle.fulfilled),
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token || null;
          console.log('✅ Auth successful. User:', state.user);
        }
      )
      .addMatcher(
        isAnyOf(loginUser.rejected, signupUser.rejected, loginWithGoogle.rejected),
        (state, action) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.error = (action.payload as string) || action.error.message || 'An unknown error occurred';
          console.error('❌ Auth failed:', state.error);
        }
      );
  },
});

export const { logout, updateUserState } = authSlice.actions;
export default authSlice.reducer;