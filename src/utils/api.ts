const API_BASE = 'https://api.modrinth.com/v2';
const HEADERS: Record<string, string> = {};

async function request<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
  });
  const res = await fetch(url.toString(), { headers: HEADERS });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json() as Promise<T>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const API = {
  getProject: (id: string) => request<any>(`/project/${id}`),
  searchMods: (query: string, facets: string[][], offset: number, limit: number, index: string) =>
    request<any>('/search', { query, facets, offset, limit, index }),
  getProjects: (ids: string[]) => request<any[]>('/projects', { ids }),
  getVersions: (id: string, loader?: string, version?: string) => {
    const loaders = loader ? [loader] : undefined;
    const game_versions = version ? [version] : undefined;
    return request<any[]>(`/project/${id}/version`, { loaders, game_versions });
  },
  getVersionFile: (hash: string) =>
    fetch(`${API_BASE}/version_file/${hash}?algorithm=sha1`, { headers: HEADERS }).then(r => {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`API Error: ${r.status}`);
      return r.json();
    }),
  getGameVersions: () => request<any[]>('/tag/game_version'),
  getCategories: () => request<any[]>('/tag/category'),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const API_BASE_URL = API_BASE;
