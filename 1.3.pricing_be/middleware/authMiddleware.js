const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY; // Replace with your own secret key

// Define the verifyToken middleware function
function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
}

module.exports = { verifyToken };
