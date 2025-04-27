import { createEnv } from "@t3-oss/env-nextjs";

import { z } from "zod"


export const env = createEnv({
  server: {
    NEXT_PUBLIC_API_HOST: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_API_HOST_CLIENT: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
    NEXT_PUBLIC_API_HOST_CLIENT: process.env.NEXT_PUBLIC_API_HOST,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  }
})

