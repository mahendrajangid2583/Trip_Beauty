import { configureStore } from '@reduxjs/toolkit';
import selectedPlacesReducer from './selectedPlacesSlice.js';

export const store = configureStore({
  reducer: {
    selectedPlaces: selectedPlacesReducer,
  },
});

export const selectSelectedPlaces = (state) => state.selectedPlaces.items;


