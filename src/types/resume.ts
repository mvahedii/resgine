export interface ResumeHeader {
  name: string;
  title: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  dateRange: string;
  location?: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  dateRange: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Project {
  title: string;
  link?: string;
  linkText?: string;
  description?: string;
  bullets: string[];
}

export interface Resume {
  header: ResumeHeader;
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillGroup[];
  projects: Project[];
}
