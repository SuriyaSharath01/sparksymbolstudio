import { CORE_CARDS, type CoreCardId } from './core-cards';

export interface SocialStoryPage {
  id: string;
  pageNumber: number;
  heading: string;
  sentence: string;
  guidanceNote?: string;
  symbol?: string;
  coreCardId?: CoreCardId;
}

export interface SocialStory {
  id: string;
  title: string;
  category: 'Routines & Transitions' | 'Sensory & Calm Support' | 'Everyday Living & Care';
  audience: string;
  pages: SocialStoryPage[];
}

export const DEFAULT_SOCIAL_STORIES: SocialStory[] = [
  {
    id: 'story_routine_change',
    title: 'When Routines or Plans Change',
    category: 'Routines & Transitions',
    audience: 'Adult Residential & Supported Living',
    pages: [
      {
        id: 'rc_1',
        pageNumber: 1,
        heading: 'Starting the Day',
        sentence: 'Sometimes plans during the day change after we wake up or have a morning drink.',
        guidanceNote: 'Keep language calm and concrete before a shift change or outing adjustment.',
        symbol: '/symbols/wake_up_,_to.svg',
      },
      {
        id: 'rc_2',
        pageNumber: 2,
        heading: 'Pausing When Unsure',
        sentence: 'If a change feels sudden, I can pause and let support staff explain what is happening next.',
        guidanceNote: 'Offer clear visual choices rather than rapid verbal questions.',
        coreCardId: 'stop',
        symbol: CORE_CARDS.stop.imageSrc,
      },
      {
        id: 'rc_3',
        pageNumber: 3,
        heading: 'Taking a Calm Break',
        sentence: 'I can ask for quiet time or step away for a moment while things get sorted.',
        guidanceNote: 'Support access to a low-stimulus space if agitation builds.',
        coreCardId: 'quiet',
        symbol: CORE_CARDS.quiet.imageSrc,
      },
      {
        id: 'rc_4',
        pageNumber: 4,
        heading: 'Moving Forward Together',
        sentence: 'Changes can feel easier when we take one step at a time.',
        guidanceNote: 'Pair with a Now / Next / Then strip in the main grid.',
        coreCardId: 'home',
        symbol: CORE_CARDS.home.imageSrc,
      },
    ],
  },
  {
    id: 'story_loud_places',
    title: 'Loud Places & Ear Muffs',
    category: 'Sensory & Calm Support',
    audience: 'Community Outings & Shared Spaces',
    pages: [
      {
        id: 'lp_1',
        pageNumber: 1,
        heading: 'Noisy Spaces',
        sentence: 'Shops, busy streets, and group sessions can sometimes sound loud or crowded.',
        guidanceNote: 'Check sensory triggers before arriving at community venues.',
        symbol: '/symbols/walk_,_to.svg',
      },
      {
        id: 'lp_2',
        pageNumber: 2,
        heading: 'Using Ear Muffs',
        sentence: 'I can put on ear muffs to help lower loud sounds so I feel more comfortable.',
        guidanceNote: 'Check fit and comfort without forcing prolonged wear.',
        symbol: '/symbols/ear_muffs.svg',
      },
      {
        id: 'lp_3',
        pageNumber: 3,
        heading: 'Quiet Reset',
        sentence: 'If I still feel overwhelmed, I can choose quiet time or head back when ready.',
        guidanceNote: 'Respect early exit or quiet break requests.',
        coreCardId: 'quiet',
        symbol: CORE_CARDS.quiet.imageSrc,
      },
    ],
  },
  {
    id: 'story_personal_care',
    title: 'Daily Washing & Fresh Start',
    category: 'Everyday Living & Care',
    audience: 'Personal Care & Daily Living',
    pages: [
      {
        id: 'pc_1',
        pageNumber: 1,
        heading: 'Washing Hands & Face',
        sentence: 'Washing my face and hands helps me feel fresh before meals and after activities.',
        guidanceNote: 'Break steps down into single actions where helpful.',
        symbol: '/symbols/wash_hands_,_to.svg',
      },
      {
        id: 'pc_2',
        pageNumber: 2,
        heading: 'Drying & Teeth Care',
        sentence: 'Drying my hands and brushing my teeth are simple steps I can do at my own pace.',
        guidanceNote: 'Allow extra processing time rather than rushing.',
        symbol: '/symbols/toothbrush.svg',
      },
      {
        id: 'pc_3',
        pageNumber: 3,
        heading: 'Warm Drink & Comfort',
        sentence: 'Afterwards, I can have a warm drink or settle into my next activity.',
        guidanceNote: 'Reinforce autonomy and dignified adult pacing.',
        coreCardId: 'hot_drink',
        symbol: CORE_CARDS.hot_drink.imageSrc,
      },
    ],
  },
];

const STORIES_STORAGE_KEY = 'spark_social_stories_v1';

export function loadSavedSocialStories(): SocialStory[] {
  try {
    const raw = localStorage.getItem(STORIES_STORAGE_KEY);
    if (!raw) return DEFAULT_SOCIAL_STORIES;
    const parsed = JSON.parse(raw) as SocialStory[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SOCIAL_STORIES;
  } catch {
    return DEFAULT_SOCIAL_STORIES;
  }
}

export function saveSocialStoriesToStorage(stories: SocialStory[]): void {
  try {
    localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories));
  } catch {
    // Ignore storage quota errors in restricted browser modes
  }
}
