/**
 * Legal copy shown in-app at /legal/privacy and /legal/terms.
 *
 * IMPORTANT: replace SUPPORT_EMAIL and COMPANY_NAME with your real details
 * before going live — Stripe and the app stores both require a reachable
 * contact and an accurate operator name.
 */

export const COMPANY_NAME = 'Ideate';
export const SUPPORT_EMAIL = 'support@ideate.app';
export const LAST_UPDATED = 'August 14, 2026';

export type LegalDoc = 'privacy' | 'terms';

export type LegalSection = {
  heading: string;
  body: string[];
};

export type LegalContent = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

const PRIVACY: LegalContent = {
  title: 'Privacy Policy',
  intro: `This policy explains what ${COMPANY_NAME} collects, why, and what control you have over it. Last updated ${LAST_UPDATED}.`,
  sections: [
    {
      heading: 'What we collect',
      body: [
        'Prompts you write and the text generated from them. These are sent to our server so an AI provider can produce a result.',
        'Your email address, but only if you start a subscription. We use it to link your purchase and to restore access on another device.',
        'Basic anonymous usage events (screens opened, generations started) so we can see which features are used.',
      ],
    },
    {
      heading: 'What stays on your device',
      body: [
        'Your generation history, favorites and daily credit count are stored locally on your device. We do not upload your history to our servers.',
        'Clearing your history in the app removes it permanently. There is no server copy to recover.',
      ],
    },
    {
      heading: 'Who we share data with',
      body: [
        'OpenAI processes your prompt to generate text. Your prompt is sent to them for that purpose only.',
        'Stripe processes payments. Stripe receives your email and payment details. We never see or store your card number.',
        'We do not sell your data, and we do not share it with advertisers.',
      ],
    },
    {
      heading: 'How long we keep it',
      body: [
        'Prompts are processed to return a result and are not retained by us as a stored record tied to your identity.',
        'Subscription records (email, plan, status) are kept for as long as your subscription is active, plus the period required for accounting and tax purposes.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'You can request a copy of the data linked to your email, or ask us to delete it, at any time.',
        `Email ${SUPPORT_EMAIL} and we will respond within 30 days. Deleting your subscription data also ends your access to Pro.`,
      ],
    },
    {
      heading: 'Children',
      body: [
        'This app is not intended for anyone under 13, and we do not knowingly collect data from children.',
      ],
    },
    {
      heading: 'Changes',
      body: [
        'If we change this policy in a way that affects you, we will update the date above and show the new version in the app.',
      ],
    },
    {
      heading: 'Contact',
      body: [`Questions about privacy: ${SUPPORT_EMAIL}`],
    },
  ],
};

const TERMS: LegalContent = {
  title: 'Terms of Service',
  intro: `By using ${COMPANY_NAME} you agree to these terms. Please read them before subscribing. Last updated ${LAST_UPDATED}.`,
  sections: [
    {
      heading: 'The service',
      body: [
        `${COMPANY_NAME} generates business writing — ideas, marketing copy, emails, pitches and similar — from the prompts you provide.`,
        'Free use includes a limited number of generations per day. A Pro subscription removes that limit and unlocks premium categories.',
      ],
    },
    {
      heading: 'Billing and renewal',
      body: [
        'Pro is billed through Stripe as a recurring subscription, monthly or yearly depending on the plan you pick.',
        'Your subscription renews automatically at the end of each period until you cancel. The price shown at checkout is the price you are charged.',
        'You can cancel at any time using the manage-subscription link in your Stripe receipt email. Cancelling stops future charges; you keep Pro until the end of the period you already paid for.',
      ],
    },
    {
      heading: 'Refunds',
      body: [
        `If something went wrong with a charge, email ${SUPPORT_EMAIL} and we will look at it. Refunds outside of statutory rights are at our discretion.`,
      ],
    },
    {
      heading: 'AI output',
      body: [
        'Generated text is produced by an AI model. It can be inaccurate, generic, or unsuitable for your situation. Review and edit it before you use it.',
        'Output is not legal, financial, tax, or professional advice, and we do not guarantee any business result from using it.',
        'You are responsible for checking that anything you publish is accurate and does not infringe on someone else\u2019s rights.',
      ],
    },
    {
      heading: 'Your content',
      body: [
        'You keep the rights to the prompts you write. We only use them to generate your result.',
        'As between you and us, you are free to use the generated output commercially. Note that AI output may not be copyrightable in every jurisdiction, and similar output may be generated for other users.',
      ],
    },
    {
      heading: 'Acceptable use',
      body: [
        'Do not use the app to create spam, malware, harassment, hate speech, sexual content involving minors, or anything illegal.',
        'Do not attempt to resell, scrape, or automate access to the service, or to work around usage limits.',
        'We can suspend access that breaks these rules.',
      ],
    },
    {
      heading: 'Availability',
      body: [
        'We aim to keep the service running but do not promise uninterrupted availability. Generation depends on a third-party AI provider that can be slow or temporarily unavailable.',
      ],
    },
    {
      heading: 'Liability',
      body: [
        'To the extent permitted by law, our total liability to you is limited to the amount you paid us in the 12 months before the claim.',
        'We are not liable for lost profits, lost data, or indirect or consequential damages.',
      ],
    },
    {
      heading: 'Contact',
      body: [`Questions about these terms: ${SUPPORT_EMAIL}`],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalDoc, LegalContent> = {
  privacy: PRIVACY,
  terms: TERMS,
};

export function isLegalDoc(value: string | undefined): value is LegalDoc {
  return value === 'privacy' || value === 'terms';
}
