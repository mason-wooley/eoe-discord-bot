const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const e = require('express')
const { addActiveMember } = require('../db/commands')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmember')
        .setDescription('Adds a guild member to the active roster.')
        .addStringOption(option =>
            option
                .setName('character')
                .setDescription('The name of the character to add.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('server')
                .setDescription('The slug of the server the character is on (e.g. "Area 52" becomes "area-52"')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('role')
                .setDescription('The player\'s preferred role.')
                .setRequired(true)
                .addChoices(
                    { name: 'Tank', value: 'Tank' },
                    { name: 'Healer', value: 'Healer' },
                    { name: 'Ranged', value: 'Ranged' },
                    { name: 'Melee', value: 'Melee' }
                )),
    async execute(interaction, data = {}) {
        const { accessToken } = data

        if (!accessToken) {
            throw new Error('No access token found')
        }

        const character = interaction.options.getString('character')
        const server = interaction.options.getString('server')
        const role = interaction.options.getString('role')

        const characterInfoUri = `https://us.api.blizzard.com/profile/wow/character/${server}/${character}?namespace=profile-us&locale=en_US&access_token=${accessToken}`
        const charRes = await fetch(characterInfoUri)
        const char = await charRes.json()

        console.log(char)

        const input = [
            char.id,
            char.name,
            char.character_class.id,
            char.character_class.name,
            true,
            char.realm.id,
            char.realm.name,
            role
        ]

        const out = await addActiveMember(input)
        console.log(out)
        const message = `Added ${char.name} to the active roster.`

        await interaction.reply(message)
    }
}
