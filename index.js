import express from 'express'
import db from './db/db.js'
import path from 'path'
import { fileURLToPath } from 'url'


const app = express()
const port = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})


app.get('/create-test-table', async (req, res) => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS test(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        email VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        res.status(200).send('TEST table created successfully IF NOT EXISTS');
    } catch (err) {
        console.error('ERROR creating table:', err); // print full error
        res.status(500).send('Server error while creating table');
    }
});


app.get('/insert-test-data', async (req, res) => {
    try {
        const query = `
            INSERT INTO test (name, age, email, description) VALUES
            ('Zunoon',20,'zunnoon2006@gamil.com','This is a test description for Zunoon')
            Returning *;`

        const result = await db.query(query);
        res.status(200).json({
            message: "Data inserted successfully",
            data: result.rows
        })

    } catch (err) {
        console.error('ERROR inserting data:', err); // print full error
        res.status(500).send('Server error while inserting data');
    }
});


app.put('/test/:id', async (req, res) => {
    const id = parseInt(req.params.id); // Convert id to number

    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID parameter" });
    }

    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: "Both 'name' and 'description' fields are required" });
    }

    try {
        const result = await db.query(
            `UPDATE test
             SET name = $1, description = $2, updated_at = NOW()
             WHERE test_id = $3
             RETURNING *;`,
            [name, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Data not found for the given ID" });
        }

        res.status(200).json({
            message: "Data updated successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error updating test data:", error.message);
        res.status(500).json({
            message: "Server error while updating data"
        });
    }
});


app.delete('/test/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID parameter" });
    }

    try {
        const result = await db.query(`DELETE FROM test WHERE test_id = $1 RETURNING *;`, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No record found to delete" });
        }

        res.status(200).json({ message: "Row deleted successfully", deleted: result.rows[0] });
    } catch (error) {
        console.error("Error deleting data:", error.message);
        res.status(500).json({ message: "Server error while deleting data" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});