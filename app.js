const COLORS = [
  { id: "ruby", name: "RUBY", label: "Merah", hex: "#ed5d4d", light: "#ff9a83", deep: "#8f303b", beak: "#ffc05c" },
  { id: "sapphire", name: "SAPPHIRE", label: "Biru", hex: "#4f91ed", light: "#9bc4ff", deep: "#244b91", beak: "#ffd06a" },
  { id: "emerald", name: "EMERALD", label: "Hijau", hex: "#36b887", light: "#83e0bb", deep: "#17634e", beak: "#f4c75e" },
  { id: "sun", name: "SUN", label: "Kuning", hex: "#e9b83f", light: "#ffe28a", deep: "#88601c", beak: "#ff8e4f" },
  { id: "violet", name: "VIOLET", label: "Ungu", hex: "#9a70e8", light: "#c8afff", deep: "#51328c", beak: "#f2bd69" }
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
  <svg viewBox="0 0 320 270" role="img" aria-label="Ayam petarung kartun warna ${color.label}">
    <ellipse cx="150" cy="247" rx="88" ry="11" fill="rgba(0,0,0,.32)" />
    <g stroke="#101522" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <!-- Tail feathers -->
      <path d="M94 175 C50 174 23 148 21 111 C45 111 69 126 88 145 C70 111 78 77 100 56 C122 80 128 111 116 143 C140 116 168 116 184 137 C169 164 137 180 106 184Z" fill="var(--bird-deep)" />
      <path d="M38 119 C56 124 73 139 87 154 M96 75 C111 97 115 119 110 139 M151 128 C138 147 122 157 104 164" fill="none" stroke="var(--bird-light)" stroke-width="5" />
      <!-- Legs and hooked claws -->
      <path d="M116 212 L111 239 M177 214 L184 239" fill="none" stroke="#c58a3d" stroke-width="10" />
      <path d="M96 241 L118 241 L128 233 M105 241 L93 250 L78 250 M174 241 L196 241 L207 232 M184 241 L178 252 L162 252" fill="none" stroke="#e7aa52" stroke-width="7" />
      <path d="M118 225 L104 218 L111 236 M184 225 L199 216 L191 237" fill="#e7aa52" />
      <!-- Powerful body -->
      <path d="M70 204 C52 180 58 144 83 119 C111 91 163 88 201 113 C235 136 242 176 217 207 C193 238 139 246 99 227 C86 221 77 213 70 204Z" fill="var(--bird)" />
      <!-- Breast feathers -->
      <path d="M158 145 C184 127 216 143 225 173 C234 204 213 228 184 232 C160 233 144 214 143 190Z" fill="var(--bird-deep)" />
      <path d="M163 164 L187 184 L211 176 M157 185 L181 204 L205 198 M157 205 L178 219" fill="none" stroke="var(--bird-light)" stroke-width="5" />
      <!-- Wing armor -->
      <path d="M91 164 C109 130 154 118 189 138 C211 151 215 179 194 197 C169 218 126 212 101 192 C88 182 85 173 91 164Z" fill="var(--bird-light)" />
      <path d="M106 166 C130 145 157 145 180 160 M111 181 C135 166 159 169 178 183 M124 197 C144 187 160 191 170 201" fill="none" stroke="var(--bird-deep)" stroke-width="6" />
      <!-- Neck hackles -->
      <path d="M157 142 L170 157 L184 145 L193 163 L208 151 L215 174 L228 168 L226 192 L210 210 L185 202 L164 182Z" fill="var(--bird)" />
      <!-- Head -->
      <path d="M164 126 C160 98 179 66 208 59 C235 52 256 72 252 101 C249 127 226 145 195 145 L175 140Z" fill="var(--bird)" />
      <path d="M178 116 C191 92 215 80 240 87 C234 111 214 129 188 132Z" fill="var(--bird-light)" stroke="none" />
      <!-- Fierce serrated comb -->
      <path d="M174 83 L171 56 L190 65 L198 35 L213 57 L231 31 L238 63 L257 57 L250 87 C227 99 195 100 174 83Z" fill="#e84845" />
      <path d="M185 59 L194 70 M211 51 L216 68 M239 52 L239 68" fill="none" stroke="#ff9b82" stroke-width="4" />
      <!-- Brow and narrowed eye -->
      <path d="M205 91 C220 79 239 83 246 96 C233 91 222 97 211 105Z" fill="#141a28" stroke="none" />
      <path d="M213 99 C224 91 237 94 240 102 C232 111 219 111 213 99Z" fill="#fff4d9" stroke="none" />
      <circle cx="231" cy="101" r="5.5" fill="#dc3f39" stroke="none" />
      <circle cx="233" cy="100" r="2.4" fill="#111522" stroke="none" />
      <path d="M205 90 L244 82" fill="none" stroke="#101522" stroke-width="8" />
      <!-- Open hooked beak -->
      <path d="M246 108 L294 118 L254 145 L235 132Z" fill="var(--beak)" />
      <path d="M244 127 L280 137 L253 158 L238 143Z" fill="#d94e3f" />
      <path d="M248 119 L278 121" fill="none" stroke="#fff0b4" stroke-width="4" />
      <!-- Wattle -->
      <path d="M217 139 C226 135 236 144 231 156 C226 169 211 166 211 153Z" fill="#d94e55" />
      <path d="M228 148 L231 161" fill="none" stroke="#ff9a85" stroke-width="3" />
      <!-- Shoulder spikes -->
      <path d="M153 145 L144 128 L165 137 M171 153 L169 133 L188 146" fill="var(--bird-light)" />
    </g>
    <path d="M81 202 C99 216 124 223 143 222" fill="none" stroke="rgba(255,255,255,.38)" stroke-width="4" stroke-linecap="round" />
  </svg>`;

function getColor(id) {
  return COLORS.find((item) => item.id === id) || COLORS[0];
}

function renderChicken(side) {
  const color = getColor(state[`${side}Color`]);
  $(`${side}-art`).innerHTML = chickenSvg(color);
  $(`${side}-art`).style.setProperty("--bird", color.hex);
  $(`${side}-art`).style.setProperty("--bird-light", color.light);
  $(`${side}-art`).style.setProperty("--bird-deep", color.deep);
  $(`${side}-art`).style.setProperty("--beak", color.beak);
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
    const response = await fetch("/api/state");
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
  $("arena").classList.remove("winner-wala", "winner-meron", "is-fighting");
  $("arena-caption").textContent = "PREPARING THE SHOWDOWN";
  $("round-label").innerHTML = `ROUND ${String(state.round).padStart(3, "0")} <i>•</i> GETTING READY`;

  try {
    const response = await fetch("/api/fight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "Pertandingan gagal dimulai.");

    $("fight-button-text").textContent = "PERTARUNGAN BERLANGSUNG...";
    $("arena").classList.add("is-fighting");
    $("arena-caption").textContent = "FIGHT IN PROGRESS";
    $("round-label").innerHTML = `ROUND ${String(state.round).padStart(3, "0")} <i>•</i> IN PROGRESS`;
    await sleep(3200);
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
}, 15000);
