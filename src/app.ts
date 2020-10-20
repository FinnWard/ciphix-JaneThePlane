import express from 'express'
import cors from 'cors'

import { WebhookClient } from 'dialogflow-fulfillment'

// intent method imports
import { fallback } from './intents/fallback'
import { welcome } from './intents/welcome'
import { weather } from './intents/weather'
import { welcomeWeather } from './intents/welcomeWeather'
import { vlucht } from './intents/vlucht'

const app = express()

const PORT: number = 8080

app.use(
    cors({ origin: '*' }),
    express.json(),
)

// Map of intent-name to their respective method
const intents = new Map<string, (agent: any) => void>()

// Set specific intent-name to it's respective method
intents.set('Default Fallback Intent', fallback)
intents.set('Default Welcome Intent', welcome)
intents.set('Default Welcome Intent - weer', welcomeWeather)
intents.set('Huidige weer', weather)
intents.set('vlucht', vlucht)


app.post('/', async (req, res) => {
    const agent: any = new WebhookClient({ request: req, response: res })

    await agent.handleRequest(intents)
})

app.listen(PORT, () => console.log(`Server started on port: ${PORT}!`))