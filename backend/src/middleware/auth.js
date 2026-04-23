const jwt = require("jsonwebtoken");

function protectAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function protectCustomer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    if (payload.role !== "customer" || !payload.mobile) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.customer = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { protectAdmin, protectCustomer };
