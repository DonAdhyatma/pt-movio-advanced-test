"use client";

import { useRef } from "react";
import { ContentOutput } from "@/lib/gemini";

interface OutputPanelProps {
  output: ContentOutput | null;
  isLoading: boolean;
  briefName?: string;
}

const CARDS = [
  {
    key: "caption" as keyof ContentOutput,
    title: "Social Media Caption",
    icon: "✦",
    accent: "card-purple",
    desc: "Ready-to-post caption with CTA",
  },
  {
    key: "videoScript" as keyof ContentOutput,
    title: "Video Script",
    icon: "▶",
    accent: "card-teal",
    desc: "Scene-by-scene video breakdown",
  },
  {
    key: "storyboard" as keyof ContentOutput,
    title: "Storyboard Frames",
    icon: "◈",
    accent: "card-amber",
    desc: "Visual frame-by-frame direction",
  },
  {
    key: "posterConcept" as keyof ContentOutput,
    title: "Poster Concept",
    icon: "◉",
    accent: "card-rose",
    desc: "Layout, headline & visual direction",
  },
  {
    key: "hashtags" as keyof ContentOutput,
    title: "Hashtag Set",
    icon: "#",
    accent: "card-blue",
    desc: "10 targeted hashtags",
  },
];

const CARD_COLORS: Record<string, string> = {
  "card-purple": "#7c6cff",
  "card-teal":   "#00d4aa",
  "card-amber":  "#f59e0b",
  "card-rose":   "#f43f5e",
  "card-blue":   "#3b82f6",
};

const ACCENT_RGB: Record<string, [number, number, number]> = {
  "card-purple": [124, 108, 255],
  "card-teal":   [0,   212, 170],
  "card-amber":  [245, 158,  11],
  "card-rose":   [244,  63,  94],
  "card-blue":   [ 59, 130, 246],
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function formatHashtags(raw: string): string {
  return raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .join("  ");
}

function renderHashtags(raw: string) {
  const tags = raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));

  return (
    <div className="hashtag-wrap">
      {tags.map((tag, i) => (
        <span key={i} className="hashtag-chip">{tag}</span>
      ))}
    </div>
  );
}

function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")  // misc symbols & pictographs
    .replace(/[\u{2600}-\u{26FF}]/gu, "")     // misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, "")     // dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")     // variation selectors
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")   // flags
    .replace(/\s{2,}/g, " ")                  // collapse extra spaces
    .trim();
}

async function exportWithJsPDF(output: ContentOutput, briefName?: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const PW  = 210;
  const PH  = 297;
  const ML  = 14;
  const MR  = 14;
  const CW  = PW - ML - MR;
  const BOT = 16; // bottom margin
  const now = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  let y = 0;

  // ── Page guard: add new page if content won't fit ──────
  function ensureSpace(needed: number) {
    if (y + needed > PH - BOT) {
      doc.addPage();
      y = 14;
    }
  }

  // ── Draw a full section (header pill + content box) ────
  function drawSection(
    label: string,
    content: string,
    rgb: [number, number, number]
  ) {
    const FONT_SIZE   = 8.5;
    const LINE_H      = 5.0;
    const PAD_X       = 5;
    const PAD_Y       = 5;
    const HEADER_H    = 8;
    const INNER_W     = CW - PAD_X * 2;

    // Clean emoji from content for jsPDF compatibility
    const cleanContent = stripEmojis(content);

    doc.setFontSize(FONT_SIZE);
    doc.setFont("helvetica", "normal");
    const lines: string[] = doc.splitTextToSize(cleanContent, INNER_W);
    const boxH = PAD_Y + lines.length * LINE_H + PAD_Y;
    const totalH = HEADER_H + boxH + 10; // 10 = gap after section

    ensureSpace(totalH);

    // Header pill
    doc.setFillColor(...rgb);
    doc.roundedRect(ML, y, CW, HEADER_H, 2, 2, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(label.toUpperCase(), ML + PAD_X, y + 5.5);
    y += HEADER_H;

    // Content box — draw border first
    doc.setFillColor(249, 249, 251);
    doc.setDrawColor(220, 220, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, CW, boxH, 0, 2, "FD");

    // Write lines individually, checking page breaks mid-section
    let ty = y + PAD_Y + LINE_H * 0.6;
    doc.setFontSize(FONT_SIZE);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 46);

    for (const line of lines) {
      // If this single line would overflow, add page and redraw content bg
      if (ty + LINE_H > PH - BOT) {
        doc.addPage();
        y = 14;
        ty = y + PAD_Y;
        // Continuation box
        const remLines = lines.slice(lines.indexOf(line));
        const remBoxH  = PAD_Y + remLines.length * LINE_H + PAD_Y;
        doc.setFillColor(249, 249, 251);
        doc.setDrawColor(220, 220, 235);
        doc.setLineWidth(0.3);
        doc.roundedRect(ML, y, CW, remBoxH, 2, 2, "FD");
        ty = y + PAD_Y + LINE_H * 0.6;
      }
      doc.text(line, ML + PAD_X, ty);
      ty += LINE_H;
    }

    y = ty + PAD_Y + 6; // gap between sections
  }

  // ══════════════════════════════════════════════════════
  // HEADER BLOCK
  // ══════════════════════════════════════════════════════
  // Background
  doc.setFillColor(124, 108, 255);
  doc.roundedRect(ML, 10, CW, 32, 4, 4, "F");
  // Teal accent right strip
  doc.setFillColor(0, 180, 150);
  doc.roundedRect(ML + CW * 0.7, 10, CW * 0.3, 32, 4, 4, "F");
  // Re-cover left so it blends
  doc.setFillColor(124, 108, 255);
  doc.rect(ML + CW * 0.6, 10, CW * 0.15, 32, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(200, 195, 255);
  doc.text("AI-GENERATED CONTENT PACKAGE", ML + 6, 18);

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Movio Smart Content Builder", ML + 6, 26);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(210, 210, 255);
  if (briefName) doc.text(`Campaign for: ${briefName}`, ML + 6, 33);
  doc.text(`Generated: ${now}  |  Powered by Gemini AI`, ML + 6, 39);

  y = 50;

  // ══════════════════════════════════════════════════════
  // SECTIONS
  // ══════════════════════════════════════════════════════
  drawSection("01 — Social Media Caption", output.caption,      [124, 108, 255]);
  drawSection("02 — Video Script",         output.videoScript,  [0,   200, 160]);
  drawSection("03 — Storyboard Frames",    output.storyboard,   [220, 140,   0]);
  drawSection("04 — Poster Concept",       output.posterConcept,[220,  50,  80]);
  drawSection("05 — Hashtag Set",          formatHashtags(output.hashtags), [50, 120, 230]);

  // ══════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════
  ensureSpace(12);
  doc.setDrawColor(210, 210, 225);
  doc.setLineWidth(0.3);
  doc.line(ML, y, ML + CW, y);
  y += 5;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 185);
  doc.text(
    "Movio Smart Content Builder  |  PT Movio Kreasi Indonesia  |  Confidential",
    PW / 2, y, { align: "center" }
  );

  const filename = `movio-content-${(briefName || "brief").replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}

// ══════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════
export default function OutputPanel({ output, isLoading, briefName }: OutputPanelProps) {
  const handleExportPDF = async () => {
    if (!output) return;
    await exportWithJsPDF(output, briefName);
  };

  if (isLoading) {
    return (
      <div className="output-loading">
        <div className="loading-orb" />
        <p className="loading-text">Crafting your content package...</p>
        <p className="loading-sub">Powered by Gemini 2.5 Flash Lite</p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="output-empty">
        <div className="empty-icon">✦</div>
        <p className="empty-title">Your content will appear here</p>
        <p className="empty-sub">
          Fill in the brief form and click Generate to create your campaign content package.
        </p>
      </div>
    );
  }

  return (
    <div className="output-panel">
      <div className="output-header">
        <div>
          <h3 className="output-title">Content Package</h3>
          {briefName && <p className="output-brand">for {briefName}</p>}
        </div>
        <button onClick={handleExportPDF} className="export-btn">
          ↓ Export PDF
        </button>
      </div>

      <div className="cards-grid">
        {CARDS.map((card) => (
          <div key={card.key} className={`content-card ${card.accent}`}>
            <div className="card-header">
              <div
                className="card-icon-wrap"
                style={{ background: `${CARD_COLORS[card.accent]}18` }}
              >
                <span className="card-icon" style={{ color: CARD_COLORS[card.accent] }}>
                  {card.icon}
                </span>
              </div>
              <div className="card-meta">
                <h4 className="card-title">{card.title}</h4>
                <p className="card-desc">{card.desc}</p>
              </div>
              <button
                onClick={() => copyToClipboard(output[card.key])}
                className="copy-btn"
                title="Copy to clipboard"
              >
                ⎘
              </button>
            </div>
            <div className="card-body">
              {card.key === "hashtags"
                ? renderHashtags(output.hashtags)
                : <p className="card-content">{output[card.key]}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}