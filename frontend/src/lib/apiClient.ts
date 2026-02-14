"use client"
import axios from "axios"
import {getSession} from "next-auth/react"
import { CLIENT_API_BASE_URL } from "@/lib/api-base-url.client";


const apiClient = axios.create({
    baseURL: CLIENT_API_BASE_URL,
})

const ACCESS_TOKEN_CACHE_TTL_MS = 15_000
let cachedAccessToken: string | null = null
let accessTokenCacheExpiresAt = 0

async function getAccessToken() {
    const now = Date.now()
    if (now < accessTokenCacheExpiresAt) {
        return cachedAccessToken
    }

    const session = await getSession()
    cachedAccessToken = session?.user?.accessToken ?? null
    accessTokenCacheExpiresAt = now + ACCESS_TOKEN_CACHE_TTL_MS
    return cachedAccessToken
}

apiClient.interceptors.request.use(async (config) => {
    const token = await getAccessToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            cachedAccessToken = null
            accessTokenCacheExpiresAt = 0
        }
        return Promise.reject(error)
    }
)

export {apiClient}
