const mysql = require("mysql");
require("dotenv").config();
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_SECRET,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    multipleStatements: true,
});

module.exports = connection;
