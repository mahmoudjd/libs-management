import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import type { AppContext } from "../context/app-ctx";

export const googleAuth = (appCtx: AppContext) => async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  // Check if user already exists
  let user = await appCtx.dbCtx.users.findOne({ email: normalizedEmail });

  if (!user) {
    // Create new user if doesn't exist
    const newUser = {
      _id: new ObjectId(),
      email: normalizedEmail,
      firstName: firstName || '',
      lastName: lastName || '',
      // No password for Google users
      password: '', 
      // Default role for new users
      role: 'user' as const
    };

    await appCtx.dbCtx.users.insertOne(newUser);
    user = newUser;
  }

  if (!user) {
    return res.status(500).json({ message: "User creation failed." });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user._id.toHexString(),
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email, 
      role: user.role 
    },
    appCtx.config.auth.secret,
    { expiresIn: "7d" }
  );

  const result = {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    accessToken: token
  }

  return res.status(200).json({ message: "Google authentication successful.", user: result });
};
