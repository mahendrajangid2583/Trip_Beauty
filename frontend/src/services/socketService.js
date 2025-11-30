import { io } from "socket.io-client";
import store from "../store";
import { syncTripData } from "../store/tripSlice";
import { BASE_URL } from "./api";

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket) return;

        this.socket = io(BASE_URL, {
            withCredentials: true,
        });

        this.socket.on("connect", () => {
            console.log("Socket connected:", this.socket.id);
        });

        this.socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        // Global listener for itinerary updates
        this.socket.on("itinerary_updated", (updatedTrip) => {
            console.log("Received itinerary update:", updatedTrip);
            store.dispatch(syncTripData(updatedTrip));
        });
    }

    joinTrip(tripId) {
        if (!this.socket) this.connect();
        this.socket.emit("join_trip_room", tripId);
    }

    leaveTrip(tripId) {
        if (this.socket) {
            this.socket.emit("leave_trip_room", tripId);
        }
    }

    emitUpdate(tripId, updatedTrip) {
        if (this.socket) {
            this.socket.emit("update_itinerary", { tripId, updatedTrip });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

const socketService = new SocketService();
export default socketService;
