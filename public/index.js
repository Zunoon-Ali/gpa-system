import express from 'express'
import getDbClient from './db/db.js';
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

app.get('/api/gpa', async (req, res) => {
  const client = await getDbClient();
  try {
    const result = await  client.query(`
      WITH StudentCourseDetails AS (
          SELECT
              s.regno,
              s.name AS student_name,
              c.cid,
              c.code AS course_code,
              c.title AS course_title,
              c.theory,
              c.lab,
              r.semester,
              r.year,
              SUM(m.marks) AS total_course_marks
          FROM student AS s
          JOIN marks AS m ON s.regno = m.regno
          JOIN recap AS r ON m.rid = r.rid
          JOIN course AS c ON r.cid = c.cid
          WHERE r.semester IN ('Fall', 'Spring')
          GROUP BY s.regno, s.name, c.cid, c.code, c.title, c.theory, c.lab, r.semester, r.year
      ),
      StudentCourseGrades AS (
          SELECT
              scd.regno,
              scd.student_name,
              (scd.theory + scd.lab) AS course_credit_hours,
              scd.year,
              scd.total_course_marks,
              g.gpa AS course_gpa_point
          FROM StudentCourseDetails AS scd
          JOIN grade AS g ON scd.total_course_marks BETWEEN g.start AND g."end"
      ),
      StudentAnnualAggregates AS (
          SELECT
              scg.regno,
              scg.student_name,
              scg.year,
              SUM(scg.course_gpa_point * scg.course_credit_hours) AS annual_weighted_gpa_sum,
              SUM(scg.course_credit_hours) AS annual_total_credit_hours,
              ROUND(SUM(scg.course_gpa_point * scg.course_credit_hours) / NULLIF(SUM(scg.course_credit_hours), 0), 2) AS calculated_annual_gpa
          FROM StudentCourseGrades AS scg
          GROUP BY scg.regno, scg.student_name, scg.year
      ),
      BatchGPA AS (
          SELECT
              saa.year,
              ROUND(SUM(saa.annual_weighted_gpa_sum) / NULLIF(SUM(saa.annual_total_credit_hours), 0), 2) AS overall_batch_gpa
          FROM StudentAnnualAggregates AS saa
          GROUP BY saa.year
      )
      SELECT
          saa.regno AS student_registration,
          saa.student_name,
          saa.year,
          bg.overall_batch_gpa AS batch_gpa,
          saa.annual_total_credit_hours AS total_credit_hours,
          CASE
              WHEN saa.calculated_annual_gpa >= 3.75 THEN 'A'
              WHEN saa.calculated_annual_gpa >= 3.50 THEN 'A-'
              WHEN saa.calculated_annual_gpa >= 3.25 THEN 'B+'
              WHEN saa.calculated_annual_gpa >= 3.00 THEN 'B'
              WHEN saa.calculated_annual_gpa >= 2.75 THEN 'B-'
              WHEN saa.calculated_annual_gpa >= 2.50 THEN 'C+'
              WHEN saa.calculated_annual_gpa >= 2.25 THEN 'C'
              WHEN saa.calculated_annual_gpa >= 2.00 THEN 'C-'
              WHEN saa.calculated_annual_gpa >= 1.75 THEN 'D+'
              WHEN saa.calculated_annual_gpa >= 1.50 THEN 'D'
              WHEN saa.calculated_annual_gpa < 1.50 AND saa.annual_total_credit_hours > 0 THEN 'F'
              ELSE 'N/A'
          END AS overall_final_grade_for_year,
          saa.calculated_annual_gpa AS student_annual_gpa
      FROM StudentAnnualAggregates AS saa
      JOIN BatchGPA AS bg ON saa.year = bg.year
      ORDER BY saa.year, saa.student_name;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch GPA data' });
  }finally {
    // Important: Close the client connection when done
    await client.end();
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});