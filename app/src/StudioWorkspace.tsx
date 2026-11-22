import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { CommunicationPassport, ReviewLog } from './types/passport';
import { AISReviewBanner } from './components/passport/AISReviewBanner';
import { exportCQCEvidence } from './utils/cqcExport';
import { ParkItPocket } from './components/layout/ParkItPocket';
import React,
  { useEffect,
  useMemo,
  useState } from 'react';
import {
  Search,
  Camera,
  Printer,
  LayoutTemplate,
  ListOrdered,
  Compass,
  HeartHandshake,
  Zap,
  Layers,
  X,
  FolderOpen,
  BookOpen,
  Download,
  Upload,
  Sparkles,
} from 'lucide-react';
import { type FocusStep } from './components/FocusCard';
import SparkLogo from './components/SparkLogo';
import { CardVisual } from './components/AnchorCard';
import { type TemplatePillAction } from './components/TemplateGrid';
import { type StripSymbolItem } from './components/WidgitSentenceStrip';
import { CORE_CARDS, type CoreCardId } from './data/core-cards';
import { RESOURCE_REGISTRY } from './data/resource-registry';
import {
  DEFAULT_SOCIAL_STORIES,
  loadSavedSocialStories,
  saveSocialStoriesToStorage,
  type SocialStory,
} from './data/social-stories';
import {
  loadMulberrySymbols,
  searchMulberrySymbols,
  findBestSymbol,
  saveResidentPhoto,
  getAllResidentPhotos,
  deleteResidentPhoto,
  type MulberrySymbol,
  type ResidentPhotoItem,
} from './data/symbols';
import { downloadOpenBoardFile, parseOpenBoardFile, type ObfExportTileInput } from './utils/obf-export';
import { searchSymbolsCommercialSafe } from './utils/remoteSymbolSearch';
import type { SymbolAsset } from './types/symbols';
import './index.css';
import {
  type ResourceTemplateId,
  type QuickCard,
  type SupportPackItem,
  type CommunityPreset,
  SUPPORT_PACKS,
  COMMUNITY_PRESETS,
  WANTS_BOARD_ITEMS,
} from './data/studio-presets';
import { CustomBoardWorkspace } from './components/studio/CustomBoardWorkspace';
import { StudioCanvasWorkspace } from './components/studio/StudioCanvasWorkspace';
import { EasyReadWriterPanel } from './components/studio/EasyReadWriterPanel';
import { RoutinePresetsPanel } from './components/studio/RoutinePresetsPanel';
import { SupportPacksPanel } from './components/studio/SupportPacksPanel';
import { MediaLibraryPanel } from './components/studio/MediaLibraryPanel';
import { ChoiceBoardTab } from './components/studio/ChoiceBoardTab';
import { CoreCardsTab } from './components/studio/CoreCardsTab';
import { FocusModeTab } from './components/studio/FocusModeTab';
import { SocialStoriesTab } from './components/studio/SocialStoriesTab';
export type { QuickCard } from './data/studio-presets';
export type AppTab = 'templates' | 'studio' | 'easyread' | 'packs' | 'wants' | 'community' | 'anchors' | 'focus' | 'stories' | 'media';
type PrintFormat = 'a4' | 'pocket';
interface ResourceTemplate {
  id: ResourceTemplateId;
  name: string;
  description: string;
  defaultTitle: string;
  slots: { slotLabel: string; cardId: CoreCardId }[];
}
const RESOURCE_TEMPLATES: ResourceTemplate[] = [
  {
    id: 'now_next_then',
    name: 'Now / Next / Then Strip',
    description: 'A simple three-step visual sequence.',
    defaultTitle: 'Now / Next / Then Strip',
    slots: [
      { slotLabel: 'NOW', cardId: 'tea' },
      { slotLabel: 'NEXT', cardId: 'toilet' },
      { slotLabel: 'THEN', cardId: 'home' },
    ],
  },
  {
    id: 'choice_grid',
    name: 'Choice Grid',
    description: 'Six everyday choices for requesting support.',
    defaultTitle: 'Everyday Choice Grid',
    slots: [
      { slotLabel: 'OPTION 1', cardId: 'tea' },
      { slotLabel: 'OPTION 2', cardId: 'hot_drink' },
      { slotLabel: 'OPTION 3', cardId: 'toilet' },
      { slotLabel: 'OPTION 4', cardId: 'quiet' },
      { slotLabel: 'OPTION 5', cardId: 'ear_defenders' },
      { slotLabel: 'OPTION 6', cardId: 'home' },
    ],
  },
  {
    id: 'routine_strip',
    name: 'Routine Strip',
    description: 'A predictable sequence for an outing.',
    defaultTitle: 'Routine Strip',
    slots: [
      { slotLabel: 'STEP 1', cardId: 'shopping_bag' },
      { slotLabel: 'STEP 2', cardId: 'queue' },
      { slotLabel: 'STEP 3', cardId: 'home' },
    ],
  },
  {
    id: 'flashcards',
    name: 'Core Flashcards',
    description: 'High-contrast cards for immediate communication.',
    defaultTitle: 'Core Flashcards',
    slots: [
      { slotLabel: 'CARD 1', cardId: 'stop' },
      { slotLabel: 'CARD 2', cardId: 'wait' },
      { slotLabel: 'CARD 3', cardId: 'listen' },
      { slotLabel: 'CARD 4', cardId: 'quiet' },
      { slotLabel: 'CARD 5', cardId: 'toilet' },
      { slotLabel: 'CARD 6', cardId: 'home' },
    ],
  },
];
const ANCHOR_CARD_IDS: CoreCardId[] = [
  'stop',
  'wait',
  'listen',
  'quiet',
  'toilet',
  'hot_drink',
];
import { getCachedSymbolBlobUrlBySrc } from './utils/symbolCacheDb';
import OfflineStatusPanel from './components/studio/OfflineStatusPanel';
import { persistRemoteSymbolOffline } from './utils/remoteSymbolSearch';

function SymbolTileVisual({
  src,
  alt,
  label,
  coreCardId,
  sizeClass = 'h-16 w-16',
}: {
  src?: string;
  alt: string;
  label: string;
  coreCardId?: CoreCardId;
  sizeClass?: string;
}) {
  const [broken, setBroken] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(src);
  useEffect(() => {
    setBroken(false);
    setResolvedSrc(src);
    if (!src || !/^https?:\/\//i.test(src)) return;
    let active = true;
    let createdObjectUrl: string | null = null;
    getCachedSymbolBlobUrlBySrc(src).then((blobUrl) => {
      if (!active || !blobUrl) return;
      createdObjectUrl = blobUrl;
      setResolvedSrc(blobUrl);
    });
    return () => {
      active = false;
      if (createdObjectUrl && typeof URL !== 'undefined') {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [src]);
  if (coreCardId && CORE_CARDS[coreCardId]) {
    return (
      <div className={`flex items-center justify-center ${sizeClass}`}>
        <CardVisual card={CORE_CARDS[coreCardId]} />
      </div>
    );
  }
  if (!src || broken) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-1.5 text-center text-[11px] font-extrabold uppercase text-slate-700 ${sizeClass}`}
      >
        {label}
      </div>
    );
  }
  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => setBroken(true)}
      className={`object-contain ${sizeClass}`}
    />
  );
}
function getSlotBadgeLabel(
  index: number,
  totalItems: number,
  templateId: ResourceTemplateId,
  configuredLabel?: string
): string {
  if (templateId === 'now_next_then' && totalItems <= 3) {
    return ['NOW', 'NEXT', 'THEN'][index] || `STEP ${index + 1}`;
  }
  if (templateId === 'choice_grid') {
    return `OPTION ${index + 1}`;
  }
  if (templateId === 'flashcards') {
    return `CARD ${index + 1}`;
  }
  if (configuredLabel && totalItems === 3) {
    return configuredLabel;
  }
  return `STEP ${index + 1}`;
}
type AgeBand = '5-11' | '12-17' | '18-59' | '60-70+';
type SupportLevel = 'high_nonverbal' | 'moderate_step' | 'low_choice';

interface SupportProfileDNA {
  id: string;
  label: string;
  initials: string;
  ageBand?: AgeBand;
  supportLevel?: SupportLevel;
  defaultLowArousal: boolean;
  defaultPackId: string;
  reviewNote: string;
  isCustom?: boolean;
}

const DEFAULT_SUPPORT_PROFILES: SupportProfileDNA[] = [
  {
    id: 'default',
    label: 'General Shift Board',
    initials: '',
    defaultLowArousal: false,
    defaultPackId: '',
    reviewNote: 'Person-Centred Visual Support',
  },
  {
    id: 'nonverbal_nownext',
    label: 'Non-Verbal 2-Card Now/Next (Low-Arousal)',
    initials: 'C.',
    defaultLowArousal: true,
    defaultPackId: 'pack_everyday_living',
    reviewNote: 'Non-Verbal 2-Card Now/Next • Low-Arousal',
  },
  {
    id: 'kitchen_autonomy',
    label: 'Pantry to Pot • Kitchen Independence',
    initials: 'M.',
    defaultLowArousal: false,
    defaultPackId: 'pack_pantry_to_pot',
    reviewNote: 'Pantry to Pot Visual Meal Prep',
  },
  {
    id: 'morning_autonomy',
    label: 'Morning Autonomy & Open-Door Profile',
    initials: 'D.',
    defaultLowArousal: false,
    defaultPackId: 'pack_morning_autonomy',
    reviewNote: 'Autonomy & Unhurried Morning Routine',
  },
  {
    id: 'seizure_recovery',
    label: 'Post-Seizure Rest & Recovery Profile',
    initials: 'N.',
    defaultLowArousal: true,
    defaultPackId: 'pack_post_seizure_rest',
    reviewNote: 'Post-Seizure Recovery & Safety Plan',
  },
];

import { getMulberryCatalog, loadOpenMojiCatalog, searchLocalSymbols } from './utils/symbolSearch';

function StudioWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const seededFromUrlRef = useRef<string | null>(null);
  const [heroSearchQuery, setHeroSearchQuery] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveSearchResults, setLiveSearchResults] = useState<SymbolAsset[]>([]);
  const [isSearchingSymbols, setIsSearchingSymbols] = useState<boolean>(false);
  const [showLaunchpad, setShowLaunchpad] = useState<boolean>(false);
  const [sequenceMode, setSequenceMode] = useState<'full' | 'now_next' | 'now_next_then'>('full');
  const [customProfiles, setCustomProfiles] = useState<SupportProfileDNA[]>(() => {
    try {
      const raw = localStorage.getItem('spark_custom_resident_profiles');
      return raw ? (JSON.parse(raw) as SupportProfileDNA[]) : [];
    } catch {
      return [];
    }
  });
  const [showProfileCreator, setShowProfileCreator] = useState<boolean>(false);
  const [newProfileLabel, setNewProfileLabel] = useState<string>('');
  const [newProfileInitials, setNewProfileInitials] = useState<string>('');
  const [newProfileAge, setNewProfileAge] = useState<AgeBand>('18-59');
  const [newProfileLevel, setNewProfileLevel] = useState<SupportLevel>('high_nonverbal');
  const [newProfileLowArousal, setNewProfileLowArousal] = useState<boolean>(true);
  const [newProfileNote, setNewProfileNote] = useState<string>('');
  useEffect(() => {
    const trimmed = heroSearchQuery.trim();
    if (!trimmed) {
      setLiveSearchResults([]);
      setIsSearchingSymbols(false);
      return;
    }
    let cancelled = false;
    setIsSearchingSymbols(true);
    const timer = window.setTimeout(() => {
      const localHits: SymbolAsset[] = searchMulberrySymbols(symbols, trimmed, 'All', 36).map((s) => ({
        id: s.id,
        label: s.label,
        imagePath: s.svgPath,
        source: s.id.startsWith('om_') ? ('openmoji' as any) : 'mulberry',
        license: 'CC BY-SA' as SymbolAsset['license'], commercialSafe: true,
      }));
      searchSymbolsCommercialSafe(trimmed, { includeRemote: false, timeoutMs: 500 })
        .then((hits) => {
          if (cancelled) return;
          const seen = new Set(localHits.map((h) => h.label.toLowerCase() + '|' + h.imagePath));
          const merged = [...localHits, ...hits.filter((h) => !seen.has(h.label.toLowerCase() + '|' + h.imagePath))];
          setLiveSearchResults(merged);
        })
        .finally(() => {
          if (!cancelled) setIsSearchingSymbols(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [heroSearchQuery]);
  const [activeTab, setActiveTab] = useState<AppTab>('templates');
  const [topSearch, setTopSearch] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<ResourceTemplateId>('now_next_then');
  const [printFormat, setPrintFormat] = useState<PrintFormat>('a4');
  const [lowArousalMode, setLowArousalMode] = useState<boolean>(false);
  useEffect(() => {
    document.body.classList.toggle('low-arousal', lowArousalMode);
  }, [lowArousalMode]);
  const [careInitials, setCareInitials] = useState<string>('');
  const [careReviewNote, setCareReviewNote] = useState<string>('Person-Centred Visual Support');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('default');
  const [aisReviewRecords, setAisReviewRecords] = useState<
    Record<string, { createdAt: string; lastReviewedAt: string | null; nextReviewDue: string; reviewLog: ReviewLog[] }>
  >(() => {
    try {
      const raw = localStorage.getItem('spark_ais_review_records');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const allProfiles = [...DEFAULT_SUPPORT_PROFILES, ...customProfiles];

  const toCommunicationPassport = (p: SupportProfileDNA): CommunicationPassport => {
    const rec = aisReviewRecords[p.id];
    const defaultDue = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      id: p.id,
      residentInitials: (p.id === selectedProfileId && careInitials.trim()) ? careInitials.trim() : p.initials || p.label,
      profile: {
        fontFamily: 'system',
        pageBackground: p.defaultLowArousal ? '#FAFAF5' : '#FFFFFF',
        symbolSet: 'mixed',
        requiresLowArousal: p.defaultLowArousal,
        requiresHighContrast: false,
        customPhotoBindings: {},
      },
      createdAt: rec?.createdAt || new Date().toISOString().split('T')[0],
      lastReviewedAt: rec?.lastReviewedAt || null,
      nextReviewDue: rec?.nextReviewDue || defaultDue,
      reviewLog: rec?.reviewLog || [],
    };
  };

  const activePassport: CommunicationPassport | null = (() => {
    if (selectedProfileId === 'default' && customProfiles.length === 0) return null;
    const found = allProfiles.find((p) => p.id === selectedProfileId);
    return found ? toCommunicationPassport(found) : null;
  })();

  const handleLogPassportReview = (staffInitials: string, notes?: string) => {
    if (!activePassport) return;
    const today = new Date().toISOString().split('T')[0];
    const nextDue = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const entry: ReviewLog = { reviewedAt: today, reviewedBy: staffInitials, notes };
    setAisReviewRecords((prev) => {
      const existing = prev[activePassport.id];
      const updated = {
        ...prev,
        [activePassport.id]: {
          createdAt: existing?.createdAt || today,
          lastReviewedAt: today,
          nextReviewDue: nextDue,
          reviewLog: [entry, ...(existing?.reviewLog || [])],
        },
      };
      try {
        localStorage.setItem('spark_ais_review_records', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setCareReviewNote(`AIS Reviewed ${today} by ${staffInitials}`);
  };

  const handleExportAllCqcEvidence = () => {
    const tracked = allProfiles.filter((p) => p.id !== 'default').map(toCommunicationPassport);
    exportCQCEvidence(tracked.length > 0 ? tracked : allProfiles.map(toCommunicationPassport));
  };

  const handleSelectSupportProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profile = [...DEFAULT_SUPPORT_PROFILES, ...customProfiles].find((p) => p.id === profileId);
    if (!profile) return;
    setLowArousalMode(profile.defaultLowArousal);
    setCareInitials(profile.initials);
    setCareReviewNote(profile.reviewNote);
    if (profile.defaultPackId) {
      const pack = SUPPORT_PACKS.find((p) => p.id === profile.defaultPackId);
      if (pack) {
        loadSupportPack(pack);
      }
    }
  };
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('shops');
  const [sentenceStripItems, setSentenceStripItems] = useState<StripSymbolItem[]>([]);
  const appendSymbolToStrip = (label: string, imageSrc: string) => {
    setSentenceStripItems((prev) => [
      ...prev,
      { id: `${label}-${Date.now()}-${prev.length}`, label, imageSrc },
    ]);
  };
  const [boardTitle, setBoardTitle] = useState<string>(() => {
    try {
      return localStorage.getItem('carecomm_board_title') || 'Now / Next / Then Strip';
    } catch {
      return 'Now / Next / Then Strip';
    }
  });
  const [socialStories, setSocialStories] = useState<SocialStory[]>(() =>
    loadSavedSocialStories()
  );
  const [selectedStoryId, setSelectedStoryId] = useState<string>(() =>
    loadSavedSocialStories()[0]?.id || ''
  );
  const [customBoard, setCustomBoard] = useState<QuickCard[]>(() => {
    try {
      const saved = localStorage.getItem('carecomm_widgit_board');
      return saved ? (JSON.parse(saved) as QuickCard[]) : [];
    } catch {
      return [];
    }
  });
  const [symbols, setSymbols] = useState<MulberrySymbol[]>([]);
  const [symbolSearch, setSymbolSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [symbolError, setSymbolError] = useState<string>('');
  const [loadingSymbols, setLoadingSymbols] = useState<boolean>(true);
  const [photos, setPhotos] = useState<ResidentPhotoItem[]>([]);
  const [photoLabel, setPhotoLabel] = useState<string>('');
  const [photoContext, setPhotoContext] = useState<string>('home');
  const [savingPhoto, setSavingPhoto] = useState<boolean>(false);
  useEffect(() => {
    localStorage.setItem('carecomm_widgit_board', JSON.stringify(customBoard));
  }, [customBoard]);
  useEffect(() => {
    try {
      localStorage.setItem('carecomm_board_title', boardTitle);
    } catch {
      // Ignore storage quota issues
    }
  }, [boardTitle]);
  useEffect(() => {
    saveSocialStoriesToStorage(socialStories);
  }, [socialStories]);
  useEffect(() => {
    let mounted = true;
    loadMulberrySymbols()
      .then((list) => {
        if (!mounted) return;
        setSymbols(list);
        setSymbolError('');
      })
      .catch((err: Error) => {
        if (!mounted) return;
        setSymbolError(err.message);
      })
      .finally(() => {
        if (mounted) setLoadingSymbols(false);
      });
    getAllResidentPhotos()
      .then((items) => {
        if (mounted) setPhotos(items);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  const categories = useMemo(() => {
    const unique = Array.from(new Set(symbols.map((s) => s.category))).sort();
    return ['All', ...unique];
  }, [symbols]);
  const effectiveSearch = symbolSearch || topSearch;
  const filteredSymbols = useMemo(
    () => searchMulberrySymbols(symbols, effectiveSearch, selectedCategory, 90),
    [symbols, effectiveSearch, selectedCategory]
  );
  const activeTemplate =
    RESOURCE_TEMPLATES.find((t) => t.id === selectedTemplateId) || RESOURCE_TEMPLATES[0];
  const activePreset: CommunityPreset =
    COMMUNITY_PRESETS[selectedPresetKey] || COMMUNITY_PRESETS.shops;
  const activeStory =
    socialStories.find((s) => s.id === selectedStoryId) || socialStories[0];
  const focusSteps: FocusStep[] = useMemo(() => {
    const presetSteps: FocusStep[] = activePreset.steps.map((s) => ({
      id: s.id,
      label: s.label,
      actionInstruction: s.actionInstruction,
      imageSrc: s.imageSrc,
      imageAlt: s.imageAlt || s.label,
      waitSeconds: s.waitSeconds,
    }));
    const boardSteps: FocusStep[] = customBoard.map((c) => ({
      id: c.id,
      label: c.title,
      actionInstruction: c.actionText,
      imageSrc: c.imageSrc || findBestSymbol(symbols, c.keywords)?.svgPath || '',
      imageAlt: c.title,
      waitSeconds: c.waitSeconds,
    }));
    return [...presetSteps, ...boardSteps];
  }, [activePreset, customBoard, symbols]);
  const applyTemplate = (tpl: ResourceTemplate) => {
    setSelectedTemplateId(tpl.id);
    setBoardTitle(tpl.defaultTitle);
    setCustomBoard(
      tpl.slots.map((slot, idx) => {
        const card = CORE_CARDS[slot.cardId];
        return {
          id: `${tpl.id}_${slot.cardId}_${idx}_${Date.now()}`,
          title: card.label,
          actionText: card.subtext,
          keywords: [card.label.toLowerCase()],
          imageSrc: card.imageSrc,
          coreCardId: card.id,
        };
      })
    );
  };
  const loadRegistryPack = (key: keyof typeof RESOURCE_REGISTRY) => {
    const pack = RESOURCE_REGISTRY[key];
    if (!pack) return;
    setBoardTitle(pack.title);
    setCustomBoard(
      pack.steps.map((step, idx) => ({
        id: `${pack.id}_${step.id}_${idx}_${Date.now()}`,
        title: step.label,
        actionText: step.instruction,
        keywords: [step.label.toLowerCase()],
        imageSrc: step.symbol || (step.coreCardId ? CORE_CARDS[step.coreCardId].imageSrc : ''),
        coreCardId: step.coreCardId,
        waitSeconds: step.waitSeconds,
      }))
    );
  };
  const loadSupportPack = (pack: SupportPackItem) => {
    setBoardTitle(pack.title);
    setCustomBoard(
      pack.cards.map((item, idx) => ({
        id: `${pack.id}_${idx}_${Date.now()}`,
        title: item.label,
        actionText: item.subtext,
        keywords: [item.label.toLowerCase()],
        imageSrc: item.imageSrc,
        coreCardId: item.cardId,
      }))
    );
    setActiveTab('templates');
  };
  const handleAddStoryToGrid = (story: SocialStory) => {
    setBoardTitle(story.title);
    setCustomBoard(
      story.pages.map((page, idx) => ({
        id: `${story.id}_${page.id}_${idx}_${Date.now()}`,
        title: page.heading,
        actionText: page.sentence,
        keywords: [page.heading.toLowerCase()],
        imageSrc: page.symbol || (page.coreCardId ? CORE_CARDS[page.coreCardId].imageSrc : ''),
        coreCardId: page.coreCardId,
      }))
    );
    setActiveTab('templates');
  };
  const handleCreateCustomStory = (
    title: string,
    category: SocialStory['category'],
    sentence: string,
    symbol: string
  ) => {
    const newStory: SocialStory = {
      id: `custom_story_${Date.now()}`,
      title,
      category,
      audience: 'Adult Care & Support',
      pages: [
        {
          id: `page_1_${Date.now()}`,
          pageNumber: 1,
          heading: title,
          sentence,
          symbol,
        },
      ],
    };
    setSocialStories((prev) => [newStory, ...prev]);
    setSelectedStoryId(newStory.id);
  };
  const handleUpdateStory = (updatedStory: SocialStory) => {
    setSocialStories((prev) =>
      prev.map((s) => (s.id === updatedStory.id ? updatedStory : s))
    );
  };
  const handleResetStories = () => {
    setSocialStories(DEFAULT_SOCIAL_STORIES);
    setSelectedStoryId(DEFAULT_SOCIAL_STORIES[0]?.id || '');
    saveSocialStoriesToStorage(DEFAULT_SOCIAL_STORIES);
  };
  const handleTemplatePillAction = (action: TemplatePillAction) => {
    if (action.type === 'registry') {
      loadRegistryPack(action.registryKey);
      return;
    }
    if (action.type === 'template') {
      const found = RESOURCE_TEMPLATES.find((t) => t.id === action.templateId);
      if (found) applyTemplate(found);
      return;
    }
    if (action.type === 'schedule') {
      setSelectedPresetKey(action.presetKey);
      setActiveTab('community');
      return;
    }
    if (action.type === 'pack') {
      const foundPack = SUPPORT_PACKS.find((p) => p.id === action.packId);
      if (foundPack) loadSupportPack(foundPack);
      return;
    }
    setActiveTab(action.tab);
  };
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSavingPhoto(true);
    try {
      const saved = await saveResidentPhoto(file, photoLabel, photoContext);
      setPhotos((prev) => [saved, ...prev]);
      setPhotoLabel('');
      e.target.value = '';
    } finally {
      setSavingPhoto(false);
    }
  };
  const handleDeletePhoto = async (id: string) => {
    await deleteResidentPhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };
  const addTileToBoard = (card: QuickCard) => {
    setCustomBoard((prev) => [
      ...prev,
      { ...card, id: `${card.id}_${Date.now()}` },
    ]);
    if (card.imageSrc) {
      appendSymbolToStrip(card.title, card.imageSrc);
    }
  };
  const removeBoardTile = (id: string) => {
    setCustomBoard((prev) => prev.filter((item) => item.id !== id));
  };
  const handleImportObf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseOpenBoardFile(file);
      setBoardTitle(parsed.title);
      setCustomBoard(
        parsed.tiles.map((t, idx) => ({
          id: `${t.id}_imp_${idx}_${Date.now()}`,
          title: t.label,
          actionText: t.vocalization || t.label,
          keywords: [t.label.toLowerCase()],
          imageSrc: t.imageSrc || '',
        }))
      );
      setActiveTab('templates');
    } finally {
      e.target.value = '';
    }
  };
  const triggerPrint = (format: PrintFormat) => {
    setPrintFormat(format);
    window.setTimeout(() => {
      window.print();
    }, 80);
  };
  const handleExportObf = () => {
    const gridTiles: ObfExportTileInput[] =
      customBoard.length > 0
        ? customBoard.map((c) => ({
            id: c.id,
            label: c.title,
            vocalization: c.actionText,
            imageSrc: c.imageSrc,
            coreCardId: c.coreCardId,
          }))
        : activePreset.steps.map((s) => ({
            id: s.id,
            label: s.label,
            vocalization: s.actionInstruction,
            imageSrc: s.imageSrc,
            coreCardId: s.coreCardId,
          }));
    const exportTitle = customBoard.length > 0 ? boardTitle : activePreset.name;
    downloadOpenBoardFile(
      exportTitle,
      'Exported from Spark Symbol Support Studio',
      gridTiles
    );
  };
  const cardsForPrint: {
    id: string;
    title: string;
    subtitle: string;
    imageSrc?: string;
    coreCardId?: CoreCardId;
  }[] = useMemo(() => {
    if ((activeTab === 'templates' || activeTab === 'packs') && customBoard.length > 0) {
      return customBoard.map((c, i) => ({
        id: c.id,
        title: c.title,
        subtitle: getSlotBadgeLabel(
          i,
          customBoard.length,
          selectedTemplateId,
          activeTemplate.slots[i]?.slotLabel
        ),
        imageSrc: c.imageSrc,
        coreCardId: c.coreCardId,
      }));
    }
    if (activeTab === 'stories') {
      return (activeStory?.pages || []).map((p) => ({
        id: p.id,
        title: p.heading,
        subtitle: p.sentence,
        imageSrc: p.symbol,
        coreCardId: p.coreCardId,
      }));
    }
    if (activeTab === "templates" && sentenceStripItems.length > 0) {
      return sentenceStripItems.map((item, i) => ({
        id: item.id,
        title: item.label,
        subtitle: `Symbol ${i + 1}`,
        imageSrc: item.imageSrc,
      }));
    }
    return activePreset.steps.map((s, idx) => ({
      id: s.id,
      title: s.label,
      subtitle: `Step ${idx + 1}`,
      imageSrc: s.imageSrc,
      coreCardId: s.coreCardId,
    }));
  }, [activeTab, customBoard, activeTemplate, activePreset, activeStory, sentenceStripItems]);
  const quickSearchInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const rawSentence = searchParams.get("sentence")?.trim();
    if (!rawSentence || seededFromUrlRef.current === rawSentence) return;
    seededFromUrlRef.current = rawSentence;
    let cancelled = false;

    const applySeed = (catalog: ReturnType<typeof getMulberryCatalog>) => {
      if (cancelled) return;
      const words = rawSentence.split(/\s+/).filter(Boolean).slice(0, 12);
      const seeded: StripSymbolItem[] = words.map((w, idx) => {
        const clean = w.replace(/[^\w]+/g, "") || w;
        const match = searchLocalSymbols(clean, catalog)[0];
        return {
          id: `url_seed_${idx}_${clean.toLowerCase()}`,
          label: match?.label || clean,
          imageSrc: match?.imagePath || "",
          imageAlt: match?.label || clean,
        };
      });
      if (seeded.length > 0) {
        setSentenceStripItems(seeded);
        setActiveTab("templates");
      }
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("sentence");
      setSearchParams(nextParams, { replace: true });
    };

    const baseCatalog = getMulberryCatalog();
    applySeed(baseCatalog);
    loadOpenMojiCatalog()
      .then((extra) => {
        if (!cancelled && extra.length > 0) {
          applySeed([...baseCatalog, ...extra]);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams]);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('spark_low_arousal_mode');
      if (saved === 'true') setLowArousalMode(true);
      if (saved === 'false') setLowArousalMode(false);
    } catch {
      // ignore storage restrictions
    }
  }, [setLowArousalMode]);
  useEffect(() => {
    try {
      window.localStorage.setItem('spark_low_arousal_mode', String(lowArousalMode));
    } catch {
      // ignore storage restrictions
    }
  }, [lowArousalMode]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        quickSearchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <div data-active-tab={activeTab} data-low-arousal={lowArousalMode ? "true" : "false"} className={`min-h-screen text-slate-900 transition-colors ${lowArousalMode ? "bg-[#eef2ef]" : "bg-[#f4f5f7]"}`}>
      {/* Context-Aware Obsidian Glass Studio Header */}
      <header className="no-print sticky top-0 z-40">
        {activeTab === 'focus' ? (
          <div className="border-b border-slate-300 bg-[#eef2ef]/95 px-6 py-2.5 text-slate-900 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <SparkLogo className="h-7 w-7" lowArousal />
                <span className="text-xs font-extrabold tracking-wide text-slate-800 uppercase">
                  Resident Focus Mode • Calm Single-Step View
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-100"
              >
                Exit Focus Mode
              </button>
            </div>
          </div>
        ) : (
          <div
            className={
              lowArousalMode
                ? 'border-b border-emerald-900/50 bg-[#14201c]/95 text-slate-100 shadow-lg backdrop-blur-md transition-colors'
                : 'border-b border-slate-800/90 bg-[#0F172A]/95 text-white shadow-[0_8px_30px_rgba(15,23,42,0.25)] backdrop-blur-md transition-colors'
            }
          >
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('templates');
                }}
                className="group flex items-center gap-3 text-left"
              >
                <span className="transition-transform duration-200 group-hover:scale-[1.03]">
                  <SparkLogo className="h-10 w-10" lowArousal={lowArousalMode} />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-white">Spark</span>
                    <span
                      className={
                        lowArousalMode
                          ? 'rounded-full border border-emerald-400/30 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-200 uppercase'
                          : 'rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase'
                      }
                    >
                      {symbols.length > 0 ? `${symbols.length.toLocaleString('en-GB')} Symbols` : 'Symbol Studio'}
                    </span>
                  </span>
                  <span
                    className={
                      lowArousalMode
                        ? 'mt-1 hidden text-[11px] font-medium tracking-wide text-emerald-200/80 sm:inline'
                        : 'mt-1 hidden text-[11px] font-medium tracking-wide text-slate-300 sm:inline'
                    }
                  >
                    Clinical Symbol Studio • UK Care &amp; SALT
                  </span>
                </span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    ref={quickSearchInputRef}
                    type="text"
                    placeholder="Search symbols (⌘K)..."
                    value={heroSearchQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setHeroSearchQuery(v);
                      setSearchQuery(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const nextQ = heroSearchQuery.trim() || 'drink';
                        setHeroSearchQuery(nextQ);
                        setSearchQuery(nextQ);
                      }
                    }}
                    aria-label="Search symbols"
                    className="h-9 w-48 rounded-lg border border-slate-700 bg-slate-900/90 px-3 pr-8 text-xs font-medium text-white placeholder:text-slate-400 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none sm:w-56"
                  />
                  <button
                    type="button"
                    aria-label="Run symbol search"
                    onClick={() => {
                      const query = (heroSearchQuery || 'drink').trim();
                      setHeroSearchQuery(query);
                      setSearchQuery(query);
                    }}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded text-slate-300 transition hover:bg-slate-800 hover:text-amber-300"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setLowArousalMode((m) => !m)}
                  aria-pressed={lowArousalMode}
                  title="Switch to calm low-arousal colours when co-creating beside a resident"
                  className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${
                    lowArousalMode
                      ? 'border-emerald-400/50 bg-emerald-900/70 text-emerald-100 hover:bg-emerald-900'
                      : 'border-slate-700 bg-slate-800/90 text-slate-200 hover:border-amber-400/50 hover:text-white'
                  }`}
                >
                  <span>{lowArousalMode ? 'Low-Arousal: ON' : 'Low-Arousal Mode'}</span>
                </button>

                <label
                  className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${
                    lowArousalMode
                      ? 'border-emerald-900/70 bg-slate-800/80 text-slate-100 hover:bg-slate-800'
                      : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span title="Load a saved board file (Open Board Format .obf or .json)">Load Board</span>
                  <input type="file" accept=".obf,.json,application/json" onChange={handleImportObf} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleExportObf}
                  className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${
                    lowArousalMode
                      ? 'border-emerald-900/70 bg-slate-800/80 text-slate-100 hover:bg-slate-800'
                      : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span title="Save this board as a portable Open Board Format (.obf) file">Save Board</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerPrint('a4')}
                  className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${
                    lowArousalMode
                      ? 'border-emerald-500/40 bg-emerald-800/70 text-white hover:bg-emerald-800'
                      : 'border-amber-400/40 bg-slate-800 text-amber-200 hover:border-amber-400 hover:bg-slate-800/90 hover:text-white'
                  }`}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print A4</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerPrint('pocket')}
                  className={`flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-extrabold shadow-sm transition ${
                    lowArousalMode
                      ? 'bg-emerald-300 text-slate-950 hover:bg-emerald-200'
                      : 'bg-gradient-to-r from-amber-500 to-[#E36C2B] text-white hover:from-amber-400 hover:to-[#d45f20]'
                  }`}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Pocket Cards</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calm 3-Mode Master Navigation + Contextual Sub-Bar */}
        {(() => {
          type MasterMode = "design" | "documents" | "talker";
          const currentMode: MasterMode =
            activeTab === "easyread" || activeTab === "stories"
              ? "documents"
              : activeTab === "focus" || activeTab === "anchors"
                ? "talker"
                : "design";

          const subTabsByMode: Record<MasterMode, { id: AppTab; label: string; icon: typeof LayoutTemplate }[]> = {
            design: [
              { id: "templates", label: "Board Builder", icon: LayoutTemplate },
              { id: "studio", label: "Studio Canvas", icon: Sparkles },
              { id: "packs", label: "Support Packs", icon: FolderOpen },
              { id: "wants", label: "Choice & Request", icon: HeartHandshake },
              { id: "community", label: "Visual Schedules", icon: Compass },
              { id: "media", label: "Resident Photos", icon: Camera },
            ],
            documents: [
              { id: "easyread", label: "Easy Read (Zero-PII)", icon: BookOpen },
              { id: "stories", label: "Social Stories", icon: BookOpen },
            ],
            talker: [
              { id: "focus", label: "1-Step Focus Mode", icon: Layers },
              { id: "anchors", label: "Core Anchor Cards", icon: Zap },
            ],
          };

          const handleModeSwitch = (mode: MasterMode) => {
            if (mode === "design") setActiveTab("templates");
            else if (mode === "documents") setActiveTab("easyread");
            else setActiveTab("focus");
          };

          return (
            <div className={lowArousalMode ? "border-b border-slate-700 bg-slate-900 text-slate-200" : "border-b border-slate-200 bg-white text-slate-800 shadow-2xs"}>
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6">
                <div className="flex items-center gap-6">
                  {[
                    { id: "design" as MasterMode, label: "Design Studio", icon: LayoutTemplate },
                    { id: "documents" as MasterMode, label: "Easy Read & Documents", icon: BookOpen },
                    { id: "talker" as MasterMode, label: "Live Talker & Focus", icon: Zap },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const active = currentMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleModeSwitch(mode.id)}
                        className={`flex items-center gap-2 border-b-2 py-3 text-xs sm:text-sm font-extrabold transition ${
                          active
                            ? lowArousalMode
                              ? "border-emerald-400 text-emerald-300"
                              : "border-[#D45A1A] text-[#D45A1A]"
                            : lowArousalMode
                              ? "border-transparent text-slate-400 hover:text-white"
                              : "border-transparent text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 py-2 text-xs font-bold">
                  <Link
                    to="/kiosk"
                    className={lowArousalMode ? "rounded-lg border border-slate-700 px-2.5 py-1 text-emerald-300 hover:bg-slate-800" : "rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-slate-700 hover:bg-slate-100"}
                  >
                    Full Kiosk Talker ↗
                  </Link>
                  <Link
                    to="/"
                    className={lowArousalMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}
                  >
                    ← Platform Home
                  </Link>
                </div>
              </div>

              {/* Contextual Sub-Navigation Bar */}
              <div className={lowArousalMode ? "border-t border-slate-800 bg-slate-950/60" : "border-t border-slate-100 bg-slate-50/90"}>
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1.5 px-6 py-2">
                  {subTabsByMode[currentMode].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          isActive
                            ? lowArousalMode
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-900 text-white shadow-2xs"
                            : lowArousalMode
                              ? "text-slate-300 hover:bg-slate-800"
                              : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </header>

      {/* Calm Clinical Launchpad */}
      <section className={`no-print border-b border-slate-200 ${lowArousalMode ? 'bg-slate-100' : 'bg-[#f4f5f7]'}`}>
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Person-Centred Visual Support • CQC Reg 9 &amp; Accessible Information Standard
              </p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Clinical Visual Communication Workspace
              </h1>
            </div>

            {/* Toggle Quick Launch Cards */}
            <button
              type="button"
              onClick={() => setShowLaunchpad((v) => !v)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              {showLaunchpad ? 'Hide Quick Launch' : 'Show Quick Launch'}
            </button>

            {/* Optional A4 / Pocket Print Stamp (Local-only, never uploaded) */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">Support Profile:</span>
              <select
                value={selectedProfileId}
                onChange={(e) => handleSelectSupportProfile(e.target.value)}
                aria-label="Select resident support profile"
                className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-extrabold text-slate-800 focus:border-slate-500 focus:bg-white focus:outline-none"
              >
                {[...DEFAULT_SUPPORT_PROFILES, ...customProfiles].map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}{p.ageBand ? ` (${p.ageBand})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowProfileCreator((v) => !v)}
                className="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-800 hover:bg-slate-200"
              >
                {showProfileCreator ? 'Close' : '+ Resident DNA'}
              </button>
              <span className="text-[11px] font-bold text-slate-500">Print Stamp:</span>
              <input
                type="text"
                maxLength={12}
                value={careInitials}
                onChange={(e) => setCareInitials(e.target.value)}
                placeholder="Initials (e.g. A.B.)"
                aria-label="Service user initials for printout"
                className="w-28 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
              <input
                type="text"
                maxLength={48}
                value={careReviewNote}
                onChange={(e) => setCareReviewNote(e.target.value)}
                placeholder="Support profile / review note"
                aria-label="Care plan print note"
                className="w-48 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {activePassport && (
            <div className="mt-3">
              <AISReviewBanner
                passport={activePassport}
                onLogReview={handleLogPassportReview}
                onExportCqc={handleExportAllCqcEvidence}
              />
            </div>
          )}

          {/* 6 Outcome-Focused Quick Launch Cards for SALTs, LD Nurses & Support Staff */}

          {showProfileCreator && (
            <div className="mt-3 rounded-xl border border-slate-300 bg-white p-3.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-xs font-extrabold text-slate-900">
                  Save Local Resident DNA Profile (Stored 100% on Device)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Calibrates age band (5–70), support demand &amp; Low-Arousal defaults
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
                <input
                  type="text"
                  value={newProfileLabel}
                  onChange={(e) => setNewProfileLabel(e.target.value)}
                  placeholder="Profile Name (e.g. Curtis • Quiet Routine)"
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800 lg:col-span-2"
                />
                <input
                  type="text"
                  maxLength={6}
                  value={newProfileInitials}
                  onChange={(e) => setNewProfileInitials(e.target.value)}
                  placeholder="Initials (e.g. C.M.)"
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                />
                <select
                  value={newProfileAge}
                  onChange={(e) => setNewProfileAge(e.target.value as AgeBand)}
                  aria-label="Resident age band"
                  className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="5-11">Age 5–11 (Child)</option>
                  <option value="12-17">Age 12–17 (Youth)</option>
                  <option value="18-59">Age 18–59 (Adult)</option>
                  <option value="60-70+">Age 60–70+ (Older Adult)</option>
                </select>
                <select
                  value={newProfileLevel}
                  onChange={(e) => setNewProfileLevel(e.target.value as SupportLevel)}
                  aria-label="Support complexity level"
                  className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="high_nonverbal">High • Non-Verbal 2-Card</option>
                  <option value="moderate_step">Moderate • Step-by-Step</option>
                  <option value="low_choice">Low • Independent Choice</option>
                </select>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newProfileLowArousal}
                      onChange={(e) => setNewProfileLowArousal(e.target.checked)}
                    />
                    Low-Arousal
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newProfileLabel.trim()) return;
                      const created: SupportProfileDNA = {
                        id: `resident_${Date.now()}`,
                        label: newProfileLabel.trim(),
                        initials: newProfileInitials.trim(),
                        ageBand: newProfileAge,
                        supportLevel: newProfileLevel,
                        defaultLowArousal: newProfileLowArousal,
                        defaultPackId:
                          newProfileLevel === 'high_nonverbal'
                            ? 'pack_everyday_living'
                            : newProfileLevel === 'moderate_step'
                              ? 'pack_pantry_to_pot'
                              : 'pack_morning_autonomy',
                        reviewNote:
                          newProfileNote.trim() ||
                          `Age ${newProfileAge} • ${newProfileLevel === 'high_nonverbal' ? '2-Card Now/Next' : newProfileLevel === 'moderate_step' ? 'Step Routine' : 'Autonomy Choice'}`,
                        isCustom: true,
                      };
                      const next = [...customProfiles, created];
                      setCustomProfiles(next);
                      localStorage.setItem('spark_custom_resident_profiles', JSON.stringify(next));
                      handleSelectSupportProfile(created.id);
                      setNewProfileLabel('');
                      setNewProfileInitials('');
                      setNewProfileNote('');
                      setShowProfileCreator(false);
                    }}
                    className="ml-auto rounded-lg bg-[#E36C2B] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#c85a1e]"
                  >
                    Save Profile
                  </button>
                </div>
              </div>
              {customProfiles.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
                  <span className="text-[11px] font-bold text-slate-500">Saved Residents:</span>
                  {customProfiles.map((cp) => (
                    <span
                      key={cp.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-700"
                    >
                      {cp.label} ({cp.ageBand})
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = customProfiles.filter((item) => item.id !== cp.id);
                          setCustomProfiles(filtered);
                          localStorage.setItem('spark_custom_resident_profiles', JSON.stringify(filtered));
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Remove saved profile"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {showLaunchpad && (
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Immediate Calm & De-escalation',
                desc: 'Low-demand pause, ear defenders, quiet space & core anchor prompts.',
                badge: 'PBS & Sensory',
                onClick: () => {
                  const tpl = RESOURCE_TEMPLATES.find((t) => t.id === 'flashcards');
                  if (tpl) applyTemplate(tpl);
                  setActiveTab('anchors');
                },
              },
              {
                title: 'Now / Next / Then Strip',
                desc: 'Three-step transition strip to reduce anxiety during daily changes.',
                badge: 'Transitions',
                onClick: () => {
                  const tpl = RESOURCE_TEMPLATES.find((t) => t.id === 'now_next_then');
                  if (tpl) applyTemplate(tpl);
                  setActiveTab('templates');
                },
              },
              {
                title: 'Choice & Request Board',
                desc: 'Dignified everyday options supporting autonomy and clear consent.',
                badge: 'Communication',
                onClick: () => setActiveTab('wants'),
              },
              {
                title: 'Community & Outing Schedules',
                desc: 'Step-by-step routines for shops, walks, appointments & group sessions.',
                badge: 'Outings',
                onClick: () => setActiveTab('community'),
              },
              {
                title: 'Social Stories & Easy Read',
                desc: 'Multi-page predictable explanations built for adult care & autism support.',
                badge: 'SALT & Comprehension',
                onClick: () => setActiveTab('stories'),
              },
              {
                title: 'Studio Canvas',
                desc: 'Per-cell display modes, independent captions, Fitzgerald borders & offline OpenDyslexic.',
                badge: 'Widgit Studio',
                onClick: () => setActiveTab('studio'),
              },
              {
                title: 'Real Resident Photos & Media',
                desc: 'Pair familiar local photos of staff, rooms & items with Mulberry symbols.',
                badge: 'Local-First Private',
                onClick: () => setActiveTab('media'),
              },
            ].map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={card.onClick}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-2xs transition hover:border-slate-400 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-slate-900 group-hover:text-[#D45A1A]">
                    {card.title}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {card.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{card.desc}</p>
              </button>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Main Resource Studio */}
      <main className="no-print mx-auto max-w-6xl px-6 py-6">
        {searchQuery.trim() && (
          <section className="mx-auto my-4 max-w-6xl rounded-xl border-2 border-[#E36C2B] bg-white p-4 px-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Quick Symbol Search Results for “{searchQuery.trim()}”
                </h2>
                <p className="text-xs text-slate-600">
                  {isSearchingSymbols
                    ? 'Searching local Mulberry library & commercial-safe symbols...'
                    : `Showing ${liveSearchResults.length} commercial-safe symbol(s) — click any tile to add straight to your active grid.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setHeroSearchQuery('');
                }}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Clear Search
              </button>
            </div>
            {liveSearchResults.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {liveSearchResults.slice(0, 18).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCustomBoard((prev) => [
                        ...prev,
                        {
                          id: `${item.id}_${Date.now()}`,
                          title: item.label,
                          actionText: item.label,
                          keywords: [item.label.toLowerCase()],
                          imageSrc: item.imagePath,
                        },
                      ]);
                      if (item.source !== 'mulberry') {
                        void persistRemoteSymbolOffline(item);
                      }
                      appendSymbolToStrip(item.label, item.imagePath);
                      setActiveTab('templates');
                    }}
                    className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-3 text-center transition hover:border-[#E36C2B] hover:bg-orange-50/40"
                  >
                    <img
                      src={item.imagePath}
                      alt={item.label}
                      className="h-12 w-12 object-contain"
                    />
                    <span className="mt-2 line-clamp-1 text-xs font-extrabold text-slate-900">
                      {item.label}
                    </span>
                    <span className="mt-1 rounded bg-white px-2 py-0.5 text-[10px] font-bold text-[#D45A1A] ring-1 ring-slate-200">
                      + Add ({item.source === 'mulberry' ? 'Mulberry' : (item.source as string) === 'openmoji' ? 'OpenMoji' : 'Safe Web'})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
        {activeTab === 'stories' && (
          <SocialStoriesTab
            stories={socialStories}
            selectedStoryId={selectedStoryId}
            onSelectStory={setSelectedStoryId}
            onResetStories={handleResetStories}
            onAddStoryToGrid={handleAddStoryToGrid}
            onCreateCustomStory={handleCreateCustomStory}
            onUpdateStory={handleUpdateStory}
          />
        )}
        {activeTab === 'packs' && (
          <SupportPacksPanel
            packs={SUPPORT_PACKS}
            symbols={symbols}
            onLoadSupportPack={loadSupportPack}
            renderTileVisual={(params) => <SymbolTileVisual {...params} />}
          />
        )}
        {activeTab === 'templates' && (
          <CustomBoardWorkspace
            customBoard={customBoard}
            setCustomBoard={setCustomBoard}
            setActiveTab={setActiveTab}
            sequenceMode={sequenceMode}
            setSequenceMode={setSequenceMode}
            boardTitle={boardTitle}
            setBoardTitle={setBoardTitle}
            removeBoardTile={removeBoardTile}
            addTileToBoard={addTileToBoard}
            symbolSearch={symbolSearch}
            setSymbolSearch={setSymbolSearch}
            setTopSearch={setTopSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            symbolError={symbolError}
            loadingSymbols={loadingSymbols}
            symbols={symbols}
            filteredSymbols={filteredSymbols}
            categories={categories}
            selectedTemplateId={selectedTemplateId}
            activeTemplate={activeTemplate}
            getSlotBadgeLabel={getSlotBadgeLabel}
            handleTemplatePillAction={handleTemplatePillAction}
            sentenceStripItems={sentenceStripItems}
            setSentenceStripItems={setSentenceStripItems}
            renderTileVisual={(params) => <SymbolTileVisual {...params} />}
            renderCloseIcon={() => <X />}
            renderHeaderIcon={() => <ListOrdered className="text-[#E36C2B]" />}
            renderSearchIcon={() => <Search className="pointer-events-none absolute top-2.5 left-3 text-slate-400" />}
          />
        )}
        {activeTab === 'wants' && (
          <ChoiceBoardTab
            items={WANTS_BOARD_ITEMS}
            onAddToGrid={(item) => {
              addTileToBoard(item);
              setActiveTab('templates');
            }}
            renderTileVisual={(params) => <SymbolTileVisual {...params} />}
          />
        )}
        {activeTab === 'community' && (
          <RoutinePresetsPanel
            presets={Object.entries(COMMUNITY_PRESETS).map(([key, preset]) => ({ ...preset, key }))}
            selectedPresetKey={selectedPresetKey}
            onSelectPreset={setSelectedPresetKey}
            activePreset={activePreset}
            onLoadPresetToStrip={setSentenceStripItems}
            onAppendSymbolToStrip={appendSymbolToStrip}
            renderTileVisual={(params) => <SymbolTileVisual {...params} />}
          />
        )}
        {activeTab === 'anchors' && (
          <CoreCardsTab
            anchorCardIds={ANCHOR_CARD_IDS}
            onAddToGrid={(card) => {
              addTileToBoard(card);
              setActiveTab('templates');
            }}
            renderTileVisual={(params) => <SymbolTileVisual {...params} />}
          />
        )}
        {activeTab === 'focus' && (
          <FocusModeTab
            presets={Object.entries(COMMUNITY_PRESETS).map(([key, preset]) => ({ key, preset }))}
            selectedPresetKey={selectedPresetKey}
            onSelectPreset={setSelectedPresetKey}
            activePreset={activePreset}
            steps={focusSteps}
          />
        )}
        {activeTab === 'studio' && (
          <StudioCanvasWorkspace
            symbols={symbols}
            activePassport={activePassport}
            careInitials={careInitials}
            careReviewNote={careReviewNote}
          />
        )}

        {activeTab === 'easyread' && (
          <EasyReadWriterPanel
            symbols={symbols}
            careInitials={careInitials}
            careReviewNote={careReviewNote}
          />
        )}

        {activeTab === 'media' && (
          <MediaLibraryPanel
            photos={photos}
            photoLabel={photoLabel}
            setPhotoLabel={setPhotoLabel}
            photoContext={photoContext}
            setPhotoContext={setPhotoContext}
            savingPhoto={savingPhoto}
            handlePhotoUpload={handlePhotoUpload}
            handleDeletePhoto={handleDeletePhoto}
            addTileToBoard={addTileToBoard}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
      <section aria-label="Printable symbol cards" className="print-container">
        <div className="print-header">
          <h1>
            {(activeTab === 'templates' || activeTab === 'packs') && customBoard.length > 0
              ? boardTitle
              : activeTab === 'stories'
                ? activeStory?.title || 'Social Stories'
                : activeTab === 'anchors'
                  ? 'Core Anchor Cards'
                  : activeTab === 'wants'
                    ? 'Choice Board'
                    : activeTab === "templates" && sentenceStripItems.length > 0
                      ? "Communication Sentence Strip"
                      : activePreset.name}
          </h1>
          <p>
            {printFormat === 'pocket' ? 'Pocket Symbol Cards' : 'A4 Symbol Support Sheet'}
            {careInitials.trim() ? ` • Prepared for: ${careInitials.trim()}` : ''}
            {careReviewNote.trim() ? ` • ${careReviewNote.trim()}` : ''}
            {` • ${new Date().toLocaleDateString('en-GB')}`}
          </p>
        </div>
        <div
          className={
            printFormat === 'pocket' ? 'print-grid pocket' : 'print-grid'
          }
        >
          {(sequenceMode === 'now_next'
            ? cardsForPrint.slice(0, 2)
            : sequenceMode === 'now_next_then'
              ? cardsForPrint.slice(0, 3)
              : cardsForPrint
          ).map((card, idx) => {
            const seqBadge =
              sequenceMode === 'now_next'
                ? idx === 0
                  ? 'NOW'
                  : 'NEXT'
                : sequenceMode === 'now_next_then'
                  ? idx === 0
                    ? 'NOW'
                    : idx === 1
                      ? 'NEXT'
                      : 'THEN'
                  : null;
            return (
              <div key={`print_${card.id}`} className="print-card">
                {seqBadge && (
                  <div className="mb-1.5 text-[11px] font-black tracking-wider text-slate-900 uppercase">
                    {seqBadge}
                  </div>
                )}
                <div className="mb-3 flex h-32 w-32 items-center justify-center">
                  <SymbolTileVisual
                    src={card.imageSrc}
                    alt={card.title}
                    label={card.title}
                    coreCardId={card.coreCardId}
                    sizeClass="h-32 w-32"
                  />
                </div>
                <h3>{card.title}</h3>
                {!seqBadge && card.subtitle && !/^STEP\s+\d+$/i.test(card.subtitle.trim()) && sequenceMode !== 'now_next' && sequenceMode !== 'now_next_then' && (
                  <p>{card.subtitle}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <ParkItPocket />
      <OfflineStatusPanel />
    </div>
  );
}
export default StudioWorkspace;