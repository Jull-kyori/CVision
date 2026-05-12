"use client";

import Link from "next/link";
import { useState } from "react";
import type { AnalysisRecord } from "@/types/resume";

function getHistory(): AnalysisRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem("cvision_history");

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as AnalysisRecord[];
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const [history, setHistory] = useState<AnalysisRecord[]>(getHistory);

  const totalAnalyses = history.length;

  const averageScore =
    totalAnalyses > 0
      ? Math.round(
          history.reduce((total, item) => total + item.ats_score, 0) /
            totalAnalyses
        )
      : 0;

  const bestScore =
    totalAnalyses > 0
      ? Math.max(...history.map((item) => item.ats_score))
      : 0;

  const totalMissingKeywords = history.reduce(
    (total, item) => total + (item.missing_keywords?.length || 0),
    0
  );

  const allSkills = history.flatMap((item) => item.skills || []);
  const uniqueSkills = Array.from(new Set(allSkills)).slice(0, 12);

  function clearHistory() {
    localStorage.removeItem("cvision_history");
    setHistory([]);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold">Dashboard</h1>

            <p className="text-zinc-400 mt-3">
              Resume analysis overview and ATS performance.
            </p>
          </div>

          <div className="flex gap-3">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="border border-red-800 text-red-300 hover:bg-red-950 px-6 py-3 rounded-2xl font-semibold transition"
              >
                Clear History
              </button>
            )}

            <Link
              href="/upload"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-semibold transition"
            >
              Analyze New Resume
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <p className="text-zinc-400 text-sm">Average ATS Score</p>

            <h2 className="text-4xl font-bold text-green-400 mt-4">
              {averageScore}%
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <p className="text-zinc-400 text-sm">Total Analyses</p>

            <h2 className="text-4xl font-bold mt-4">{totalAnalyses}</h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <p className="text-zinc-400 text-sm">Best Score</p>

            <h2 className="text-4xl font-bold text-blue-400 mt-4">
              {bestScore}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
            <p className="text-zinc-400 text-sm">Missing Keywords</p>

            <h2 className="text-4xl font-bold text-red-400 mt-4">
              {totalMissingKeywords}
            </h2>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-bold mb-3">
              Belum ada data analisis
            </h2>

            <p className="text-zinc-400 mb-8">
              Upload CV pertama kamu untuk melihat data dashboard secara
              otomatis.
            </p>

            <Link
              href="/upload"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-semibold transition inline-block"
            >
              Analyze Resume
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Recent Analyses</h2>

              <div className="space-y-4">
                {history.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-950 rounded-2xl p-5 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{item.filename}</h3>

                      <p className="text-zinc-500 text-sm mt-1">
                        {new Date(item.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        {item.ats_score}
                      </p>

                      <p className="text-zinc-500 text-xs">ATS Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Top Detected Skills</h2>

              <div className="flex flex-wrap gap-3">
                {uniqueSkills.length > 0 ? (
                  uniqueSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-zinc-800 rounded-xl"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-zinc-400">
                    Belum ada skill yang terdeteksi.
                  </p>
                )}
              </div>

              <div className="mt-8 bg-blue-950 border border-blue-800 text-blue-300 p-5 rounded-2xl">
                Tip: Tambahkan keyword seperti TypeScript, REST API, Database,
                dan GitHub untuk meningkatkan kecocokan ATS.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}