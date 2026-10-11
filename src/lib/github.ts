import { GitHubConfig } from '../types/policy';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  default_branch: string;
  private: boolean;
  html_url: string;
  description: string | null;
}

export interface PushResult {
  success: boolean;
  commitSha?: string;
  htmlUrl?: string;
  rawUrl?: string;
  error?: string;
}

/**
 * Validates a GitHub Personal Access Token
 */
export async function verifyGitHubToken(token: string): Promise<GitHubUser> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('Token GitHub tidak boleh kosong.');
  }

  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Token GitHub tidak valid atau telah kadaluarsa. Pastikan token memiliki izin `repo`.');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Gagal memverifikasi token GitHub (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Fetch repositories accessible by the token
 */
export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const cleanToken = token.trim();
  const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil daftar repositori: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get existing file SHA if file already exists in repo
 */
async function getFileSha(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | undefined> {
  try {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(branch)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 404) {
      return undefined;
    }

    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }
  } catch {
    // If not found or error, return undefined to create as new
    return undefined;
  }
  return undefined;
}

/**
 * Push file (commit & push) to GitHub Repository
 */
export async function pushFileToGitHub(
  config: GitHubConfig,
  filePath: string,
  content: string,
  commitMessage: string
): Promise<PushResult> {
  try {
    const { token, owner, repo, branch = 'main' } = config;
    if (!token || !owner || !repo || !filePath) {
      return {
        success: false,
        error: 'Konfigurasi GitHub belum lengkap (token, owner, repo, atau path file kosong).'
      };
    }

    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const existingSha = await getFileSha(token, owner, repo, cleanPath, branch);

    // UTF-8 to Base64 safe conversion
    const utf8Bytes = new TextEncoder().encode(content);
    let binary = '';
    for (let i = 0; i < utf8Bytes.byteLength; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Content = btoa(binary);

    const payload: Record<string, any> = {
      message: commitMessage || `Update ${cleanPath} via Term & Privacy Policy Generator`,
      content: base64Content,
      branch: branch || 'main',
    };

    if (existingSha) {
      payload.sha = existingSha;
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorJson.message || `Gagal menyimpan ke GitHub (HTTP ${response.status})`
      };
    }

    const resData = await response.json();
    const commitSha = resData?.commit?.sha || resData?.content?.sha;
    const htmlUrl = resData?.content?.html_url || `https://github.com/${owner}/${repo}/blob/${branch}/${cleanPath}`;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;

    return {
      success: true,
      commitSha,
      htmlUrl,
      rawUrl
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan saat mengunggah ke GitHub'
    };
  }
}
