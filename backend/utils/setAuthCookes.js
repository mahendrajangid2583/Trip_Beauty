// utils/cookies.js
function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/", // usable across app
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export default setAuthCookie;