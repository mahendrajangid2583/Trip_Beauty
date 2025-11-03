import Itinerary from "../models/Itinerary.js";

export const createItinerary = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { title, city, startDate, endDate, places } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!title || !city) return res.status(400).json({ message: "title and city are required" });
    const itinerary = await Itinerary.create({ userId, title, city, startDate, endDate, places: places || [] });
    res.status(201).json(itinerary);
  } catch (err) {
    next(err);
  }
};

export const getMyItineraries = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const items = await Itinerary.find({ userId }).sort({ updatedAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const getItineraryById = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const item = await Itinerary.findOne({ _id: id, userId });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const updateItinerary = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const update = req.body || {};
    const item = await Itinerary.findOneAndUpdate({ _id: id, userId }, update, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const deleteItinerary = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const del = await Itinerary.findOneAndDelete({ _id: id, userId });
    if (!del) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Stub optimize: returns same places ordered by orderIndex; to be replaced by GA/SA
export const optimizeItinerary = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const item = await Itinerary.findOne({ _id: id, userId });
    if (!item) return res.status(404).json({ message: "Not found" });
    const places = [...(item.places || [])].sort((a, b) => (a.dayIndex - b.dayIndex) || (a.orderIndex - b.orderIndex));
    item.places = places;
    item.isOptimized = true;
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
};



