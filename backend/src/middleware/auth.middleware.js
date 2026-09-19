import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function authenticate(req, res, next) {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (
      typeof payload !== "object" ||
      typeof payload.userId !== "string" ||
      typeof payload.role !== "string"
    ) {
      return res.status(401).json({
        error: "Invalid authentication token",
      });
    }
    
    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired authentication token",
    });
  }
}
