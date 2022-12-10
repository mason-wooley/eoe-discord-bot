const { Pool } = require('pg')
const pool = new Pool()

const DB = {
    query: (query, params, callback) => {
        return pool.query(query, params, callback)
    },
}

module.exports = DB
