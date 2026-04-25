"use client";

import { useState } from "react";
import { BriefInput } from "@/lib/gemini";

interface BriefFormProps {
  onSubmit: (data: BriefInput) => void;
  isLoading: boolean;
}

const INDUSTRIES = [
  "Fashion & Lifestyle",
  "Food & Beverage",
  "Technology & SaaS",
  "Healthcare & Wellness",
  "Education & E-Learning",
  "Real Estate & Property",
  "Finance & Banking",
  "Entertainment & Media",
  "Travel & Tourism",
  "Retail & E-Commerce",
  "Automotive",
  "Non-Profit & Social",
];

const TONES = [
  "Professional & Corporate",
  "Friendly & Approachable",
  "Bold & Energetic",
  "Elegant & Luxury",
  "Playful & Fun",
  "Inspirational & Motivational",
  "Minimalist & Clean",
  "Edgy & Disruptive",
];

const GOALS = [
  "Brand Awareness",
  "Lead Generation",
  "Product Launch",
  "Community Engagement",
  "Sales & Conversion",
  "Recruitment & Hiring",
  "Event Promotion",
  "Customer Retention",
];

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "YouTube",
  "Twitter / X",
  "Facebook",
  "Multi-Platform",
];

export default function BriefForm({ onSubmit, isLoading }: BriefFormProps) {
  const [form, setForm] = useState<BriefInput>({
    brandName: "",
    industry: "",
    audience: "",
    tone: "",
    goal: "",
    platform: "",
    additionalContext: "",
  });

  const [errors, setErrors] = useState<Partial<BriefInput>>({});

  const validate = (): boolean => {
    const newErrors: Partial<BriefInput> = {};
    if (!form.brandName.trim()) newErrors.brandName = "Brand name is required";
    if (!form.industry) newErrors.industry = "Please select an industry";
    if (!form.audience.trim()) newErrors.audience = "Target audience is required";
    if (!form.tone) newErrors.tone = "Please select a tone";
    if (!form.goal) newErrors.goal = "Please select a campaign goal";
    if (!form.platform) newErrors.platform = "Please select a platform";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const set = (field: keyof BriefInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="brief-form">
      {/* Brand Name */}
      <div className="field-group">
        <label className="field-label">
          <span className="label-number">01</span>
          Brand Name
        </label>
        <input
          type="text"
          placeholder="e.g. Movio Kreasi Indonesia"
          value={form.brandName}
          onChange={(e) => set("brandName", e.target.value)}
          className={`field-input ${errors.brandName ? "input-error" : ""}`}
          disabled={isLoading}
        />
        {errors.brandName && (
          <span className="error-msg">{errors.brandName}</span>
        )}
      </div>

      {/* Industry */}
      <div className="field-group">
        <label className="field-label">
          <span className="label-number">02</span>
          Industry
        </label>
        <select
          value={form.industry}
          onChange={(e) => set("industry", e.target.value)}
          className={`field-select ${errors.industry ? "input-error" : ""}`}
          disabled={isLoading}
        >
          <option value="">Select your industry...</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        {errors.industry && (
          <span className="error-msg">{errors.industry}</span>
        )}
      </div>

      {/* Target Audience */}
      <div className="field-group">
        <label className="field-label">
          <span className="label-number">03</span>
          Target Audience
        </label>
        <input
          type="text"
          placeholder="e.g. Young professionals aged 22–35 interested in tech"
          value={form.audience}
          onChange={(e) => set("audience", e.target.value)}
          className={`field-input ${errors.audience ? "input-error" : ""}`}
          disabled={isLoading}
        />
        {errors.audience && (
          <span className="error-msg">{errors.audience}</span>
        )}
      </div>

      {/* Tone + Goal — side by side */}
      <div className="field-row">
        <div className="field-group">
          <label className="field-label">
            <span className="label-number">04</span>
            Brand Tone
          </label>
          <select
            value={form.tone}
            onChange={(e) => set("tone", e.target.value)}
            className={`field-select ${errors.tone ? "input-error" : ""}`}
            disabled={isLoading}
          >
            <option value="">Select tone...</option>
            {TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.tone && <span className="error-msg">{errors.tone}</span>}
        </div>

        <div className="field-group">
          <label className="field-label">
            <span className="label-number">05</span>
            Campaign Goal
          </label>
          <select
            value={form.goal}
            onChange={(e) => set("goal", e.target.value)}
            className={`field-select ${errors.goal ? "input-error" : ""}`}
            disabled={isLoading}
          >
            <option value="">Select goal...</option>
            {GOALS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {errors.goal && <span className="error-msg">{errors.goal}</span>}
        </div>
      </div>

      {/* Platform */}
      <div className="field-group">
        <label className="field-label">
          <span className="label-number">06</span>
          Target Platform
        </label>
        <div className="platform-grid">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("platform", p)}
              disabled={isLoading}
              className={`platform-chip ${form.platform === p ? "chip-active" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
        {errors.platform && (
          <span className="error-msg">{errors.platform}</span>
        )}
      </div>

      {/* Additional Context */}
      <div className="field-group">
        <label className="field-label">
          <span className="label-number">07</span>
          Additional Context
          <span className="label-optional">optional</span>
        </label>
        <textarea
          placeholder="Any specific keywords, references, campaign themes, or constraints..."
          value={form.additionalContext}
          onChange={(e) => set("additionalContext", e.target.value)}
          className="field-textarea"
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="submit-btn"
      >
        {isLoading ? (
          <span className="btn-loading">
            <span className="spinner" />
            Generating Content...
          </span>
        ) : (
          <span className="btn-text">
            ✦ Generate Content Package
          </span>
        )}
      </button>
    </form>
  );
}