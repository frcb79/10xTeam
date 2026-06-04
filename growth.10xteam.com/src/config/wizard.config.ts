import type { ICPType } from "@/types/wizard.types";

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio_cards"
  | "channel_picker"
  | "flow_picker"
  | "range_select";

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface ValidationRule {
  type: "required" | "minLength" | "maxLength" | "minWords" | "noGenericWords" | "custom";
  value?: number | string[];
  message: string;
}

export interface WizardQuestion {
  id: string;
  step: 1 | 2 | 3 | 4 | 5;
  block: "A" | "B_b2b" | "B_b2c" | "B_common" | "C" | "D" | "E";
  type: QuestionType;
  label: string;
  labelB2C?: string;
  labelFreelancer?: string;
  placeholder?: string;
  helperText?: string;
  options?: QuestionOption[];
  validation: ValidationRule[];
  icpLayer: "situational" | "descriptive" | "psychographic" | "behavioral" | "economic";
  systemOutput: string;
  followUpProbe?: string;
  prefillKey?: string;
  showOnlyFor?: ICPType[];
  icpScoreWeight?: number;
}

export const GENERIC_WORDS = [
  "calidad",
  "excelencia",
  "innovacion",
  "innovador",
  "integral",
  "personalizado",
  "comprometidos",
  "dedicados",
  "expertos",
  "lideres",
  "mejor",
  "superior",
  "unico",
  "solucion",
  "servicio",
  "mundo",
  "clase mundial",
  "a tu medida",
];

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: "one_liner",
    step: 2,
    block: "A",
    type: "textarea",
    label: "Que hace tu empresa en una sola oracion?",
    labelB2C: "A que te dedicas y que ofreces?",
    placeholder:
      "Ejemplo: Ayudamos a clinicas dentales en CDMX a llenar su agenda con pacientes calificados usando un sistema automatizado de seguimiento por WhatsApp.",
    helperText: "Incluye: a quien ayudas, con que resultado y como.",
    validation: [
      { type: "required", message: "Esta descripcion es necesaria para generar materiales." },
      { type: "minWords", value: 10, message: "Necesitamos al menos 10 palabras." },
      {
        type: "noGenericWords",
        value: GENERIC_WORDS,
        message: "Evita palabras genericas. Se especifico con detalle.",
      },
    ],
    icpLayer: "descriptive",
    systemOutput: "Pitch, bio, primera frase del bot, headline.",
    followUpProbe: "Completa: Ayudamos a [quien] a [resultado] mediante [como].",
    prefillKey: "oneLiner",
    icpScoreWeight: 0,
  },
  {
    id: "industry",
    step: 2,
    block: "A",
    type: "select",
    label: "En que industria opera tu negocio?",
    options: [
      { value: "salud_odontologia", label: "Salud - Odontologia" },
      { value: "inmobiliaria", label: "Inmobiliaria y Construccion" },
      { value: "educacion", label: "Educacion y Capacitacion" },
      { value: "consultoria", label: "Consultoria y Servicios Profesionales" },
      { value: "tecnologia", label: "Tecnologia y Software" },
      { value: "marketing_agencia", label: "Marketing y Agencias Digitales" },
      { value: "otro", label: "Otro" },
    ],
    validation: [{ type: "required", message: "Selecciona la industria." }],
    icpLayer: "descriptive",
    systemOutput: "Activa snapshot y vocabulario.",
    prefillKey: "industry",
    icpScoreWeight: 0,
  },
  {
    id: "icp_type",
    step: 2,
    block: "A",
    type: "radio_cards",
    label: "A quien le vendes principalmente?",
    options: [
      { value: "b2b", label: "Empresas (B2B)", icon: "🏢" },
      { value: "b2c", label: "Personas (B2C)", icon: "👤" },
      { value: "mixed", label: "Ambos", icon: "🔀" },
      { value: "freelancer", label: "Profesional / Solopreneur", icon: "🧑‍💼" },
    ],
    validation: [{ type: "required", message: "Selecciona el tipo de ICP." }],
    icpLayer: "descriptive",
    systemOutput: "Define flujo de preguntas del paso 3.",
    icpScoreWeight: 0,
  },
  {
    id: "decision_maker_b2b",
    step: 3,
    block: "B_b2b",
    type: "text",
    label: "Quien toma la decision de comprarte?",
    placeholder: "Ej: Director Comercial, Dueno, Gerente de Marketing",
    validation: [
      { type: "required", message: "Necesitamos el cargo del decisor." },
      { type: "minLength", value: 3, message: "Especifica el cargo." },
    ],
    icpLayer: "descriptive",
    systemOutput: "Tono del copy y calificadores del bot.",
    showOnlyFor: ["b2b", "mixed"],
    icpScoreWeight: 0,
  },
  {
    id: "client_profile_b2c",
    step: 3,
    block: "B_b2c",
    type: "textarea",
    label: "Quien es tu cliente ideal?",
    labelFreelancer: "Cual es el perfil del profesional que mas se beneficia?",
    placeholder:
      "Ej: Mujer de 35-50 anos, duena de negocio propio con 1-5 anos, ingresos familiares de $50K-$150K MXN/mes.",
    validation: [
      { type: "required", message: "Necesitamos el perfil del cliente." },
      { type: "minWords", value: 12, message: "Describe con mas detalle." },
    ],
    icpLayer: "descriptive",
    systemOutput: "Tono de copy y segmentacion.",
    showOnlyFor: ["b2c", "freelancer", "mixed"],
    icpScoreWeight: 0,
  },
  {
    id: "main_pain",
    step: 3,
    block: "B_common",
    type: "textarea",
    label: "Cual es el problema mas urgente o frustrante de tu cliente ideal?",
    labelB2C: "Que dolor, deseo o necesidad tiene tu cliente para buscarte?",
    helperText: "Escribelo con palabras del cliente.",
    validation: [
      { type: "required", message: "El dolor es la base de tus materiales." },
      { type: "minWords", value: 15, message: "Agrega mas detalle y consecuencias." },
      {
        type: "noGenericWords",
        value: GENERIC_WORDS,
        message: "El dolor esta muy generico. Baja al detalle operativo.",
      },
    ],
    icpLayer: "situational",
    systemOutput: "Hooks, subject lines, bot opening, slide de problema.",
    prefillKey: "mainPain",
    icpScoreWeight: 25,
  },
  {
    id: "cost_of_inaction",
    step: 3,
    block: "B_common",
    type: "textarea",
    label: "Que pierde tu cliente si no resuelve esto en 6 meses?",
    validation: [
      { type: "required", message: "El costo de inaccion define urgencia." },
      { type: "minWords", value: 10, message: "Incluye consecuencias concretas." },
    ],
    icpLayer: "psychographic",
    systemOutput: "Argumentos de urgencia y ROI.",
    icpScoreWeight: 0,
  },
  {
    id: "main_outcome",
    step: 3,
    block: "B_common",
    type: "textarea",
    label: "Que resultado concreto y medible obtiene tu cliente?",
    validation: [
      { type: "required", message: "La promesa es clave para conversion." },
      { type: "minWords", value: 10, message: "Incluye metrica y tiempo." },
    ],
    icpLayer: "behavioral",
    systemOutput: "Promesa central, CTA, oferta.",
    prefillKey: "mainOutcome",
    icpScoreWeight: 25,
  },
];

export function getStepQuestions(step: 1 | 2 | 3 | 4 | 5, icpType: ICPType | null): WizardQuestion[] {
  return WIZARD_QUESTIONS.filter((q) => {
    if (q.step !== step) return false;

    // B_common is always visible for Step 3 regardless of ICP type.
    if (q.block === "B_common") return true;

    if (!q.showOnlyFor) return true;
    if (!icpType) return true;
    return q.showOnlyFor.includes(icpType);
  });
}

export function getQuestionLabel(question: WizardQuestion, icpType: ICPType | null): string {
  if (icpType === "freelancer") {
    return question.labelFreelancer ?? question.labelB2C ?? question.label;
  }
  if (icpType === "b2c") {
    return question.labelB2C ?? question.label;
  }
  return question.label;
}
