import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";

export async function protectRoute(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const headers = req.headers.authorization;

  if (!headers || !headers.startsWith("Bearer")) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: No token provided" });
  }

  const token = headers.split(" ")[1];

  try {
    const { userId } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.userId = userId;

    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Unauthorized : Invalid token",
    });
  }
}

export async function protectAdminRoute(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ statu: "error", message: "User not found" });
    }

    if (user.role !== "admin") {
      return res
        .status(401)
        .json({ statu: "error", message: "Unauthorized : No access" });
    }

    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Unauthorized : No access",
    });
  }
}
