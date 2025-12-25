import dotenv from "dotenv"

export interface Config {
    api: {
        prefix: string
    },
    app: {
        port: number
    },
    db: {
        connectionString: string
        database: string
    },
    auth: {
        secret: string
    }
}

const foundEnv = dotenv.config({path: ['.env'], debug: true})

if (foundEnv.error && process.env.NODE_ENV !== "production") {
    console.error(`⚠ Config: Couldn't find .env file`)
    console.info(`! Config: Parsing .env file failed, shutting down application.`)
    process.exit(1)
}


function getConfig() {
    const env = process.env
    const config: Config = {
        api: {
            prefix: env.API_PREFIX as unknown as string
        },
        app: {
            port: parseInt(env.APP_PORT || "8080")
        },
        db: {
            connectionString: env.DB_CONNECTION_STRING as unknown as string,
            database: env.DB_DATABASE as unknown as string
        },
        auth: {
            secret: env.AUTH_SECRET as unknown as string
        }
    }

    return config;
}

function sanitaizeConfig(config: Config) {
    let isEnvFileValid = true
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            console.error(`⚠ Missing Environment Variable: ${key}`)
            isEnvFileValid = false
        }
    }

    if (!isEnvFileValid) {
        console.info(
            `! Config: Parsing .env file failed, shutting down application.`,
        )
        process.exit(1)
    }

    return config as Config
}

export const loadConfig = () => {
    const config = getConfig()
    const sanitaizedConfig = sanitaizeConfig(config)
    return sanitaizedConfig
}
