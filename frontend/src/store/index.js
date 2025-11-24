import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice.js'
import selectedPlacesReducer from './selectedPlacesSlice.js';
import tripReducer from './tripSlice.js';
import bookmarksReducer from './bookmarksSlice.js';

export const store = configureStore({
  reducer: {
    selectedPlaces: selectedPlacesReducer,

    // --- THIS IS THE FIX ---
    // Give it a key (e.g., 'user' or 'auth') so you can
    // access it with state.user or state.auth
    user: userReducer,
    // ----------------------
    trips: tripReducer,
    bookmarks: bookmarksReducer,
  },
});

// This selector is correct for 'selectedPlaces'
export const selectSelectedPlaces = (state) => state.selectedPlaces.items;
