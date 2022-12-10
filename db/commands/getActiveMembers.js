const db = require('..')
const Promise = require('bluebird')

function getActiveMembers() {
    return new Promise((resolve, reject) => {
        db.query(
            `
            select * 
            from public.guildmembers
            where active = true
            `,
            [],
            (err, res) => resolve(res.rows)
        )
    })
}

module.exports = getActiveMembers
