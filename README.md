# CVision AI

CVision AI adalah aplikasi web berbasis Next.js untuk menganalisis resume/CV berbentuk PDF. Sistem ini dapat mengekstrak teks dari PDF, menghitung ATS Score, mendeteksi skill, menampilkan missing keywords, menghitung Job Match Score berdasarkan job description, serta memberikan rekomendasi perbaikan CV.

## Features

- Upload resume dalam format PDF
- Extract text dari file PDF
- ATS Score berbasis keyword
- Job Match Score berdasarkan deskripsi lowongan
- Skills detection
- Missing keywords
- Matched job keywords
- Recommendations
- Dashboard analisis
- Analysis history menggunakan localStorage
- Export report ke PDF

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- pdf-parse
- jsPDF
- LocalStorage

## Pages

- `/` Landing Page
- `/upload` Resume Analyzer
- `/dashboard` Analysis Dashboard
- `/history` Analysis History

## Run Locally

```bash
npm install
npm run dev
