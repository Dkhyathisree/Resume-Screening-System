# Resume-Screening-System
A full-stack DBMS project that allows students to upload resumes and recruiters to search, rank, shortlist, and export candidates. The system parses PDF resumes, extracts structured data, and supports recruiter workflows, including keyword search and CSV export.

## Features
---
#### 1.Student Portal
---

Upload resume PDF

Enter candidate name

Automatic resume parsing

Skill extraction

Email extraction

Phone extraction

Resume summary generation



#### 2.Recruiter Portal
---
Keyword search across resumes

Smart ranking based on job description

Resume preview text

View original PDF

Delete candidates

Shortlist candidates

View shortlist

Export shortlist to CSV


## Database Design
---
#### 1.Main Table — candidates
---
id (PK)

name

resume_text

skills

email

phone

summary

filename


#### 2.Shortlist Table
---
id (PK)

candidate_id (FK)

added_at

Demonstrates relational modeling, derived attributes, and recruiter workflow mapping.



## Tech Stack
---
Node.js

Express.js

PostgreSQL

Multer (file upload)

pdf-parse

json2csv

Vanilla JS frontend

HTML/CSS dashboard UI


## Installation
---
git clone https://github.com/Dkhyathisree/Resume-Screening-System.git

cd Resume-Screening-System

npm install


## Setup Database
---
#### Create database:
---
      CREATE DATABASE resumes;


#### Create tables:
---
    CREATE TABLE candidates ( 
    id SERIAL PRIMARY KEY,
    name TEXT,
    resume_text TEXT,
    skills TEXT,
    filename TEXT,
    email TEXT,
    phone TEXT,
    summary TEXT
    );

    CREATE TABLE shortlist (
    id SERIAL PRIMARY KEY,
    candidate_id INT REFERENCES candidates(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


## Run Server
---
    node server.js


## Open:

    http://localhost:3000


## Recruiter Workflow
---
Upload → Parse → Search → Rank → Shortlist → Export CSV


## Possible Future Enhancements
---
ML skill classification

Semantic vector ranking

Recruiter login system

Interview scheduling

Candidate scoring dashboard


## Author
---
D.Khyathisree
