import React, { createContext, useContext, useState } from 'react';

export const Persona = {
  NEUTRAL: 'neutral',
  GIRL: 'girl',
  BOY: 'boy',
  WOMAN: 'woman',
  MAN: 'man',
  OLDER_WOMAN: 'older_woman',
  OLDER_MAN: 'older_man',
} as const;

export type Persona =
  | 'neutral'
  | 'girl'
  | 'boy'
  | 'woman'
  | 'man'
  | 'older_woman'
  | 'older_man';

const PERSONA_VARIANTS: Record<string, Partial<Record<Persona, string>>> = {
  i_me: {
    girl: 'i_me_girl',
    boy: 'i_me_boy',
    woman: 'i_me_woman',
    older_woman: 'i_me_older_woman',
    older_man: 'i_me_older_man',
  },
  calm: {
    woman: 'calm_woman',
    girl: 'calm_woman',
    older_woman: 'calm_older_woman',
  },
  listen: {
    woman: 'listen_woman',
    girl: 'listen_woman',
    older_woman: 'listen_woman',
  },
  ask: {
    woman: 'ask_woman',
    girl: 'ask_woman',
    older_woman: 'ask_woman',
  },
  doctor: {
    woman: 'doctor_woman',
    girl: 'doctor_woman',
    older_woman: 'doctor_woman',
  },
};

export function applyPersonaToSymbolId(baseSymbolId: string, persona: Persona): string {
  if (persona === 'neutral') return baseSymbolId;
  return PERSONA_VARIANTS[baseSymbolId]?.[persona] ?? baseSymbolId;
}

interface PersonaContextType {
  activePersona: Persona;
  setPersona: (persona: Persona) => void;
  resolvePersonaSymbol: (baseSymbolId: string) => string;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const PersonaProvider = ({ children }: { children: React.ReactNode }) => {
  const [activePersona, setPersona] = useState<Persona>('neutral');

  const resolvePersonaSymbol = (baseSymbolId: string) =>
    applyPersonaToSymbolId(baseSymbolId, activePersona);

  return (
    <PersonaContext.Provider value={{ activePersona, setPersona, resolvePersonaSymbol }}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (!context) throw new Error('usePersona must be used within PersonaProvider');
  return context;
};
