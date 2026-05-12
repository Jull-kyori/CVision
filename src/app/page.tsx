"use client";

import Link from "next/link";
import { useState } from "react";
import type { AnalysisRecord } from "@/types/resume";

function getLatestAnalysis(): AnalysisRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem("cvision_history");

  if (!saved) {
    return null;
  }

  try {
    const history = JSON.parse(saved) as AnalysisRecord[];
    return history.length > 0 ? history[0] : null;
  } catch {
    return null;
  }
}

function getScoreStatus(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
}

export default function HomePage() {
  const [latestAnalysis] = useState<AnalysisRecord | null>(getLatestAnalysis);

  const atsScore = latestAnalysis?.ats_score ?? 0;
  const skillsCount = latestAnalysis?.skills?.length ?? 0;
  const missingCount = latestAnalysis?.missing_keywords?.length ?? 0;
  const jobMatchScore = latestAnalysis?.job_match_score ?? 0;

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex mb-6 px-4 py-2 rounded-full bg-blue-950/70 text-blue-300 border border-blue-800 text-sm">
              AI Resume Analyzer for ATS Optimization
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Build an{" "}
              <span className="text-blue-500">
                ATS-Ready
              </span>{" "}
              Resume with Smart Analysis
            </h1>

            <p className="mt-6 text-lg md:text-xl text-zinc-400 leading-relaxed max-w-xl">
              Upload your CV, analyze ATS compatibility, detect missing
              keywords, compare with job descriptions, and get improvement
              recommendations instantly.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/upload"
                className="bg-blue-600 hover:bg-blue-700 px-7 py-4 rounded-2xl font-semibold transition shadow-lg shadow-blue-600/20"
              >
                Start Analyze
              </Link>

              <Link
                href="/dashboard"
                className="border border-zinc-700 hover:border-zinc-500 px-7 py-4 rounded-2xl font-semibold transition"
              >
                View Dashboard
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                <p className="text-2xl font-bold text-green-400">
                  {latestAnalysis ? atsScore : "Real"}
                </p>
                <p className="text-zinc-500 text-sm mt-1">
                  ATS Score
                </p>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                <p className="text-2xl font-bold text-blue-400">
                  {latestAnalysis ? skillsCount : "PDF"}
                </p>
                <p className="text-zinc-500 text-sm mt-1">
                  Extraction
                </p>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                <p className="text-2xl font-bold text-red-400">
                  {latestAnalysis ? missingCount : "ATS"}
                </p>
                <p className="text-zinc-500 text-sm mt-1">
                  Keywords
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-[2rem] p-6 shadow-2xl shadow-blue-600/10 backdrop-blur-xl">
              <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-zinc-500 text-sm">
                      Latest Resume Analysis
                    </p>

                    <h2 className="text-xl font-bold mt-1">
                      {latestAnalysis
                        ? latestAnalysis.filename
                        : "No resume analyzed yet"}
                    </h2>
                  </div>

                  <span className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-full text-xs">
                    Live Preview
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-zinc-900 rounded-2xl p-5">
                    <p className="text-zinc-500 text-sm mb-3">
                      ATS Score
                    </p>

                    <h3 className="text-5xl font-black text-green-400">
                      {latestAnalysis ? atsScore : "--"}
                    </h3>

                    <p className="text-zinc-500 text-sm mt-2">
                      {latestAnalysis
                        ? getScoreStatus(atsScore)
                        : "Upload CV first"}
                    </p>
                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-5">
                    <p className="text-zinc-500 text-sm mb-3">
                      Job Match
                    </p>

                    <h3 className="text-5xl font-black text-blue-400">
                      {latestAnalysis && jobMatchScore > 0
                        ? `${jobMatchScore}%`
                        : "--"}
                    </h3>

                    <p className="text-zinc-500 text-sm mt-2">
                      Based on job description
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-zinc-900 rounded-2xl p-5">
                    <p className="text-zinc-500 text-sm">
                      Skills Detected
                    </p>

                    <h4 className="text-3xl font-bold mt-2">
                      {latestAnalysis ? skillsCount : 0}
                    </h4>
                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-5">
                    <p className="text-zinc-500 text-sm">
                      Missing Keywords
                    </p>

                    <h4 className="text-3xl font-bold mt-2 text-red-400">
                      {latestAnalysis ? missingCount : 0}
                    </h4>
                  </div>
                </div>

                {latestAnalysis ? (
                  <div className="space-y-3">
                    {latestAnalysis.strengths?.slice(0, 2).map((item, index) => (
                      <div
                        key={index}
                        className="bg-zinc-900 rounded-2xl p-4 text-sm"
                      >
                        ✅ {item}
                      </div>
                    ))}

                    {latestAnalysis.weaknesses?.slice(0, 1).map((item, index) => (
                      <div
                        key={index}
                        className="bg-zinc-900 rounded-2xl p-4 text-sm"
                      >
                        ❌ {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900 rounded-2xl p-5 text-zinc-400">
                    Upload your first resume to see real analysis data here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-24 grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-3">
              PDF Resume Parsing
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              Extract resume text directly from PDF files and analyze content
              based on relevant ATS keywords.
            </p>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-3">
              Job Match Analysis
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              Compare resume content with job descriptions to calculate match
              score and matched keywords.
            </p>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-3">
              Smart Recommendations
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              Get improvement suggestions based on missing keywords, detected
              skills, and ATS readiness.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}