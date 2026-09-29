import { parseGIF, decompressFrames, GIFEncoder, quantize, applyPalette } from "./vendor/gif-libs.js";

const $ = (id) => document.getElementById(id);

/* =====================================================================
 * TÍTULO ANIMADO
 * ===================================================================== */

const TITLE = "F*CK THIS IMAGE";

const FONTS = [
  '"Comic Sans MS", cursive',
  'Impact, "Arial Black", sans-serif',
  '"Times New Roman", serif',
  '"Courier New", monospace',
  '"Papyrus", fantasy',
  '"Brush Script MT", cursive',
  '"Bangers"',
  '"Creepster"',
  '"Monoton"',
  '"Pacifico"',
  '"Press Start 2P"',
  '"Rubik Glitch"',
  '"UnifrakturMaguntia"',
  '"Lobster"',
  '"Rye"',
  '"VT323"',
];

const COLORS = ["#ffff00", "#00ff00", "#00ffff", "#ff00ff", "#ff6600", "#ffffff", "#ff3333"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function buildTitle() {
  const title = $("title");
  const letters = [];
  for (const word of TITLE.split(" ")) {
    const w = document.createElement("span");
    w.className = "word";
    for (const ch of word) {
      const span = document.createElement("span");
      span.className = "letter";
      if (ch === "*" || ch === "I") span.classList.add("narrow");
      span.dataset.char = ch;
      span.setAttribute("aria-hidden", "true");
      w.appendChild(span);
      letters.push(span);
    }
    title.appendChild(w);
  }
  return letters;
}

// Reduz o glifo (via `scale`, que não briga com as animações de `transform`)
// até caber na caixa fixa da letra
function fitGlyph(glyph, box) {
  glyph.style.scale = "";
  const s = Math.min(1, box.clientWidth * 1.15 / glyph.offsetWidth, box.clientHeight / glyph.offsetHeight);
  if (s < 1) glyph.style.scale = s.toFixed(3);
}

function mutateLetter(span) {
  const ch = span.dataset.char;
  const glyph = document.createElement("span");
  glyph.className = "glyph pop";

  glyph.textContent = ch;
  glyph.style.fontFamily = pick(FONTS);
  glyph.style.color = pick(COLORS);
  glyph.style.rotate = `${(Math.random() * 16 - 8).toFixed(1)}deg`;
  if (ch === "*" && Math.random() < 0.5) glyph.classList.replace("pop", "spin");
  span.replaceChildren(glyph);
  fitGlyph(glyph, span);
}

function startTitle() {
  const letters = buildTitle();
  letters.forEach(mutateLetter);
  // quando as webfonts terminarem de carregar, reajusta o que já está na tela
  document.fonts?.ready.then(() => letters.forEach((l) => l.firstChild && fitGlyph(l.firstChild, l)));
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(() => {
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) mutateLetter(pick(letters));
  }, 280);
}

/* =====================================================================
 * FIRULAS DOS ANOS 2000
 * ===================================================================== */

/* Contador de visitantes em estilo caça-níquel: cada dígito é um rolo */

const DIGITS = 6;
const REEL_COPIES = 10; // 0-9 repetido para o rolo poder girar várias voltas inteiras

function makeReel() {
  const reel = document.createElement("span");
  reel.className = "reel";
  const strip = document.createElement("span");
  strip.className = "strip";
  for (let i = 0; i < 10 * REEL_COPIES; i++) {
    const d = document.createElement("span");
    d.textContent = i % 10;
    strip.appendChild(d);
  }
  reel.appendChild(strip);
  return { strip, pos: 0, onEnd: null };
}

function setReel(reel, pos, duration) {
  reel.pos = pos;
  reel.strip.style.transition = duration ? `transform ${duration}ms cubic-bezier(.25, 1.35, .45, 1)` : "none";
  reel.strip.style.transform = `translateY(${-pos}em)`;
}

// Gira o rolo `turns` voltas completas e para no dígito `digit`
function spinReel(reel, digit, turns, duration) {
  const current = reel.pos % 10;
  const target = reel.pos - current + turns * 10 + digit + (digit < current ? 10 : 0);
  if (target === reel.pos) return;
  setReel(reel, target, duration);
  // ao terminar, volta para a primeira cópia sem animação (visualmente idêntico)
  if (reel.onEnd) reel.strip.removeEventListener("transitionend", reel.onEnd);
  reel.onEnd = () => setReel(reel, digit, 0);
  reel.strip.addEventListener("transitionend", reel.onEnd, { once: true });
}

function startCounter() {
  const box = $("counter");
  box.textContent = "";
  const reels = Array.from({ length: DIGITS }, () => {
    const r = makeReel();
    box.appendChild(r.strip.parentElement);
    return r;
  });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let count = 100000 + Math.floor(Math.random() * 800000);

  const show = (value, spinAll) => {
    const digits = String(value).padStart(DIGITS, "0").slice(-DIGITS);
    reels.forEach((reel, i) => {
      const d = Number(digits[i]);
      if (reduced) return setReel(reel, d, 0);
      if (spinAll) {
        // giro inicial: todos os rolos giram e param um de cada vez, da esquerda pra direita
        spinReel(reel, d, 2 + i, 1400 + i * 350);
      } else if (reel.pos % 10 !== d) {
        spinReel(reel, d, 1, 900);
      }
    });
  };

  // espera o layout existir antes do giro inicial
  requestAnimationFrame(() => requestAnimationFrame(() => show(count, true)));

  const tick = () => {
    count += 1 + Math.floor(Math.random() * 3);
    show(count, false);
    setTimeout(tick, 2500 + Math.random() * 3500);
  };
  setTimeout(tick, 4500);
}

function startSparkles() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const glyphs = ["✦", "✧", "★", "✨", "·"];
  let last = 0;
  window.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - last < 40) return;
    last = now;
    const s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = pick(glyphs);
    s.style.left = `${e.clientX + 6}px`;
    s.style.top = `${e.clientY + 6}px`;
    s.style.color = pick(COLORS);
    document.body.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  });
}

/* =====================================================================
 * DESTRUIÇÃO DE IMAGENS
 * ===================================================================== */

const LEVEL_NAMES = [
  [0, "Quase intacta (sem graça)"],
  [15, "Print de WhatsApp"],
  [30, "Encaminhada 10 vezes"],
  [45, "Foto de Orkut"],
  [60, "Webcam de 2004"],
  [75, "Enviada por MMS"],
  [88, "Relíquia do Facebook de 2012"],
  [96, "BATATA NUCLEAR ☢️"],
];

const lerp = (a, b, t) => a + (b - a) * t;

function levelName(level) {
  let name = LEVEL_NAMES[0][1];
  for (const [min, n] of LEVEL_NAMES) if (level >= min) name = n;
  return name;
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

// Parâmetros de destruição derivados do slider (0..100)
function destructionParams(level, opts) {
  const t = level / 100;
  return {
    t,
    scale: lerp(1, 0.06, Math.pow(t, 0.6)), // resolução interna
    quality: lerp(0.92, 0.03, Math.pow(t, 0.5)), // qualidade do JPEG
    passes: 1 + Math.round(t * 10), // gerações de recompressão
    colors: Math.max(4, Math.round(lerp(256, 4, Math.pow(t, 0.7)))), // cores do GIF
    fry: opts.fry,
    noise: opts.noise,
    pixel: opts.pixel,
  };
}

/**
 * Recebe uma fonte desenhável (canvas/imagem) e devolve um canvas destruído
 * no tamanho de saída w x h.
 */
async function destroyFrame(source, w, h, p, maxPasses = Infinity) {
  // piso de resolução: o lado menor nunca fica abaixo de ~32px (o meme ainda precisa ser reconhecível)
  const scale = Math.max(p.scale, Math.min(1, 32 / Math.min(w, h)));
  const sw = Math.max(4, Math.round(w * scale));
  const sh = Math.max(4, Math.round(h * scale));

  let canvas = makeCanvas(sw, sh);
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // JPEG não tem transparência
  ctx.fillRect(0, 0, sw, sh);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(source, 0, 0, sw, sh);

  // Recompressão em várias gerações, variando levemente o tamanho
  // para que os blocos do JPEG não se alinhem e o estrago acumule.
  const passes = Math.min(p.passes, maxPasses);
  let current = canvas;
  for (let i = 0; i < passes; i++) {
    const blob = await canvasToBlob(current, "image/jpeg", p.quality);
    const bmp = await createImageBitmap(blob);
    const jitter = i % 2 ? 0.87 : 1;
    const c = makeCanvas(Math.max(4, Math.round(sw * jitter)), Math.max(4, Math.round(sh * jitter)));
    const cctx = c.getContext("2d");
    cctx.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close?.();
    current = c;
  }

  // Volta ao tamanho de saída
  const out = makeCanvas(w, h);
  const octx = out.getContext("2d");
  octx.imageSmoothingEnabled = !p.pixel;
  if (p.fry) {
    const k = 0.3 + p.t;
    octx.filter = `saturate(${1 + 3 * k}) contrast(${1 + 0.9 * k}) brightness(1.08)`;
  }
  octx.drawImage(current, 0, 0, w, h);
  octx.filter = "none";

  if (p.fry || p.noise) {
    const img = octx.getImageData(0, 0, w, h);
    const d = img.data;
    const amount = p.noise ? 20 + 90 * p.t : 0;
    for (let i = 0; i < d.length; i += 4) {
      if (p.fry) {
        // posteriza e puxa pro laranja "fritado"
        d[i] = Math.min(255, d[i] * 1.12 + 10);
        d[i + 2] = d[i + 2] * 0.8;
      }
      if (amount) {
        const n = (Math.random() - 0.5) * amount;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
      }
    }
    octx.putImageData(img, 0, 0);
  }
  return out;
}

async function destroyStill(img, p) {
  const MAX = 1200;
  const s = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * s);
  const h = Math.round(img.naturalHeight * s);
  const canvas = await destroyFrame(img, w, h, p);
  return canvasToBlob(canvas, "image/jpeg", p.quality);
}

/** Decodifica o GIF em quadros completos (já compostos) */
function decodeGif(buffer) {
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);
  const w = gif.lsd.width;
  const h = gif.lsd.height;

  const full = makeCanvas(w, h);
  const fctx = full.getContext("2d", { willReadFrequently: true });
  const patch = makeCanvas(1, 1);
  const pctx = patch.getContext("2d");

  const out = [];
  let prevDisposal = 0;
  let prevDims = null;
  let restore = null;

  for (const f of frames) {
    if (prevDisposal === 2 && prevDims) {
      fctx.clearRect(prevDims.left, prevDims.top, prevDims.width, prevDims.height);
    } else if (prevDisposal === 3 && restore) {
      fctx.putImageData(restore, 0, 0);
    }
    restore = f.disposalType === 3 ? fctx.getImageData(0, 0, w, h) : null;

    const { width, height, left, top } = f.dims;
    patch.width = width;
    patch.height = height;
    pctx.putImageData(new ImageData(f.patch, width, height), 0, 0);
    fctx.drawImage(patch, left, top);

    const snap = makeCanvas(w, h);
    snap.getContext("2d").drawImage(full, 0, 0);
    out.push({ canvas: snap, delay: f.delay || 100 });

    prevDisposal = f.disposalType;
    prevDims = f.dims;
  }
  return { width: w, height: h, frames: out };
}

async function destroyGif(buffer, p, onProgress) {
  const gif = decodeGif(buffer);
  const MAX = 480;
  const s = Math.min(1, MAX / Math.max(gif.width, gif.height));
  const w = Math.round(gif.width * s);
  const h = Math.round(gif.height * s);

  // Em níveis altos, pula quadros para deixar a animação travada
  const step = p.t > 0.85 ? 3 : p.t > 0.6 ? 2 : 1;
  const frames = [];
  for (let i = 0; i < gif.frames.length; i += step) {
    let delay = 0;
    for (let j = i; j < Math.min(i + step, gif.frames.length); j++) delay += gif.frames[j].delay;
    frames.push({ canvas: gif.frames[i].canvas, delay });
  }

  const enc = GIFEncoder();
  for (let i = 0; i < frames.length; i++) {
    const canvas = await destroyFrame(frames[i].canvas, w, h, p, 4);
    const data = canvas.getContext("2d").getImageData(0, 0, w, h).data;
    const palette = quantize(data, p.colors, { format: "rgb444" });
    const index = applyPalette(data, palette, "rgb444");
    enc.writeFrame(index, w, h, { palette, delay: frames[i].delay });
    onProgress((i + 1) / frames.length);
    // devolve o controle ao navegador de vez em quando
    if (i % 3 === 2) await new Promise((r) => setTimeout(r));
  }
  enc.finish();
  return new Blob([enc.bytes()], { type: "image/gif" });
}

/* =====================================================================
 * INTERFACE
 * ===================================================================== */

const state = {
  file: null,
  isGif: false,
  img: null,
  beforeUrl: null,
  afterUrl: null,
  fileId: 0, // muda a cada imagem anexada
  lastKey: null, // parâmetros que geraram o resultado atual
  busy: false,
  queued: false,
};

// Identifica a combinação imagem + parâmetros
function paramsKey() {
  const opts = ["opt-fry", "opt-noise", "opt-pixel"].map((id) => +$(id).checked).join("");
  return `${state.fileId}|${$("level").value}|${opts}`;
}

// Só dá para destruir se algo mudou desde o último resultado
function updateDestroyButton() {
  $("destroy").disabled = !state.file || state.busy || paramsKey() === state.lastKey;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function showImage(imgEl, placeholderEl, url) {
  imgEl.src = url;
  imgEl.classList.add("show");
  if (placeholderEl) placeholderEl.hidden = true;
}

function setProgress(frac, text) {
  const box = $("progress");
  if (frac == null) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  $("progress-bar").style.width = `${Math.round(frac * 100)}%`;
  $("progress-text").textContent = text;
}

function currentParams() {
  return destructionParams(Number($("level").value), {
    fry: $("opt-fry").checked,
    noise: $("opt-noise").checked,
    pixel: $("opt-pixel").checked,
  });
}

async function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("ERRO 404: isso aí não é uma imagem!!!");
    return;
  }
  state.file = file;
  state.fileId++;
  state.isGif = file.type === "image/gif";

  if (state.beforeUrl) URL.revokeObjectURL(state.beforeUrl);
  state.beforeUrl = URL.createObjectURL(file);

  const img = new Image();
  img.src = state.beforeUrl;
  try {
    await img.decode();
  } catch {
    alert("Não consegui abrir essa imagem. Ela já veio destruída demais.");
    return;
  }
  state.img = img;

  showImage($("before"), null, state.beforeUrl);
  $("dropzone").classList.add("has-image");
  $("swap").hidden = false;
  $("before-info").textContent = `${img.naturalWidth}×${img.naturalHeight} · ${formatBytes(file.size)}${state.isGif ? " · GIF" : ""}`;
  run();
}

async function run() {
  if (!state.file) return;
  if (state.busy) {
    state.queued = true;
    return;
  }
  state.busy = true;
  updateDestroyButton();

  const p = currentParams();
  const key = paramsKey();
  const file = state.file;
  const img = state.img;
  try {
    let blob;
    if (state.isGif) {
      setProgress(0, "Decodificando GIF...");
      const buffer = await file.arrayBuffer();
      blob = await destroyGif(buffer, p, (f) => setProgress(f, `Destruindo quadros... ${Math.round(f * 100)}%`));
    } else {
      setProgress(0.5, "Destruindo...");
      blob = await destroyStill(img, p);
    }

    if (state.afterUrl) URL.revokeObjectURL(state.afterUrl);
    state.afterUrl = URL.createObjectURL(blob);
    showImage($("after"), $("after-ph"), state.afterUrl);

    const ratio = 100 - (blob.size / file.size) * 100;
    $("after-info").textContent =
      `${formatBytes(blob.size)} · ` + (ratio >= 0 ? `${ratio.toFixed(0)}% menor` : `${(-ratio).toFixed(0)}% MAIOR (?!)`);

    const dl = $("download");
    const base = file.name.replace(/\.[^.]+$/, "") || "imagem";
    dl.href = state.afterUrl;
    dl.download = `${base}-destruida.${state.isGif ? "gif" : "jpg"}`;
    dl.hidden = false;
    state.lastKey = key;
  } catch (err) {
    console.error(err);
    alert("Deu ruim destruindo a imagem: " + err.message);
  } finally {
    setProgress(null);
    state.busy = false;
    updateDestroyButton();
    if (state.queued) {
      state.queued = false;
      run();
    }
  }
}

function updateLevelLabel() {
  const v = Number($("level").value);
  $("level-value").textContent = v;
  $("level-name").textContent = levelName(v);
}

function setupUI() {
  const drop = $("dropzone");
  const input = $("file");

  input.addEventListener("change", () => {
    if (input.files[0]) loadFile(input.files[0]);
    input.value = ""; // permite escolher o mesmo arquivo de novo
  });

  ["dragenter", "dragover"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("over");
    }),
  );
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove("over")));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    loadFile(e.dataTransfer.files[0]);
  });

  window.addEventListener("paste", (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (item) loadFile(item.getAsFile());
  });

  // Imagens estáticas atualizam sozinhas; GIFs só no botão (são mais pesados)
  let timer;
  const autoRun = () => {
    updateLevelLabel();
    updateDestroyButton();
    if (state.isGif) return;
    clearTimeout(timer);
    timer = setTimeout(run, 200);
  };
  $("level").addEventListener("input", autoRun);
  ["opt-fry", "opt-noise", "opt-pixel"].forEach((id) => $(id).addEventListener("change", autoRun));
  $("destroy").addEventListener("click", run);

  updateLevelLabel();
  $("year").textContent = new Date().getFullYear();
}

startTitle();
startCounter();
startSparkles();
setupUI();
