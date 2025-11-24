import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async Thunks
export const fetchBookmarks = createAsyncThunk('bookmarks/fetchBookmarks', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/api/users/bookmarks');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to fetch bookmarks');
    }
});

export const addBookmark = createAsyncThunk('bookmarks/addBookmark', async (place, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/users/bookmarks', place);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to add bookmark');
    }
});

export const removeBookmark = createAsyncThunk('bookmarks/removeBookmark', async (placeId, { rejectWithValue }) => {
    try {
        await api.delete(`/api/users/bookmarks/${placeId}`);
        return placeId;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to remove bookmark');
    }
});

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const bookmarksSlice = createSlice({
    name: 'bookmarks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchBookmarks.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBookmarks.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchBookmarks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addBookmark.fulfilled, (state, action) => {
                // Assuming backend returns the updated list or the new item.
                // If it returns the new item, push it. If list, replace.
                // Based on previous code, it seemed to return updated array or we just push.
                // Let's assume it returns the new bookmark or updated list.
                // Ideally we should check the response structure.
                // For now, let's assume it returns the new bookmark and we push it if not exists.
                if (Array.isArray(action.payload)) {
                    state.items = action.payload;
                } else {
                    state.items.push(action.payload);
                }
            })
            // Remove
            .addCase(removeBookmark.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item._id !== action.payload && item.id !== action.payload);
            });
    },
});

export const selectBookmarks = (state) => state.bookmarks.items;
export default bookmarksSlice.reducer;
