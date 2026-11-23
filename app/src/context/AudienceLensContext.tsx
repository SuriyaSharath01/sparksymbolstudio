import React, { createContext, useContext, useState } from 'react';

export type AudienceLens = 'kids' | 'teens' | 'adults' | 'clinical';

export interface AudienceLensMeta {
  id: AudienceLens;
  shortLabel: string;
  label: string;
  tagline: string;
}

export const AUDIENCE_LENSES: AudienceLensMeta[] = [
  {
    id: 'kids',
    shortLabel: 'Kids & Schools',
    label: 'Kids & Early Years (3–11)',
    tagline: 'Primary schools, nurseries, home routines & playful clear cues',
  },
  {
    id: 'teens',
    shortLabel: 'Teens & ADHD',
    label: 'Teens & Independence (12–25)',
    tagline: 'Age-respectful ADHD checklists, sensory exit passes & college life',
  },
  {
    id: 'adults',
    shortLabel: 'Adults & Community',
    label: 'Adults, Work & Community',
    tagline: 'Everyday independent living, buses, cafés, venues & hobbies',
  },
  {
    id: 'clinical',
    shortLabel: 'Health & Care',
    label: 'Health, Care & Older Age',
    tagline: 'GP/hospital visits, epilepsy safety, dementia, IDDSI & NHS AIS',
  },
];

interface AudienceContextType {
  lens: AudienceLens;
  setLens: (lens: AudienceLens) => void;
}

const AudienceContext = createContext<AudienceContextType | undefined>(undefined);

export const AudienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lens, setLensState] = useState<AudienceLens>(() => {
    try {
      const saved = window.localStorage.getItem('spark_audience_lens') as AudienceLens | null;
      if (saved && ['kids', 'teens', 'adults', 'clinical'].includes(saved)) return saved;
    } catch {
      // Ignore storage errors in private browsing modes
    }
    return 'adults';
  });

  const setLens = (newLens: AudienceLens) => {
    setLensState(newLens);
    try {
      window.localStorage.setItem('spark_audience_lens', newLens);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <AudienceContext.Provider value={{ lens, setLens }}>
      {children}
    </AudienceContext.Provider>
  );
};

export const useAudienceLens = (): AudienceContextType => {
  const ctx = useContext(AudienceContext);
  if (!ctx) {
    return { lens: 'adults', setLens: () => {} };
  }
  return ctx;
};
