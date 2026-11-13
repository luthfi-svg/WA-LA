const COLORS = [
  { id: "ruby", name: "RUBY", label: "Merah", hex: "#ed5d4d", beak: "#ffc05c" },
  { id: "sapphire", name: "SAPPHIRE", label: "Biru", hex: "#4f91ed", beak: "#ffd06a" },
  { id: "emerald", name: "EMERALD", label: "Hijau", hex: "#36b887", beak: "#f4c75e" },
  { id: "sun", name: "SUN", label: "Kuning", hex: "#e9b83f", beak: "#ff8e4f" },
  { id: "violet", name: "VIOLET", label: "Ungu", hex: "#9a70e8", beak: "#f2bd69" }
];

const state = {
  walaColor: "ruby",
  meronColor: "sapphire",
  mode: "random",
  round: 1,
  busy: false,
  online: false,
  hasShownConnectionError: false,
  toastTimer: null
};

const $ = (id) => document.getElementById(id);
const chickenSvg = (color) => `
  <svg viewBox="0 0 260 250" role="img" aria-label="Ayam kartun warna ${color.label}">
    <ellipse cx="128" cy="218" rx="78" ry="10" fill="rgba(0,0,0,.12)" />
    <path d="M64 113 C39 93 32 68 45 55 C60 57 72 73 76 90 C76 63 91 43 107 42 C121 54 119 76 107 91" fill="${color.hex}" stroke="#172033" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M76 164 C57 148 58 116 73 94 C91 68 133 66 161 89 C185 109 190 145 171 170 C151 197 98 199 76 164Z" fill="${color.hex}" stroke="#172033" stroke-width="7" stroke-linejoin="round" />
    <path d="M93 135 C105 115 139 111 159 132 C169 144 162 164 144 170 C123 177 99 164 93 135Z" fill="rgba(255,255,255,.18)" stroke="#172033" stroke-width="5" />
    <path d="M143 90 C146 66 166 49 186 58 C205 67 208 94 194 111 C181 127 154 122 143 107Z" fill="${color.hex}" stroke="#172033" stroke-width="7" />
    <path d="M157 59 C149 44 158 29 170 33 C181 20 195 29 192 43 C207 38 216 52 204 64 C191 75 169 72 157 59Z" fill="#f06455" stroke="#172033" stroke-width="6" stroke-linejoin="round" />
    <path d="M197 85 L224 99 L198 110Z" fill="${color.beak}" stroke="#172033" stroke-width="6" stroke-linejoin="round" />
    <circle cx="184" cy="82" r="5.5" fill="#172033" />
    <circle cx="185.5" cy="80.5" r="1.6" fill="#fff" />
    <path d="M195 116 C212 116 215 132 202 140 C191 145 184 134 190 126Z" fill="#f06455" stroke="#172033" stroke-width="5" />
    <path d="M103 191 L100 212 M148 192 L151 212" stroke="#e9a84c" stroke-width="8" stroke-linecap="round" />
    <path d="M86 214 L111 214 M138 214 L164 214" stroke="#e9a84c" stroke-width="7" stroke-linecap="round" />
    <path d="M88 145 C100 127 124 126 139 142" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="5" stroke-linecap="round" />
    <path d="M59 90 L42 81 M65 77 L53 61" stroke="rgba(255,255,255,.62)" stroke-width="4" stroke-linecap="round" />
  </svg>`;

function getColor(id) {
  return COLORS.find((item) => item.id === id) || COLORS[0];
}

function renderChicken(side) {
  const color = getColor(state[`${side}Color`]);
  $(`${side}-art`).innerHTML = chickenSvg(color);
  $(`${side}-art`).style.setProperty("--bird", color.hex);
  $(`${side}-color-name`).textContent = color.name;
}

function renderSwatches(side) {
  const container = $(`${side}-swatches`);
  container.innerHTML = COLORS.map((color) => `
    <button class="swatch" type="button" data-color="${color.id}" style="--swatch:${color.hex}" aria-pressed="${state[`${side}Color`] === color.id}" aria-label="Pilih ayam ${color.label}">
      <span class="swatch-color"></span><span class="swatch-name">${color.name}</span>
    </button>
  `).join("");

  container.onclick = (event) => {
    const button = event.target.closest("button[data-color]");
    if (!button || state.busy) return;
    state[`${side}Color`] = button.dataset.color;
    renderSwatches(side);
    renderChicken(side);
  };
}

function renderMode(mode) {
  const labels = {
    wala: ["WALA", "WALA menjadi pemenang setiap ronde"],
    meron: ["MERON", "MERON menjadi pemenang setiap ronde"],
    random: ["RANDOM", "Pemenang ditentukan secara acak"]
  };
  const [label, description] = labels[mode] || labels.random;
  $("mode-value").textContent = label;
  $("mode-description").textContent = description;
  state.mode = mode;
}

function setConnection(online, message) {
  state.online = online;
  if (online) state.hasShownConnectionError = false;
  const pill = $("connection-pill");
  pill.classList.toggle("online", online);
  pill.classList.toggle("offline", !online);
  $("connection-text").textContent = message;
  $("fight-button").disabled = !online || state.busy;
  $("fight-button-text").textContent = online ? "MULAI PERTARUNGAN" : "SERVER BELUM SIAP";
}

async function refreshState() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Server belum siap.");
    renderMode(data.mode);
    setConnection(true, "SERVER ONLINE");
  } catch (error) {
    setConnection(false, "SERVER SETUP");
    if (!state.busy && !state.hasShownConnectionError) {
      showToast(error.message || "Tidak dapat terhubung ke server.");
      state.hasShownConnectionError = true;
    }
  }
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function winnerDetails(winner) {
  const side = winner === "wala" ? "WALA" : "MERON";
  const color = getColor(state[`${winner}Color`]);
  return { side, color };
}

async function startFight() {
  if (state.busy) return;
  state.busy = true;
  $("fight-button").disabled = true;
  $("fight-button-text").textContent = "MENYIAPKAN ARENA...";
  $("result-panel").hidden = true;
  $("arena").classList.remove("winner-wala", "winner-meron");
  $("arena").classList.add("is-fighting");
  $("arena-caption").textContent = "FIGHT IN PROGRESS";
  $("round-label").innerHTML = `ROUND ${String(state.round).padStart(3, "0")} <i>•</i> IN PROGRESS`;

  try {
    const response = await fetch("/api/fight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Pertandingan gagal dimulai.");

    $("fight-button-text").textContent = "PERTARUNGAN BERLANGSUNG...";
    await sleep(2500);
    $("arena").classList.remove("is-fighting");
    $("arena").classList.add(`winner-${data.winner}`);
    const { side, color } = winnerDetails(data.winner);
    $("arena-caption").textContent = `${side} TAKLUKKAN ARENA`;
    $("round-label").innerHTML = `ROUND ${String(state.round).padStart(3, "0")} <i>•</i> COMPLETE`;
    $("result-title").textContent = `${side} WINS!`;
    $("result-description").textContent = `Ayam ${color.label.toLowerCase()} dari ${side} menjadi pemenang ronde ini.`;
    $("result-panel").hidden = false;
    $("fight-button-text").textContent = "MULAI PERTARUNGAN";
    state.round += 1;
    $("result-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    $("arena").classList.remove("is-fighting");
    $("arena-caption").textContent = "THE ARENA IS YOURS";
    $("round-label").innerHTML = `ROUND ${String(state.round).padStart(3, "0")} <i>•</i> READY`;
    showToast(error.message || "Terjadi kesalahan saat memulai pertandingan.");
    await refreshState();
  } finally {
    state.busy = false;
    $("fight-button").disabled = !state.online;
  }
}

$("fight-button").addEventListener("click", startFight);
$("again-button").addEventListener("click", () => {
  $("result-panel").hidden = true;
  $("arena").classList.remove("winner-wala", "winner-meron");
  $("arena-caption").textContent = "THE ARENA IS YOURS";
  $("round-label").innerHTML = `ROUND ${String(state.round).padStart(3, "0")} <i>•</i> READY`;
  $("fight-button").scrollIntoView({ behavior: "smooth", block: "center" });
});

renderSwatches("wala");
renderSwatches("meron");
renderChicken("wala");
renderChicken("meron");
refreshState();
setInterval(() => {
  if (!state.busy) refreshState();
}, 10000);
