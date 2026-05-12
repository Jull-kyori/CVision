export interface ResumeAnalysis {
  ats_score: number;
  job_match_score?: number;
  strengths: string[];
  weaknesses: string[];
  missing_keywords?: string[];
  matched_keywords?: string[];
  recommendations?: string[];
  skills: string[];
  recommended_roles?: string[];
  summary?: string;
  extracted_text?: string;
  error?: string;
}

export interface AnalysisRecord extends ResumeAnalysis {
  id: string;
  filename: string;
  createdAt: string;
}