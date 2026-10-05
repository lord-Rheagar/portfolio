// The reference portfolio's four-card gallery; project details live in
// src/content/works/<slug>.md and are displayed by the existing Works UI.
export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

const en: WorksLang = {
  title: 'Works',
  closeLabel: 'Back',
  openLabel: 'Explore',
  hint: 'Keep scrolling',
  awardsLabel: 'Awards',
  visitLabel: 'View original work',
  detailPlaceholder: 'Details coming soon.',
  phImageLabel: 'Image / Video',
  phButtonLabel: 'Link coming soon',
  countLabel: (n) => `${n} works`,
  sections: [
    {
      id: 'automation',
      no: '01',
      title: 'AI Automation workflows',
      tagline: 'Research, knowledge and operations workflows',
      items: [
        { name: 'Prospect intelligence', meta: 'Workflow', slug: 'prospect-intelligence' },
        { name: 'Competitive intelligence Automation', meta: 'Workflow', slug: 'competitive-intelligence-automation' },
        { name: 'SOP Assistant bot', meta: 'Slack bot', slug: 'sop-assistant-bot' },
        { name: 'Linear ticket workflow', meta: 'Support ops', slug: 'linear-ticket-workflow' },
      ],
    },
    {
      id: 'gtm',
      no: '02',
      title: 'GTM case studies',
      tagline: 'Growth questions, launch plans and creator strategy',
      items: [
        { name: 'Cal.com: How to convert free users to Paid?', meta: 'Case study', slug: 'cal-com-free-to-paid' },
        { name: 'Wispr Flow GTM thesis', meta: 'India launch', slug: 'wispr-flow-gtm-thesis' },
        { name: 'ElevenLabs Efficacy Engine', meta: 'Creator analysis', slug: 'elevenlabs-efficacy-engine' },
      ],
    },
    {
      id: 'writing',
      no: '03',
      title: 'Writing',
      tagline: 'Research and essays',
      items: [
        { name: 'Does Partial Progress Affect Task Gaming?', meta: 'Research proposal', slug: 'partial-progress-task-gaming' },
        { name: 'History of Security Incidents on Solana', meta: 'Article', slug: 'solana-security-incidents' },
        { name: 'Exploring Moats & Defensibility of Stablecoins', meta: 'Article', slug: 'stablecoin-moats' },
      ],
    },
    {
      id: 'side-projects',
      no: '04',
      title: 'Side Projects',
      tagline: 'Tools and data explorations',
      items: [
        { name: 'EvidenceLab', meta: 'Research tool', slug: 'evidence-lab' },
        { name: 'AI Exposure of the Indian Job Market', meta: 'Interactive data app', slug: 'indian-job-ai-exposure' },
      ],
    },
  ],
}

export const WORKS: Record<'en' | 'zh', WorksLang> = { en, zh: en }
// Use images from Bodhi's published work for the reference-style gallery.
export const SECTION_COVERS: Record<string, string> = {
  automation: `${import.meta.env.BASE_URL}works/prospect-intelligence/workflow.png`,
  gtm: `${import.meta.env.BASE_URL}works/elevenlabs-efficacy-engine/dashboard.png`,
  writing: `${import.meta.env.BASE_URL}works/solana-security-incidents/cover.jpg`,
  'side-projects': `${import.meta.env.BASE_URL}works/evidence-lab/cover.png`,
}

export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, group) => n + group.items.length, 0)
  return 0
}
