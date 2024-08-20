import jwt from "jsonwebtoken";

const SECRET_KEY =
  process.env.JWT_SECRET_KEY || "OHvZXgNjP5EEvYe0zygMoYWyTlfLxA0M1PRbeDi212M=";

export function generateToken(user) {
  const payload = {
    googleId: user.googleId,
    email: user.email,
  };
  const options = {
    expiresIn: "1h", // Token expires in 1 hour
  };
  return jwt.sign(payload, SECRET_KEY, options);
}
