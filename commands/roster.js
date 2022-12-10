const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const e = require('express')
const { getActiveMembers } = require('../db/commands')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roster')
        .setDescription('Gets the active roster.'),
    async execute(interaction, data = {}) {
        const { accessToken } = data

        if (!accessToken) {
            throw new Error('No access token found')
        }
        const roster = await getActiveMembers()

        console.log(roster)
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Guild Roster')
            .setAuthor({ name: 'Envy of Eden Bot', url: 'https://discord.js.org/' })
            .setTimestamp()
            .setFooter({ text: '.', iconURL: 'https://i.imgur.com/AfFp7pu.png' })

        roster.forEach((char) => {
            const {
                charactername,
                classname,
                preferredrole
            } = char
            embed.addFields(
                { name: "Character", value: charactername, inline: true },
                { name: "Class", value: classname, inline: true },
                { name: "Role", value: preferredrole, inline: true }
            )
        })

        await interaction.reply({ embeds: [embed] })
    }
}

function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}