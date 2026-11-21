// The Learn page's places, as one file of symbols (src/lib/nostos-scenes.ts).
import { scenesSprite } from '../../lib/nostos-scenes';

export const GET = () => new Response(scenesSprite(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
