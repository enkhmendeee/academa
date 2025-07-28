import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Check that decoded is an object and has an id
    if (typeof decoded === "object" && "userId" in decoded) {
      req.user = decoded as JwtPayload & { id: number };
      return next();
    } else {
      return res.status(401).json({ message: "Invalid token payload" });
    }
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
