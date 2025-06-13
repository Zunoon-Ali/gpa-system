Here is a **perfectly formatted and beginner-friendly `guide.md`** file with clear instructions, code comments, and structure — specifically tailored for classmates who are new to **Express.js**, **Alpine.js**, or even **JavaScript**.

---

# 📘 GPA System - Beginner Guide (Express + Alpine + PostgreSQL)

### 🛠 Step 1: Project Setup

1. **Create a Folder**

   * Open VS Code
   * Open terminal in VS Code (`Ctrl + ~`)
   * Run this command:

     ```bash
     npm init -y
     ```
   * This will create a `package.json` file automatically.

2. **Install Required Packages**

   ```bash
   npm install express pg dotenv
   npm install --save-dev nodemon
   ```

3. **Folder Structure**

   ```
   GPA-SYSTEM/
   ├── bootstrap/            # Optional: Bootstrap files for frontend styling
   │   ├── min.css
   │   └── min.js
   ├── controllers/          # Business logic, like CRUD and GPA calculations
   │   └── gpaController.js
   ├── db/
   │   └── db.js             # PostgreSQL connection file
   ├── init/
   │   ├── EXAMS.sql         # SQL file to insert exam data
   │   └── EXAMS.zip
   ├── node_modules/         # Installed node packages
   ├── public/               # Frontend files (HTML, CSS, JS)
   │   ├── components/
   │   │   └── navbar.html
   │   ├── app.js
   │   ├── files.js
   │   ├── index.html
   │   └── style.css
   ├── routes/               # API routes (like /api/marks)
   │   └── gpaRoutes.js
   ├── .env                  # Environment variables (manual create if missing)
   ├── .gitattributes
   ├── .gitignore
   ├── guide.md              # THIS GUIDE FILE
   ├── index.js              # Main server file
   ├── package.json
   └── package-lock.json
   ```

---

### 🌍 .env File

Create a `.env` file in the **root** folder and add your PostgreSQL NeonDB connection string:

```env
DATABASE_URL=postgresql://neondb_owner:npg_JZ92SmhtKIsv@ep-lingering-sunset-a4xx8k64-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

### ⚙️ `package.json` (important changes)

Make sure your `package.json` has these lines:

```json
"type": "module",    // Enables ES6-style import/export

"scripts": {
  "start": "nodemon index.js"
}
```

---

### 🚀 Starting the Server

Start your server with:

```bash
nodemon index.js
```

This will restart the server automatically when code changes — no need to run the command again and again.

---

### 🌐 `index.js` — Main Express Server

```js
// index.js

import express from 'express'
import db from './db/db.js'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Required for path resolution in ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Enable JSON and serve frontend files
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Serve frontend HTML on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Get all marks with pagination (100 per page)
app.get('/api/marks', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = 100
  const offset = (page - 1) * limit

  const [data, count] = await Promise.all([
    db.query('SELECT * FROM marks ORDER BY mid ASC LIMIT $1 OFFSET $2', [limit, offset]),
    db.query('SELECT COUNT(*) FROM marks')
  ])

  res.json({ rows: data.rows, total: parseInt(count.rows[0].count) })
})

// GPA Calculation by batch and student
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
    `)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch GPA data' })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
```

---

### 🧠 `db/db.js` — Database Setup

```js
// db.js

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // For NeonDB self-signed certs
  }
})

export default db

// This file connects to PostgreSQL using NeonDB and uses SSL.
// It exports a `db` object you can use to make queries anywhere.
```

---

### 🧾 Importing SQL Data to Neon

If inserting `EXAMS.sql` causes stuck or error, use this command in your terminal:

```bash
psql -h ep-lingering-sunset-a4bcb64-pooler.us-east-1.aws.neon.tech -b neondb_owner -d neondb -f init/EXAMS.sql
```

Make sure:

* `psql` is installed
* The SQL file path is correct
* Replace credentials if different

---

### 🧩 Alpine.js Integration

To use **Alpine.js** in `public/index.html`, add:

```html
<script src="https://cdn.jsdelivr.net/npm/alpinejs" defer></script>
```

Now you can add dynamic behavior directly in HTML like:

```html
<div x-data="{ show: false }">
  <button @click="show = !show">Toggle</button>
  <p x-show="show">Hello Alpine!</p>
</div>
```

---

### ✅ Recap Commands

| Task             | Command                                |
| ---------------- | -------------------------------------- |
| Init project     | `npm init -y`                          |
| Install packages | `npm install express pg dotenv`        |
| Install dev tool | `npm install --save-dev nodemon`       |
| Run server       | `nodemon index.js`                     |
| SQL import       | `psql -h ... -d ... -f init/EXAMS.sql` |

---

Let me know if you want me to generate a PDF or give this in a downloadable version too.

this is my github repo  of this project if you want direct chapna for go for it but bhai paper hain pareshan na krna

github:    https://github.com/Zunoon-Ali/gpa-system.git