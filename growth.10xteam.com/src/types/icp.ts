export type WizardData = {
  companyName: string;
  industry: string;
  employeeRange: string;
  idealRole: string;
  mainPain: string;
  expectedOutcome: string;
  preferredChannels: string[];
  monthlyLeadGoal: string;
};

export type ChannelMaterial = {
  headline: string;
  message: string;
  cta: string;
  assets: string[];
};

export type SocialPost = {
  channel: string;
  title: string;
  body: string;
};

export type GeneratedMaterials = {
  icpSummary: string;
  onePagerOutline: string[];
  pitchDeckOutline: string[];
  callScript: string[];
  channels: Record<string, ChannelMaterial>;
  socialPosts: SocialPost[];
};
