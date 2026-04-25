"use client";

import { useState } from "react";
import BriefForm from "@/components/BriefForm";
import OutputPanel from "@/components/OutputPanel";
import { BriefInput, ContentOutput } from "@/lib/gemini";

export default function Home() {
  const [output, setOutput] = useState<ContentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>("");

  const handleGenerate = async (brief: BriefInput) => {
    setIsLoading(true);
    setError(null);
    setBrandName(brief.brandName);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Generation failed");

      setOutput(json.data);

      // Save to localStorage history
      const history = JSON.parse(
        localStorage.getItem("movio_history") || "[]"
      );
      history.unshift({
        id: Date.now(),
        brandName: brief.brandName,
        platform: brief.platform,
        goal: brief.goal,
        output: json.data,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(
        "movio_history",
        JSON.stringify(history.slice(0, 10))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="logo-mark">▦</span>
          <span className="logo-text">Movio</span>
          <span className="logo-tag">Smart Content Builder</span>
        </div>
        <div className="nav-badge">
          Powered by Gemini 2.5 Flash Lite
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-chip">AI-Powered Creative Platform</div>
        <h1 className="hero-title">
          Generate Campaign Content
          <br />
          <span className="hero-accent">in Seconds, Not Hours</span>
        </h1>
        <p className="hero-sub">
          Fill your creative brief → Let Gemini AI craft captions, scripts,
          storyboards, poster concepts, and hashtags — ready to pitch.
        </p>
      </section>

      {/* Main Layout */}
      <div className="workspace">
        {/* Left: Form */}
        <section className="panel panel-form">
          <div className="panel-label">
            <span className="panel-step">01</span>
            Creative Brief
          </div>
          <BriefForm onSubmit={handleGenerate} isLoading={isLoading} />
        </section>

        {/* Divider */}
        <div className="workspace-divider">
          <div className="divider-line" />
          <div className="divider-icon">✦</div>
          <div className="divider-line" />
        </div>

        {/* Right: Output */}
        <section className="panel panel-output">
          <div className="panel-label">
            <span className="panel-step">02</span>
            Generated Content
          </div>
          {error && (
            <div className="error-banner">
              ⚠ {error}
            </div>
          )}
          <OutputPanel
            output={output}
            isLoading={isLoading}
            briefName={brandName}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Movio Smart Content Builder · Built with Next.js 16 + Gemini AI ·
          By Danni A. Rachman
        </p>
      </footer>
    </main>
  );
}