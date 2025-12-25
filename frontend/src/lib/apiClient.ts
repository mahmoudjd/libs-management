"use client"
import axios from "axios"
import {getSession} from "next-auth/react"
import {env} from "@/env";


const apiClient = axios.create({
    baseURL: env.NEXT_PUBLIC_API_HOST_CLIENT,
})

apiClient.interceptors.request.use(async (config) => {
    let session = await getSession()

    const token = session?.user?.accessToken
    if (token) {
        config.headers.Authorization = `Bearer ${session?.user?.accessToken}`
    }

    return config
})

export {apiClient}