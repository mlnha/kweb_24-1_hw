var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0324',
    database: 'kweb_hw'
});
db.connect();

module.exports = db;