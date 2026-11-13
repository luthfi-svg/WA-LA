import { writeMode, readState } from "./_lib/store.js";

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function reply(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } catch (error) {
    console.error("Telegram reply failed:", error?.message || error);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = req.headers["x-telegram-bot-api-secret-token"];
  if (!expectedSecret || !safeEqual(receivedSecret, expectedSecret)) {
    return res.status(401).json({ ok: false });
  }

  const message = req.body?.message;
  const chatId = message?.chat?.id;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const text = typeof message?.text === "string" ? message.text.trim() : "";

  if (!chatId || !adminChatId || String(chatId) !== String(adminChatId) || !text) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  const command = text.split(/\s+/)[0].split("@")[0].toLowerCase();

  try {
    if (command === "/wala" || command === "/meron" || command === "/random") {
      const mode = command.slice(1);
      const state = await writeMode(mode, "telegram-admin");
      const names = { wala: "WALA", meron: "MERON", random: "RANDOM" };
      await reply(chatId, `✅ Pengaturan pemenang diperbarui.\nMode: ${names[state.mode]}\n${state.mode === "random" ? "Pemenang akan dipilih secara acak setiap ronde." : `${names[state.mode]} akan menjadi pemenang setiap ronde.`}`);
      return res.status(200).json({ ok: true });
    }

    if (command === "/status") {
      const state = await readState();
      await reply(chatId, `🐔 STATUS WALA VS MERON\nMode: ${state.mode.toUpperCase()}\nDiperbarui: ${state.updatedAt || "Belum pernah"}`);
      return res.status(200).json({ ok: true });
    }

    if (command === "/help" || command === "/start") {
      await reply(chatId, "🐔 PANEL WALA VS MERON\n/wala — atur WALA sebagai pemenang\n/meron — atur MERON sebagai pemenang\n/random — pemenang acak tiap ronde\n/status — lihat mode saat ini");
      return res.status(200).json({ ok: true });
    }

    await reply(chatId, "Perintah tidak dikenali. Gunakan /help untuk melihat daftar perintah.");
    return res.status(200).json({ ok: true, unknownCommand: true });
  } catch (error) {
    console.error("Telegram command failed:", error?.message || error);
    await reply(chatId, "❌ Pengaturan gagal disimpan. Periksa konfigurasi GitHub Gist di Vercel.");
    return res.status(200).json({ ok: false });
  }
}
