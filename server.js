const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");



require("dotenv").config();

const app = express();

const sslOptions = {

    ca: fs.readFileSync("mysqlssl/ca.pem"),

};

const pool = mysql.createPool({

    connectionLimit : 10,
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USERNAME,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DB_NAME,
    ssl : sslOptions

});

app.use(express.static("public"));
app.use(express.json());

app.get("/search", (req, res) => {

    const query = req.headers.query;
    const region = req.headers.region;
    const genre = req.headers.genre;

    pool.getConnection((err, connection) => {

        if (err) throw err;

        const sql = `
            SELECT 
                name, 
                netflix, 
                hbo, 
                binge, 
                stan, 
                disney
            FROM 
                titles
            WHERE 
                LOWER(name) LIKE CONCAT("%", LOWER(?), "%") AND 
                region = ? AND 
                (genre = ? OR ? = "any")
            ORDER BY 
                CASE 
                    WHEN LOWER(name) = LOWER(?) THEN 1 
                    WHEN LOWER(name) LIKE CONCAT(LOWER(?), "%") THEN 2 
                    WHEN LOWER(name) LIKE CONCAT("% ", LOWER(?), "%") THEN 3 
                    WHEN LOWER(name) LIKE CONCAT("%", LOWER(?), "%") THEN 4 
                    ELSE 5 
                END
        `.replace(/(\r\n|\n|\r)/gm, "");

        connection.query(sql, [query, region, genre, genre, query, query, query, query], (err, result) => {

            connection.release();

            if (err) throw err;

            console.log(result)

            res.json(result);

        });

    });

});

app.listen(3000, () => {

    console.log("Server started on port 3000");

});