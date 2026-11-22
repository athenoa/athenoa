// Resolves Course.image (a file name without extension) to the photo in src/assets/media.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../../assets/media/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

export function courseImage(name: string): ImageMetadata {
  const hit = Object.entries(files).find(([path]) => path.split('/').pop()!.replace(/\.\w+$/, '') === name);
  if (!hit) throw new Error(`Course image "${name}" not found in src/assets/media`);
  return hit[1].default;
}

// Every course card shows its photo in the same frame, so a photo is cropped to fit. This is the point
// of each one that must stay in view (CSS object-position); a photo not listed is centred.
const focus: Record<string, string> = {
  'reading-by-the-sea': '45% 50%',
};

export const courseFocus = (name: string): string | undefined => focus[name];

// A picture that is a lettered banner, much wider than the card's frame. The card shows it whole
// instead of cropping through its words. None at present: the course banners of the live site,
// when they are added, may belong here.
const banners = new Set<string>([]);
export const courseBanner = (name: string): boolean => banners.has(name);
