import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
     const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) return res.status(401).json({ message: "Not authorized, token missing" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Not authorized, token invalid" });
    }
};

export default protect;