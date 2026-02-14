import axios from "axios"
import { CLIENT_API_BASE_URL } from "@/lib/api-base-url.client"
import { getApiErrorMessage } from "@/lib/api-error"
import type { ApiMessageResponse } from "@/lib/types"

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
    const response = await axios.post<ApiMessageResponse>(`${CLIENT_API_BASE_URL}/auth/signup`, {
      email,
      password,
      firstName,
      lastName
    });
    return response.data;
  } catch (error) {
    console.error("Signup failed:", getApiErrorMessage(error, "Signup failed"));
    return null;
  }
}
