const db = require('..')
const Promise = require('bluebird')
const { ApplicationCommandOptionWithChoicesAndAutocompleteMixin } = require('discord.js')

function getActiveMembers(input) {
    return new Promise((resolve, reject) => {
        db.query(
            `
            insert into public.guildmembers
            values ($1, $2, $3, $4, $5, $6, $7, $8)
            returning *
            `,
            [...input],
            (err, res) => {
                console.log(err, res)
                resolve(res)
            }
        )
    })
}

module.exports = getActiveMembers
