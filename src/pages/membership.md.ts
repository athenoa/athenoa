// /membership.md (Greek) and /en/membership.md: the Markdown twin of the membership page.
import type { APIRoute } from 'astro';
import { getLocale } from '../lib/locale';
import { textPages } from '../lib/markdown';

export const GET: APIRoute = ({ url }) => textPages(getLocale(url)).membership();
