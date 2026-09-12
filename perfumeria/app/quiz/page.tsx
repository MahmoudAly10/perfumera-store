"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { SCENT_FAMILIES, PRODUCTS } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import type { ScentFamily } from "@/lib/types";

type Answers = {
  moods: string[];
  intensity: "light" | "moderate" | "strong" | null;
  occasion: string;
  scentFamilies: ScentFamily[];
};

const QUESTIONS = [
  {
    id: "moods",
    title: "Which moods do you want your fragrance to evoke?",
    subtitle: "Pick up to 3",
    multi: true,
    max: 3,
    options: [
      { value: "romantic", label: "Romantic", emoji: "💕" },
      { value: "confident", label: "Confident", emoji: "💪" },
      { value: "mysterious", label: "Mysterious", emoji: "🌙" },
      { value: "playful", label: "Playful", emoji: "✨" },
      { value: "calm", label: "Calm", emoji: "🌿" },
      { value: "sophisticated", label: "Sophisticated", emoji: "🥂" },
      { value: "energizing", label: "Energizing", emoji: "⚡" },
      { value: "warm", label: "Warm", emoji: "🤎" },
    ],
  },
  {
    id: "intensity",
    title: "How strong do you like your fragrance?",
    subtitle: "Pick one",
    options: [
      { value: "light", label: "Light & airy", desc: "Whisper-soft, intimate", emoji: "💨" },
      { value: "moderate", label: "Moderate", desc: "Noticed but not loud", emoji: "🌸" },
      { value: "strong", label: "Strong", desc: "Make a statement", emoji: "🔥" },
    ],
  },
  {
    id: "occasion",
    title: "When will you wear it most?",
    subtitle: "Pick one",
    options: [
      { value: "everyday", label: "Everyday", emoji: "☀️" },
      { value: "office", label: "Office / work", emoji: "💼" },
      { value: "evening", label: "Evening out", emoji: "🌃" },
      { value: "special", label: "Special occasion", emoji: "💎" },
    ],
  },
  {
    id: "scentFamilies",
    title: "Which scent worlds speak to you?",
    subtitle: "Pick up to 3",
    multi: true,
    max: 3,
    options: SCENT_FAMILIES.map((f) => ({ value: f.id, label: f.label, emoji: f.emoji, desc: f.description })),
  },
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    moods: [],
    intensity: null,
    occasion: "",
    scentFamilies: [],
  });

  const question = QUESTIONS[step];

  const onSelect = (value: string) => {
    const key = question.id as keyof Answers;
    if (question.multi) {
      const current = (answers[key] as string[]) || [];
      let updated: string[];
      if (current.includes(value)) {
        updated = current.filter((v) => v !== value);
      } else {
        if (current.length >= (question.max || 99)) return;
        updated = [...current, value];
      }
      setAnswers({ ...answers, [key]: updated } as Answers);
    } else {
      setAnswers({ ...answers, [key]: value } as Answers);
    }
  };

  const canContinue = (() => {
    const key = question.id as keyof Answers;
    const v = answers[key];
    if (Array.isArray(v)) return v.length > 0;
    if (question.id === "intensity") return v !== null;
    return !!v;
  })();

  const next = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const back = () => step > 0 && setStep(step - 1);

  const reset = () => {
    setStep(0);
    setDone(false);
    setAnswers({ moods: [], intensity: null, occasion: "", scentFamilies: [] });
  };

  const recommendations = done
    ? getRecommendations(answers)
    : [];

  if (done) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex w-14 h-14 items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <p className="eyebrow mb-2">Your results</p>
          <h1 className="font-display text-5xl mb-3">Your Signature Scents</h1>
          <p className="text-[var(--color-ink-soft)] max-w-xl mx-auto">
            Based on your preferences, we think you'll love these fragrances.
            Each one matches your mood, intensity, and occasion choices.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {answers.scentFamilies.map((f) => {
            const sf = SCENT_FAMILIES.find((s) => s.id === f);
            return (
              <span
                key={f}
                className="px-3 py-1.5 bg-[var(--color-bg-alt)] border border-[var(--color-line)] text-sm"
              >
                {sf?.emoji} {sf?.label}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mb-12">
          {recommendations.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="text-center">
          <button onClick={reset} className="btn btn-secondary inline-flex">
            <RefreshCw className="w-4 h-4" /> Retake the quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="bg-[var(--color-bg-alt)] py-4 border-b border-[var(--color-line)]">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-sm">
          <Link href="/" className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            <ArrowLeft className="inline w-4 h-4 mr-1" /> Home
          </Link>
          <span className="text-[var(--color-ink-muted)]">
            Question {step + 1} of {QUESTIONS.length}
          </span>
        </div>
        <div className="max-w-3xl mx-auto px-4 mt-3">
          <div className="h-1 bg-[var(--color-line)]">
            <div
              className="h-full bg-[var(--color-gold)] transition-all"
              style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl text-center mb-2">
            {question.title}
          </h1>
          <p className="text-center text-[var(--color-ink-muted)] mb-10">
            {question.subtitle}
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {question.options.map((opt) => {
              const key = question.id as keyof Answers;
              const current = answers[key];
              const selected = Array.isArray(current)
                ? (current as string[]).includes(opt.value)
                : current === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onSelect(opt.value)}
                  className={cn(
                    "p-5 border text-left transition-all",
                    selected
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)] scale-[1.02]"
                      : "border-[var(--color-line)] hover:border-[var(--color-ink)] bg-[var(--color-bg)]"
                  )}
                >
                  <div className="text-2xl mb-2">{opt.emoji}</div>
                  <div className="font-medium">{opt.label}</div>
                  {("desc" in opt) && opt.desc && (
                    <div
                      className={cn(
                        "text-xs mt-1",
                        selected ? "text-white/70" : "text-[var(--color-ink-muted)]"
                      )}
                    >
                      {opt.desc}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)] bg-[var(--color-bg)] py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="btn btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={next}
            disabled={!canContinue}
            className="btn btn-primary disabled:opacity-40"
          >
            {step === QUESTIONS.length - 1 ? "See results" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getRecommendations(answers: Answers) {
  // Score every product based on:
  //  +3 per matched scent family
  //  +1 for matching intensity (parfum/edp = strong, edt/edc = light)
  //  +1 if gender matches occasion preferences
  const intensityMap: Record<string, string[]> = {
    light: ["EDC", "Body Mist", "EDT"],
    moderate: ["EDT", "EDP"],
    strong: ["EDP", "Parfum"],
  };
  const wantConcs = answers.intensity ? intensityMap[answers.intensity] : [];

  return PRODUCTS.map((p) => {
    let score = 0;
    answers.scentFamilies.forEach((f) => {
      if (p.scentFamily.includes(f)) score += 3;
    });
    if (wantConcs.length && wantConcs.includes(p.concentration)) score += 2;
    if (answers.occasion === "everyday" && p.rating >= 4.6) score += 1;
    if (answers.occasion === "special" && p.concentration === "Parfum") score += 1;
    if (answers.occasion === "office" && (p.sillage === "Intimate" || p.sillage === "Moderate")) score += 1;
    return { product: p, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.product);
}
