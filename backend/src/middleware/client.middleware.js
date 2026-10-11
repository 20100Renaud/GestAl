export function requireClient(req, res, next) {
  if (req.user.role !== "CLIENT") {
    return res.status(403).json({
      error: "Client access required",
    });
  }

  next();
}
