import { env } from "@/env"
import axios from "axios"

export async function loginUser({ email, password }: { email: string; password: string }) {
  try {
    const response = await axios.post(`${env.API_HOST}/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
}


export async function googleLogin({ email, firstName, lastName }: { email: string; firstName: string, lastName: string }) {
  try {
    const response = await axios.post(`${env.API_HOST}/auth/google-login`, {
      email,
      firstName,
      lastName
    });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
}


