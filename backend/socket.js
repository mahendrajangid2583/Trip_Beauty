import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("join_trip_room", (tripId) => {
            socket.join(tripId);
            console.log(`Socket ${socket.id} joined trip room: ${tripId}`);
        });

        socket.on("leave_trip_room", (tripId) => {
            socket.leave(tripId);
            console.log(`Socket ${socket.id} left trip room: ${tripId}`);
        });

        socket.on("update_itinerary", (data) => {
            // data should contain tripId and the updated trip object or changes
            const { tripId, updatedTrip } = data;
            // Broadcast to everyone else in the room
            socket.to(tripId).emit("itinerary_updated", updatedTrip);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
