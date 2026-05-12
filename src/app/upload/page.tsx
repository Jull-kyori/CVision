"use client";

import { useState } from "react";
import { ResumeAnalysis } from "@/types/resume";
import jsPDF from "jspdf";

export default function UploadPage() {
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  
    async function handleAnalyze() {
    if (!file) {
        alert("Pilih file PDF dulu");
        return;
    }

    try {
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("jobDescription", jobDescription);
        const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        });

        const data = await res.json();

        console.log("API RESULT:", data);

        setResult(data);

        if (!data.error) {
        const newRecord = {
            id: crypto.randomUUID(),
            filename: file.name,
            createdAt: new Date().toISOString(),
            ...data,
        };

        const oldData = localStorage.getItem("cvision_history");
        const history = oldData ? JSON.parse(oldData) : [];

        const updatedHistory = [newRecord, ...history];

        localStorage.setItem(
            "cvision_history",
            JSON.stringify(updatedHistory)
        );
        }
    } catch (error) {
        console.log(error);

        setResult({
        error: "Terjadi kesalahan saat menganalisis file.",
        ats_score: 0,
        strengths: [],
        weaknesses: [],
        skills: [],
        });
    } finally {
        setLoading(false);
    }
    }

    function exportReport() {
    if (!result || result.error) {
        alert("Belum ada hasil analisis untuk diexport.");
        return;
    }

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.text("CVision AI - Resume Analysis Report", 20, y);

    y += 15;

    doc.setFontSize(12);
    doc.text(`File: ${file?.name || "Resume PDF"}`, 20, y);

    y += 10;
    doc.text(`ATS Score: ${result.ats_score}/100`, 20, y);

    y += 15;

    function addSection(title: string, items?: string[]) {
        if (!items || items.length === 0) return;

        doc.setFontSize(14);
        doc.text(title, 20, y);
        y += 8;

        doc.setFontSize(11);

        items.forEach((item) => {
        const lines = doc.splitTextToSize(`- ${item}`, 170);

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(lines, 25, y);
        y += lines.length * 7;
        });

        y += 8;
    }

    addSection("Strengths", result.strengths);
    addSection("Weaknesses", result.weaknesses);
    addSection("Detected Skills", result.skills);
    addSection("Missing Keywords", result.missing_keywords);
    addSection("Recommendations", result.recommendations);
    addSection("Recommended Roles", result.recommended_roles);


    if (result.summary) {
        doc.setFontSize(14);
        doc.text("Summary", 20, y);
        y += 8;

        doc.setFontSize(11);

        const summaryLines = doc.splitTextToSize(result.summary, 170);
        doc.text(summaryLines, 25, y);

        y += summaryLines.length * 7;
    }

    doc.save("cvision-ai-report.pdf");
    }
    
    function getScoreLabel(score: number) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
    }

    function getScoreDescription(score: number) {
    if (score >= 80) {
        return "Resume sudah kuat dan cukup siap untuk melewati screening ATS.";
    }

    if (score >= 60) {
        return "Resume sudah cukup baik, tetapi masih bisa ditingkatkan dengan keyword dan detail project.";
    }

    if (score >= 40) {
        return "Resume masih perlu diperbaiki, terutama pada keyword, pengalaman, dan pencapaian terukur.";
    }

    return "Resume masih lemah untuk ATS dan perlu banyak optimasi.";
    }

    function getScoreColor(score: number) {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
    }

    function getProgressColor(score: number) {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
    }

    
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-6xl font-bold">
          CVision AI
        </h1>

        <p className="text-zinc-400 mt-4 text-xl">
          AI-powered Resume Analyzer
        </p>

        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
        <h2 className="text-2xl font-bold mb-2">
            Upload Resume
        </h2>

        <p className="text-zinc-400 mb-8">
            Upload file CV dalam format PDF untuk dianalisis.
        </p>

        <label
            htmlFor="resume"
            className="
            block
            border-2
            border-dashed
            border-zinc-700
            hover:border-blue-500
            transition
            rounded-3xl
            p-10
            text-center
            cursor-pointer
            bg-zinc-950
            "
        >
            <div className="text-5xl mb-4">
            📄
            </div>

            <h3 className="text-xl font-semibold">
            {file ? file.name : "Klik untuk upload CV"}
            </h3>

            <p className="text-zinc-500 mt-2">
            Format PDF · Maksimal 10MB
            </p>

            <input
            id="resume"
            type="file"
            accept=".pdf"
            onChange={(e) => {
                if (e.target.files?.[0]) {
                setFile(e.target.files[0]);
                }
            }}
            className="hidden"
            />
        </label>

        {file && (
            <p className="mt-5 text-sm text-green-400">
            File siap dianalisis: {file.name}
            </p>
        )}

        <div className="mt-8">
        <label className="block text-sm font-medium text-zinc-300 mb-3">
            Job Description / Lowongan Kerja
        </label>

        <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste deskripsi lowongan kerja di sini, misalnya: Frontend Developer, React, TypeScript, REST API, Git, Tailwind CSS..."
            className="w-full min-h-36 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition"
        />
        </div>

        <button
            onClick={handleAnalyze}
            disabled={loading}
            className="
            mt-8
            px-6
            py-4
            bg-blue-600
            hover:bg-blue-700
            rounded-2xl
            transition
            font-semibold
            disabled:opacity-50
            "
        >
            {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
        </div>

        {result?.error && (
        <div className="mt-8 bg-red-950 border border-red-800 text-red-300 p-6 rounded-3xl">
            {result.error}
        </div>
        )}

        {result && !result.error && (
        <div className="mt-8 flex justify-end">
            <button
            onClick={exportReport}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-2xl font-semibold transition"
            >
            Download Report
            </button>
        </div>
        )}

        {result && !result.error && (
        <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                ATS Score
                </h2>

                <span className="text-sm text-zinc-500">
                /100
                </span>
            </div>

            <p className={`text-7xl font-bold mt-6 ${getScoreColor(result.ats_score)}`}>
                {result.ats_score}
            </p>

            <p className={`mt-3 font-semibold ${getScoreColor(result.ats_score)}`}>
                {getScoreLabel(result.ats_score)}
            </p>

            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                {getScoreDescription(result.ats_score)}
            </p>

            <div className="mt-6">
                <div className="flex justify-between text-sm text-zinc-500 mb-2">
                <span>ATS Compatibility</span>
                <span>{result.ats_score}%</span>
                </div>

                <div className="h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${getProgressColor(result.ats_score)}`}
                    style={{
                    width: `${result.ats_score}%`,
                    }}
                />
                </div>
            </div>
            </div>

            {result.job_match_score !== undefined && result.job_match_score > 0 && (
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    Job Match Score
                </h2>

                <span className="text-sm text-zinc-500">
                    /100
                </span>
                </div>

                <p className={`text-7xl font-bold mt-6 ${getScoreColor(result.job_match_score)}`}>
                {result.job_match_score}%
                </p>

                <p className={`mt-3 font-semibold ${getScoreColor(result.job_match_score)}`}>
                {getScoreLabel(result.job_match_score)}
                </p>

                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                Score ini menunjukkan kecocokan CV dengan deskripsi lowongan kerja yang kamu masukkan.
                </p>

                <div className="mt-6">
                <div className="flex justify-between text-sm text-zinc-500 mb-2">
                    <span>Job Description Match</span>
                    <span>{result.job_match_score}%</span>
                </div>

                <div className="h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <div
                    className={`h-full rounded-full transition-all duration-700 ${getProgressColor(result.job_match_score)}`}
                    style={{
                        width: `${result.job_match_score}%`,
                    }}
                    />
                </div>
                </div>
            </div>
            )}

            <div className="bg-zinc-900 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">
                Skills
            </h2>

            <div className="flex flex-wrap gap-3">
                {result.skills?.map((item, index) => (
                <span
                    key={index}
                    className="px-4 py-2 bg-zinc-800 rounded-xl"
                >
                    {item}
                </span>
                ))}
            </div>
            </div>

            <div className="bg-zinc-900 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">
                Strengths
            </h2>

            <ul className="space-y-3">
                {result.strengths?.map((item, index) => (
                <li key={index}>
                    ✅ {item}
                </li>
                ))}
            </ul>
            </div>

            <div className="bg-zinc-900 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">
                Weaknesses
            </h2>

            <ul className="space-y-3">
                {result.weaknesses?.map((item, index) => (
                <li key={index}>
                    ❌ {item}
                </li>
                ))}
            </ul>
            </div>

            {result.missing_keywords && (
            <div className="md:col-span-2 bg-zinc-900 p-8 rounded-3xl">
                <h2 className="text-2xl font-bold mb-6">
                Missing Keywords
                </h2>

                <div className="flex flex-wrap gap-3">
                {result.missing_keywords.map((item, index) => (
                    <span
                    key={index}
                    className="px-4 py-2 bg-red-950 text-red-300 border border-red-800 rounded-xl"
                    >
                    {item}
                    </span>
                ))}
                </div>
            </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
            <div className="md:col-span-2 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                <h2 className="text-2xl font-bold mb-6">
                Recommendations
                </h2>

                <div className="space-y-4">
                {result.recommendations.map((item, index) => (
                    <div
                    key={index}
                    className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"
                    >
                    <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                        <span className="text-blue-400 font-bold mr-2">
                        {index + 1}.
                        </span>
                        {item}
                    </p>
                    </div>
                ))}
                </div>
            </div>
            )}

            {result.matched_keywords && result.matched_keywords.length > 0 && (
            <div className="md:col-span-2 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                <h2 className="text-2xl font-bold mb-6">
                Matched Job Keywords
                </h2>

                <div className="flex flex-wrap gap-3">
                {result.matched_keywords.map((item, index) => (
                    <span
                    key={index}
                    className="px-4 py-2 bg-blue-950 text-blue-300 border border-blue-800 rounded-xl"
                    >
                    {item}
                    </span>
                ))}
                </div>
            </div>
            )}

            <div className="md:col-span-2 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6">
                Recommendations
            </h2>

            <div className="space-y-4 text-zinc-300">
                <p>
                1. Tambahkan keyword teknis yang relevan dengan posisi yang dilamar.
                </p>

                <p>
                2. Sertakan link GitHub, portfolio, atau project yang pernah dibuat.
                </p>

                <p>
                3. Gunakan pencapaian terukur seperti persentase peningkatan performa,
                jumlah user, atau hasil project.
                </p>

                <p>
                4. Sesuaikan CV dengan job description agar Job Match Score meningkat.
                </p>
            </div>
            </div>

            {result.summary && (
            <div className="md:col-span-2 bg-zinc-900 p-8 rounded-3xl">
                <h2 className="text-2xl font-bold mb-6">
                Summary
                </h2>

                <p className="text-zinc-400 leading-relaxed">
                {result.summary}
                </p>
            </div>
            )}

            {result.extracted_text && (
            <div className="md:col-span-2 bg-zinc-900 p-8 rounded-3xl">
                <h2 className="text-2xl font-bold mb-6">
                Extracted PDF Text
                </h2>

                <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed">
                {result.extracted_text}
                </p>
            </div>
            )}
        </div>
        )}
        
      </div>
    </main>
  );
}