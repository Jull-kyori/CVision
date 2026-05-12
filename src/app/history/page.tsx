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

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisRecord[]>(getHistory);

  function deleteItem(id: string) {
    const updated = history.filter((item) => item.id !== id);

    setHistory(updated);

    localStorage.setItem(
      "cvision_history",
      JSON.stringify(updated)
    );
  }

  function clearAllHistory() {
    localStorage.removeItem("cvision_history");
    setHistory([]);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold">
              Analysis History
            </h1>

            <p className="text-zinc-400 mt-3">
              Riwayat hasil analisis resume yang pernah kamu upload.
            </p>
          </div>

          <div className="flex gap-3">
            {history.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="border border-red-800 text-red-300 hover:bg-red-950 px-6 py-3 rounded-2xl font-semibold transition"
              >
                Clear All
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

        {history.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-bold mb-3">
              Belum ada riwayat analisis
            </h2>

            <p className="text-zinc-400 mb-8">
              Upload CV terlebih dahulu untuk menyimpan hasil analisis.
            </p>

            <Link
              href="/upload"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-semibold transition inline-block"
            >
              Upload Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {item.filename}
                    </h2>

                    <p className="text-zinc-500 mt-2">
                      {new Date(item.createdAt).toLocaleString("id-ID")}
                    </p>

                    <p className="text-zinc-400 mt-4 max-w-2xl">
                      {item.summary || "Resume berhasil dianalisis."}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-zinc-400 text-sm">
                      ATS Score
                    </p>

                    <h3 className="text-6xl font-bold text-green-400">
                      {item.ats_score}
                    </h3>
                  </div>
                </div>

                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div className="bg-zinc-950 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Skills
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {item.skills?.length ? (
                        item.skills.map((skill) => (
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
                  </div>

                  <div className="bg-zinc-950 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Missing Keywords
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {item.missing_keywords?.length ? (
                        item.missing_keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="px-4 py-2 bg-red-950 text-red-300 border border-red-800 rounded-xl"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <p className="text-zinc-400">
                          Tidak ada missing keyword.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="border border-red-800 text-red-300 hover:bg-red-950 px-5 py-3 rounded-2xl transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}