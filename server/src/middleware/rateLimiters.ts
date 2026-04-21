import rateLimit from "express-rate-limit";

const skipInTest = () => process.env.NODE_ENV === "test";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    error: "Too many authentication attempts, please try again in 15 minutes.",
  },
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    error: "Too many requests, please try again in a minute.",
  },
});
