import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../../models/user.model";

export async function loginAdmin(req: Request, res: Response): Promise<any> {
  const { email, password } = req.body;

  try {
    // validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "All inputs are required" });
    }

    // check user credentials
    const user = await User.findOne({ email: email.toLowerCase() });

    const isPasswordCorrect = await bcryptjs.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid email or password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized, do not have access",
      });
    }

    // generate jwt token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    user.password = "";

    res
      .status(200)
      .json({
        status: "success",
        message: "Login successful",
        data: { token, user },
      });
  } catch (error) {
    console.log("Error in login function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
