import express from "express";
import bodyParser from "body-parser";
import mysql from 'mysql2';
import { dirname } from "path";
import { fileURLToPath } from "url";
import util from 'util'

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 5000;

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Admin",
    database: 'projeto_karina'
  });
conn.connect()
const query = util.promisify(conn.query).bind(conn);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/api/data', async (req, res) => {
    try {
        const result = await query('select text, ml_category from ml_classification_final limit 10');
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});