import { env } from "@/env.mjs"
import axios from "axios"

export async function loginUser({ email, password }: { email: string; password: string }) {
  try {
    const response = await axios.post(`${env.NEXT_PUBLIC_API_HOST}/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
}
