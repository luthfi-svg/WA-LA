const DEFAULT_STATE = Object.freeze({
  mode: "random",
  updatedAt: null,
  updatedBy: "default"
});

const GITHUB_API = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";
const DEFAULT_GIST_FILENAME = "wala-meron-state.json";

function gistConfig() {
  // The aliases make it easier to reuse naming conventions from an older project.
  const token = process.env.GITHUB_TOKEN
    || process.env.GITHUB_GIST_TOKEN
    || process.env.GIST_TOKEN;
  const gistId = process.env.GITHUB_GIST_ID || process.env.GIST_ID;
  const filename = process.env.GITHUB_GIST_FILENAME || DEFAULT_GIST_FILENAME;

  if (!token || !gistId) {
    const error = new Error(
      "Penyimpanan belum dikonfigurasi. Tambahkan GITHUB_TOKEN dan GITHUB_GIST_ID di Vercel."
    );
    error.code = "STORAGE_NOT_CONFIGURED";
    throw error;
  }

  return { token, gistId, filename };
}

function gistHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    "Content-Type": "application/json",
    "User-Agent": "wala-meron-arena"
  };
}

async function gistRequest(method, url, token, body) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: gistHeaders(token),
      cache: "no-store",
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke GitHub Gist. Periksa koneksi server Vercel.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // GitHub should return JSON. Keep a controlled error if it does not.
  }

  if (!response.ok) {
    const status = response.status;
    const error = new Error(
      status === 401 || status === 403
        ? "Akses GitHub Gist ditolak. Periksa token dan izin Gists (write)."
        : status === 404
          ? "GitHub Gist tidak ditemukan atau token tidak memiliki akses ke Gist tersebut."
          : payload?.message || `GitHub Gist gagal merespons (HTTP ${status}).`
    );
    error.status = status;
    throw error;
  }

  return payload;
}

function parseState(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Isi file Gist bukan JSON yang valid. Periksa file wala-meron-state.json.");
  }

  if (!parsed || !["wala", "meron", "random"].includes(parsed.mode)) {
    throw new Error("Mode dalam file Gist tidak valid. Gunakan wala, meron, atau random.");
  }

  return {
    ...DEFAULT_STATE,
    mode: parsed.mode,
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    updatedBy: typeof parsed.updatedBy === "string" ? parsed.updatedBy : "github-gist"
  };
}

export async function readState() {
  const { token, gistId, filename } = gistConfig();
  const gist = await gistRequest(
    "GET",
    `${GITHUB_API}/gists/${encodeURIComponent(gistId)}`,
    token
  );

  const file = gist?.files?.[filename];
  // The first read can safely use defaults before an admin sets the first mode.
  if (!file) return { ...DEFAULT_STATE };
  if (file.truncated) {
    throw new Error(`File ${filename} di Gist terlalu besar untuk dibaca melalui API.`);
  }
  if (typeof file.content !== "string") {
    throw new Error(`Konten file ${filename} tidak tersedia di GitHub Gist.`);
  }

  return parseState(file.content);
}

export async function writeMode(mode, updatedBy = "telegram") {
  if (!["wala", "meron", "random"].includes(mode)) {
    throw new Error("Mode pemenang tidak valid.");
  }

  const { token, gistId, filename } = gistConfig();
  const nextState = {
    mode,
    updatedAt: new Date().toISOString(),
    updatedBy
  };

  await gistRequest(
    "PATCH",
    `${GITHUB_API}/gists/${encodeURIComponent(gistId)}`,
    token,
    {
      files: {
        [filename]: {
          content: `${JSON.stringify(nextState, null, 2)}\n`
        }
      }
    }
  );

  return nextState;
}

export function getStorageErrorMessage(error) {
  if (error?.code === "STORAGE_NOT_CONFIGURED") return error.message;
  return error?.message || "Tidak dapat membaca GitHub Gist. Periksa GITHUB_TOKEN, GITHUB_GIST_ID, dan izin token.";
}
