import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import type { AppContext } from "../context/app-ctx";
import { UserSchema } from "../types/types";

export const signupUser = (appCtx: AppContext) => async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "First name, last name, email, and password are required." });
  }

  const existingUser = await appCtx.dbCtx.users.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "A user with this email already exists." });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const parseResult = UserSchema.safeParse(req.body)
  if (parseResult.error) {
    console.debug(
      `Invalid request body for method ${req.method} ${req.originalUrl} with error ${parseResult.error}`
    )
    return res.status(400).json(parseResult.error)
  }
  // Save the user
  const user = parseResult.data
  await appCtx.dbCtx.users.insertOne({
    ...user,
    password: hashedPassword,
  });

  return res.status(201).json({ message: "User successfully registered." });
}
