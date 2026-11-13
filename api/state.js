import { readState, getStorageErrorMessage } from "./_lib/store.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=5, stale-while-revalidate=5");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Method tidak diizinkan." });
  }

  try {
    const state = await readState();
    return res.status(200).json({ ok: true, ...state });
  } catch (error) {
    const status = error?.code === "STORAGE_NOT_CONFIGURED" ? 503 : 502;
    return res.status(status).json({ ok: false, message: getStorageErrorMessage(error) });
  }
}
