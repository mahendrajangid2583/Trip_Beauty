import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async Thunks
export const fetchTrips = createAsyncThunk('trips/fetchTrips', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/api/trips');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const createTrip = createAsyncThunk('trips/createTrip', async (tripData, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/trips', tripData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const addPlaceToTrip = createAsyncThunk('trips/addPlaceToTrip', async ({ tripId, placeData }, { rejectWithValue, dispatch }) => {
    try {
        // 1. Add place to backend (initial state)
        const response = await api.post(`/api/trips/${tripId}/places`, placeData);
        const newPlace = response.data;

        // 2. Trigger AI Enrichment in background (if needed)
        if (newPlace.aiTimeStatus === 'pending') {
            dispatch(enrichPlaceWithAI({ tripId, placeId: newPlace._id, placeName: newPlace.name, city: newPlace.cityName || "Unknown City" }));
        }

        return newPlace;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const enrichPlaceWithAI = createAsyncThunk('trips/enrichPlaceWithAI', async ({ tripId, placeId, placeName, city }, { rejectWithValue }) => {
    try {
        // Call our AI Estimator Service (which now calls Backend Proxy)
        const response = await api.post('/api/proxy/gemini/estimate', { placeName, city });

        const estimatedTime = response.data.estimatedTime; // Expecting { estimatedTime: "90" }

        // Update the place in the backend with the new time
        await api.patch(`/api/trips/${tripId}/places/${placeId}`, {
            estimatedTime: estimatedTime,
            aiTimeStatus: 'verified'
        });

        return { tripId, placeId, estimatedTime, aiTimeStatus: 'verified' };

    } catch (error) {
        console.error("AI Enrichment Failed:", error);
        // Update status to failed
        await api.patch(`/api/trips/${tripId}/places/${placeId}`, {
            aiTimeStatus: 'failed'
        });
        return rejectWithValue(error.message);
    }
});

export const deletePlaceFromTrip = createAsyncThunk('trips/deletePlaceFromTrip', async ({ tripId, placeId }, { rejectWithValue }) => {
    try {
        await api.delete(`/api/trips/${tripId}/places/${placeId}`);
        return { tripId, placeId };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const deleteTrip = createAsyncThunk('trips/deleteTrip', async (tripId, { rejectWithValue }) => {
    try {
        await api.delete(`/api/trips/${tripId}`);
        return tripId;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const updateTripStatus = createAsyncThunk('trips/updateTripStatus', async ({ tripId, status }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/api/trips/${tripId}/status`, { status });
        return { tripId, status: response.data.status };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const updatePlaceStatus = createAsyncThunk('trips/updatePlaceStatus', async ({ tripId, placeId, status }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/api/trips/${tripId}/places/${placeId}`, { status });
        return { tripId, placeId, status: response.data.status || status };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const updateItineraryItemStatus = createAsyncThunk('trips/updateItineraryItemStatus', async ({ tripId, itemId, status }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/api/trips/${tripId}/itinerary/${itemId}/status`, { status });
        return { tripId, itemId, status: response.data.status };
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

const tripSlice = createSlice({
    name: 'trips',
    initialState: {
        trips: [],
        loading: false,
        error: null,
    },
    reducers: {
        // Synchronous actions if needed
    },
    extraReducers: (builder) => {
        builder
            // Fetch Trips
            .addCase(fetchTrips.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.trips = action.payload;
            })
            .addCase(fetchTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Trip
            .addCase(createTrip.fulfilled, (state, action) => {
                state.trips.push(action.payload);
            })
            // Add Place
            .addCase(addPlaceToTrip.fulfilled, (state, action) => {
                // Optimistic update or wait for re-fetch. Here we try to find the trip and add the place.
                // Note: The backend response for addPlaceToTrip usually returns the NEW PLACE object, not the whole trip.
                // If it returns the whole trip, we should replace it.
                // Based on the thunk above: "const newPlace = response.data;" -> It returns the place.

                // We need to find the trip in the state and add the place to it.
                // However, we need the tripId which is in action.meta.arg.tripId
                const trip = state.trips.find((t) => t._id === action.meta.arg.tripId);
                if (trip) {
                    // Ensure places array exists
                    if (!trip.places) trip.places = [];
                    trip.places.push(action.payload);
                }
            })
            // AI Enrichment Fulfilled
            .addCase(enrichPlaceWithAI.fulfilled, (state, action) => {
                const { tripId, placeId, estimatedTime, aiTimeStatus } = action.payload;
                const trip = state.trips.find(t => t._id === tripId);
                if (trip && trip.places) {
                    const place = trip.places.find(p => p._id === placeId);
                    if (place) {
                        place.estimatedTime = estimatedTime;
                        place.aiTimeStatus = aiTimeStatus;
                    }
                }
            })
            // Delete Place
            .addCase(deletePlaceFromTrip.fulfilled, (state, action) => {
                const trip = state.trips.find((t) => t._id === action.payload.tripId);
                if (trip && trip.places) {
                    trip.places = trip.places.filter((p) => p._id !== action.payload.placeId);
                }
            })
            // Delete Trip
            .addCase(deleteTrip.fulfilled, (state, action) => {
                state.trips = state.trips.filter((t) => t._id !== action.payload);
            })
            // Update Trip Status
            .addCase(updateTripStatus.fulfilled, (state, action) => {
                const trip = state.trips.find(t => t._id === action.payload.tripId);
                if (trip) {
                    trip.status = action.payload.status;
                }
            })
            // Update Place Status
            .addCase(updatePlaceStatus.fulfilled, (state, action) => {
                const trip = state.trips.find(t => t._id === action.payload.tripId);
                if (trip) {
                    // Update places array
                    if (trip.places) {
                        const place = trip.places.find(p => p._id === action.payload.placeId);
                        if (place) {
                            place.status = action.payload.status;
                            
                            // Sync with itinerary items
                            if (trip.itinerary) {
                                trip.itinerary.forEach(day => {
                                    day.items.forEach(item => {
                                        // Match by externalId (item.id) == place.externalId
                                        if (place.externalId && item.id === place.externalId) {
                                            item.status = action.payload.status;
                                        } else if (!place.externalId && item.name === place.name) {
                                            item.status = action.payload.status;
                                        }
                                    });
                                });
                            }
                        }
                    }
                }
            })
            // Update Itinerary Item Status
            .addCase(updateItineraryItemStatus.fulfilled, (state, action) => {
                const trip = state.trips.find(t => t._id === action.payload.tripId);
                if (trip && trip.itinerary) {
                    let foundItem = null;
                    for (const day of trip.itinerary) {
                        const item = day.items.find(i => i._id === action.payload.itemId);
                        if (item) {
                            item.status = action.payload.status;
                            foundItem = item;
                            break;
                        }
                    }
                    
                    // Sync with places array
                    // Sync with places array
                    if (foundItem && trip.places) {
                        let place = null;
                        
                        // Try finding by externalId first
                        if (foundItem.id) {
                            place = trip.places.find(p => p.externalId === foundItem.id);
                        }
                        
                        // Fallback to finding by name if not found by ID
                        if (!place) {
                            place = trip.places.find(p => p.name === foundItem.name);
                        }

                        if (place) {
                            place.status = action.payload.status;
                        }
                    }
                }
            });
    },
});

export default tripSlice.reducer;
