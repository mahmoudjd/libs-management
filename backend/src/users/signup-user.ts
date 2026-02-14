import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

import type { AppContext } from "../context/app-ctx";
import { UserSchema } from "../types/types";

export const signupUser = (appCtx: AppContext) => async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "First name, last name, email, and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const existingUser = await appCtx.dbCtx.users.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(400).json({ message: "A user with this email already exists." });
  }

  const newUser = {
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    role: "user"
  }
  const parseResult = UserSchema.safeParse(newUser)
  if (!parseResult.success) {
    console.debug(
      `Invalid request body for method ${req.method} ${req.originalUrl} with error ${parseResult.error}`
    )
    return res.status(400).json(parseResult.error)
  }

  const user = parseResult.data
  const hashedPassword = await bcrypt.hash(user.password, 10);

  await appCtx.dbCtx.users.insertOne({
    ...user,
    _id: new ObjectId(),
    password: hashedPassword,
  });

  return res.status(201).json({ message: "User successfully registered." });
}
