import { describe, expect, test } from 'vitest';
import { getContent } from '../../src/content';
import type { Locale, SiteContent } from '../../src/content/types';

const locales: Locale[] = ['en', 'es'];

function allStrings(obj: unknown): string[] {
  if (typeof obj === 'string') return [obj];
  if (Array.isArray(obj)) return obj.flatMap(allStrings);
  if (obj && typeof obj === 'object') return Object.values(obj).flatMap(allStrings);
  return [];
}

// voice-dna.md §3A, copied verbatim with qualifiers stripped
// ("landscape (abstract)", "underscore (verb)", "highlight (verb)") and
// "intricate/intricacies" split into two entries.
const bannedEn = [
  'delve', 'realm', 'harness', 'unlock', 'tapestry', 'paradigm', 'cutting-edge', 'revolutionize',
  'landscape', 'intricate', 'intricacies', 'showcasing', 'crucial', 'pivotal', 'surpass',
  'meticulously', 'vibrant', 'unparalleled', 'underscore', 'leverage', 'synergy', 'innovative',
  'game-changer', 'testament', 'commendable', 'meticulous', 'highlight', 'emphasize', 'boast',
  'groundbreaking', 'align', 'foster', 'showcase', 'enhance', 'holistic', 'garner', 'accentuate',
  'pioneering', 'trailblazing', 'unleash', 'versatile', 'transformative', 'redefine', 'seamless',
  'optimize', 'scalable', 'robust', 'breakthrough', 'empower', 'streamline', 'frictionless',
  'elevate', 'adaptive', 'effortless', 'data-driven', 'insightful', 'proactive', 'mission-critical',
  'visionary', 'disruptive', 'reimagine', 'unprecedented', 'intuitive', 'leading-edge', 'synergize',
  'democratize', 'accelerate', 'state-of-the-art', 'dynamic', 'immersive', 'predictive',
  'transparent', 'proprietary', 'integrated', 'plug-and-play', 'turnkey', 'future-proof',
  'paradigm-shifting', 'supercharge', 'enduring', 'interplay', 'valuable', 'captivate',
];

const bannedEs = [
  'versátil', 'innovador', 'innovadora', 'sinergia', 'robusto', 'robusta', 'escalable',
  'optimizar', 'optimicé', 'potenciar', 'apasionado', 'dinámico', 'dinámica',
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// JS `\b` treats accented letters as non-word characters, so `\boptimicé\b` never
// matches "optimicé el". Use Unicode-aware lookarounds instead. EN words also
// match common inflections ("optimized", "enhancing", "aligns").
function bannedPattern(word: string, lang: 'en' | 'es'): RegExp {
  const w = escape(word);
  let body: string;
  if (lang === 'en') {
    const stem = word.endsWith('e') ? escape(word.slice(0, -1)) : null;
    body = stem ? `(?:${w}(?:s|d|r|rs)?|${stem}(?:ing|ation|ations|ed))` : `${w}(?:s|es|ed|ing|ly)?`;
  } else {
    body = `${w}s?`;
  }
  return new RegExp(`(?<![\\p{L}\\p{N}_])${body}(?![\\p{L}\\p{N}_])`, 'iu');
}

const bannedPatterns = [
  ...bannedEn.map((w) => bannedPattern(w, 'en')),
  ...bannedEs.map((w) => bannedPattern(w, 'es')),
];

function bannedHits(text: string): string[] {
  return bannedPatterns.filter((re) => re.test(text)).map((re) => re.source);
}

test('banned-word matcher catches accented and inflected forms', () => {
  expect(bannedHits('Optimicé el sitio')).not.toHaveLength(0);
  expect(bannedHits('Versátil y rápido')).not.toHaveLength(0);
  expect(bannedHits('Optimized the website')).not.toHaveLength(0);
  expect(bannedHits('Integrated third-party APIs to enhance it')).not.toHaveLength(0);
  expect(bannedHits('Built a queue-driven system with Redis')).toHaveLength(0);
});

describe.each(locales)('content (%s)', (locale) => {
  const c: SiteContent = getContent(locale);
  const strings = allStrings(c);

  test('slogan is exact', () => {
    expect(c.hero.slogan).toBe(
      locale === 'en'
        ? 'Each job handed me a new stack. I shipped in all of them.'
        : 'Cada trabajo me dio un stack nuevo. Entregué en todos.',
    );
  });

  test('no em dashes', () => {
    expect(strings.filter((s) => s.includes('—'))).toEqual([]);
  });

  test('no forbidden names or private data', () => {
    for (const re of [/milky/i, /829/, /miramar/i, /salary|salario/i]) {
      expect(strings.filter((s) => re.test(s))).toEqual([]);
    }
  });

  test('no banned voice words', () => {
    const hits = strings.flatMap((s) => bannedHits(s).map((p) => `${p} in "${s}"`));
    expect(hits).toEqual([]);
  });

  test('no SBG impact numbers', () => {
    const sbg = c.jobs.find((j) => j.id === 'sbg');
    expect(sbg).toBeDefined();
    for (const s of [sbg!.summary, ...sbg!.bullets]) {
      expect(s).not.toMatch(/\d+\s?%/);
    }
  });

  test('facts', () => {
    expect(c.locale).toBe(locale);
    expect(c.contact.email).toBe('armando2445@outlook.com');
    expect(c.projects[0].id).toBe('recibo');
    expect(c.projects[0].repo).toBe('https://github.com/Oct4vius/Recibo');
    const awards = c.projects.find((p) => p.id === 'awards');
    expect(awards).toBeDefined();
    expect(awards!.repo).toBeUndefined();
    expect(awards!.status).toBeTruthy();
    expect(c.contact.cvFile).toBe(
      locale === 'en' ? 'Octavio-Luperon-CV-EN.pdf' : 'Octavio-Luperon-CV-ES.pdf',
    );
    expect(c.jobs.map((j) => j.period)).toEqual(
      locale === 'en'
        ? ['Dec 2025 – Sep 2026', 'Aug 2024 – Oct 2025', 'Jan 2023 – Aug 2024']
        : ['dic 2025 – sep 2026', 'ago 2024 – oct 2025', 'ene 2023 – ago 2024'],
    );
    expect(c.jobs.filter((j) => j.current).map((j) => j.id)).toEqual(['sbg']);
    for (const job of c.jobs) {
      expect(job.bullets.length).toBeGreaterThanOrEqual(3);
      expect(job.bullets.length).toBeLessThanOrEqual(5);
    }
  });
});

test('EN/ES parity', () => {
  const en = getContent('en');
  const es = getContent('es');
  expect(es.jobs.map((j) => j.id)).toEqual(en.jobs.map((j) => j.id));
  expect(en.jobs.map((j) => j.id)).toEqual(['sbg', 'newfold', 'mediarev']);
  expect(es.jobs.map((j) => j.bullets.length)).toEqual(en.jobs.map((j) => j.bullets.length));
  expect(es.projects.map((p) => p.id)).toEqual(en.projects.map((p) => p.id));
  expect(es.projects.map((p) => p.repo)).toEqual(en.projects.map((p) => p.repo));
  expect(es.stack.map((g) => g.level)).toEqual(en.stack.map((g) => g.level));
  expect(es.stack.map((g) => g.items)).toEqual(en.stack.map((g) => g.items));
});
