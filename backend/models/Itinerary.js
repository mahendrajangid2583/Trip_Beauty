import mongoose from 'mongoose'

const placeSchema = new mongoose.Schema({
    placeId: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    type: { type: String, enum: ['attraction', 'food'], default: 'attraction' },
    averageVisitMinutes: { type: Number },
    dayIndex: { type: Number, default: 0 },
    orderIndex: { type: Number, default: 0 },
    startTime: { type: String },
    endTime: { type: String }
}, { _id: false });

const itinerarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    city: { type: String, required: true, index: true },
    startDate: { type: Date },
    endDate: { type: Date },
    places: { type: [placeSchema], default: [] },
    isOptimized: { type: Boolean, default: false }
}, { timestamps: true });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);
export default Itinerary;



