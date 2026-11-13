import { randomInt, randomUUID } from "node:crypto";
import { readState, getStorageErrorMessage } from "./_lib/store.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method tidak diizinkan." });
  }

  try {
    const state = await readState();
    const winner = state.mode === "random"
      ? (randomInt(0, 2) === 0 ? "wala" : "meron")
      : state.mode;

    return res.status(200).json({
      ok: true,
      matchId: randomUUID(),
      mode: state.mode,
      winner,
      decidedAt: new Date().toISOString()
    });
  } catch (error) {
    const status = error?.code === "STORAGE_NOT_CONFIGURED" ? 503 : 502;
    return res.status(status).json({ ok: false, message: getStorageErrorMessage(error) });
  }
}
