import jwt from "jsonwebtoken";

const SECRET_KEY =
  process.env.JWT_SECRET_KEY || "OHvZXgNjP5EEvYe0zygMoYWyTlfLxA0M1PRbeDi212M=";

export function verifyToken(req, res, next) {
  const token = req.query.token;
  if (!token) {
    return res.status(401).send("Access Denied");
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
}
