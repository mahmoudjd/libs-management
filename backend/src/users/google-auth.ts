import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import type { AppContext } from "../context/app-ctx";

export const googleAuth = (appCtx: AppContext) => async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  // Check if user already exists
  let user = await appCtx.dbCtx.users.findOne({ email });

  if (!user) {
    // Create new user if doesn't exist
    const newUser = {
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      // No password for Google users
      password: '', 
      // Default role for new users
      role: 'user'
    };

    const result = await appCtx.dbCtx.users.insertOne(newUser);
    user = {
      ...newUser,
      _id: result.insertedId
    };
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user._id, 
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