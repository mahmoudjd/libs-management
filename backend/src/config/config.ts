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

const foundEnv = dotenv.config({ path: ".env" })

if (foundEnv.error && process.env.NODE_ENV !== "production") {
    console.error(`⚠ Config: Couldn't find .env file`)
    console.info(`! Config: Parsing .env file failed, shutting down application.`)
    process.exit(1)
}


function getRequiredEnv(name: string) {
    const value = process.env[name]
    if (!value || value.trim() === "") {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

function getConfig() {
    const rawPort = process.env.APP_PORT || "8080"
    const parsedPort = Number.parseInt(rawPort, 10)

    if (Number.isNaN(parsedPort) || parsedPort <= 0) {
        throw new Error("APP_PORT must be a positive number")
    }

    const config: Config = {
        api: {
            prefix: process.env.API_PREFIX?.trim() || "/api"
        },
        app: {
            port: parsedPort
        },
        db: {
            connectionString: getRequiredEnv("DB_CONNECTION_STRING"),
            database: getRequiredEnv("DB_DATABASE")
        },
        auth: {
            secret: getRequiredEnv("AUTH_SECRET")
        }
    }

    return config
}

export const loadConfig = () => {
    try {
        return getConfig()
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`⚠ Config: ${message}`)
        console.info(`! Config: Parsing .env file failed, shutting down application.`)
        process.exit(1)
    }
}
