const express = require("express");
const crypto = require("crypto");
const { isUndefined } = require("util");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const app = express();

const db = new sqlite3.Database("./dbs/main.db");

db.run(`CREATE TABLE IF NOT EXISTS titles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        region TEXT NOT NULL,
        genre TEXT NOT NULL DEFAULT "any",
        netflix INTEGER NOT NULL DEFAULT 0,
        hbo INTEGER NOT NULL DEFAULT 0,
        binge INTEGER NOT NULL DEFAULT 0,
        stan INTEGER NOT NULL DEFAULT 0,
        disney INTEGER NOT NULL DEFAULT 0
);`);

app.use(express.static("public"));
app.use(express.json());

app.get("/search", (req, res) => {

    const query = req.headers.query;
    const region = req.headers.region;
    const genre = req.headers.genre;

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
            LOWER(name) LIKE "%" || LOWER(?) || "%" AND 
            region = ? AND 
            (genre = ? OR ? = "any")
        ORDER BY 
            CASE 
                WHEN LOWER(name) = LOWER(?) THEN 1 
                WHEN LOWER(name) LIKE LOWER(?) || "%" THEN 2 
                WHEN LOWER(name) LIKE "%" || LOWER(?) || "%" THEN 3
                ELSE 4 
            END
    `;

    db.all(sql, [query, region, genre, genre, query, query, query], (err, result) => {

        if (err) throw err;

        res.json(result);

    });

});

function verifyAPIKey(APIKey, hashedAPIKey) {

    const [digest, salt] = hashedAPIKey.split(":");

    const saltBuffer = Buffer.from(salt, "hex");

    const digestBuffer = Buffer.from(digest, "hex");
    const testDigestBuffer = crypto.scryptSync(APIKey, saltBuffer, 64);

    return crypto.timingSafeEqual(digestBuffer, testDigestBuffer);

}

function isNullOrUndefined(value) {

    return (value === null) || (value === undefined);

}

app.post("/add", (req, res) => {

    const data = req.body;

    if (!data || !data.toAdd || !data.APIKey) {

        res.send("Missing request data.");

        return;

    }

    const toAdd = data.toAdd;

    if (isNullOrUndefined(toAdd.name) || isNullOrUndefined(toAdd.region) || isNullOrUndefined(toAdd.genre) || isNullOrUndefined(toAdd.netflix) || isNullOrUndefined(toAdd.hbo) || isNullOrUndefined(toAdd.binge) || isNullOrUndefined(toAdd.stan) || isNullOrUndefined(toAdd.disney) || ["us", "uk", "ca", "au"].indexOf(toAdd.region) == -1 || ["action", "comedy", "drama", "horror", "romance", "sci-fi"].indexOf(toAdd.genre) == -1) {

        res.send("Could not add row since it was either invalid or missing data.");

        return;

    }

    if (!verifyAPIKey(data.APIKey, process.env.API_KEY_DIGEST)) {

        res.send("Could not verify API key");

    }

    else {

        db.run(`INSERT OR REPLACE INTO titles (name, region, genre, netflix, hbo, binge, stan, disney)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [toAdd.name, toAdd.region, toAdd.genre, toAdd.netflix, toAdd.hbo, toAdd.binge, toAdd.stan, toAdd.disney]);

        res.send("Added to the database succesfully.");

    }

});

app.listen(3000, () => {

    console.log("Server started on port 3000");


});