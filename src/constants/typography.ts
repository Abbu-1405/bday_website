import { Theme } from '../types/theme';

export type TypographyToken =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body-large'
  | 'body'
  | 'small'
  | 'caption'
  | 'quote'
  | 'button'
  | 'handwritten';

export interface TypographyTokenDetail {
  name: TypographyToken;
  className: string;
  description: string;
}

export const TYPOGRAPHY_CLASSES: Record<TypographyToken, string> = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  'body-large': 'text-body-lg',
  body: 'text-body',
  small: 'text-small',
  caption: 'text-caption',
  quote: 'text-quote',
  button: 'text-button',
  handwritten: 'text-handwritten',
};

export const TYPOGRAPHY_TOKENS: readonly TypographyTokenDetail[] = [
  {
    name: 'display',
    className: TYPOGRAPHY_CLASSES.display,
    description: 'Hero and major section titles',
  },
  {
    name: 'h1',
    className: TYPOGRAPHY_CLASSES.h1,
    description: 'Primary page headings',
  },
  {
    name: 'h2',
    className: TYPOGRAPHY_CLASSES.h2,
    description: 'Section headings',
  },
  {
    name: 'h3',
    className: TYPOGRAPHY_CLASSES.h3,
    description: 'Subheadings and card titles',
  },
  {
    name: 'body-large',
    className: TYPOGRAPHY_CLASSES['body-large'],
    description: 'Lead paragraphs and emphasized text',
  },
  {
    name: 'body',
    className: TYPOGRAPHY_CLASSES.body,
    description: 'Standard body text',
  },
  {
    name: 'small',
    className: TYPOGRAPHY_CLASSES.small,
    description: 'Secondary information and fine print',
  },
  {
    name: 'caption',
    className: TYPOGRAPHY_CLASSES.caption,
    description: 'Labels, metadata, and badges',
  },
  {
    name: 'quote',
    className: TYPOGRAPHY_CLASSES.quote,
    description: 'Featured quotes and excerpts',
  },
  {
    name: 'button',
    className: TYPOGRAPHY_CLASSES.button,
    description: 'Interactive control labels',
  },
  {
    name: 'handwritten',
    className: TYPOGRAPHY_CLASSES.handwritten,
    description: 'Personal notes, signatures, and whimsical callouts',
  },
] as const;

export interface ThemeFontFamilyConfig {
  display: string;
  heading: string;
  body: string;
  quote: string;
  handwritten: string;
}

export const THEME_FONTS: Record<Theme, ThemeFontFamilyConfig> = {
  'letter-archive': {
    display: "'Cormorant Garamond', Georgia, serif",
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'Plus Jakarta Sans', -apple-system, sans-serif",
    quote: "'EB Garamond', Georgia, serif",
    handwritten: "'Allura', 'Caveat', cursive",
  },
  'midnight-journal': {
    display: "'DM Serif Display', Georgia, serif",
    heading: "'DM Serif Display', Georgia, serif",
    body: "'Inter', -apple-system, sans-serif",
    quote: "'Instrument Serif', Georgia, serif",
    handwritten: "'Caveat', cursive",
  },
  'whimsical-scrapbook': {
    display: "'Fraunces', Georgia, serif",
    heading: "'Fraunces', Georgia, serif",
    body: "'Newsreader', Georgia, serif",
    quote: "'Newsreader', Georgia, serif",
    handwritten: "'Caveat', cursive",
  },
};
