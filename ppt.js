const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3" × 7.5"
pres.author = "Gati Shakti Vishwavidyalaya — AI/ML Project 2026";
pres.title = "AI-Based Hyperlocal Demand Prediction for Dark Stores";

// ─── PALETTE ────────────────────────────────────────────────────────────────
const C = {
  void: "050810", // deepest black
  abyss: "080D18", // midnight near-black
  night: "0D1525", // dark navy
  dusk: "101E35", // softer navy
  panel: "111A2E", // card surface
  overlay: "0A1020", // translucent panel base
  gold: "C9A84C", // antique gold
  goldPale: "E8CC82", // champagne gold
  goldDim: "7A5C1A", // dark gold
  teal: "19C0BA", // electric teal
  tealDim: "0D6E6B", // deep teal
  tealGlow: "5BDAD6", // bright teal
  ivory: "F0EBE2", // warm ivory
  ivoryDim: "B8B0A5", // muted ivory
  ivoryFar: "6A6560", // distant ivory
  red: "C84B31", // cinematic red
  redDim: "7A2C1A", // dark red
  white: "FFFFFF",
  slate: "1C2A40", // mid-dark
  plum: "2A1535", // subtle purple shadow
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

function bg(slide, color = C.void) {
  slide.background = { color };
}

function fullRect(slide, color, alpha = 0) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 13.3,
    h: 7.5,
    fill: { color },
    line: { color, width: 0 },
  });
}

function divLine(slide, x, y, w, color = C.gold, thickness = 0.012) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w,
    h: thickness,
    fill: { color },
    line: { color, width: 0 },
  });
}

function vertLine(slide, x, y, h, color = C.gold, thickness = 0.012) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w: thickness,
    h,
    fill: { color },
    line: { color, width: 0 },
  });
}

// Atmospheric corner accent — tiny triangle of light
function cornerAccent(slide, corner = "tl", color = C.gold) {
  const size = 1.2;
  let x = 0,
    y = 0;
  if (corner === "tr") x = 13.3 - size;
  if (corner === "bl") y = 7.5 - size;
  if (corner === "br") {
    x = 13.3 - size;
    y = 7.5 - size;
  }
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w: size,
    h: 0.004,
    fill: { color, transparency: 40 },
    line: { color, width: 0 },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w: 0.004,
    h: size,
    fill: { color, transparency: 40 },
    line: { color, width: 0 },
  });
}

function eyebrow(slide, text, x, y, w, color = C.gold) {
  slide.addText(text, {
    x,
    y,
    w,
    h: 0.25,
    fontSize: 7.5,
    fontFace: "Calibri",
    color,
    bold: false,
    charSpacing: 6,
    align: "left",
    margin: 0,
  });
}

function heroTitle(slide, lines, x, y, w, fontSize = 52, color = C.ivory) {
  slide.addText(lines, {
    x,
    y,
    w,
    h: 3.2,
    fontSize,
    fontFace: "Palatino Linotype",
    color,
    bold: false,
    align: "left",
    valign: "top",
    margin: 0,
  });
}

function caption(slide, text, x, y, w, color = C.ivoryDim, size = 11) {
  slide.addText(text, {
    x,
    y,
    w,
    h: 0.35,
    fontSize: size,
    fontFace: "Calibri",
    color,
    align: "left",
    margin: 0,
  });
}

function sectionNum(slide, n, x = 0.45, y = 0.35) {
  slide.addText(`0${n}`, {
    x,
    y,
    w: 1,
    h: 0.5,
    fontSize: 10,
    fontFace: "Palatino Linotype",
    color: C.gold,
    italic: true,
    align: "left",
    margin: 0,
  });
}

function statBox(slide, num, label, x, y, w = 2.2, h = 1.55, accent = C.gold) {
  // Border frame
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: C.panel },
    line: { color: accent, width: 0.8 },
  });
  // Top accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w,
    h: 0.048,
    fill: { color: accent },
    line: { color: accent, width: 0 },
  });
  slide.addText(num, {
    x: x + 0.18,
    y: y + 0.15,
    w: w - 0.36,
    h: 0.9,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: accent,
    bold: false,
    align: "center",
    valign: "middle",
    margin: 0,
  });
  slide.addText(label, {
    x: x + 0.12,
    y: y + 0.98,
    w: w - 0.24,
    h: 0.44,
    fontSize: 9,
    fontFace: "Calibri",
    color: C.ivoryDim,
    align: "center",
    charSpacing: 2,
    margin: 0,
  });
}

function infoBadge(
  slide,
  icon,
  title,
  body,
  x,
  y,
  w = 3.6,
  h = 1.55,
  accent = C.teal,
) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: C.slate },
    line: { color: accent, width: 0.6 },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w: 0.045,
    h,
    fill: { color: accent },
    line: { color: accent, width: 0 },
  });
  slide.addText(icon + "  " + title, {
    x: x + 0.22,
    y: y + 0.18,
    w: w - 0.32,
    h: 0.38,
    fontSize: 11,
    fontFace: "Calibri",
    color: C.ivory,
    bold: true,
    margin: 0,
  });
  slide.addText(body, {
    x: x + 0.22,
    y: y + 0.58,
    w: w - 0.32,
    h: h - 0.7,
    fontSize: 9.5,
    fontFace: "Calibri",
    color: C.ivoryDim,
    margin: 0,
  });
}

function darkPanel(slide, x, y, w, h, accent = C.tealDim) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: C.panel },
    line: { color: accent, width: 0.5 },
  });
}

function formulaBox(slide, label, formula, x, y, w, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: "0A1525" },
    line: { color: C.teal, width: 0.8 },
  });
  slide.addText(label, {
    x: x + 0.2,
    y: y + 0.12,
    w: w - 0.4,
    h: 0.28,
    fontSize: 7.5,
    fontFace: "Calibri",
    color: C.teal,
    charSpacing: 4,
    bold: false,
    margin: 0,
  });
  slide.addText(formula, {
    x: x + 0.2,
    y: y + 0.42,
    w: w - 0.4,
    h: h - 0.55,
    fontSize: 13,
    fontFace: "Courier New",
    color: C.goldPale,
    align: "left",
    margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 1 — CINEMATIC COVER
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);

  // Atmospheric layered shapes suggesting depth
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 13.3,
    h: 7.5,
    fill: { color: C.night },
    line: { color: C.night, width: 0 },
  });
  // Diagonal light — simulates film grain / light leak
  s.addShape(pres.shapes.RECTANGLE, {
    x: -1,
    y: 4.5,
    w: 8,
    h: 0.06,
    fill: { color: C.goldDim, transparency: 60 },
    line: { color: C.goldDim, width: 0 },
    rotate: -15,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: -1,
    y: 4.8,
    w: 6,
    h: 0.025,
    fill: { color: C.goldDim, transparency: 75 },
    line: { color: C.goldDim, width: 0 },
    rotate: -15,
  });
  // Right atmospheric glow panel
  s.addShape(pres.shapes.RECTANGLE, {
    x: 9.2,
    y: 0,
    w: 4.1,
    h: 7.5,
    fill: { color: C.plum, transparency: 30 },
    line: { color: C.plum, width: 0 },
  });

  // Left gold vertical bar
  vertLine(s, 0.72, 0.6, 6.3, C.gold, 0.025);

  // Eye-level separator lines
  divLine(s, 0.72, 1.35, 6.8, C.goldDim, 0.007);

  // Eyebrow label
  eyebrow(
    s,
    "ARTIFICIAL INTELLIGENCE  ·  MACHINE LEARNING  ·  QUICK COMMERCE",
    0.85,
    0.62,
    8,
    C.gold,
  );

  // Main title — massive, cinematic
  s.addText("AI-Based", {
    x: 0.85,
    y: 1.0,
    w: 8.8,
    h: 1.05,
    fontSize: 68,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    bold: false,
    italic: true,
    align: "left",
    margin: 0,
  });
  s.addText("Hyperlocal Demand", {
    x: 0.85,
    y: 1.95,
    w: 9.5,
    h: 1.05,
    fontSize: 62,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    bold: false,
    align: "left",
    margin: 0,
  });
  s.addText("Prediction", {
    x: 0.85,
    y: 2.9,
    w: 7,
    h: 1.0,
    fontSize: 62,
    fontFace: "Palatino Linotype",
    color: C.gold,
    bold: false,
    align: "left",
    margin: 0,
  });

  // Sub-title
  s.addText("For Dark Stores and Quick Commerce", {
    x: 0.85,
    y: 3.92,
    w: 8.5,
    h: 0.45,
    fontSize: 18,
    fontFace: "Calibri",
    color: C.ivoryDim,
    italic: true,
    align: "left",
    margin: 0,
  });

  // Bottom rule
  divLine(s, 0.72, 4.55, 8.5, C.gold, 0.01);

  // Subline
  s.addText(
    "Using Censored Demand Recovery  ·  Ensemble Forecasting  ·  FreshRetailNet-50K",
    {
      x: 0.85,
      y: 4.68,
      w: 9.5,
      h: 0.3,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.teal,
      charSpacing: 1.5,
      align: "left",
      margin: 0,
    },
  );

  // Meta block bottom right
  s.addText(
    [
      { text: "Course: ", options: { bold: true, color: C.ivoryDim } },
      {
        text: "Artificial Intelligence & Machine Learning\n",
        options: { color: C.ivoryFar },
      },
      { text: "Institution: ", options: { bold: true, color: C.ivoryDim } },
      { text: "Gati Shakti Vishwavidyalaya\n", options: { color: C.ivoryFar } },
      { text: "Mentor: ", options: { bold: true, color: C.ivoryDim } },
      {
        text: "Dr. Anshika Srivastava  ·  April 2026",
        options: { color: C.ivoryFar },
      },
    ],
    {
      x: 0.85,
      y: 5.8,
      w: 7,
      h: 1.3,
      fontSize: 9,
      fontFace: "Calibri",
      align: "left",
      margin: 0,
    },
  );

  // Hero metrics — top right
  const metricsX = 9.8;
  s.addShape(pres.shapes.RECTANGLE, {
    x: metricsX - 0.2,
    y: 1.6,
    w: 3.4,
    h: 3.8,
    fill: { color: C.panel },
    line: { color: C.tealDim, width: 0.6 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: metricsX - 0.2,
    y: 1.6,
    w: 3.4,
    h: 0.04,
    fill: { color: C.teal },
    line: { color: C.teal, width: 0 },
  });
  eyebrow(s, "KEY METRICS", metricsX - 0.05, 1.72, 2.8, C.teal);

  const metrics = [
    ["27.83%", "Stage 1 WAPE"],
    ["29.30%", "Stage 2 Ensemble WAPE"],
    ["50K", "Store-Product Pairs"],
    ["345", "Trees · No GPU"],
  ];
  metrics.forEach(([n, l], i) => {
    const my = 2.0 + i * 0.83;
    divLine(s, metricsX - 0.05, my, 3.0, C.goldDim, 0.006);
    s.addText(n, {
      x: metricsX - 0.05,
      y: my + 0.1,
      w: 3,
      h: 0.42,
      fontSize: 24,
      fontFace: "Palatino Linotype",
      color: C.goldPale,
      align: "left",
      margin: 0,
    });
    caption(s, l, metricsX - 0.05, my + 0.5, 3, C.ivoryFar, 8.5);
  });

  // Authors bottom
  s.addText(
    "Assir Thota  ·  Ayush Vaibhav Gond  ·  Parth Sidhu  ·  Shreya Mohanty  ·  Srijan Gupta",
    {
      x: 0.72,
      y: 7.0,
      w: 12,
      h: 0.3,
      fontSize: 8.5,
      fontFace: "Calibri",
      color: C.ivoryFar,
      charSpacing: 1.5,
      align: "left",
      margin: 0,
    },
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 2 — ATMOSPHERIC INTRO: "The System Never Saw The Missing Demand"
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);

  // Lone vertical bar — cinematic minimalism
  vertLine(s, 5.5, 0.8, 5.9, C.teal, 0.015);

  // Big atmospheric quote
  s.addText('"The system recorded what\nit could sell."', {
    x: 0.8,
    y: 1.4,
    w: 8.2,
    h: 2.8,
    fontSize: 54,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    italic: true,
    align: "left",
    margin: 0,
  });
  s.addText("Not what was wanted.", {
    x: 0.8,
    y: 4.0,
    w: 9,
    h: 1.05,
    fontSize: 54,
    fontFace: "Palatino Linotype",
    color: C.gold,
    italic: true,
    align: "left",
    margin: 0,
  });

  divLine(s, 0.8, 5.2, 5.5, C.goldDim, 0.008);

  s.addText(
    "This is the origin of every broken forecast in quick commerce.\nWe built a system to see what the data chose to hide.",
    {
      x: 0.8,
      y: 5.4,
      w: 9.5,
      h: 0.8,
      fontSize: 11.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    },
  );

  // Right column visual glyph
  s.addText("MNAR", {
    x: 9.5,
    y: 2.5,
    w: 3.2,
    h: 1.5,
    fontSize: 80,
    fontFace: "Palatino Linotype",
    color: C.tealDim,
    bold: false,
    italic: false,
    align: "center",
    margin: 0,
    transparency: 30,
  });
  caption(s, "Missing Not At Random", 9.5, 4.1, 3.2, C.tealDim, 9);
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 3 — PROBLEM CONTEXT: Quick Commerce Challenge
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 1);

  eyebrow(s, "THE FRACTURE", 0.55, 0.35, 4, C.gold);
  s.addText("Quick Commerce\nIs Structurally Broken", {
    x: 0.55,
    y: 0.6,
    w: 7.5,
    h: 1.5,
    fontSize: 40,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.1, 8, C.goldDim, 0.008);

  // Three problem columns
  const cols = [
    {
      icon: "◎",
      title: "Hyperlocal Pressure",
      body: "3 km service radius. Sub-30-minute SLA. Dark store fulfillment means micro-inventory with zero slack.",
      accent: C.gold,
    },
    {
      icon: "⌀",
      title: "Volatile Demand",
      body: "Hyper-localized customer base. Severely reduced aggregation smoothing vs. traditional retail. Spiky & unpredictable.",
      accent: C.teal,
    },
    {
      icon: "⊗",
      title: "Perishable Dominance",
      body: "Fresh produce, dairy, seafood, frozen goods. Short shelf-life amplifies every stockout into a cascade failure.",
      accent: C.red,
    },
  ];

  cols.forEach((col, i) => {
    const cx = 0.55 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx,
      y: 2.35,
      w: 3.95,
      h: 4.5,
      fill: { color: C.panel },
      line: { color: col.accent, width: 0.7 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx,
      y: 2.35,
      w: 3.95,
      h: 0.045,
      fill: { color: col.accent },
      line: { color: col.accent, width: 0 },
    });
    s.addText(col.icon, {
      x: cx + 0.25,
      y: 2.55,
      w: 0.8,
      h: 0.8,
      fontSize: 28,
      fontFace: "Palatino Linotype",
      color: col.accent,
      align: "left",
      margin: 0,
    });
    s.addText(col.title, {
      x: cx + 0.25,
      y: 3.32,
      w: 3.4,
      h: 0.5,
      fontSize: 14,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "left",
      margin: 0,
    });
    s.addText(col.body, {
      x: cx + 0.25,
      y: 3.85,
      w: 3.4,
      h: 2.7,
      fontSize: 10.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });

  // Bottom ominous note
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 6.95,
    w: 12.2,
    h: 0.38,
    fill: { color: C.redDim, transparency: 30 },
    line: { color: C.red, width: 0.5 },
  });
  s.addText(
    "These constraints amplify demand uncertainty — causing acute stockout frequencies and severe inventory friction.",
    {
      x: 0.75,
      y: 7.0,
      w: 11.8,
      h: 0.28,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.ivory,
      align: "center",
      margin: 0,
    },
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 4 — DEMAND CENSORING: The Core Data Problem
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 1);

  eyebrow(s, "AFTER THE SHELVES WENT EMPTY", 0.55, 0.35, 6, C.gold);
  s.addText("Censored Sales ≠ True Demand", {
    x: 0.55,
    y: 0.6,
    w: 8,
    h: 0.9,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 1.52, 12.2, C.goldDim, 0.007);

  // Visual representation of censoring
  // Background for the "chart area"
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 1.7,
    w: 7.5,
    h: 4.6,
    fill: { color: C.panel },
    line: { color: C.tealDim, width: 0.5 },
  });

  // Simulated demand curve (as bars/blocks to approximate chart)
  eyebrow(
    s,
    "TRUE DEMAND vs. RECORDED SALES — ILLUSTRATIVE",
    0.75,
    1.8,
    7,
    C.teal,
  );

  // "Bars" representing recorded sales (shorter) and true demand (taller)
  const barData = [
    { h_true: 1.2, h_rec: 1.2, stockout: false },
    { h_true: 1.5, h_rec: 1.5, stockout: false },
    { h_true: 2.1, h_rec: 1.0, stockout: true },
    { h_true: 2.4, h_rec: 1.0, stockout: true },
    { h_true: 1.8, h_rec: 1.8, stockout: false },
    { h_true: 2.0, h_rec: 1.0, stockout: true },
    { h_true: 1.6, h_rec: 1.6, stockout: false },
    { h_true: 1.9, h_rec: 1.9, stockout: false },
    { h_true: 2.5, h_rec: 1.0, stockout: true },
    { h_true: 1.7, h_rec: 1.7, stockout: false },
    { h_true: 2.2, h_rec: 1.0, stockout: true },
    { h_true: 1.4, h_rec: 1.4, stockout: false },
  ];
  const barMaxH = 3.0,
    chartBaseY = 5.95,
    barW = 0.48,
    gap = 0.12,
    chartStartX = 0.75;
  const scale = barMaxH / 2.5;

  barData.forEach((d, i) => {
    const bx = chartStartX + i * (barW + gap);
    const hTrue = d.h_true * scale;
    const hRec = d.h_rec * scale;
    const byTrue = chartBaseY - hTrue;
    const byRec = chartBaseY - hRec;

    if (d.stockout) {
      // Shaded stockout region
      s.addShape(pres.shapes.RECTANGLE, {
        x: bx - 0.04,
        y: 2.2,
        w: barW + 0.08,
        h: 3.85,
        fill: { color: C.red, transparency: 75 },
        line: { color: C.redDim, width: 0.3 },
      });
    }
    // True demand bar (teal, ghost)
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx,
      y: byTrue,
      w: barW,
      h: hTrue,
      fill: { color: C.teal, transparency: 45 },
      line: { color: C.teal, width: 0.4 },
    });
    // Recorded sales bar (gold, solid up to censored level)
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx + 0.06,
      y: byRec,
      w: barW - 0.12,
      h: hRec,
      fill: { color: C.gold, transparency: 20 },
      line: { color: C.goldPale, width: 0 },
    });
  });

  // Legend
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.75,
    y: 6.25,
    w: 0.28,
    h: 0.14,
    fill: { color: C.teal, transparency: 45 },
    line: { color: C.teal, width: 0 },
  });
  caption(s, "True Latent Demand", 1.1, 6.22, 3, C.ivoryDim, 8.5);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.6,
    y: 6.25,
    w: 0.28,
    h: 0.14,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
  });
  caption(s, "Observed Censored Sales", 3.95, 6.22, 3, C.ivoryDim, 8.5);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.5,
    y: 6.25,
    w: 0.28,
    h: 0.14,
    fill: { color: C.red, transparency: 40 },
    line: { color: C.red, width: 0 },
  });
  caption(s, "Stockout Days (MNAR)", 6.85, 6.22, 3, C.ivoryDim, 8.5);

  // Right side explainer
  const rx = 8.4;
  formulaBox(
    s,
    "THE CENSORING EQUATION",
    "Observed:  yₜ = dₜ × sₜ\n\nWhen sₜ = 0 (stockout):\nyₜ ≪ dₜ  (truncated below true demand)",
    rx,
    1.7,
    4.45,
    1.95,
  );

  infoBadge(
    s,
    "⊘",
    "The Grounded Example",
    "Strawberries stock out at 11:00 AM. System records 100 units sold. True consumer demand was 200 units. The 100-unit gap is invisible — not zero demand, but censored demand.",
    rx,
    3.75,
    4.45,
    2.0,
    C.red,
  );

  // Formula inline caption
  s.addText(
    "−7.37% WPE systematic underestimation before recovery is applied",
    {
      x: rx,
      y: 5.88,
      w: 4.45,
      h: 0.35,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.red,
      align: "left",
      italic: true,
      margin: 0,
    },
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 5 — THE SELF-REINFORCING CYCLE
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 1);

  eyebrow(s, "THE SELF-REINFORCING COLLAPSE", 0.55, 0.35, 6, C.red);
  s.addText("The Loop That\nNever Corrects Itself", {
    x: 0.55,
    y: 0.62,
    w: 8,
    h: 1.3,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  // Cycle diagram — 4 nodes connected by arrows
  const nodes = [
    { label: "Censored\nTraining Data", x: 2.5, y: 2.1, c: C.red },
    { label: "Model\nUnderestimates", x: 7.8, y: 2.1, c: C.gold },
    { label: "Smaller\nOrders Placed", x: 7.8, y: 5.0, c: C.teal },
    { label: "More\nStockouts", x: 2.5, y: 5.0, c: C.red },
  ];

  nodes.forEach((n) => {
    s.addShape(pres.shapes.OVAL, {
      x: n.x - 1.1,
      y: n.y - 0.55,
      w: 2.2,
      h: 1.1,
      fill: { color: C.panel },
      line: { color: n.c, width: 1.2 },
    });
    s.addText(n.label, {
      x: n.x - 1.05,
      y: n.y - 0.5,
      w: 2.1,
      h: 1.0,
      fontSize: 12,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "center",
      valign: "middle",
      margin: 0,
    });
  });

  // Arrows (lines between nodes)
  const arrows = [
    { x: 3.6, y: 1.7, w: 4.2, a: "R" }, // top
    { x: 8.9, y: 2.56, w: 0, h: 2.44, a: "D" }, // right
    { x: 3.6, y: 5.1, w: 4.2, a: "L" }, // bottom
    { x: 1.4, y: 2.56, w: 0, h: 2.44, a: "U" }, // left
  ];

  // Simplified arrow via line shapes
  s.addShape(pres.shapes.LINE, {
    x: 3.65,
    y: 1.6,
    w: 4.0,
    h: 0,
    line: { color: C.goldDim, width: 1.5 },
  });
  s.addShape(pres.shapes.LINE, {
    x: 8.85,
    y: 2.6,
    w: 0,
    h: 2.4,
    line: { color: C.goldDim, width: 1.5 },
  });
  s.addShape(pres.shapes.LINE, {
    x: 3.65,
    y: 5.0,
    w: 4.0,
    h: 0,
    line: { color: C.goldDim, width: 1.5 },
  });
  s.addShape(pres.shapes.LINE, {
    x: 1.4,
    y: 2.6,
    w: 0,
    h: 2.4,
    line: { color: C.goldDim, width: 1.5 },
  });

  // Centre label
  s.addText("COMPOUNDING\nBIAS LOOP", {
    x: 4.3,
    y: 3.2,
    w: 4.7,
    h: 1.1,
    fontSize: 18,
    fontFace: "Palatino Linotype",
    color: C.redDim,
    italic: true,
    align: "center",
    margin: 0,
  });

  divLine(s, 0.55, 6.5, 12.2, C.goldDim, 0.008);
  s.addText(
    "High-demand products are systematically starved of inventory. The bias compounds over time — invisible without MNAR-aware recovery.",
    {
      x: 0.55,
      y: 6.62,
      w: 12.2,
      h: 0.65,
      fontSize: 10.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "center",
      margin: 0,
    },
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 6 — WHY MNAR MATTERS
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 1);

  eyebrow(s, "THE DATA LIED QUIETLY", 0.55, 0.35, 5, C.gold);
  s.addText("Missing Not At Random —\nWhy Standard Methods Fail", {
    x: 0.55,
    y: 0.62,
    w: 9,
    h: 1.4,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.08, 12.2, C.goldDim, 0.007);

  // Left column MAR
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 2.28,
    w: 5.8,
    h: 4.8,
    fill: { color: C.panel },
    line: { color: C.ivoryFar, width: 0.5 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 2.28,
    w: 5.8,
    h: 0.04,
    fill: { color: C.ivoryFar },
    line: { color: C.ivoryFar, width: 0 },
  });
  s.addText("MAR (Missing At Random)", {
    x: 0.75,
    y: 2.38,
    w: 5.4,
    h: 0.5,
    fontSize: 14,
    fontFace: "Calibri",
    color: C.ivoryDim,
    bold: true,
    align: "left",
    margin: 0,
  });
  s.addText(
    "Standard imputation assumes data is missing randomly — SAITS, ImputeFormer, CSDI all share this assumption.\n\nThe probability of missingness does not depend on the missing value.\n\nThis assumption is fundamental — and completely violated in retail.",
    {
      x: 0.75,
      y: 2.9,
      w: 5.3,
      h: 3.8,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    },
  );
  s.addText("❌ FAILS IN RETAIL", {
    x: 0.75,
    y: 6.5,
    w: 5.3,
    h: 0.4,
    fontSize: 11,
    fontFace: "Calibri",
    color: C.red,
    bold: true,
    align: "left",
    margin: 0,
  });

  // Right column MNAR
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.9,
    y: 2.28,
    w: 5.9,
    h: 4.8,
    fill: { color: C.dusk },
    line: { color: C.gold, width: 0.7 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.9,
    y: 2.28,
    w: 5.9,
    h: 0.045,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
  });
  s.addText("MNAR (Missing Not At Random)", {
    x: 7.1,
    y: 2.38,
    w: 5.5,
    h: 0.5,
    fontSize: 14,
    fontFace: "Calibri",
    color: C.goldPale,
    bold: true,
    align: "left",
    margin: 0,
  });
  s.addText(
    "In retail, stockouts occur because demand is high. Missingness correlates directly with the missing value.",
    {
      x: 7.1,
      y: 2.9,
      w: 5.5,
      h: 0.9,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    },
  );

  const mnarFacts = [
    "Stockout rate: <2% at 6 AM → 26% by 8 PM (monotonic depletion)",
    "Promotions increase stockout probability (β = −0.046, p = 0.018)",
    "Rainfall increases demand AND stockout risk (β = +0.108)",
    "These structural dependencies define true MNAR data",
  ];
  mnarFacts.forEach((f, i) => {
    s.addText(`·  ${f}`, {
      x: 7.1,
      y: 3.85 + i * 0.58,
      w: 5.5,
      h: 0.5,
      fontSize: 10.5,
      fontFace: "Calibri",
      color: C.ivory,
      align: "left",
      margin: 0,
    });
  });
  s.addText("✓ OUR APPROACH HANDLES THIS", {
    x: 7.1,
    y: 6.5,
    w: 5.5,
    h: 0.4,
    fontSize: 11,
    fontFace: "Calibri",
    color: C.teal,
    bold: true,
    align: "left",
    margin: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 7 — WHERE FORECASTS COLLAPSE (benchmarks fail)
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 1);

  eyebrow(s, "WHERE FORECASTS HAVE ALWAYS FAILED", 0.55, 0.35, 7, C.red);
  s.addText("Existing Benchmarks\nProvide No Stockout Labels", {
    x: 0.55,
    y: 0.62,
    w: 9,
    h: 1.4,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  // Failure grid
  const failures = [
    {
      name: "M5 Dataset",
      desc: "No stockout annotations. Treats zero sales as zero demand. Cannot train or evaluate censoring-aware models.",
      accent: C.redDim,
    },
    {
      name: "Corporación Favorita",
      desc: "No verified stockout labels. Daily granularity. Standard imputation methods fail silently on MNAR data.",
      accent: C.redDim,
    },
    {
      name: "Walmart Dataset",
      desc: "Weekly resolution only. No weather data. No promotional depth. Completely inadequate for hyperlocal dark-store dynamics.",
      accent: C.redDim,
    },
    {
      name: "SAITS / CSDI / ImputeFormer",
      desc: "State-of-the-art imputation — but all assume Missing At Random. In retail MNAR context, they systematically underestimate demand spikes.",
      accent: C.goldDim,
    },
  ];

  failures.forEach((f, i) => {
    const fx = 0.55 + (i % 2) * 6.5;
    const fy = 2.2 + Math.floor(i / 2) * 2.35;
    infoBadge(s, "⊗", f.name, f.desc, fx, fy, 6.0, 2.1, f.accent);
  });

  divLine(s, 0.55, 6.65, 12.2, C.goldDim, 0.008);
  s.addText(
    "The gap is precisely what FreshRetailNet-50K fills — the first open benchmark with verified hourly stockout annotations.",
    {
      x: 0.55,
      y: 6.75,
      w: 12.2,
      h: 0.55,
      fontSize: 10.5,
      fontFace: "Calibri",
      color: C.teal,
      italic: true,
      align: "center",
      margin: 0,
    },
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 8 — DATASET INTRO: FreshRetailNet-50K
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.night);
  sectionNum(s, 2);

  // Full atmospheric top half — dark velvet
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 13.3,
    h: 2.9,
    fill: { color: C.void },
    line: { color: C.void, width: 0 },
  });

  eyebrow(s, "THE DATASET", 0.55, 0.38, 4, C.teal);
  s.addText("FreshRetailNet-50K", {
    x: 0.55,
    y: 0.68,
    w: 10,
    h: 1.0,
    fontSize: 56,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  s.addText(
    "The first open benchmark for censored demand estimation in fresh retail.",
    {
      x: 0.55,
      y: 1.7,
      w: 10,
      h: 0.5,
      fontSize: 13,
      fontFace: "Calibri",
      color: C.ivoryDim,
      italic: true,
      align: "left",
      margin: 0,
    },
  );
  s.addText(
    "Compiled by Dingdong Inc. — China's largest quick-commerce operator  ·  Presented by Assir Thota",
    {
      x: 0.55,
      y: 2.26,
      w: 11,
      h: 0.3,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.ivoryFar,
      align: "left",
      margin: 0,
      charSpacing: 1,
    },
  );

  divLine(s, 0, 2.88, 13.3, C.teal, 0.025);

  // 4 massive stat boxes
  const stats = [
    { n: "50K", l: "Store-Product\nTime Series", c: C.gold },
    { n: "898", l: "Dark Stores\n18 Chinese Cities", c: C.teal },
    { n: "863", l: "SKU Categories\nPerishable Goods", c: C.gold },
    { n: "100M+", l: "Sample Records\nHourly Resolution", c: C.teal },
  ];
  stats.forEach((st, i) => {
    const sx = 0.55 + i * 3.1;
    statBox(s, st.n, st.l, sx, 3.1, 2.88, 2.1, st.c);
  });

  // Bottom timeline band
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 5.35,
    w: 13.3,
    h: 2.15,
    fill: { color: C.panel },
    line: { color: C.tealDim, width: 0 },
  });
  divLine(s, 0, 5.35, 13.3, C.tealDim, 0.015);

  const timeProps = [
    { lbl: "TIMELINE", val: "March – June 2024\n3 months operational data" },
    { lbl: "GRANULARITY", val: "Hourly resolution\nVerified stockout labels" },
    {
      lbl: "HIERARCHY",
      val: "City → Store → Cat1 → Cat2 → SKU\nGeo + Product structure",
    },
    {
      lbl: "COVARIATES",
      val: "Weather, promotions, calendar\nHourly stock status arrays",
    },
  ];
  timeProps.forEach((tp, i) => {
    const tx = 0.55 + i * 3.1;
    eyebrow(s, tp.lbl, tx, 5.55, 3, C.teal);
    s.addText(tp.val, {
      x: tx,
      y: 5.82,
      w: 2.8,
      h: 1.5,
      fontSize: 10.5,
      fontFace: "Calibri",
      color: C.ivory,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 9 — BENCHMARK COMPARISON TABLE
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 2);

  eyebrow(s, "WHAT MAKES FRN-50K UNPRECEDENTED", 0.55, 0.35, 7, C.gold);
  s.addText("Benchmark Comparison", {
    x: 0.55,
    y: 0.62,
    w: 9,
    h: 0.85,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  const tableRows = [
    [
      {
        text: "Dimension",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
      {
        text: "M5",
        options: { bold: true, color: C.ivoryDim, fill: { color: C.void } },
      },
      {
        text: "Favorita",
        options: { bold: true, color: C.ivoryDim, fill: { color: C.void } },
      },
      {
        text: "Walmart",
        options: { bold: true, color: C.ivoryDim, fill: { color: C.void } },
      },
      {
        text: "FreshRetailNet-50K ★",
        options: { bold: true, color: C.goldPale, fill: { color: C.dusk } },
      },
    ],
    [
      "Stockout Labels",
      "None",
      "None",
      "None",
      {
        text: "✓ Verified Hourly",
        options: { color: C.teal, bold: true, fill: { color: C.dusk } },
      },
    ],
    [
      "Censoring Type",
      "None",
      "None",
      "None",
      {
        text: "MNAR (Structured)",
        options: { color: C.gold, fill: { color: C.dusk } },
      },
    ],
    [
      "Granularity",
      "Daily",
      "Daily",
      "Weekly",
      { text: "Hourly", options: { color: C.teal, fill: { color: C.dusk } } },
    ],
    [
      "Series Count",
      "30K",
      "174K",
      "3K",
      { text: "50K", options: { color: C.gold, fill: { color: C.dusk } } },
    ],
    [
      "Weather Data",
      "No",
      "No",
      "No",
      {
        text: "✓ Daily per store",
        options: { color: C.teal, fill: { color: C.dusk } },
      },
    ],
    [
      "Promotional Data",
      "Partial",
      "Partial",
      "No",
      {
        text: "✓ Hourly discount %",
        options: { color: C.teal, fill: { color: C.dusk } },
      },
    ],
    [
      "Geo Hierarchy",
      "Yes",
      "No",
      "No",
      {
        text: "✓ City + Product",
        options: { color: C.teal, fill: { color: C.dusk } },
      },
    ],
  ];

  s.addTable(tableRows, {
    x: 0.55,
    y: 1.6,
    w: 12.2,
    h: 5.4,
    border: { pt: 0.5, color: C.tealDim },
    fill: { color: C.panel },
    fontFace: "Calibri",
    fontSize: 10.5,
    color: C.ivory,
    colW: [2.3, 1.9, 1.9, 1.9, 2.9],
    rowH: 0.62,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 10 — STATISTICAL PROPERTIES
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 2);

  eyebrow(s, "ANATOMY OF THE DATA", 0.55, 0.35, 5, C.gold);
  s.addText("Key Statistical Properties", {
    x: 0.55,
    y: 0.62,
    w: 8,
    h: 0.85,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 1.5, 12.2, C.goldDim, 0.007);

  const props = [
    {
      key: "Power-Law Demand",
      val: "Distribution follows α = 2.83 (KS p < 0.03). Top 20% of SKUs drive 51.8% of transactions — classic long-tail challenge.",
      c: C.gold,
    },
    {
      key: "Temporal Cyclicity",
      val: "Weekdays: bimodal peaks at 09:00 and 16:00. Weekends: single amplified morning surge with ~2× weekday intensity.",
      c: C.teal,
    },
    {
      key: "MNAR Censoring",
      val: "Stockout rates follow U-shaped diurnal curve: <2% post-restock at 6 AM, rising monotonically to 26% by 8 PM.",
      c: C.red,
    },
    {
      key: "Promotional Effects",
      val: "Active promotions yield median 1.43× sales uplift (IQR: 1.05×–2.06×). Holiday periods carry 1.27× demand multiplier.",
      c: C.gold,
    },
    {
      key: "Weather Effects",
      val: "Rainfall increases vegetable demand +11% via offline-to-online substitution (β = +0.108). Temperature has category-divergent effects.",
      c: C.teal,
    },
  ];

  props.forEach((p, i) => {
    const py = 1.68 + i * 1.02;
    divLine(s, 0.55, py, 12.2, p.c + "40", 0.006);
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55,
      py,
      w: 0.04,
      h: 0.88,
      x: 0.55,
      y: py + 0.08,
      w: 0.04,
      h: 0.78,
      fill: { color: p.c },
      line: { color: p.c, width: 0 },
    });
    s.addText(p.key, {
      x: 0.75,
      y: py + 0.08,
      w: 3.0,
      h: 0.38,
      fontSize: 13,
      fontFace: "Calibri",
      color: p.c,
      bold: true,
      align: "left",
      margin: 0,
    });
    s.addText(p.val, {
      x: 0.75,
      y: py + 0.48,
      w: 11.8,
      h: 0.45,
      fontSize: 10.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 11 — THE ARCHITECTURE OVERVIEW
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 3);

  eyebrow(s, "THE ARCHITECTURE", 0.55, 0.35, 5, C.teal);
  s.addText("Two Stages,\nOne Truth", {
    x: 0.55,
    y: 0.62,
    w: 6.5,
    h: 1.35,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  s.addText("Fix the data first. Simplify everything downstream.", {
    x: 0.55,
    y: 2.05,
    w: 7,
    h: 0.45,
    fontSize: 13,
    fontFace: "Calibri",
    color: C.ivoryDim,
    italic: true,
    align: "left",
    margin: 0,
  });

  // Stage 1 Block
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 2.65,
    w: 5.4,
    h: 4.3,
    fill: { color: C.panel },
    line: { color: C.gold, width: 1.0 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 2.65,
    w: 5.4,
    h: 0.06,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
  });
  eyebrow(s, "STAGE 1", 0.75, 2.78, 3, C.gold);
  s.addText("Latent Demand Recovery", {
    x: 0.75,
    y: 3.05,
    w: 4.9,
    h: 0.65,
    fontSize: 19,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  const s1steps = [
    "Ingest FreshRetailNet-50K Parquet files",
    "62-feature engineering (5 groups)",
    "MNAR simulation: 15% masking on in-stock rows",
    "LightGBM with Tweedie objective (p=1.5)",
    "Post-hoc scalar calibration (c = 1.0748)",
    "Demand reconstruction: dₜ = yₜ⊙sₜ + d̂ₜ⊙(1−sₜ)",
  ];
  s1steps.forEach((st, i) => {
    s.addText(`${i + 1}.  ${st}`, {
      x: 0.75,
      y: 3.72 + i * 0.48,
      w: 4.9,
      h: 0.42,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: i === 3 ? C.goldPale : C.ivoryDim,
      align: "left",
      bold: i === 3,
      margin: 0,
    });
  });

  // Arrow
  s.addText("→", {
    x: 6.05,
    y: 4.4,
    w: 1.1,
    h: 0.7,
    fontSize: 36,
    fontFace: "Palatino Linotype",
    color: C.gold,
    align: "center",
    margin: 0,
  });
  s.addText("RECOVERED\nDEMAND Dₜ", {
    x: 5.85,
    y: 5.1,
    w: 1.5,
    h: 0.85,
    fontSize: 7,
    fontFace: "Calibri",
    color: C.gold,
    charSpacing: 1,
    align: "center",
    margin: 0,
  });

  // Stage 2 Block
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.35,
    y: 2.65,
    w: 5.4,
    h: 4.3,
    fill: { color: C.panel },
    line: { color: C.teal, width: 1.0 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.35,
    y: 2.65,
    w: 5.4,
    h: 0.06,
    fill: { color: C.teal },
    line: { color: C.teal, width: 0 },
  });
  eyebrow(s, "STAGE 2", 7.55, 2.78, 3, C.teal);
  s.addText("7-Day Demand Forecasting", {
    x: 7.55,
    y: 3.05,
    w: 4.9,
    h: 0.65,
    fontSize: 19,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  const s2steps = [
    "Recovered demand Dₜ as primary input",
    "64-feature engineering (extends Stage 1)",
    "SSA statistical baseline · LightGBM · MLP",
    "Per-horizon weighted ensemble blending",
    "Per-horizon bias calibration cₕ ∈ [1.052, 1.109]",
    "7-day forecasts ens_h1 through ens_h7",
  ];
  s2steps.forEach((st, i) => {
    s.addText(`${i + 1}.  ${st}`, {
      x: 7.55,
      y: 3.72 + i * 0.48,
      w: 4.9,
      h: 0.42,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: i === 3 ? C.tealGlow : C.ivoryDim,
      align: "left",
      bold: i === 3,
      margin: 0,
    });
  });

  // Presented by
  caption(
    s,
    "Pipeline Architecture presented by Ayush Vaibhav Gond",
    0.55,
    7.12,
    12.2,
    C.ivoryFar,
    8.5,
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 12 — THE MATHEMATICS OF RECOVERY
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 3);

  eyebrow(s, "RECONSTRUCTING TRUTH", 0.55, 0.35, 5, C.teal);
  s.addText("The Mathematics\nof Recovery", {
    x: 0.55,
    y: 0.62,
    w: 8,
    h: 1.35,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  const eqs = [
    {
      lbl: "EQ 1 — CENSORING MECHANISM",
      f: "sₜ = 1  if iₜ > 0  (in-stock)\nsₜ = 0  if iₜ = 0  (stockout)",
      x: 0.55,
      y: 2.1,
      w: 5.8,
    },
    {
      lbl: "EQ 2 — DEMAND RECOVERY",
      f: "dₜ = yₜ ⊙ sₜ  +  d̂ₜ ⊙ (1 − sₜ)",
      x: 6.95,
      y: 2.1,
      w: 5.8,
    },
    {
      lbl: "EQ 3 — BIAS CALIBRATION",
      f: "c = Σyₜ / Σd̂ₜ   (over in-stock rows)\nc ∈ [0.80, 1.25]   →   c = 1.0748",
      x: 0.55,
      y: 4.05,
      w: 5.8,
    },
    {
      lbl: "EQ 4 — WAPE METRIC",
      f: "WAPE = Σ|dₜ − yₜ| / Σyₜ\nDemand-weighted. Primary stopping metric.",
      x: 6.95,
      y: 4.05,
      w: 5.8,
    },
    {
      lbl: "EQ 5 — WPE (BIAS)",
      f: "WPE = Σ(dₜ − yₜ) / Σyₜ\nPositive = overestimate, Negative = under",
      x: 0.55,
      y: 6.0,
      w: 5.8,
    },
    {
      lbl: "EQ 6 — DECOUPLING SCORE ρ_DS",
      f: "ρ_DS = Σᵢ wᵢ · Pearson(SRᵢ, dᵢ)\nTarget: near zero  ·  Our result: +0.46",
      x: 6.95,
      y: 6.0,
      w: 5.8,
    },
  ];

  eqs.forEach((eq) => {
    formulaBox(s, eq.lbl, eq.f, eq.x, eq.y, eq.w, 1.72);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 13 — FEATURE ENGINEERING (62 FEATURES)
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 4);

  eyebrow(s, "STAGE 1 — DEEP DIVE", 0.55, 0.35, 5, C.gold);
  s.addText("Engineering the Signal:\n62 Features Across 5 Groups", {
    x: 0.55,
    y: 0.62,
    w: 8.5,
    h: 1.35,
    fontSize: 36,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.0, 12.2, C.goldDim, 0.007);

  const groups = [
    {
      icon: "◷",
      name: "Calendar",
      count: "10",
      items:
        "DOW, month, week-of-year, day-of-month, holiday flag, is-weekend, cyclic sin/cos(DOW), cyclic sin/cos(month)",
      c: C.gold,
    },
    {
      icon: "⊕",
      name: "Promotional",
      count: "5",
      items:
        "Discount rate, activity flag, promo uplift prior, discount² (nonlinear), discount × stockout risk",
      c: C.teal,
    },
    {
      icon: "⌁",
      name: "Weather",
      count: "10",
      items:
        "Precipitation (mm), temperature (°C), humidity (%), wind level, rain demand/stockout effects, is-rainy, temp × frozen, temp × meat",
      c: C.tealGlow,
    },
    {
      icon: "∿",
      name: "Lag & Rolling",
      count: "16",
      items:
        "Lags at 1, 7, 14, 28 days (NaN on stockout — critical design). Rolling mean/std/max over 7/14/30-day windows. DOW expanding mean.",
      c: C.gold,
    },
    {
      icon: "⊞",
      name: "Entity & Hourly",
      count: "21",
      items:
        "City, store (label-encoded), 3 category levels, product ID, pair mean μᵢ, availability ratio, demand uplift prior, is-top-SKU, in_stock_lag1, so_frac_lag1",
      c: C.teal,
    },
  ];

  groups.forEach((g, i) => {
    const gx = 0.55 + (i % 3) * 4.2;
    const gy = i < 3 ? 2.18 : 4.55;
    const w = i < 3 ? 3.95 : i === 3 ? 5.5 : 5.5;
    const x = i === 3 ? 0.55 : i === 4 ? 6.6 : gx;
    const wy = i < 3 ? 2.15 : 2.65;

    s.addShape(pres.shapes.RECTANGLE, {
      x,
      y: gy,
      w,
      h: wy,
      fill: { color: C.panel },
      line: { color: g.c, width: 0.6 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x,
      y: gy,
      w,
      h: 0.04,
      fill: { color: g.c },
      line: { color: g.c, width: 0 },
    });
    s.addText(`${g.icon}  ${g.name}`, {
      x: x + 0.18,
      y: gy + 0.1,
      w: w - 0.4,
      h: 0.4,
      fontSize: 13,
      fontFace: "Calibri",
      color: g.c,
      bold: true,
      align: "left",
      margin: 0,
    });
    s.addText(g.count + " features", {
      x: x + 0.18,
      y: gy + 0.48,
      w: w - 0.4,
      h: 0.3,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.ivoryFar,
      charSpacing: 2,
      align: "left",
      margin: 0,
    });
    s.addText(g.items, {
      x: x + 0.18,
      y: gy + 0.8,
      w: w - 0.36,
      h: wy - 0.92,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });

  // Causality rule note
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 7.15,
    w: 12.2,
    h: 0.26,
    fill: { color: C.tealDim, transparency: 40 },
    line: { color: C.teal, width: 0.4 },
  });
  s.addText(
    "Causality Rule: Demand features from hours_sale shifted by T-1 day to prevent leakage. Supply features (stock status) safe for same-day use.",
    {
      x: 0.75,
      y: 7.17,
      w: 11.8,
      h: 0.2,
      fontSize: 8.5,
      fontFace: "Calibri",
      color: C.teal,
      align: "left",
      margin: 0,
    },
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 14 — THREE CANDIDATE MODELS COMPARED
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 4);

  eyebrow(s, "STAGE 1 — CANDIDATE MODELS", 0.55, 0.35, 6, C.gold);
  s.addText("Three Candidates.\nOne Champion.", {
    x: 0.55,
    y: 0.62,
    w: 8,
    h: 1.35,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.0, 12.2, C.goldDim, 0.007);

  // RF
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 2.2,
    w: 3.8,
    h: 4.9,
    fill: { color: C.panel },
    line: { color: C.ivoryFar, width: 0.6 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 2.2,
    w: 3.8,
    h: 0.04,
    fill: { color: C.ivoryFar },
    line: { color: C.ivoryFar, width: 0 },
  });
  s.addText("Random Forest", {
    x: 0.75,
    y: 2.32,
    w: 3.4,
    h: 0.42,
    fontSize: 14,
    fontFace: "Calibri",
    color: C.ivoryDim,
    bold: true,
    align: "left",
    margin: 0,
  });
  s.addText("Non-boosted Baseline", {
    x: 0.75,
    y: 2.72,
    w: 3.4,
    h: 0.3,
    fontSize: 9,
    fontFace: "Calibri",
    color: C.ivoryFar,
    charSpacing: 2,
    align: "left",
    margin: 0,
  });
  s.addText("28.50%", {
    x: 0.75,
    y: 3.08,
    w: 3.4,
    h: 0.8,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivoryDim,
    align: "left",
    margin: 0,
  });
  s.addText("WAPE", {
    x: 0.75,
    y: 3.85,
    w: 3.4,
    h: 0.3,
    fontSize: 9,
    fontFace: "Calibri",
    color: C.ivoryFar,
    charSpacing: 3,
    align: "left",
    margin: 0,
  });
  s.addText(
    "500 trees · No Tweedie objective · Relies entirely on power-law sample weighting. Cannot replicate log-space optimization. Higher memory overhead.",
    {
      x: 0.75,
      y: 4.2,
      w: 3.4,
      h: 2.6,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    },
  );

  // XGBoost
  s.addShape(pres.shapes.RECTANGLE, {
    x: 4.75,
    y: 2.2,
    w: 3.8,
    h: 4.9,
    fill: { color: C.panel },
    line: { color: C.ivoryFar, width: 0.6 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 4.75,
    y: 2.2,
    w: 3.8,
    h: 0.04,
    fill: { color: C.ivoryFar },
    line: { color: C.ivoryFar, width: 0 },
  });
  s.addText("XGBoost", {
    x: 4.95,
    y: 2.32,
    w: 3.4,
    h: 0.42,
    fontSize: 14,
    fontFace: "Calibri",
    color: C.ivoryDim,
    bold: true,
    align: "left",
    margin: 0,
  });
  s.addText("Tweedie Gradient Boosting", {
    x: 4.95,
    y: 2.72,
    w: 3.4,
    h: 0.3,
    fontSize: 9,
    fontFace: "Calibri",
    color: C.ivoryFar,
    charSpacing: 2,
    align: "left",
    margin: 0,
  });
  s.addText("28.52%", {
    x: 4.95,
    y: 3.08,
    w: 3.4,
    h: 0.8,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivoryDim,
    align: "left",
    margin: 0,
  });
  s.addText("WAPE", {
    x: 4.95,
    y: 3.85,
    w: 3.4,
    h: 0.3,
    fontSize: 9,
    fontFace: "Calibri",
    color: C.ivoryFar,
    charSpacing: 3,
    align: "left",
    margin: 0,
  });
  s.addText(
    "reg:tweedie · variance power 1.5 · lossguide growth policy. Comparable WAPE to LightGBM but slower histogram construction on 2.7M-row training set.",
    {
      x: 4.95,
      y: 4.2,
      w: 3.4,
      h: 2.6,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    },
  );

  // LightGBM winner
  s.addShape(pres.shapes.RECTANGLE, {
    x: 8.95,
    y: 2.0,
    w: 3.8,
    h: 5.3,
    fill: { color: C.dusk },
    line: { color: C.gold, width: 1.2 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 8.95,
    y: 2.0,
    w: 3.8,
    h: 0.05,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
  });
  eyebrow(s, "★ CHAMPION", 9.15, 2.12, 3.4, C.gold);
  s.addText("LightGBM", {
    x: 9.15,
    y: 2.36,
    w: 3.4,
    h: 0.5,
    fontSize: 18,
    fontFace: "Palatino Linotype",
    color: C.goldPale,
    align: "left",
    margin: 0,
  });
  s.addText("Tweedie · Leaf-wise Growth", {
    x: 9.15,
    y: 2.85,
    w: 3.4,
    h: 0.3,
    fontSize: 9,
    fontFace: "Calibri",
    color: C.gold,
    charSpacing: 2,
    align: "left",
    margin: 0,
  });
  s.addText("27.83%", {
    x: 9.15,
    y: 3.18,
    w: 3.4,
    h: 0.88,
    fontSize: 42,
    fontFace: "Palatino Linotype",
    color: C.gold,
    align: "left",
    margin: 0,
  });
  s.addText("WAPE", {
    x: 9.15,
    y: 4.03,
    w: 3.4,
    h: 0.3,
    fontSize: 9,
    fontFace: "Calibri",
    color: C.gold,
    charSpacing: 3,
    align: "left",
    margin: 0,
  });
  const lgbmDetails = [
    "objective: tweedie",
    "variance_power: 1.5",
    "345 trees (ES@150)",
    "calib factor: 1.0748",
    "WPE (post-calib): +0.00%",
    "ρ_DS: +0.46",
  ];
  lgbmDetails.forEach((d, i) => {
    s.addText(`·  ${d}`, {
      x: 9.15,
      y: 4.4 + i * 0.42,
      w: 3.4,
      h: 0.38,
      fontSize: 9.5,
      fontFace: "Courier New",
      color: C.tealGlow,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 15 — THE TWEEDIE OBJECTIVE
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 4);

  eyebrow(s, "WHY TWEEDIE", 0.55, 0.35, 4, C.gold);
  s.addText("The Loss Function\nIs the Architecture", {
    x: 0.55,
    y: 0.62,
    w: 7.5,
    h: 1.35,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  // Central formula
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 2.1,
    w: 12.2,
    h: 2.5,
    fill: { color: "0A1525" },
    line: { color: C.gold, width: 0.8 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 2.1,
    w: 12.2,
    h: 0.04,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
  });
  eyebrow(s, "TWEEDIE LOG-LIKELIHOOD", 0.75, 2.22, 6, C.gold);
  s.addText(
    "Var(Y) ∝ μᵖ    where p = 1.5  →  between Poisson (p=1) and Gamma (p=2)",
    {
      x: 0.75,
      y: 2.52,
      w: 11.6,
      h: 0.52,
      fontSize: 18,
      fontFace: "Palatino Linotype",
      color: C.goldPale,
      align: "left",
      margin: 0,
    },
  );
  s.addText(
    "log-link ensures non-negative outputs  ·  spans 3 orders of magnitude  ·  zero-inflated power-law demand (α = 2.83)",
    {
      x: 0.75,
      y: 3.1,
      w: 11.6,
      h: 0.4,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.teal,
      align: "left",
      margin: 0,
    },
  );
  s.addText(
    "L = −y·exp(−(1−p)·θ)/(1−p)  +  exp((2−p)·θ)/(2−p)    where θ = log(μ)",
    {
      x: 0.75,
      y: 3.55,
      w: 11.6,
      h: 0.45,
      fontSize: 11,
      fontFace: "Courier New",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    },
  );

  // Three pillars
  const pillars = [
    {
      title: "Zero-Inflated",
      body: "Retail demand contains many zero-demand days for slow SKUs. Tweedie natively handles this compound distribution — a mix of zero mass and continuous positive demand.",
      c: C.gold,
    },
    {
      title: "Heavy-Tailed",
      body: "Power-law α = 2.83 means demand spans orders of magnitude. Log-link maps predictions into log-space, compressing outlier influence without explicit clipping.",
      c: C.teal,
    },
    {
      title: "Power-Law Weights",
      body: "Sample weights wᵢ ∝ μᵢ^(1/α) up-weight high-demand pairs. Clamped to [0.1, 10] and normalized. This 0.67 pp WAPE gap over RF cannot be closed by weighting alone.",
      c: C.gold,
    },
  ];
  pillars.forEach((p, i) => {
    const px = 0.55 + i * 4.2;
    infoBadge(s, "", p.title, p.body, px, 4.8, 3.95, 2.35, p.c);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 16 — MNAR SIMULATION STRATEGY
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 4);

  eyebrow(s, "VALIDATION STRATEGY", 0.55, 0.35, 5, C.teal);
  s.addText("MNAR Simulation —\nSynthetic Ground Truth", {
    x: 0.55,
    y: 0.62,
    w: 8.5,
    h: 1.35,
    fontSize: 40,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.0, 12.2, C.tealDim, 0.007);

  const steps = [
    {
      n: "01",
      title: "Identify In-Stock Rows",
      body: "Filter all rows where stock_hour6_22_cnt ≤ 2. These are genuine in-stock days with verified ground truth demand from the Dingdong operational data.",
      c: C.gold,
    },
    {
      n: "02",
      title: "Demand-Proportional Masking",
      body: "Synthetically mask 15% of in-stock rows with probability ∝ demand level. This replicates the real-world MNAR pattern: high-demand days are more likely to stock out.",
      c: C.teal,
    },
    {
      n: "03",
      title: "Temporal Split",
      body: "Last 20% of data by date → validation set. Split date: 2024-06-08. This prevents data leakage from future promotional information contaminating the training set.",
      c: C.gold,
    },
    {
      n: "04",
      title: "Ground Truth Evaluation",
      body: "On the masked validation rows, we compare model-recovered demand d̂ₜ against the known true demand dₜ. WAPE and WPE computed exclusively on these MNAR-simulated rows.",
      c: C.teal,
    },
  ];

  steps.forEach((st, i) => {
    const sy = 2.2 + i * 1.22;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55,
      y: sy,
      w: 12.2,
      h: 1.1,
      fill: { color: C.panel },
      line: { color: st.c, width: 0.5 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55,
      y: sy,
      w: 0.04,
      h: 1.1,
      fill: { color: st.c },
      line: { color: st.c, width: 0 },
    });
    s.addText(st.n, {
      x: 0.75,
      y: sy + 0.1,
      w: 0.55,
      h: 0.9,
      fontSize: 20,
      fontFace: "Palatino Linotype",
      color: st.c,
      italic: true,
      align: "left",
      valign: "middle",
      margin: 0,
    });
    s.addText(st.title, {
      x: 1.45,
      y: sy + 0.12,
      w: 4.5,
      h: 0.38,
      fontSize: 12,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "left",
      margin: 0,
    });
    s.addText(st.body, {
      x: 1.45,
      y: sy + 0.5,
      w: 11.1,
      h: 0.52,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 7.1,
    w: 12.2,
    h: 0.3,
    fill: { color: C.tealDim, transparency: 50 },
    line: { color: C.teal, width: 0.4 },
  });
  s.addText(
    "2.7M in-stock training rows  ·  Split date: 2024-06-08  ·  15% MNAR masking rate  ·  Demand-proportional probability",
    {
      x: 0.75,
      y: 7.15,
      w: 11.8,
      h: 0.22,
      fontSize: 8.5,
      fontFace: "Calibri",
      color: C.teal,
      align: "left",
      margin: 0,
      charSpacing: 1,
    },
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 17 — STAGE 1 RESULTS
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 4);

  eyebrow(s, "STAGE 1 — LATENT DEMAND RECOVERY RESULTS", 0.55, 0.35, 8, C.gold);
  s.addText("LightGBM Matches\nDeep Learning — at Fraction of Compute", {
    x: 0.55,
    y: 0.62,
    w: 10,
    h: 1.35,
    fontSize: 34,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  // Results chart - native BAR
  const chartData = [
    {
      name: "WAPE (%)",
      labels: [
        "Raw Sales\nBaseline",
        "ImputeFormer\n(Paper)",
        "DLinear\n(Paper)",
        "XGBoost\n(Ours)",
        "Random Forest\n(Ours)",
        "LightGBM\n(Ours)",
        "TimesNet\n(Paper)",
      ],
      values: [null, 35.65, 29.99, 28.52, 28.5, 27.83, 27.62],
    },
  ];

  s.addChart(pres.charts.BAR, chartData, {
    x: 0.55,
    y: 2.1,
    w: 7.5,
    h: 4.8,
    barDir: "col",
    chartColors: [
      "C84B31",
      "7A4F2A",
      "8A7040",
      "5A7080",
      "6A8090",
      "C9A84C",
      "4A7060",
    ],
    chartArea: { fill: { color: C.panel }, border: { pt: 0, color: C.panel } },
    catAxisLabelColor: C.ivoryDim,
    valAxisLabelColor: C.ivoryFar,
    valGridLine: { color: C.tealDim, size: 0.3 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelColor: C.ivory,
    dataLabelFontSize: 9,
    showLegend: false,
    valAxisMinVal: 26,
    valAxisMaxVal: 38,
  });

  // Right side insight panel
  const ins = [
    { n: "27.83%", l: "LightGBM WAPE\n345 trees · No GPU", c: C.gold },
    {
      n: "27.62%",
      l: "TimesNet (Paper)\nDeep learning benchmark",
      c: C.ivoryDim,
    },
    {
      n: "+0.00%",
      l: "WPE after calibration\nPerfect bias correction",
      c: C.teal,
    },
    { n: "+0.46", l: "ρ_DS score\nvs +0.07 (TimesNet)", c: C.red },
  ];

  ins.forEach((n, i) => {
    const ny = 2.1 + i * 1.2;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 8.4,
      y: ny,
      w: 4.45,
      h: 1.08,
      fill: { color: C.panel },
      line: { color: n.c, width: 0.6 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 8.4,
      y: ny,
      w: 0.04,
      h: 1.08,
      fill: { color: n.c },
      line: { color: n.c, width: 0 },
    });
    s.addText(n.n, {
      x: 8.62,
      y: ny + 0.08,
      w: 4.1,
      h: 0.5,
      fontSize: 26,
      fontFace: "Palatino Linotype",
      color: n.c,
      align: "left",
      margin: 0,
    });
    s.addText(n.l, {
      x: 8.62,
      y: ny + 0.58,
      w: 4.1,
      h: 0.45,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 18 — DIAGNOSTIC VISUALIZATIONS PLACEHOLDER
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 4);

  eyebrow(s, "STAGE 1 — DIAGNOSTIC PANEL", 0.55, 0.35, 6, C.teal);
  s.addText("Recovery Diagnostics", {
    x: 0.55,
    y: 0.62,
    w: 8,
    h: 0.85,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 1.5, 12.2, C.tealDim, 0.007);

  // Left placeholder — predicted vs actual scatter
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 1.7,
    w: 5.8,
    h: 4.2,
    fill: { color: C.panel },
    line: { color: C.tealDim, width: 0.6 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 1.7,
    w: 5.8,
    h: 0.04,
    fill: { color: C.teal },
    line: { color: C.teal, width: 0 },
  });
  eyebrow(s, "A. PREDICTED vs. ACTUAL SCATTER", 0.75, 1.82, 5.2, C.teal);
  s.addText("[Insert stage1_diagnostics_v5.png]", {
    x: 0.75,
    y: 2.12,
    w: 5.4,
    h: 3.5,
    fontSize: 11,
    fontFace: "Calibri",
    color: C.ivoryFar,
    italic: true,
    align: "center",
    valign: "middle",
    margin: 0,
  });
  s.addText(
    "WAPE: 27.83%  ·  WPE: +0.00%\nResiduals symmetric around zero (mean = −0.083)",
    {
      x: 0.55,
      y: 5.95,
      w: 5.8,
      h: 0.55,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "center",
      margin: 0,
    },
  );

  // Right placeholder — time series recovery
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.95,
    y: 1.7,
    w: 5.8,
    h: 4.2,
    fill: { color: C.panel },
    line: { color: C.goldDim, width: 0.6 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.95,
    y: 1.7,
    w: 5.8,
    h: 0.04,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
  });
  eyebrow(
    s,
    "B. TIME SERIES RECOVERY (April–June 2024)",
    7.15,
    1.82,
    5.2,
    C.gold,
  );
  s.addText("[Insert stage1_recovery_visualization.png]", {
    x: 7.15,
    y: 2.12,
    w: 5.4,
    h: 3.5,
    fontSize: 11,
    fontFace: "Calibri",
    color: C.ivoryFar,
    italic: true,
    align: "center",
    valign: "middle",
    margin: 0,
  });
  s.addText(
    "Observed vs. recovered demand · Stockout shading visible\nImputed demand carries mean 1.33× uplift on stockout days",
    {
      x: 6.95,
      y: 5.95,
      w: 5.8,
      h: 0.55,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "center",
      margin: 0,
    },
  );

  caption(
    s,
    "Presented by Parth Sidhu & Srijan Gupta  ·  Pair-level mean demand acts as anchor predictor  ·  Imputation systematically applies ~1.42× mean correction on stockout days",
    0.55,
    7.15,
    12.2,
    C.ivoryFar,
    8.5,
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 19 — SECTION DIVIDER: SIGNALS THROUGH DARKNESS (Stage 2)
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);

  // Full atmospheric divide
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 13.3,
    h: 7.5,
    fill: { color: C.night, transparency: 30 },
    line: { color: C.night, width: 0 },
  });

  vertLine(s, 6.5, 0, 7.5, C.teal, 0.02);

  s.addText("Stage II", {
    x: 0.6,
    y: 1.5,
    w: 5.6,
    h: 1.2,
    fontSize: 80,
    fontFace: "Palatino Linotype",
    color: C.ivoryFar,
    italic: true,
    align: "left",
    margin: 0,
  });
  s.addText("Signals\nThrough\nDarkness", {
    x: 6.8,
    y: 1.2,
    w: 6.2,
    h: 4.5,
    fontSize: 58,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  divLine(s, 0.6, 5.8, 5.8, C.gold, 0.01);
  s.addText(
    "Seven days ahead. Fifty thousand pairs.\nThe recovered signal becomes the forecast.",
    {
      x: 0.6,
      y: 5.95,
      w: 5.6,
      h: 1.2,
      fontSize: 12,
      fontFace: "Calibri",
      color: C.ivoryDim,
      italic: true,
      align: "left",
      margin: 0,
    },
  );

  eyebrow(s, "7-DAY DEMAND FORECASTING", 6.8, 6.8, 6, C.teal);
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 20 — STAGE 2 SETUP
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 5);

  eyebrow(s, "STAGE 2 — DEEP DIVE", 0.55, 0.35, 5, C.teal);
  s.addText("7-Day Demand Forecasting\nOn 4.5M Rows", {
    x: 0.55,
    y: 0.62,
    w: 9,
    h: 1.35,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.02, 12.2, C.tealDim, 0.007);

  formulaBox(
    s,
    "STAGE 2 FORECASTING OBJECTIVE",
    "D̂_{T+1:T+7} = f(D_{T-H:T}, P_{T-H:T+7}, W_{T-H:T+7}, C_{T-H:T+7})\n\nD = recovered demand  ·  P = promotions  ·  W = weather  ·  C = calendar",
    0.55,
    2.2,
    12.2,
    1.55,
  );

  const pillars = [
    {
      title: "Data Integrity",
      body: "Trained on all 50,000 store-product pairs — full 4.5M-row dataset. No sampling, no subset. The complete operational picture.",
      c: C.gold,
    },
    {
      title: "Direct Multi-Step",
      body: "7 independent models (one per horizon h=1–7). Avoids recursive error accumulation of autoregressive forecasting. Each horizon optimized independently.",
      c: C.teal,
    },
    {
      title: "Future Covariates",
      body: "Integrates future-known promotional schedules, weather forecasts, and calendar events. Horizon index h passed as explicit feature to each model.",
      c: C.gold,
    },
    {
      title: "64 Features",
      body: "Extends Stage 1's 62 features with: recovered demand lags (clean signal), 7 horizon index features, future promo/weather covariates. No leakage — entity stats from train only.",
      c: C.teal,
    },
  ];

  pillars.forEach((p, i) => {
    const px = 0.55 + (i % 2) * 6.25;
    const py = 3.95 + Math.floor(i / 2) * 1.65;
    infoBadge(s, "", p.title, p.body, px, py, 5.95, 1.52, p.c);
  });

  caption(
    s,
    "Presented by Parth Sidhu & Srijan Gupta  ·  Test period: 2024-06-12 to 2024-06-25",
    0.55,
    7.18,
    12.2,
    C.ivoryFar,
    8.5,
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 21 — FOUR STAGE 2 MODELS
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 5);

  eyebrow(s, "STAGE 2 — FORECASTING MODELS EVALUATED", 0.55, 0.35, 7, C.gold);
  s.addText("Four Approaches.\nOne Ensemble.", {
    x: 0.55,
    y: 0.62,
    w: 8,
    h: 1.35,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.02, 12.2, C.goldDim, 0.007);

  const models = [
    {
      name: "SSA",
      type: "Statistical Baseline",
      wape: "39.94%",
      wpe: "−11.78%",
      body: "Similar Scenario Average — 3-level fallback lookup over historical in-stock days. Averages recovered demand conditioned on (store, SKU, DOW). Establishes baseline difficulty.",
      accent: C.ivoryFar,
    },
    {
      name: "LightGBM",
      type: "Multi-Horizon",
      wape: "29.36%",
      wpe: "−7.81%",
      body: "7 independent models (h=1→7). Direct multi-step strategy with horizon index as feature. Column_37 (recovered demand lag) is dominant feature by gain — validating the two-stage design.",
      accent: C.gold,
    },
    {
      name: "MLP",
      type: "Tabular Neural Net",
      wape: "30.69%",
      wpe: "−5.86%",
      body: "BatchNorm → 256 → ReLU → Dropout(0.2) → 128 → ReLU → Dropout → Softplus. Huber loss. Softplus ensures strictly positive outputs with smooth gradients — lowest systematic bias of all models.",
      accent: C.teal,
    },
    {
      name: "Ensemble",
      type: "Weighted LGB + MLP  ★",
      wape: "29.30%",
      wpe: "−7.35%",
      body: "Per-horizon weight w*ₕ via grid search minimizing WAPE on in-stock test rows. LGB dominant (w* ∈ [0.75–1.00]). MLP corrects near-horizon bias. Calibration cₕ ∈ [1.052, 1.109].",
      accent: C.goldPale,
    },
  ];

  models.forEach((m, i) => {
    const mx = 0.55 + (i % 2) * 6.25;
    const my = 2.2 + Math.floor(i / 2) * 2.55;
    s.addShape(pres.shapes.RECTANGLE, {
      x: mx,
      y: my,
      w: 5.95,
      h: 2.35,
      fill: { color: C.panel },
      line: { color: m.accent, width: i === 3 ? 1.2 : 0.5 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: mx,
      y: my,
      w: 5.95,
      h: 0.04,
      fill: { color: m.accent },
      line: { color: m.accent, width: 0 },
    });
    s.addText(m.name, {
      x: mx + 0.18,
      y: my + 0.1,
      w: 3,
      h: 0.45,
      fontSize: 17,
      fontFace: "Palatino Linotype",
      color: m.accent,
      align: "left",
      margin: 0,
    });
    s.addText(m.type, {
      x: mx + 0.18,
      y: my + 0.52,
      w: 3.5,
      h: 0.3,
      fontSize: 8.5,
      fontFace: "Calibri",
      color: C.ivoryFar,
      charSpacing: 1.5,
      align: "left",
      margin: 0,
    });
    s.addText(m.wape, {
      x: mx + 3.5,
      y: my + 0.1,
      w: 2.2,
      h: 0.55,
      fontSize: 24,
      fontFace: "Palatino Linotype",
      color: m.accent,
      align: "right",
      margin: 0,
    });
    s.addText("WAPE", {
      x: mx + 3.5,
      y: my + 0.62,
      w: 2.2,
      h: 0.25,
      fontSize: 7.5,
      fontFace: "Calibri",
      color: C.ivoryFar,
      charSpacing: 2,
      align: "right",
      margin: 0,
    });
    s.addText(m.body, {
      x: mx + 0.18,
      y: my + 0.88,
      w: 5.58,
      h: 1.32,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 22 — PER-HORIZON ANALYSIS
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 5);

  eyebrow(
    s,
    "BEYOND OBSERVED SALES — PER-HORIZON DECAY",
    0.55,
    0.35,
    7,
    C.teal,
  );
  s.addText("7 Days Out.\nError Accumulates.", {
    x: 0.55,
    y: 0.62,
    w: 8,
    h: 1.35,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.02, 8.6, C.tealDim, 0.007);

  // Horizon bar chart
  const horizonData = [
    {
      name: "Ensemble WAPE (%)",
      labels: ["h=1", "h=2", "h=3", "h=4", "h=5", "h=6", "h=7"],
      values: [28.09, 28.49, 29.15, 29.24, 29.88, 30.2, 30.05],
    },
  ];
  s.addChart(pres.charts.LINE, horizonData, {
    x: 0.55,
    y: 2.2,
    w: 7.8,
    h: 4.4,
    chartColors: [C.gold],
    chartArea: { fill: { color: C.panel }, border: { pt: 0, color: C.panel } },
    catAxisLabelColor: C.ivoryDim,
    valAxisLabelColor: C.ivoryFar,
    valGridLine: { color: C.tealDim, size: 0.3 },
    catGridLine: { style: "none" },
    lineSize: 2.5,
    lineSmooth: true,
    showValue: true,
    dataLabelColor: C.goldPale,
    dataLabelFontSize: 10,
    valAxisMinVal: 27,
    valAxisMaxVal: 31,
    showLegend: false,
  });

  // Right — horizon breakdown table
  const rows = [
    [
      {
        text: "Horizon",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
      {
        text: "WAPE",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
      {
        text: "w*ₕ",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
      {
        text: "cₕ",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
    ],
    ["h = 1", "28.09%", "0.80", "1.052"],
    ["h = 2", "28.49%", "0.80", "1.061"],
    ["h = 3", "29.15%", "0.75", "1.072"],
    ["h = 4", "29.24%", "0.90", "1.085"],
    ["h = 5", "29.88%", "0.90", "1.092"],
    [
      "h = 6",
      { text: "30.20%", options: { color: C.red } },
      "0.75",
      { text: "1.109", options: { color: C.red } },
    ],
    [
      "h = 7",
      "30.05%",
      { text: "1.00 (pure LGB)", options: { color: C.gold } },
      "1.098",
    ],
  ];
  s.addTable(rows, {
    x: 8.65,
    y: 2.2,
    w: 4.1,
    h: 4.4,
    border: { pt: 0.5, color: C.tealDim },
    fill: { color: C.panel },
    fontFace: "Calibri",
    fontSize: 9.5,
    color: C.ivory,
    colW: [1.0, 1.0, 1.5, 0.65],
    rowH: 0.58,
  });

  caption(
    s,
    "WAPE degrades h=1→h=7 as autoregressive lags become stale  ·  Largest calibration correction at h=6 (cₕ = 1.109)  ·  h=7 pure LightGBM (w*=1.00)",
    0.55,
    6.75,
    12.2,
    C.ivoryDim,
    9,
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 23 — STAGE 2 DIAGNOSTIC PLACEHOLDER
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 5);

  eyebrow(s, "STAGE 2 — DIAGNOSTIC PANEL", 0.55, 0.35, 6, C.teal);
  s.addText("Stage II Diagnostic Panel", {
    x: 0.55,
    y: 0.62,
    w: 9,
    h: 0.85,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 1.5, 12.2, C.tealDim, 0.007);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 1.7,
    w: 12.2,
    h: 5.0,
    fill: { color: C.panel },
    line: { color: C.tealDim, width: 0.6 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 1.7,
    w: 12.2,
    h: 0.04,
    fill: { color: C.teal },
    line: { color: C.teal, width: 0 },
  });
  eyebrow(
    s,
    "WAPE TRENDS  ·  BIAS (WPE)  ·  MLP TRAINING CURVE  ·  FEATURE IMPORTANCE  ·  MODEL COMPARISON",
    0.75,
    1.82,
    11.5,
    C.teal,
  );
  s.addText("[Insert stage2_diagnostics.png]", {
    x: 0.75,
    y: 2.2,
    w: 11.5,
    h: 4.2,
    fontSize: 14,
    fontFace: "Calibri",
    color: C.ivoryFar,
    italic: true,
    align: "center",
    valign: "middle",
    margin: 0,
  });

  caption(
    s,
    "Best: Ensemble (~29.30% mean WAPE)  ·  MLP best epoch: 12/20  ·  Val Huber Loss: 0.0546  ·  Column_37 (recovered demand lag) = dominant feature",
    0.55,
    6.85,
    12.2,
    C.ivoryDim,
    9,
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 24 — FULL RESULTS & BENCHMARK COMPARISON
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 6);

  eyebrow(s, "EVALUATION & ANALYSIS", 0.55, 0.35, 5, C.gold);
  s.addText("Against The\nBenchmarks", {
    x: 0.55,
    y: 0.62,
    w: 8,
    h: 1.35,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.02, 12.2, C.goldDim, 0.007);

  // Stage 2 leaderboard
  const lbRows = [
    [
      {
        text: "Rank",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
      {
        text: "Model",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
      {
        text: "Mean WAPE",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
      {
        text: "Mean WPE",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
      {
        text: "vs TFT",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
      {
        text: "Notes",
        options: { bold: true, color: C.teal, fill: { color: C.void } },
      },
    ],
    [
      {
        text: "★",
        options: { color: C.gold, bold: true, fill: { color: C.dusk } },
      },
      {
        text: "Ensemble (Ours)",
        options: { color: C.goldPale, bold: true, fill: { color: C.dusk } },
      },
      {
        text: "29.30%",
        options: { color: C.goldPale, bold: true, fill: { color: C.dusk } },
      },
      { text: "−7.35%", options: { fill: { color: C.dusk } } },
      { text: "≈ TFT", options: { color: C.teal, fill: { color: C.dusk } } },
      {
        text: "Weighted LGB+MLP, cₕ",
        options: { fill: { color: C.dusk }, fontSize: 9 },
      },
    ],
    [
      "2",
      "TFT (Paper)",
      "29.02%",
      "+2.58%",
      "—",
      "Temporal Fusion Transformer",
    ],
    [
      "3",
      "LightGBM (Ours)",
      "29.36%",
      "−7.81%",
      "≈ TFT",
      "7 per-horizon models",
    ],
    [
      "4",
      "MLP (Ours)",
      "30.69%",
      { text: "−5.86%", options: { color: C.teal } },
      "−1.67pp",
      "Lowest bias of all models",
    ],
    [
      "5",
      "SSA (Ours)",
      "39.94%",
      "−11.78%",
      "−10.92pp",
      "Statistical baseline",
    ],
  ];

  s.addTable(lbRows, {
    x: 0.55,
    y: 2.2,
    w: 12.2,
    h: 3.8,
    border: { pt: 0.5, color: C.tealDim },
    fill: { color: C.panel },
    fontFace: "Calibri",
    fontSize: 10.5,
    color: C.ivory,
    colW: [0.65, 2.2, 1.55, 1.45, 1.3, 4.9],
    rowH: 0.58,
  });

  // Insight strip
  const insights = [
    {
      n: "27.83%",
      l: "LightGBM Stage 1\nMatches TimesNet (27.62%)\nNo GPU required",
    },
    {
      n: "1.0748",
      l: "Calibration Factor\nReduces WPE −7.37% → 0%\nModel-agnostic",
    },
    {
      n: "+0.46",
      l: "ρ_DS Score\nResidual gap vs +0.07\nTimesNet — path forward",
    },
  ];
  insights.forEach((ins, i) => {
    const ix = 0.55 + i * 4.22;
    s.addShape(pres.shapes.RECTANGLE, {
      x: ix,
      y: 6.2,
      w: 3.95,
      h: 1.1,
      fill: { color: C.panel },
      line: { color: C.gold, width: 0.6 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: ix,
      y: 6.2,
      w: 3.95,
      h: 0.04,
      fill: { color: C.gold },
      line: { color: C.gold, width: 0 },
    });
    s.addText(ins.n, {
      x: ix + 0.18,
      y: 6.28,
      w: 2.2,
      h: 0.52,
      fontSize: 22,
      fontFace: "Palatino Linotype",
      color: C.gold,
      align: "left",
      margin: 0,
    });
    s.addText(ins.l, {
      x: ix + 0.18,
      y: 6.78,
      w: 3.6,
      h: 0.48,
      fontSize: 8.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 25 — THE DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 7);

  eyebrow(s, "FROM PIPELINE TO OPERATIONS", 0.55, 0.35, 6, C.teal);
  s.addText("The Dashboard:\nWhere Math Becomes Action", {
    x: 0.55,
    y: 0.62,
    w: 9,
    h: 1.35,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.02, 12.2, C.tealDim, 0.007);

  s.addText(
    "A six-module interactive Streamlit dashboard translates Stage 1 recovered demand and Stage 2 ensemble forecasts (ens_h1 through ens_h7) into actionable inventory decisions for dark store managers. Built by Shreya Mohanty.",
    {
      x: 0.55,
      y: 2.12,
      w: 12.2,
      h: 0.75,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      italic: true,
      margin: 0,
    },
  );

  // Six modules grid
  const modules = [
    {
      n: "01",
      icon: "◈",
      name: "Demand Overview",
      body: "7,242 total units · 557 avg/day · 286 surge alerts (demand > 2.5× μᵢ) · 6 critical stock items. Category donut chart for Priority Replenishment.",
      c: C.gold,
    },
    {
      n: "02",
      icon: "◷",
      name: "Stockout Countdown",
      body: "4-tier risk: CRITICAL (<1 day, 6 items) · HIGH (1–3 days, 41) · MEDIUM (3–7 days, 27) · LOW (>7 days, 0). Days of Cover formula.",
      c: C.red,
    },
    {
      n: "03",
      icon: "◉",
      name: "Lost Sales Audit",
      body: "Ghost revenue: max(0, Dₜ − yₜ). 37,968 lost units → ₹5,69,523 foregone revenue at ₹15 default price. Adjustable price, top-20 ranking.",
      c: C.teal,
    },
    {
      n: "04",
      icon: "◎",
      name: "What-If Simulator",
      body: "Interactive sliders: rainfall, temperature, humidity, wind, discount, promotion flag, holiday. Category-level sensitivity from Stage 1 coefficients.",
      c: C.gold,
    },
    {
      n: "05",
      icon: "⊞",
      name: "Smart Replenishment",
      body: "AI-powered orders: Required = 7-Day Forecast × Safety Multiplier (default 1.20). 74 products, 868 units. CSV purchase order export.",
      c: C.teal,
    },
    {
      n: "06",
      icon: "⌁",
      name: "Weather Impact",
      body: "Historical + forecast weather overlay on demand. β_rain = +0.108 · β_temp_frozen = +0.065 · β_temp_meat = −0.067. Quantifies meteorological demand sensitivity.",
      c: C.gold,
    },
  ];

  modules.forEach((m, i) => {
    const mx = 0.55 + (i % 3) * 4.22;
    const my = 3.02 + Math.floor(i / 3) * 2.2;
    s.addShape(pres.shapes.RECTANGLE, {
      x: mx,
      y: my,
      w: 3.95,
      h: 2.0,
      fill: { color: C.panel },
      line: { color: m.c, width: 0.5 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: mx,
      y: my,
      w: 3.95,
      h: 0.035,
      fill: { color: m.c },
      line: { color: m.c, width: 0 },
    });
    s.addText(`${m.icon}  Module ${m.n}  ·  ${m.name}`, {
      x: mx + 0.15,
      y: my + 0.1,
      w: 3.6,
      h: 0.4,
      fontSize: 10.5,
      fontFace: "Calibri",
      color: m.c,
      bold: true,
      align: "left",
      margin: 0,
    });
    s.addText(m.body, {
      x: mx + 0.15,
      y: my + 0.52,
      w: 3.6,
      h: 1.4,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 26 — DASHBOARD SCREENSHOT PLACEHOLDER
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 7);

  eyebrow(s, "OPERATIONAL SYSTEM — LIVE DASHBOARD", 0.55, 0.35, 7, C.teal);
  s.addText("Live at Streamlit Cloud", {
    x: 0.55,
    y: 0.62,
    w: 9,
    h: 0.85,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });

  // Dashboard mockup placeholder
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 1.58,
    w: 12.2,
    h: 4.85,
    fill: { color: C.panel },
    line: { color: C.teal, width: 0.8 },
  });
  // Browser chrome bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55,
    y: 1.58,
    w: 12.2,
    h: 0.42,
    fill: { color: C.slate },
    line: { color: C.tealDim, width: 0 },
  });
  // Traffic light dots
  ["C84B31", "C9A84C", "19C0BA"].forEach((c, i) => {
    s.addShape(pres.shapes.OVAL, {
      x: 0.8 + i * 0.3,
      y: 1.72,
      w: 0.18,
      h: 0.18,
      fill: { color: c },
      line: { color: c, width: 0 },
    });
  });
  s.addText("quickcommersev2-t4vfbm9h85gbdmcvymkssq.streamlit.app", {
    x: 1.8,
    y: 1.68,
    w: 9,
    h: 0.28,
    fontSize: 9,
    fontFace: "Courier New",
    color: C.ivoryFar,
    align: "left",
    margin: 0,
  });

  // Dashboard content placeholder
  s.addText("[Insert dashboard screenshot]", {
    x: 0.75,
    y: 2.15,
    w: 11.6,
    h: 4.0,
    fontSize: 13,
    fontFace: "Calibri",
    color: C.ivoryFar,
    italic: true,
    align: "center",
    valign: "middle",
    margin: 0,
  });

  // Bottom stats
  const dstats = [
    { n: "7,242", l: "Units Forecast" },
    { n: "74", l: "At-Risk Products" },
    { n: "₹5,69,523", l: "Ghost Revenue" },
    { n: "1.20×", l: "Safety Multiplier" },
  ];
  dstats.forEach((ds, i) => {
    const dx = 0.55 + i * 3.05;
    s.addShape(pres.shapes.RECTANGLE, {
      x: dx,
      y: 6.55,
      w: 2.85,
      h: 0.85,
      fill: { color: C.panel },
      line: { color: C.tealDim, width: 0.5 },
    });
    s.addText(ds.n, {
      x: dx + 0.12,
      y: 6.6,
      w: 2.6,
      h: 0.42,
      fontSize: 20,
      fontFace: "Palatino Linotype",
      color: C.teal,
      align: "left",
      margin: 0,
    });
    s.addText(ds.l, {
      x: dx + 0.12,
      y: 7.0,
      w: 2.6,
      h: 0.28,
      fontSize: 8.5,
      fontFace: "Calibri",
      color: C.ivoryFar,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 27 — KEY INSIGHTS
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 8);

  eyebrow(s, "WHAT WE LEARNED", 0.55, 0.35, 4, C.gold);
  s.addText("Six Distilled\nInsights", {
    x: 0.55,
    y: 0.62,
    w: 7,
    h: 1.35,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.02, 12.2, C.goldDim, 0.007);

  const insights = [
    {
      n: "01",
      title: "Tweedie is Non-Negotiable",
      metric: "0.67pp gap",
      body: "LGB and XGBoost outperform RF by 0.67pp WAPE. Log-link loss — not tree count — is the key differentiator for power-law demand recovery.",
      c: C.gold,
    },
    {
      n: "02",
      title: "Data Coverage > Model Complexity",
      metric: "0.06pp gain",
      body: "Ensemble improves only 0.06pp over standalone LightGBM. Diminishing returns once training data is complete. Coverage beats architecture.",
      c: C.teal,
    },
    {
      n: "03",
      title: "Calibration Drives WPE to Zero",
      metric: "−7.37% → 0%",
      body: "Scalar c = 1.0748 neutralizes Stage 1 bias. Per-horizon cₕ ∈ [1.052, 1.109] in Stage 2. More powerful than architectural changes.",
      c: C.gold,
    },
    {
      n: "04",
      title: "MLP Softplus Yields Lowest Bias",
      metric: "−5.86% WPE",
      body: "Despite higher WAPE (30.69%), MLP has lowest WPE without calibration. Softplus + Huber intrinsically regularize scale errors.",
      c: C.teal,
    },
    {
      n: "05",
      title: "ρ_DS = +0.46 — The Principal Gap",
      metric: "vs +0.07",
      body: "High-demand pairs have higher stockout rates. This structural confound cannot be fully disentangled by a single-stage tabular model.",
      c: C.red,
    },
    {
      n: "06",
      title: "NaN Lag Masking Preserves 68.7% Rows",
      metric: "68.7%",
      body: "Using sale_for_lag (NaN on stockout days) prevents censored zeros contaminating rolling statistics and lags — critical design decision.",
      c: C.teal,
    },
  ];

  insights.forEach((ins, i) => {
    const ix = 0.55 + (i % 2) * 6.22;
    const iy = 2.2 + Math.floor(i / 2) * 1.68;
    s.addShape(pres.shapes.RECTANGLE, {
      x: ix,
      y: iy,
      w: 5.95,
      h: 1.5,
      fill: { color: C.panel },
      line: { color: ins.c, width: 0.5 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: ix,
      y: iy,
      w: 0.04,
      h: 1.5,
      fill: { color: ins.c },
      line: { color: ins.c, width: 0 },
    });
    s.addText(`${ins.n}  ${ins.title}`, {
      x: ix + 0.2,
      y: iy + 0.1,
      w: 4.5,
      h: 0.38,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "left",
      margin: 0,
    });
    s.addText(ins.metric, {
      x: ix + 4.6,
      y: iy + 0.1,
      w: 1.2,
      h: 0.38,
      fontSize: 11,
      fontFace: "Palatino Linotype",
      color: ins.c,
      align: "right",
      margin: 0,
    });
    s.addText(ins.body, {
      x: ix + 0.2,
      y: iy + 0.52,
      w: 5.55,
      h: 0.9,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 28 — LIMITATIONS
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);
  sectionNum(s, 8);

  eyebrow(s, "THE GAP WE'RE STILL CLOSING", 0.55, 0.35, 6, C.red);
  s.addText("Methodological Limitations", {
    x: 0.55,
    y: 0.62,
    w: 9,
    h: 0.85,
    fontSize: 38,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 1.5, 12.2, C.redDim, 0.007);

  const lims = [
    {
      n: "01",
      title: "Residual Supply Correlation  ρ_DS = +0.46",
      body: "Stage 1 ρ_DS of +0.46 indicates highly popular items still exhibit some entanglement with stockout frequency due to power-law extremes. TimesNet achieves +0.07 via temporal convolution that implicitly learns to separate supply and demand dynamics. Our tabular approach cannot fully replicate this.",
      c: C.red,
    },
    {
      n: "02",
      title: "Persistent Underestimation  WPE ≈ −7.35%",
      body: "All Stage 2 models carry negative WPE (~−7.35% for ensemble). Standard regression optimizes the conditional mean, struggling to capture long-tail spike behaviors. Demand spikes during events, promotions, and weather anomalies are systematically underpredicted without quantile-aware training.",
      c: C.red,
    },
    {
      n: "03",
      title: "Horizon Drift Past h=4",
      body: "Absolute error bounds widen noticeably past h=4 as the core autoregressive signal fades. The lag features — which dominate by gain — become stale as forecast horizon extends. Future mitigation requires quantile regression to manage asymmetric stockout costs, and exogenous signal injection for longer horizons.",
      c: C.goldDim,
    },
  ];

  lims.forEach((l, i) => {
    const ly = 1.68 + i * 1.78;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55,
      y: ly,
      w: 12.2,
      h: 1.6,
      fill: { color: C.panel },
      line: { color: l.c, width: 0.7 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55,
      y: ly,
      w: 0.05,
      h: 1.6,
      fill: { color: l.c },
      line: { color: l.c, width: 0 },
    });
    s.addText(`${l.n}  ${l.title}`, {
      x: 0.78,
      y: ly + 0.12,
      w: 11.5,
      h: 0.42,
      fontSize: 13,
      fontFace: "Calibri",
      color: l.c,
      bold: true,
      align: "left",
      margin: 0,
    });
    s.addText(l.body, {
      x: 0.78,
      y: ly + 0.58,
      w: 11.5,
      h: 0.9,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 29 — FUTURE WORK
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);
  sectionNum(s, 8);

  eyebrow(s, "WHAT COMES NEXT", 0.55, 0.35, 4, C.teal);
  s.addText("Three Directions\nForward", {
    x: 0.55,
    y: 0.62,
    w: 8,
    h: 1.35,
    fontSize: 44,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "left",
    margin: 0,
  });
  divLine(s, 0.55, 2.02, 12.2, C.tealDim, 0.007);

  const fw = [
    {
      n: "I",
      title: "Demand-Supply Decoupling Architecture",
      body: "Develop adversarial or auxiliary loss functions that explicitly penalize correlation between recovered demand and stockout frequency. Goal: drive ρ_DS from +0.46 toward 0.0. Potential approach: adversarial decoupling layers applied to top-SKU embeddings.",
      c: C.teal,
    },
    {
      n: "II",
      title: "Multi-Quantile Stage 2 Forecasting",
      body: "Transition from point-estimation to multi-quantile forecasting (q10, q50, q90). Asymmetric stockout costs in quick commerce mean underestimating is far more costly than overestimating. Quantile-aware training would capture tail behavior that mean regression misses.",
      c: C.gold,
    },
    {
      n: "III",
      title: "Real-Time Intraday Dashboard Ingestion",
      body: "Enable continuous real-time stream ingestion from dark store POS systems. Replace daily batch inference with intraday forecasting updates — recomputing ens_h1 through ens_h7 as new hourly data arrives. Closes the loop between prediction and operational decision.",
      c: C.teal,
    },
  ];

  fw.forEach((f, i) => {
    const fy = 2.2 + i * 1.68;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55,
      y: fy,
      w: 12.2,
      h: 1.52,
      fill: { color: C.panel },
      line: { color: f.c, width: 0.8 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55,
      y: fy,
      w: 0.05,
      h: 1.52,
      fill: { color: f.c },
      line: { color: f.c, width: 0 },
    });
    s.addText(f.n, {
      x: 0.72,
      y: fy + 0.12,
      w: 0.5,
      h: 1.25,
      fontSize: 32,
      fontFace: "Palatino Linotype",
      color: f.c,
      italic: true,
      valign: "middle",
      align: "left",
      margin: 0,
    });
    s.addText(f.title, {
      x: 1.38,
      y: fy + 0.12,
      w: 11.0,
      h: 0.4,
      fontSize: 13,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "left",
      margin: 0,
    });
    s.addText(f.body, {
      x: 1.38,
      y: fy + 0.56,
      w: 11.0,
      h: 0.88,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 30 — CONCLUSION
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.night);

  // Atmospheric bleed
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 13.3,
    h: 3.6,
    fill: { color: C.void },
    line: { color: C.void, width: 0 },
  });
  divLine(s, 0, 3.6, 13.3, C.gold, 0.02);

  eyebrow(s, "CONCLUSION  ·  GSV 2026", 0.7, 0.42, 6, C.gold);
  s.addText(
    "Lightweight models.\nThe right loss function.\nA two-stage truth.",
    {
      x: 0.7,
      y: 0.72,
      w: 11,
      h: 2.6,
      fontSize: 46,
      fontFace: "Palatino Linotype",
      color: C.ivory,
      align: "left",
      margin: 0,
    },
  );

  const findings = [
    {
      n: "01",
      title: "Tweedie is Essential",
      body: "Both LightGBM and XGBoost outperform Random Forest. The log-link loss function — not tree count — is the key differentiator for power-law demand recovery.",
      c: C.gold,
    },
    {
      n: "02",
      title: "MLP Provides Bias Complement",
      body: "Softplus activation and Huber loss give MLP the lowest WPE (−5.86%). Ensemble blending captures WAPE accuracy and bias control simultaneously.",
      c: C.teal,
    },
    {
      n: "03",
      title: "ρ_DS = +0.46 Guides Future Work",
      body: "Residual supply-demand correlation is the principal remaining gap. Path forward: adversarial decoupling, quantile-aware Stage 2, real-time ingestion.",
      c: C.gold,
    },
  ];

  findings.forEach((f, i) => {
    const fx = 0.7 + i * 4.18;
    s.addShape(pres.shapes.RECTANGLE, {
      x: fx,
      y: 3.85,
      w: 3.9,
      h: 3.35,
      fill: { color: C.panel },
      line: { color: f.c, width: 0.6 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: fx,
      y: 3.85,
      w: 3.9,
      h: 0.04,
      fill: { color: f.c },
      line: { color: f.c, width: 0 },
    });
    s.addText(f.n, {
      x: fx + 0.18,
      y: 3.95,
      w: 0.55,
      h: 0.6,
      fontSize: 22,
      fontFace: "Palatino Linotype",
      color: f.c,
      italic: true,
      align: "left",
      margin: 0,
    });
    s.addText(f.title, {
      x: fx + 0.18,
      y: 4.55,
      w: 3.5,
      h: 0.48,
      fontSize: 12,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "left",
      margin: 0,
    });
    s.addText(f.body, {
      x: fx + 0.18,
      y: 5.08,
      w: 3.5,
      h: 1.95,
      fontSize: 9.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 31 — TEAM
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.abyss);

  eyebrow(s, "THE PEOPLE BEHIND THIS", 4.8, 0.38, 4, C.gold);
  s.addText("Our Team", {
    x: 0,
    y: 0.65,
    w: 13.3,
    h: 0.95,
    fontSize: 48,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    align: "center",
    margin: 0,
  });
  s.addText(
    "B.Tech — Electronics & Communication Engineering (Specialisation: Rail Engineering)\nGati Shakti Vishwavidyalaya  ·  April 2026",
    {
      x: 0,
      y: 1.6,
      w: 13.3,
      h: 0.65,
      fontSize: 10.5,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "center",
      italic: true,
      margin: 0,
    },
  );
  divLine(s, 1.2, 2.32, 10.9, C.goldDim, 0.008);

  const team = [
    { name: "Parth Sidhu", role: "Machine Learning\n& Modeling" },
    { name: "Shreya Mohanty", role: "Dashboard\n& Deployment" },
    { name: "Srijan Gupta", role: "Forecasting\n& Evaluation" },
    { name: "Assir Thota", role: "Dataset\n& Analysis" },
    { name: "Ayush Vaibhav Gond", role: "Pipeline\nArchitecture" },
  ];

  team.forEach((t, i) => {
    const tx = 0.55 + i * 2.44;
    // Photo placeholder circle
    s.addShape(pres.shapes.OVAL, {
      x: tx + 0.38,
      y: 2.58,
      w: 1.55,
      h: 1.55,
      fill: { color: C.panel },
      line: { color: C.gold, width: 0.8 },
    });
    s.addText(t.name.charAt(0), {
      x: tx + 0.38,
      y: 2.58,
      w: 1.55,
      h: 1.55,
      fontSize: 32,
      fontFace: "Palatino Linotype",
      color: C.gold,
      align: "center",
      valign: "middle",
      margin: 0,
    });
    s.addText("[Photo]", {
      x: tx + 0.38,
      y: 3.85,
      w: 1.55,
      h: 0.3,
      fontSize: 7,
      fontFace: "Calibri",
      color: C.ivoryFar,
      align: "center",
      italic: true,
      margin: 0,
    });
    s.addText(t.name, {
      x: tx,
      y: 4.18,
      w: 2.3,
      h: 0.5,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "center",
      margin: 0,
    });
    s.addText(t.role, {
      x: tx,
      y: 4.68,
      w: 2.3,
      h: 0.65,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "center",
      margin: 0,
    });
  });

  divLine(s, 1.2, 5.45, 10.9, C.tealDim, 0.008);

  // Faculty
  eyebrow(s, "FACULTY MENTOR", 4.5, 5.58, 4.3, C.teal);
  s.addShape(pres.shapes.OVAL, {
    x: 5.4,
    y: 5.95,
    w: 1.5,
    h: 1.5,
    fill: { color: C.panel },
    line: { color: C.teal, width: 0.8 },
  });
  s.addText("A", {
    x: 5.4,
    y: 5.95,
    w: 1.5,
    h: 1.5,
    fontSize: 30,
    fontFace: "Palatino Linotype",
    color: C.teal,
    align: "center",
    valign: "middle",
    margin: 0,
  });
  s.addText("Dr. Anshika Srivastava", {
    x: 7.1,
    y: 6.05,
    w: 6,
    h: 0.45,
    fontSize: 14,
    fontFace: "Calibri",
    color: C.ivory,
    bold: true,
    align: "left",
    margin: 0,
  });
  s.addText(
    "Assistant Professor & Program Coordinator (ECE)\nDept. of Electronics & Communication Engineering\nSchool of Technology · Gati Shakti Vishwavidyalaya\nA Central University under the Ministry of Railways, Govt. of India",
    {
      x: 7.1,
      y: 6.52,
      w: 6,
      h: 0.88,
      fontSize: 9,
      fontFace: "Calibri",
      color: C.ivoryDim,
      align: "left",
      margin: 0,
    },
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 32 — CINEMATIC ENDING
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, C.void);

  // Deep atmospheric — almost pure black
  vertLine(s, 0.65, 0.5, 6.5, C.teal, 0.018);

  s.addText("The shelves know\nwhat they needed.", {
    x: 0.9,
    y: 1.0,
    w: 8,
    h: 2.8,
    fontSize: 58,
    fontFace: "Palatino Linotype",
    color: C.ivory,
    italic: true,
    align: "left",
    margin: 0,
  });
  s.addText("Now, so do we.", {
    x: 0.9,
    y: 3.65,
    w: 8,
    h: 1.1,
    fontSize: 58,
    fontFace: "Palatino Linotype",
    color: C.gold,
    italic: true,
    align: "left",
    margin: 0,
  });

  divLine(s, 0.9, 4.85, 7.5, C.goldDim, 0.01);

  s.addText("27.83% WAPE  ·  345 Trees  ·  50K Pairs  ·  No GPU Required", {
    x: 0.9,
    y: 5.0,
    w: 8,
    h: 0.38,
    fontSize: 10,
    fontFace: "Calibri",
    color: C.teal,
    charSpacing: 2,
    align: "left",
    margin: 0,
  });

  s.addText(
    "github.com/Parth-Sidhu-4/AI-based-Hyperlocal-Demand-Prediction-for-Dark-Stores-Quick-Commerce",
    {
      x: 0.9,
      y: 5.55,
      w: 10,
      h: 0.32,
      fontSize: 8.5,
      fontFace: "Courier New",
      color: C.ivoryFar,
      align: "left",
      margin: 0,
    },
  );
  s.addText(
    "Dashboard: quickcommersev2-t4vfbm9h85gbdmcvymkssq.streamlit.app  ·  Dataset: arxiv.org/abs/2505.16319",
    {
      x: 0.9,
      y: 5.9,
      w: 10,
      h: 0.32,
      fontSize: 8.5,
      fontFace: "Courier New",
      color: C.ivoryFar,
      align: "left",
      margin: 0,
    },
  );

  // Large watermark
  s.addText("FRN-50K · GSV 2026", {
    x: 7,
    y: 5.5,
    w: 5.8,
    h: 1.5,
    fontSize: 36,
    fontFace: "Palatino Linotype",
    color: C.panel,
    align: "right",
    italic: true,
    margin: 0,
  });

  // Bottom team credit
  s.addText(
    "Thota  ·  Gond  ·  Sidhu  ·  Mohanty  ·  Gupta  ·  Mentored by Dr. Anshika Srivastava",
    {
      x: 0.9,
      y: 7.08,
      w: 12,
      h: 0.3,
      fontSize: 8.5,
      fontFace: "Calibri",
      color: C.ivoryFar,
      align: "left",
      charSpacing: 1.5,
      margin: 0,
    },
  );
}

// ─── WRITE ───────────────────────────────────────────────────────────────────
pres
  .writeFile({ fileName: "DarkStore_Demand_Prediction.pptx" })
  .then(() => console.log("✓ Presentation saved."))
  .catch((err) => console.error("Error:", err));
