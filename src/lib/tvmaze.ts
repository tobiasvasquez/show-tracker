const BASE_URL = "https://api.tvmaze.com";

// --- Types ---

export interface TVMazeShow {
  id: number;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string; // "Running", "Ended", "To Be Determined", "In Development"
  runtime: number | null;
  premiered: string | null;
  ended: string | null;
  officialSite: string | null;
  schedule: { time: string; days: string[] };
  rating: { average: number | null };
  weight: number;
  network: { id: number; name: string; country: { name: string; code: string } } | null;
  webChannel: { id: number; name: string; country: { name: string; code: string } | null } | null;
  image: { medium: string; original: string } | null;
  summary: string | null;
  updated: number;
  _links: { self: { href: string }; previousepisode?: { href: string }; nextepisode?: { href: string } };
}

export interface TVMazeEpisode {
  id: number;
  url: string;
  name: string;
  season: number;
  number: number | null;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number | null;
  rating: { average: number | null };
  image: { medium: string; original: string } | null;
  summary: string | null;
  _links: { self: { href: string }; show?: { href: string } };
}

export interface TVMazeScheduleEntry {
  id: number;
  url: string;
  name: string;
  season: number;
  number: number | null;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number | null;
  rating: { average: number | null };
  image: { medium: string; original: string } | null;
  summary: string | null;
  show: TVMazeShow;
  _embedded?: { show: TVMazeShow };
}

export interface TVMazeSearchResult {
  score: number;
  show: TVMazeShow;
}

// --- API Functions ---

export async function searchShows(query: string): Promise<TVMazeSearchResult[]> {
  const res = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search shows");
  return res.json();
}

export async function getShow(id: number): Promise<TVMazeShow> {
  const res = await fetch(`${BASE_URL}/shows/${id}`);
  if (!res.ok) throw new Error("Failed to fetch show");
  return res.json();
}

export async function getShowEpisodes(id: number): Promise<TVMazeEpisode[]> {
  const res = await fetch(`${BASE_URL}/shows/${id}/episodes`);
  if (!res.ok) throw new Error("Failed to fetch episodes");
  return res.json();
}

export async function getSchedule(countryCode = "US", date?: string): Promise<TVMazeScheduleEntry[]> {
  const params = new URLSearchParams({ country: countryCode });
  if (date) params.set("date", date);
  const res = await fetch(`${BASE_URL}/schedule?${params}`);
  if (!res.ok) throw new Error("Failed to fetch schedule");
  return res.json();
}

export async function getWebSchedule(date?: string, countryCode?: string): Promise<TVMazeScheduleEntry[]> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (countryCode !== undefined) params.set("country", countryCode);
  const res = await fetch(`${BASE_URL}/schedule/web?${params}`);
  if (!res.ok) throw new Error("Failed to fetch web schedule");
  return res.json();
}

export function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export function getShowNetwork(show: TVMazeShow): string {
  return show.network?.name || show.webChannel?.name || "Unknown";
}

export function getShowImage(show: TVMazeShow): string | null {
  return show.image?.medium || show.image?.original || null;
}
