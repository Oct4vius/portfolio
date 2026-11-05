export type Locale = 'en' | 'es';

export interface Job {
  id: 'sbg' | 'newfold' | 'mediarev';
  company: string;
  role: string;
  period: string;
  summary: string;
  stack: string[];
  bullets: string[];
  current: boolean;
}

export interface Project {
  id: 'recibo' | 'awards';
  name: string;
  period: string;
  status?: string;
  summary: string;
  points: string[];
  stack: string[];
  repo?: string;
}

export interface StackGroup {
  label: string;
  level: 'daily' | 'used' | 'some';
  items: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface SiteContent {
  locale: Locale;
  meta: { title: string; description: string; ogLocale: 'en_US' | 'es_DO' };
  nav: { switchLabel: string; label: string }; // "ES" on EN page, "EN" on ES page
  hero: { name: string; tagline: string; slogan: string; badge: string; avatarAlt: string };
  headings: { work: string; projects: string; stack: string; credentials: string; contact: string };
  jobs: Job[]; // newest first: sbg, newfold, mediarev
  projects: Project[]; // recibo first (featured), then awards
  stack: StackGroup[];
  education: { degree: string; school: string; year: string };
  certifications: Certification[];
  languages: string[];
  contact: {
    blurb: string;
    email: string;
    copyLabel: string;
    copiedLabel: string;
    copyFailedLabel: string;
    linkedin: string;
    github: string;
    cvLabel: string;
    cvFile: string;
  };
  ui: { viewRepo: string };
  notFound: { title: string; message: string; backLabel: string };
}
