import axios from "axios"
import { SERVER_API_BASE_URL } from "@/lib/api-base-url.server"
import { getApiErrorMessage } from "@/lib/api-error"
import type { AuthResponse } from "@/lib/types"

export async function loginUser({ email, password }: { email: string; password: string }) {
  try {
    const response = await axios.post<AuthResponse>(`${SERVER_API_BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error("Login failed:", getApiErrorMessage(error, "Login failed"));
    return null;
  }
}


export async function googleLogin({ email, firstName, lastName }: { email: string; firstName: string, lastName: string }) {
  try {
    const response = await axios.post<AuthResponse>(`${SERVER_API_BASE_URL}/auth/google-login`, {
      email,
      firstName,
      lastName
    });
    return response.data;
  } catch (error) {
    console.error("Login failed:", getApiErrorMessage(error, "Google login failed"));
    return null;
  }
}

