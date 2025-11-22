// controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
// GET /api/user/profile
export async function fetchProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching profile" });
  }
}

// PUT /api/user/update-profile
export async function updateProfile(req, res) {
  try {
    const { name, dob, gender, profilePic } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (dob !== undefined) updates.dob = dob;
    if (gender !== undefined) updates.gender = gender;
    if (profilePic !== undefined) updates.profilePic = profilePic;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    return res.json({ user: updated });
  } catch (err) {
    return res.status(500).json({ message: "Error updating profile" });
  }
}

// (Optional) PUT /api/user/update-password

export async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both old and new password required" });

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Old password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error updating password" });
  }
}