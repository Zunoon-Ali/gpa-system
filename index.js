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
 
 
// Modified GET (to include total count)
app.get('/api/marks', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const offset = (page - 1) * limit;

    const [data, count] = await Promise.all([
        db.query('SELECT * FROM marks ORDER BY mid ASC LIMIT $1 OFFSET $2', [limit, offset]),
        db.query('SELECT COUNT(*) FROM marks')
    ]);

    res.json({ rows: data.rows, total: parseInt(count.rows[0].count) });
});

app.get('/api/gpa', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.batch,
        s.regno,
        s.name,
        ROUND(AVG(m.marks) / 20, 2) AS gpa
      FROM student s
      JOIN marks m ON s.regno = m.regno
      GROUP BY s.batch, s.regno, s.name
      ORDER BY s.batch, s.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch GPA data' });
  }
});


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});