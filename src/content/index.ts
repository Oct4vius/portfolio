import { en } from './en';
import { es } from './es';
import type { Locale, SiteContent } from './types';

const content: Record<Locale, SiteContent> = { en, es };

export function getContent(locale: Locale): SiteContent {
  return content[locale];
}

export type * from './types';
