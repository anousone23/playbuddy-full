import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import { SignupRequestDataType } from "../types";
import { User } from "../models/user.model";
import { sendPasswordResetEmail } from "../libs/nodemailer";
import { castFirstLetterToUpperCase, generateAvatar } from "../utils/helper";

export async function signup(req: Request, res: Response): Promise<any> {
  const { name, email, password, confirmPassword }: SignupRequestDataType =
    req.body;

  try {
    // validate inputs
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "All inputs are required",
      });
    }

    // check name length
    if (name.trim().length < 3 || name.trim().length > 20) {
      return res.status(400).json({
        status: "error",
        message: "Username must be between 3-20 characters",
      });
    }

    // check password length
    if (password.trim().length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 8 characters long",
      });
    }

    // check password match
    if (password.trim() !== confirmPassword.trim()) {
      return res
        .status(400)
        .json({ status: "error", message: "Password mismatch" });
    }

    const nameRegex = /^(?!.*\s{2,})[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid name, only letter and number are allowed",
      });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email",
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already used",
      });
    }

    // Generate avatar URL
    const avatar = await generateAvatar(name);

    // create new user
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      name: castFirstLetterToUpperCase(name),
      email: email.toLowerCase(),
      password: hashedPassword,
      image: avatar,
    });

    await newUser.save();

    // generate jwt token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res
      .status(201)
      .json({ status: "success", message: "Sign up successful", data: token });
  } catch (error) {
    console.log("Error in signup function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response): Promise<any> {
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

    if (user.isDeactivate) {
      return res.status(400).json({
        status: "error",
        message: "Account is deactivated",
      });
    }

    if (user.isSuspended) {
      return res.status(400).json({
        status: "error",
        message: "Account is suspended",
      });
    }

    // generate jwt token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res
      .status(200)
      .json({ status: "success", message: "Login successful", data: token });
  } catch (error) {
    console.log("Error in login function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getAuthUser(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    console.log("Error in getAuthUser function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function forgetPassword(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ status: "error", message: "Email is required" });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      sendPasswordResetEmail(email, otp);

      // add otp to user
      user.resetPasswordOtp = otp;
      await user.save();
    }

    res
      .status(200)
      .json({ status: "success", message: "Verification email sent" });
  } catch (error) {
    console.log("Error in forgetPassword function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<any> {
  try {
    const { email, otp } = req.body;

    if (!otp) {
      return res
        .status(400)
        .json({ status: "error", message: "Otp is required" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ status: "error", message: "Verify failed, please try again" });
    }

    // get a user and compare otp
    const user = await User.findOne({ email });
    const isOtpValid = user?.resetPasswordOtp === otp;

    if (!user || !isOtpValid) {
      return res.status(400).json({ status: "error", message: "Invalid OTP" });
    }

    res
      .status(200)
      .json({ status: "success", message: "Verify otp successful" });
  } catch (error) {
    console.log("Error in verifyOtp function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<any> {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || !email) {
      return res.status(400).json({
        status: "error",
        message: "reset password failed, please try again",
      });
    }

    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({
        status: "error",
        message: "New password and confirm password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 8 characters long",
      });
    }

    //  check if password match
    const isPasswordTheSame = newPassword === confirmNewPassword;

    if (!isPasswordTheSame) {
      return res
        .status(400)
        .json({ status: "error", message: "Password mismatch" });
    }

    // check if user is using old password
    const isUsingOldPassword = await bcryptjs.compare(
      newPassword,
      user.password
    );

    if (isUsingOldPassword) {
      return res
        .status(400)
        .json({ status: "error", message: "Can not use old password" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // update user password and clear otp
    user.resetPasswordOtp = "";
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "Reset password successful" });
  } catch (error) {
    console.log("Error in resetPassword function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function activateAccount(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { email } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { isDeactivate: false, deactivatedAt: null } }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res
      .status(200)
      .json({ status: "success", message: "Account activated successfully" });
  } catch (error) {
    console.log("Error in activateAccount function", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
