require('dotenv').config()

const CharacterService = require("./services/CharacterService");
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js')
const express = require('express')
const fs = require('fs')
const ClientOAuth2 = require('client-oauth2')
const path = require('path')
const config = require("./config");
const { VerifyDiscordRequest } = require('./utils.js')

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
client.commands = new Collection()


// ------------------------------------------------------------------------------------------------------------------------//
// Build Commands
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a require "data" or "execute" property.`)
    }
}

// ------------------------------------------------------------------------------------------------------------------------//

client.once(Events.ClientReady, async c => {
    console.log(`Ready!, Logged in as ${c.user.tag}`)
})

client.on(Events.InteractionCreate, async interaction => {
    const command = interaction.client.commands.get(interaction.commandName)
    const { accessToken } = await bnetAuth.credentials.getToken()
    console.log(accessToken)
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
    }

    try {
        await command.execute(interaction, { accessToken })
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
})

client.login(process.env.DISCORD_TOKEN)

const bnetAuth = new ClientOAuth2({
    clientId: process.env.BNET_OAUTH_CLIENT_ID,
    clientSecret: process.env.BNET_OAUTH_CLIENT_SECRET,
    accessTokenUri: 'https://oauth.battle.net/token'
})

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }))

app.get('/', async (req, res, next) => {
    res.status(404).send('No route found for `/`. Refer to Readme.md for available routes.')
})

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send("Internal Service Error")
})

app.get('/auth', (req, res) => {
    const uri = bnetAuth.token.createToken()

    res.redirect(uri)
})

app.get("/auth/callback", async (req, res, next) => {
    try {
        const characterName = "Burruka"
        const realmName = "Area 52"
        const region = "US"
        bnetAuth.code.getToken(req.originalUrl)
            .then((data) => {
                console.log('BIG NOTICE ME', data)
            })
        const character = await characterService.getCharacter(region, realmName, characterName);
        const characterMedia = await characterService.getCharacterMedia(character);
        const { filename, data } = await signatureService.generateImage(character, characterMedia);
        res.set("Content-Type", "image/png");
        res.set("Content-Disposition", `inline; filename="${filename}"`);
        res.send(data);
    } catch (err) {
        next(err);
    }
})

app.listen(PORT, () => {
    console.log('Listening on port', PORT)
})

