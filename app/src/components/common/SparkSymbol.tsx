import React, { useEffect, useState } from 'react';

export type SymbolTheme = 'color' | 'high-contrast' | 'mono';

const svgMarkupCache = new Map<string, string>();
const inflightRequests = new Map<string, Promise<string | null>>();

function hashKey(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function sanitiseAndScopeSvg(rawSvg: string, src: string): string {
  let cleaned = rawSvg
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*["'][^"']*["']/gi, '')
    .trim();

  if (!cleaned.toLowerCase().includes('<svg')) return '';

  // Ensure root <svg> scales cleanly inside its container
  cleaned = cleaned.replace(/<svg\b([^>]*)>/i, (_full, attrs: string) => {
    let nextAttrs = attrs
      .replace(/\bwidth\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\bheight\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\bclass\s*=\s*["']([^"']*)["']/gi, 'class="$1 spark-inline-svg"');
    if (!/\bclass\s*=/i.test(nextAttrs)) {
      nextAttrs += ' class="spark-inline-svg"';
    }
    return `<svg${nextAttrs} width="100%" height="100%" aria-hidden="true" focusable="false">`;
  });

  // Scope internal id="..." and url(#...) references so multiple inline SVGs never collide
  const prefix = `sp_${hashKey(src)}_`;
  const foundIds = new Set<string>();
  cleaned.replace(/\bid=["']([^"']+)["']/g, (_m, idVal: string) => {
    foundIds.add(idVal);
    return '';
  });

  for (const idVal of foundIds) {
    const esc = idVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned
      .replace(new RegExp(`\\bid=(["'])${esc}\\1`, 'g'), `id="${prefix}${idVal}"`)
      .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${prefix}${idVal})`)
      .replace(new RegExp(`(xlink:href|href)=(["'])#${esc}\\2`, 'g'), `$1="#${prefix}${idVal}"`);
  }

  // Scope <style> class names inside Mulberry/Illustrator SVGs so styles never leak globally
  if (/<style\b/i.test(cleaned)) {
    const classNames = new Set<string>();
    cleaned.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, cssText: string) => {
      cssText.replace(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g, (_cm, cls: string) => {
        classNames.add(cls);
        return '';
      });
      return '';
    });
    for (const cls of classNames) {
      const esc = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleaned = cleaned.replace(
        new RegExp(`(<style[^>]*>[\\s\\S]*?)\\.${esc}\\b`, 'g'),
        `$1.${prefix}${cls}`
      );
      cleaned = cleaned.replace(
        new RegExp(`\\bclass=(["'])([^"']*\\b)${esc}(\\b[^"']*)\\1`, 'g'),
        `class=$1$2${prefix}${cls}$3$1`
      );
    }
  }

  return cleaned;
}

export function getCachedSparkSvg(src: string): string | null {
  return svgMarkupCache.get(src) || null;
}

async function fetchSvgMarkup(src: string): Promise<string | null> {
  if (svgMarkupCache.has(src)) return svgMarkupCache.get(src) || null;
  if (inflightRequests.has(src)) return inflightRequests.get(src) || null;

  const task = fetch(src)
    .then((res) => (res.ok ? res.text() : null))
    .then((text) => {
      if (!text) return null;
      const scoped = sanitiseAndScopeSvg(text, src);
      if (scoped) svgMarkupCache.set(src, scoped);
      return scoped || null;
    })
    .catch(() => null)
    .finally(() => {
      inflightRequests.delete(src);
    });

  inflightRequests.set(src, task);
  return task;
}

interface SparkSymbolProps {
  src: string;
  alt: string;
  theme?: SymbolTheme;
  className?: string;
}

export const SparkSymbol: React.FC<SparkSymbolProps> = ({
  src,
  alt,
  theme = 'color',
  className = 'h-full w-full',
}) => {
  const isInlineCandidate =
    src.endsWith('.svg') &&
    (src.startsWith('/symbols/spark_') ||
      src.startsWith('/symbols/spark-core/') ||
      src.startsWith('/symbols/healthicons/'));

  const [markup, setMarkup] = useState<string | null>(() =>
    isInlineCandidate ? svgMarkupCache.get(src) || null : null
  );

  useEffect(() => {
    if (!isInlineCandidate) {
      setMarkup(null);
      return;
    }
    const cached = svgMarkupCache.get(src);
    if (cached) {
      setMarkup(cached);
      return;
    }
    let active = true;
    fetchSvgMarkup(src).then((svg) => {
      if (active && svg) setMarkup(svg);
    });
    return () => {
      active = false;
    };
  }, [src, isInlineCandidate]);

  const themeClass = `spark-symbol-host spark-theme-${theme}`;

  if (isInlineCandidate && markup) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`${themeClass} inline-flex items-center justify-center ${className}`}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }

  return (
    <span className={`${themeClass} spark-legacy-img inline-flex items-center justify-center ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-contain" loading="lazy" />
    </span>
  );
};
