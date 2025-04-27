import { env } from "@/env.mjs"
import axios from "axios"

export async function signupUser({ 
  email, 
  password, 
  firstName, 
  lastName 
}: { 
  email: string; 
  password: string;
  firstName: string;
  lastName: string;
}) {
  try {
    const response = await axios.post(`${env.NEXT_PUBLIC_API_HOST_CLIENT}/auth/signup`, {
      email,
      password,
      firstName,
      lastName
    });
    return response.data;
  } catch (error) {
    console.error("Signup failed:", error);
    return null;
  }
}