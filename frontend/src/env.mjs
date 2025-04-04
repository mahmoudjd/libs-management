import { createEnv } from "@t3-oss/env-nextjs";

import { z } from "zod"


export const env = createEnv({
  server: {
    NEXT_PUBLIC_API_HOST: z.string()
  },
  client: {

  },
  runtimeEnv: {

    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST
  }
})

