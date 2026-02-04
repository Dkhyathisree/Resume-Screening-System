const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
const fs = require('fs');
const { Parser } = require('json2csv');

const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/files', express.static('uploads'));

/* ---------- MULTER STORAGE ---------- */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".pdf");
  }
});

const upload = multer({ storage });

/* ---------- HELPERS ---------- */

function extractSkills(text) {
  const skills = [
    "python","java","sql","dbms","node","react",
    "postgres","mongodb","ai","ml","javascript"
  ];

  const lower = text.toLowerCase();

  return skills.filter(skill => {
    const pattern = new RegExp(`\\b${skill}\\b`, "i");
    return pattern.test(lower);
  }).join(", ");
}

function extractEmail(text) {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : "";
}

function extractPhone(text) {
  const m = text.match(/(\+?\d[\d\s\-]{8,}\d)/);
  return m ? m[0] : "";
}

function makeSummary(text) {
  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 40);

  return lines.slice(0, 3).join(" ");
}

function keywordScore(job, resume) {
  const words = job.toLowerCase().split(/\W+/);
  let score = 0;

  words.forEach(w => {
    if (w.length > 3 && resume.toLowerCase().includes(w)) {
      score++;
    }
  });

  return score / (words.length || 1);
}

/* ---------- UPLOAD ---------- */

app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file");

    const studentName = req.body.name || "Student";

    const buffer = fs.readFileSync(req.file.path);
    const data = await pdf(buffer);

    const skills = extractSkills(data.text);
    const email = extractEmail(data.text);
    const phone = extractPhone(data.text);
    const summary = makeSummary(data.text);

    await pool.query(
      `INSERT INTO candidates
       (name,resume_text,skills,filename,email,phone,summary)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [studentName, data.text, skills, req.file.filename, email, phone, summary]
    );

    res.send("Resume uploaded!");

  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

/* ---------- LIST ---------- */

app.get('/list', async (req,res)=>{
  const r = await pool.query(
    `SELECT id,name,skills,filename,email,phone,summary,
     LEFT(resume_text,200) preview
     FROM candidates ORDER BY id DESC`
  );
  res.json(r.rows);
});

/* ---------- SEARCH ---------- */

app.get('/search', async (req,res)=>{
  const q = req.query.q || "";

  const r = await pool.query(
    `SELECT id,name,skills,filename,email,phone,summary,
     LEFT(resume_text,200) preview
     FROM candidates
     WHERE resume_text ILIKE $1`,
    [`%${q}%`]
  );

  res.json(r.rows);
});

/* ---------- RANK ---------- */

app.post('/rate', async (req,res)=>{
  const { jobDesc } = req.body;

  const rows = await pool.query(
    `SELECT id,name,resume_text,skills,filename,email,phone,summary
     FROM candidates`
  );

  const scored = rows.rows.map(r=>({
    id: r.id,
    name: r.name,
    skills: r.skills,
    filename: r.filename,
    email: r.email,
    phone: r.phone,
    summary: r.summary,
    preview: r.resume_text.slice(0,200),
    score: keywordScore(jobDesc, r.resume_text)
  }));

  scored.sort((a,b)=>b.score-a.score);
  res.json(scored);
});

/* ---------- DELETE ---------- */

app.delete('/delete/:id', async (req,res)=>{
  await pool.query(
    `DELETE FROM candidates WHERE id=$1`,
    [req.params.id]
  );
  res.send("Deleted");
});

/* ---------- SHORTLIST ---------- */

app.post('/shortlist/:id', async (req,res)=>{
  await pool.query(
    `INSERT INTO shortlist(candidate_id)
     VALUES ($1)
     ON CONFLICT DO NOTHING`,
    [req.params.id]
  );
  res.send("Shortlisted");
});

/* ---------- EXPORT CSV ---------- */

app.get('/shortlist/export', async (req,res)=>{
  const r = await pool.query(`
    SELECT c.id, c.name, c.email, c.phone, c.skills
    FROM candidates c
    JOIN shortlist s ON c.id = s.candidate_id
    ORDER BY s.added_at DESC
  `);

  const parser = new Parser();
  const csv = parser.parse(r.rows);

  res.header('Content-Type','text/csv');
  res.attachment('shortlist.csv');
  res.send(csv);
});

/* ---------- VIEW SHORTLIST ---------- */

app.get('/shortlist', async (req,res)=>{
  const r = await pool.query(`
    SELECT c.id,name,skills,filename,email,phone,summary,
           LEFT(resume_text,200) preview
    FROM candidates c
    JOIN shortlist s ON c.id = s.candidate_id
    ORDER BY s.added_at DESC
  `);

  res.json(r.rows);
});


/* ---------- START SERVER ---------- */

app.listen(3000, ()=>{
  console.log("✅ Resume Platform running on http://localhost:3000");
});
