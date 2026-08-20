import type { Locale } from '../i18n/locale';
import en from './resume-data.en.json';
import zh from './resume-data.zh.json';

export interface Topic {
  id: string;
  title: string;
  background: string;
  role: string;
  flow: string;
  engineeringBoundary: string;
  implementation: string[];
  challenges: string[];
  outcome: string;
  stack: string[];
}

export interface Project {
  id: string;
  name: string;
  company: string;
  period: string;
  pageSpan: number;
  summary: string;
  businessContext: string;
  painPoints: string[];
  buildGoals: string[];
  role: string;
  flow: string;
  engineeringBoundary: string;
  outcome: string;
  stack: string[];
  topics: Topic[];
}

export interface Experience {
  period: string;
  company: string;
  title: string;
  summary: string;
  achievements: string[];
}

export interface ResumeData {
  profile: {
    name: string;
    title: string;
    experience: string;
    phone: string;
    email: string;
    website?: string;
    summary: string;
  };
  highlights: string[];
  strengths: Array<{ title: string; evidence: string }>;
  experiences: Experience[];
  projects: Project[];
}

const catalogs: Record<Locale, ResumeData> = {
  zh: zh as ResumeData,
  en: en as ResumeData,
};

export function getResumeData(locale: Locale): ResumeData {
  return catalogs[locale];
}

export const resumeData = getResumeData('zh');

export function getTopic(topicId: string, locale: Locale = 'zh'): Topic | undefined {
  return getResumeData(locale).projects.flatMap((project) => project.topics).find((topic) => topic.id === topicId);
}

export function getProject(projectId: string, locale: Locale = 'zh'): Project | undefined {
  return getResumeData(locale).projects.find((project) => project.id === projectId);
}
