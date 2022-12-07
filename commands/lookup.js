const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const e = require('express')



module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Fetches information about a WoW character.')
        .addStringOption(option =>
            option
                .setName('character')
                .setDescription('The name of the character to look up.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('server')
                .setDescription('The slug of the server to look up the character on (e.g. "Area 52" becomes "area-52"')
                .setRequired(true)),
    async execute(interaction, data = {}) {
        const { accessToken } = data

        if (!accessToken) {
            throw new Error('No access token found')
        }
        const character = encodeURIComponent(interaction.options.getString('character'))
        console.log(character)
        const server = interaction.options.getString('server')
        const characterLookupUri = `https://us.api.blizzard.com/profile/wow/character/${server}/${character}/equipment?namespace=profile-us&locale=en_US&access_token=${accessToken}`
        const characterInfoUri = `https://us.api.blizzard.com/profile/wow/character/${server}/${character}?namespace=profile-us&locale=en_US&access_token=${accessToken}`
        const characterImageUri = `https://us.api.blizzard.com/profile/wow/character/${server}/${character}/character-media?namespace=profile-us&locale=en_US&access_token=${accessToken}`
        const profUri = `https://us.api.blizzard.com/profile/wow/character/${server}/${character}/professions?namespace=profile-us&access_token=${accessToken}`

        const charRes = await fetch(characterInfoUri)
        const charData = await charRes.json()

        const classUri = charData.character_class.key.href + `&access_token=${accessToken}`
        const classRes = await fetch(classUri)
        const classData = await classRes.json()

        const classMediaUri = classData.media.key.href + `&access_token=${accessToken}`
        const classMediaRes = await fetch(classMediaUri)
        const classMediaData = await classMediaRes.json()

        const profRes = await fetch(profUri)
        const profData = await profRes.json()
        const response = await fetch(characterLookupUri)
        const imgRes = await fetch(characterImageUri)
        const imgData = await imgRes.json()
        const resData = await response.json()

        const professions = profData.primaries.reduce((acc, cur) => {
            const out = `${cur.profession.name} (${cur.tiers[1].skill_points})`
            acc.push(out)
            return acc
        }, [])

        const { total, equippedItems } = resData.equipped_items.reduce((acc, cur) => {
            if (cur.slot.type !== 'SHIRT' && cur.slot.type !== 'TABARD')
                return {
                    total: acc.total + cur.level.value,
                    equippedItems: acc.equippedItems + 1
                }
            return acc
        }, { total: 0, equippedItems: 0 })

        // inside a command, event listener, etc.
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setImage(imgData.assets[1].value)
            .setTitle(imgData.character.name + '\'s Character Information')
            .setURL('https://discord.js.org/')
            .setAuthor({ name: 'Envy of Eden Bot', iconURL: imgData.assets[0].value, url: 'https://discord.js.org/' })
            .setDescription('Information about your WoW character.')
            .setThumbnail(classMediaData.assets[0].value)
            .addFields(
                { name: 'Item Level', value: round(total / equippedItems, 2).toString() },
                { name: '\u200B', value: '\u200B' },
                { name: 'Class', value: charData.character_class.name, inline: true },
                { name: 'Specialization', value: charData.active_spec.name, inline: true },
            )
            .addFields({
                name: 'Professions', value: `${professions[0]} — ${professions[1]}`, inline: true
            })

            .setTimestamp()
            .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        const msg = `Your item level is ${122}`
        await interaction.reply({ embeds: [exampleEmbed] })
    }
}

function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}