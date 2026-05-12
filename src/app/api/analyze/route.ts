import { NextRequest, NextResponse } from "next/server";
import { extractPDFText } from "@/lib/pdf";

export const runtime = "nodejs";

const importantKeywords = [
  "react",
  "next.js",
  "typescript",
  "javascript",
  "tailwind",
  "node.js",
  "express",
  "api",
  "rest api",
  "database",
  "mysql",
  "postgresql",
  "git",
  "github",
  "html",
  "css",
  "ui",
  "frontend",
  "backend",
  "fullstack",
];

function analyzeResumeText(text: string) {
  const lowerText = text.toLowerCase();

  const foundKeywords = importantKeywords.filter((keyword) =>
    lowerText.includes(keyword)
  );

  const missingKeywords = importantKeywords.filter(
    (keyword) => !lowerText.includes(keyword)
  );

  const score = Math.min(
    95,
    Math.max(
      45,
      Math.round((foundKeywords.length / importantKeywords.length) * 100)
    )
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (foundKeywords.length >= 5) {
    strengths.push("Resume memiliki beberapa keyword teknis yang relevan.");
  }

  if (lowerText.includes("project") || lowerText.includes("projek")) {
    strengths.push("Resume mencantumkan pengalaman project.");
  } else {
    weaknesses.push("Belum terlihat bagian project secara jelas.");
  }

  if (lowerText.includes("github")) {
    strengths.push("Resume mencantumkan GitHub sebagai portofolio.");
  } else {
    weaknesses.push("Sebaiknya tambahkan link GitHub atau portofolio.");
  }

  if (lowerText.includes("experience") || lowerText.includes("pengalaman")) {
    strengths.push("Resume mencantumkan pengalaman kerja atau organisasi.");
  } else {
    weaknesses.push("Bagian pengalaman masih perlu diperjelas.");
  }

  if (missingKeywords.length > 0) {
    weaknesses.push("Beberapa keyword ATS penting belum muncul di resume.");
  }

  return {
    score,
    foundKeywords,
    missingKeywords: missingKeywords.slice(0, 8),
    strengths,
    weaknesses,
  };
}

function analyzeJobMatch(resumeText: string, jobDescription: string) {
  if (!jobDescription.trim()) {
    return {
      jobMatchScore: 0,
      matchedKeywords: [],
    };
  }

  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  const jobKeywords = importantKeywords.filter((keyword) =>
    jobLower.includes(keyword)
  );

  if (jobKeywords.length === 0) {
    return {
      jobMatchScore: 0,
      matchedKeywords: [],
    };
  }

  const matchedKeywords = jobKeywords.filter((keyword) =>
    resumeLower.includes(keyword)
  );

  const jobMatchScore = Math.round(
    (matchedKeywords.length / jobKeywords.length) * 100
  );

  return {
    jobMatchScore,
    matchedKeywords,
  };
}

function generateRecommendations(
  missingKeywords: string[],
  foundKeywords: string[],
  jobMatchScore: number
) {
  const recommendations: string[] = [];

  if (missingKeywords.length > 0) {
    recommendations.push(
      `Tambahkan keyword penting seperti ${missingKeywords
        .slice(0, 4)
        .join(", ")} agar CV lebih mudah terbaca oleh ATS.`
    );
  }

  if (!foundKeywords.includes("github")) {
    recommendations.push(
      "Tambahkan link GitHub atau portfolio online untuk memperkuat bukti kemampuan teknis."
    );
  }

  if (!foundKeywords.includes("typescript")) {
    recommendations.push(
      "Pertimbangkan untuk menambahkan TypeScript jika kamu menargetkan posisi frontend modern."
    );
  }

  if (!foundKeywords.includes("database")) {
    recommendations.push(
      "Tambahkan pengalaman terkait database seperti MySQL, PostgreSQL, atau MongoDB jika ada."
    );
  }

  if (jobMatchScore > 0 && jobMatchScore < 60) {
    recommendations.push(
      "Sesuaikan isi CV dengan job description, terutama pada skill dan keyword yang diminta perusahaan."
    );
  }

  recommendations.push(
    "Gunakan pencapaian terukur, misalnya peningkatan performa, jumlah pengguna, atau persentase efisiensi project."
  );

  return recommendations;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const jobDescription =
      (formData.get("jobDescription") as string | null) || "";

    if (!file) {
      return NextResponse.json(
        { error: "File PDF belum diupload" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File harus berupa PDF" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";

    try {
      text = await extractPDFText(buffer);
    } catch (pdfError) {
      console.log("PDF PARSE ERROR:", pdfError);
      text = "";
    }

    if (!text.trim()) {
      return NextResponse.json({
        error:
          "PDF berhasil diupload, tetapi teks tidak bisa diekstrak. Kemungkinan PDF berupa scan/gambar.",
      });
    }

    const analysis = analyzeResumeText(text);
    const jobMatch = analyzeJobMatch(text, jobDescription);

    return NextResponse.json({
      ats_score: analysis.score,
      job_match_score: jobMatch.jobMatchScore,

      strengths:
        analysis.strengths.length > 0
          ? analysis.strengths
          : ["Resume berhasil dibaca dan memiliki struktur dasar yang cukup baik."],

      weaknesses:
        analysis.weaknesses.length > 0
          ? analysis.weaknesses
          : ["Resume masih bisa ditingkatkan dengan keyword ATS yang lebih spesifik."],

      missing_keywords: analysis.missingKeywords,
      matched_keywords: jobMatch.matchedKeywords,

      skills:
        analysis.foundKeywords.length > 0
          ? analysis.foundKeywords.map((item) => item.toUpperCase())
          : ["Belum terdeteksi"],

      recommended_roles: [
        "Frontend Developer",
        "Junior Web Developer",
        "React Developer",
      ],

      summary:
        "Resume berhasil dianalisis berdasarkan keyword teknis, struktur dasar, dan kecocokan awal terhadap kebutuhan ATS.",

      extracted_text: text.slice(0, 1000),
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}