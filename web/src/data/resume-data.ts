import rawResumeData from './resume-data.json';

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
  summary: string;
  businessContext: string;
  painPoints: string[];
  buildGoals: string[];
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

export const resumeData = rawResumeData satisfies ResumeData;

export function getTopic(topicId: string): Topic | undefined {
  return resumeData.projects.flatMap((project) => project.topics).find((topic) => topic.id === topicId);
}

export function getProject(projectId: string): Project | undefined {
  return resumeData.projects.find((project) => project.id === projectId);
}
