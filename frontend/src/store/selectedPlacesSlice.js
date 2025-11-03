import { createSlice } from '@reduxjs/toolkit';

// Each place: id, name, lat, lon, address, thumbnail, description, category, dist, images
const selectedPlacesSlice = createSlice({
  name: 'selectedPlaces',
  initialState: {
    items: [],
  },
  reducers: {
    togglePlace(state, action) {
      const place = action.payload;
      const existingIndex = state.items.findIndex((p) => p.id === place.id);
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push(place);
      }
    },
    clearSelected(state) {
      state.items = [];
    },
    removePlace(state, action) {
      const id = action.payload;
      state.items = state.items.filter((p) => p.id !== id);
    },
  },
});

export const { togglePlace, clearSelected, removePlace } = selectedPlacesSlice.actions;
export default selectedPlacesSlice.reducer;

