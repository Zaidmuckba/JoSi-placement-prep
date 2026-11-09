# JoSi: AI-Powered Placement Preparation Platform

JoSi is a full-stack web app that helps university students get ready for campus placements. Students can analyse their resume, practise interviews by text or voice, explore hiring companies and roles, and keep track of placement events. Placement coordinators get an admin dashboard to manage it all.

Built as my final-year project for the B.Sc. in Information Technology at St. Xavier's College, Mumbai, where it scored **168 / 200 (top grade, 10 / 10)**.

## Features

### Resume analyser (NLP)
- Upload a resume as PDF or DOCX; text is extracted with pdf.js and Mammoth
- Natural language processing with `natural` (tokenisation, TF-IDF) and `compromise`
- Detects the candidate's most likely field from keyword frequency across domains
- Scores readability using the Flesch Reading Ease formula
- Measures how well the resume matches a job description and pulls out the most relevant experience
- Combines keyword, readability and relevance scores into a weighted overall score with suggestions
- Generates a downloadable PDF report of the analysis

### Interview practice
- Written practice with an AI assistant powered by a Hugging Face language model (`google/flan-t5-base`)
- Voice interview mode using the browser's Speech Recognition API
- Answers are scored on keyword coverage and depth, with targeted feedback on what to improve
- Company- and course-specific question sets stored in Firestore

### Companies, roles and events
- Browse hiring companies and the roles they offer
- Placement calendar and event listings for students

### Admin dashboard
- Role-based access for placement coordinators
- Manage companies, roles and placement events from one place

### Student tools
- Pomodoro timer and to-do list for focused preparation

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Material UI, Framer Motion |
| Backend | Next.js API routes |
| Data and auth | Firebase Authentication, Cloud Firestore (with security rules) |
| NLP and AI | natural, compromise, Hugging Face Inference |
| Documents | pdf.js, Mammoth, React-PDF |
| Charts | Recharts |

## Project structure

```
app/
  admin/            Admin dashboard (companies, roles, events, calendar)
  api/              API routes: AI chat and resume analysis
  components/       Shared UI components
  interview-prep/   Written and voice interview practice
  services/         Resume analysis engine, questions, events, PDF reports
  ...               Student pages: resume, companies, roles, calendar, tools
scripts/            Admin set-up script
```

## Running it locally

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/Zaidmuckba/josi-placement-prep.git
   cd josi-placement-prep
   npm install
   ```
2. Copy `.env.example` to `.env.local` and add your own Firebase project settings and API keys.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000.

To create an admin account, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`, add a Firebase service account key as `service-account-key.json` (never commit it), then run `node scripts/create-admin.js`.

## Author

**Muhammad Zaid Muckba**, Master of Data Science student at Monash University
[LinkedIn](https://www.linkedin.com/in/muhammad-zaid-muckba-372087252/) · [GitHub](https://github.com/Zaidmuckba)
