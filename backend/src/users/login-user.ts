import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { AppContext } from "../context/app-ctx";

export const loginUser = (appCtx: AppContext) => async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await appCtx.dbCtx.users.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid login credentials." });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid login credentials." });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    appCtx.config.auth.secret,
    { expiresIn: "1d" }
  );

  const result = {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    accessToken: token
  }
  return res.status(200).json({ message: "Login successful.", user: result });
}
