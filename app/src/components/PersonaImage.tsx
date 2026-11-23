import React from 'react';
import { usePersona } from '../context/PersonaContext';

type PersonaImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export const PersonaImage: React.FC<PersonaImageProps> = ({ src, onError, ...rest }) => {
  const { resolvePersonaSymbol } = usePersona();

  let resolvedSrc = src;
  if (typeof src === 'string') {
    const match = src.match(/^\/symbols\/spark-core\/([^/]+)\.svg$/);
    if (match) {
      resolvedSrc = `/symbols/spark-core/${resolvePersonaSymbol(match[1])}.svg`;
    }
  }

  return (
    <img
      {...rest}
      src={resolvedSrc}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/symbols/spark-core/help.svg';
        e.currentTarget.style.opacity = '0.55';
        if (onError) onError(e);
      }}
    />
  );
};
