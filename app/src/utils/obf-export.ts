import type { CoreCardId } from '../data/core-cards';

export interface ObfExportTileInput {
  id: string;
  label: string;
  vocalization?: string;
  imageSrc?: string;
  coreCardId?: CoreCardId;
}

export interface OpenBoardDocument {
  format: 'open-board-0.1';
  id: string;
  locale: 'en-GB';
  name: string;
  description_html: string;
  default_layout: {
    enlarge_to_fit: boolean;
    author_id?: string;
    columns: number;
    rows: number;
    order: (string | null)[][];
  };
  buttons: {
    id: string;
    label: string;
    vocalization?: string;
    image_id?: string;
    action?: string;
  }[];
  images: {
    id: string;
    width: number;
    height: number;
    content_type: string;
    url?: string;
    data_url?: string;
  }[];
  license: {
    type: string;
    copyright_notice_url?: string;
  };
}

function isUsableImageSrc(src?: string): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith('lucide:')) return false;
  return trimmed.startsWith('/') || trimmed.startsWith('data:');
}

export function buildOpenBoardJson(
  title: string,
  description: string,
  tiles: ObfExportTileInput[]
): OpenBoardDocument {
  const safeTiles = tiles.length > 0 ? tiles : [];
  const columns = Math.min(4, Math.max(1, safeTiles.length || 1));
  const rows = Math.max(1, Math.ceil(safeTiles.length / columns));

  const buttons: OpenBoardDocument['buttons'] = [];
  const images: OpenBoardDocument['images'] = [];
  const order: (string | null)[][] = [];

  let cursor = 0;
  for (let r = 0; r < rows; r += 1) {
    const rowIds: (string | null)[] = [];
    for (let c = 0; c < columns; c += 1) {
      const tile = safeTiles[cursor];
      cursor += 1;
      if (!tile) {
        rowIds.push(null);
        continue;
      }

      const buttonId = `btn_${r}_${c}_${tile.id}`;
      rowIds.push(buttonId);

      let imageId: string | undefined;
      if (isUsableImageSrc(tile.imageSrc)) {
        imageId = `img_${r}_${c}_${tile.id}`;
        const isDataUrl = tile.imageSrc.startsWith('data:');
        const isSvg = tile.imageSrc.toLowerCase().endsWith('.svg');
        images.push({
          id: imageId,
          width: 256,
          height: 256,
          content_type: isDataUrl
            ? 'image/jpeg'
            : isSvg
              ? 'image/svg+xml'
              : 'image/png',
          ...(isDataUrl ? { data_url: tile.imageSrc } : { url: tile.imageSrc }),
        });
      }

      buttons.push({
        id: buttonId,
        label: tile.label,
        vocalization: tile.vocalization || tile.label,
        ...(imageId ? { image_id: imageId } : {}),
      });
    }
    order.push(rowIds);
  }

  return {
    format: 'open-board-0.1',
    id: `spark_${Date.now()}`,
    locale: 'en-GB',
    name: title || 'Spark Support Board',
    description_html: `<p>${description}</p>`,
    default_layout: {
      enlarge_to_fit: true,
      columns,
      rows,
      order,
    },
    buttons,
    images,
    license: {
      type: 'CC BY-SA 4.0',
    },
  };
}

export function downloadOpenBoardFile(
  title: string,
  description: string,
  tiles: ObfExportTileInput[]
): void {
  const doc = buildOpenBoardJson(title, description, tiles);
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const slug =
    (title || 'spark-board')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'spark-board';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug}.obf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ParsedOpenBoardResult {
  title: string;
  tiles: ObfExportTileInput[];
}

export async function parseOpenBoardFile(file: File): Promise<ParsedOpenBoardResult> {
  const text = await file.text();
  const data = JSON.parse(text) as {
    name?: string;
    buttons?: {
      id: string;
      label?: string;
      vocalization?: string;
      image_id?: string;
    }[];
    images?: {
      id: string;
      url?: string;
      data_url?: string;
    }[];
  };

  const imageMap = new Map<string, string>();
  for (const img of data.images || []) {
    const candidate = img.data_url || img.url || '';
    if (isUsableImageSrc(candidate)) {
      imageMap.set(img.id, candidate);
    }
  }

  const rawButtons = Array.isArray(data.buttons) ? data.buttons : [];
  const tiles: ObfExportTileInput[] = rawButtons.map((btn, idx) => {
    const label = (btn.label || btn.vocalization || `Item ${idx + 1}`).trim();
    const resolvedSrc = btn.image_id ? imageMap.get(btn.image_id) : undefined;
    return {
      id: btn.id || `obf_btn_${idx}_${Date.now()}`,
      label,
      vocalization: (btn.vocalization || label).trim(),
      imageSrc: resolvedSrc,
    };
  });

  const fallbackTitle = file.name.replace(/.(obf|json)$/i, '').replace(/[-_]+/g, ' ').trim();
  return {
    title: (data.name || fallbackTitle || 'Imported OBF Board').trim(),
    tiles,
  };
}
