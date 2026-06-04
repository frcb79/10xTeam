import { GENERIC_WORDS } from "@/config/wizard.config";
import type { ICPQualityScore, WizardAnswers } from "@/types/wizard.types";

export function calculateLocalICPScore(answers: WizardAnswers): ICPQualityScore {
  const step3 = answers.step3_b2b ?? answers.step3_b2c;
  const step4 = answers.step4;

  const pain = step3?.mainPain ?? "";
  const outcome = step3?.mainOutcome ?? "";
  const differentiator = step4?.uniqueDifferentiator ?? "";

  const scores = {
    painInClientWords: scorePain(pain),
    measurablePromise: scorePromise(outcome),
    exclusiveDifferentiator: scoreDifferentiator(differentiator),
    actionableTrigger: scoreTrigger(pain, outcome),
  };

  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);

  const suggestions: string[] = [];

  if (scores.painInClientWords < 20) {
    suggestions.push(
      "El dolor necesita palabras del cliente y consecuencias concretas."
    );
  }
  if (scores.measurablePromise < 20) {
    suggestions.push(
      "La promesa necesita numero y tiempo (ej. 20 citas en 30 dias)."
    );
  }
  if (scores.exclusiveDifferentiator < 20) {
    suggestions.push(
      "El diferenciador debe describir proceso, no adjetivos generales."
    );
  }
  if (scores.actionableTrigger < 20) {
    suggestions.push(
      "Define un detonador accionable para saber cuando contactar al prospecto."
    );
  }

  return {
    total,
    breakdown: scores,
    suggestions,
    canProceed: total >= 40,
  };
}

function scorePain(pain: string): number {
  if (!pain || pain.length < 20) return 0;

  const words = pain.toLowerCase().split(/\s+/);
  const hasGenericWords = GENERIC_WORDS.some((word) => pain.toLowerCase().includes(word));
  const hasConsequences =
    pain.includes("porque") ||
    pain.includes("ya que") ||
    pain.includes("esto causa") ||
    pain.includes("resultado");

  let score = 5;
  if (words.length >= 20) score += 5;
  if (!hasGenericWords) score += 8;
  if (hasConsequences) score += 7;

  return Math.min(score, 25);
}

function scorePromise(outcome: string): number {
  if (!outcome || outcome.length < 10) return 0;

  const hasNumber = /\d/.test(outcome);
  const hasTime = /semana|semanas|mes|meses|dia|dias|hora|horas|week|month|day/i.test(outcome);
  const hasPercentage = /%|por ciento/i.test(outcome);

  let score = 5;
  if (hasNumber) score += 8;
  if (hasTime) score += 7;
  if (hasPercentage) score += 3;
  if (outcome.split(/\s+/).length >= 10) score += 2;

  return Math.min(score, 25);
}

function scoreDifferentiator(differentiator: string): number {
  if (!differentiator || differentiator.length < 20) return 0;

  const hasGenericWords = GENERIC_WORDS.some((word) =>
    differentiator.toLowerCase().includes(word)
  );
  const hasMechanismSignal = /proceso|sistema|metodo|framework|secuencia/i.test(
    differentiator
  );

  let score = 5;
  if (!hasGenericWords) score += 8;
  if (hasMechanismSignal) score += 7;
  if (differentiator.split(/\s+/).length >= 15) score += 5;

  return Math.min(score, 25);
}

function scoreTrigger(pain: string, outcome: string): number {
  if (!pain) return 0;

  const hasEvent = /cuando|despues|antes|al momento|en cuanto|ya no/i.test(pain);
  const hasOutcomeTime = /semana|mes|dia|hora|week|month|day/i.test(outcome);

  let score = 5;
  if (hasEvent) score += 12;
  if (hasOutcomeTime) score += 8;

  return Math.min(score, 25);
}
