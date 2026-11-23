import type { PolicyAnalysis } from "../schema";

const none = { value: "unclear" as const, quote: "" };

/** Reviewed by hand against the privacy policy and terms of service, both effective December 15, 2026. */
export const DISCORD: Record<string, PolicyAnalysis> = {
  "https://discord.com/privacy": {
    serviceName: "Discord",
    documentType: "privacy",
    summary:
      "Discord says it doesn't sell your data, and voice and video calls are designed to be end-to-end encrypted. It does collect what you do on the app, which game you're playing, and data about you from outside companies, and it uses public posts to build its machine-learning systems. You can download your data, delete your account, and switch off several kinds of data use in settings.",
    grade: "B",
    highlights: [
      {
        title: "Public posts help build Discord's AI",
        explanation: "Posts, usernames, avatars and server names that are widely visible can be used to train models and power features like conversation catch-up summaries.",
        severity: "bad",
        quote: "We may also use content posted in larger spaces to help us develop, improve, and power our services, including features that help you catch up on conversations",
      },
      {
        title: "Data brokers send information about you",
        explanation: "Discord may get demographic details and information about what you do outside Discord from advertisers and third-party data providers, and combine it with what it already has.",
        severity: "bad",
        quote: "We may also receive information about you from advertisers, partners and third-party data providers, such as demographic information and how you engage with other products and services outside of Discord.",
      },
      {
        title: "Admins can put your posts on Google",
        explanation: "Server owners, not you, decide whether a server is open to anyone and whether its content shows up off Discord, including in search results. These settings can change after you post.",
        severity: "caution",
        quote: "They control whether a server requires an invite link or content posted to the server is open and accessible to anyone, including whether the content is available off of Discord such as in search engine results.",
      },
      {
        title: "It sees which game you're playing",
        explanation: "While Discord is running, it can collect information from your device such as the game you have open, and linked accounts can share the song you're listening to.",
        severity: "caution",
        quote: "We may also collect limited information from your device while Discord is running (such as the game you are playing).",
      },
      {
        title: "Bots play by their own rules",
        explanation: "Apps and bots added by server admins are run by third parties. Discord requires them to have a privacy policy but doesn't control what they collect.",
        severity: "caution",
        quote: "But because these services are operated by third parties, we don’t control them or what information they collect.",
      },
      {
        title: "Personalized sponsored content may be on by default",
        explanation: "Depending on where you live, Quests and other sponsored content may be tailored to you without asking first. You can switch it off.",
        severity: "caution",
        quote: "But in other regions, sponsored content may be personalized by default (and you can disable it).",
      },
      {
        title: "Deleting doesn't always mean gone",
        explanation: "Deleting your account removes identifying information and anonymizes the rest, but some content can be kept under Discord's data retention policy or for legal reasons.",
        severity: "neutral",
        quote: "Content may be retained by Discord for use as described elsewhere in this policy and in our data retention policy.",
      },
      {
        title: "Calls are end-to-end encrypted",
        explanation: "Voice and video calls are designed so only the people in the call can hear them, and Discord says it generally doesn't store call contents.",
        severity: "good",
        quote: "Voice and video communications on Discord are designed to be end-to-end encrypted.",
      },
      {
        title: "Your data isn't for sale",
        explanation: "Discord says it makes money from subscriptions, paid products and sponsored content, not from selling personal information.",
        severity: "good",
        quote: "We don’t sell your personal information.",
      },
      {
        title: "Settings to limit data use",
        explanation: "You can turn off use of your data for improving the service, personalization and sponsored content, and request a copy of your data, which should arrive within 30 days.",
        severity: "good",
        quote: "If you turn off these settings, we will stop collecting and using new information about how you use and/or navigate Discord in order to understand and improve our services as described in these settings.",
      },
    ],
    facts: {
      sellsData: { value: "no", quote: "We don’t sell your personal information." },
      // Discord shares limited data with ad platforms to advertise itself, and with measurement partners for sponsored content.
      sharesWithAdvertisers: { value: "yes", quote: "We may also provide limited information to advertising platforms to help us reach people that we think will like our products and to measure the performance of our ads shown on those platforms." },
      usesDataForAITraining: { value: "yes", quote: "to develop features or machine learning models that make Discord safer and better to use" },
      tracksAcrossSites: { value: "yes", quote: "We may also receive information about you from advertisers, partners and third-party data providers, such as demographic information and how you engage with other products and services outside of Discord." },
      collectsPreciseLocation: none,
      // Age checks can use a selfie, but outside providers handle it and Discord only keeps the resulting age signal.
      collectsBiometrics: { value: "unclear", quote: "We work with trusted providers so that Discord doesn’t handle the information you submit to confirm your age, such as a selfie, identify documents, or credit card details." },
      canDeleteAccount: { value: "yes", quote: "You can disable or delete your account via the “Account” settings in Discord." },
      canExportData: { value: "yes", quote: "you can request a copy of your data in the “Data & Privacy” settings in Discord" },
      forcedArbitration: none,
      classActionWaiver: none,
      changesWithoutNotice: { value: "no", quote: "We always indicate the date the last changes were published, and if changes are significant, we’ll provide a more prominent notice as required by law" },
      sharesWithGovernmentWithoutWarrant: { value: "yes", quote: "We may disclose information if we believe in good faith that it's necessary to prevent death or other serious harm to a person." },
    },
    business: {
      perpetualContentLicense: none,
      liabilityCapLow: none,
      shortClaimDeadline: none,
      internationalTransfers: { value: "yes", quote: "you understand that your information will be processed, transferred, and stored in the U.S. and other countries" },
      breachNotification: none,
      // Only payment processors are named as examples; there is no list of vendors.
      namesSubprocessors: { value: "no", quote: "Vendors who support our technical infrastructure may sometimes process or host your information." },
    },
    dataRetention: "Kept until Discord decides it's no longer needed, with details in a separate data retention policy. Deleting your account removes identifying information and anonymizes the rest; some data is kept for legal reasons.",
    jurisdiction: "Not stated",
  },

  "https://discord.com/terms": {
    serviceName: "Discord",
    documentType: "terms",
    summary:
      "If you live in the US or Canada, disputes with Discord go to private arbitration instead of court, unless you email an opt-out within 30 days. Before any claim you must fill in a form and join a call with Discord yourself, and the most Discord owes you is $100 or what you paid in the last three months. Discord can suspend or close your account for any reason, including two years of inactivity, but you can appeal its decisions.",
    grade: "D",
    highlights: [
      {
        title: "The most they'll owe you: $100",
        explanation: "Whatever goes wrong, Discord's liability is capped at what you paid in the three months before your claim, or $100 if that's more.",
        severity: "bad",
        quote: "DISCORD LIMITS OUR LIABILITY TO YOU TO THE GREATER OF (A) THE AMOUNTS YOU HAVE PAID US IN THE THREE MONTHS BEFORE YOU FIRST ASSERT A CLAIM OR (B) $100 USD",
      },
      {
        title: "No court or jury in the US and Canada",
        explanation: "Disputes go to private arbitration, one person at a time. You can't join a class action or ask for a jury.",
        severity: "bad",
        quote: "IF YOU’RE A U.S. OR CANADIAN RESIDENT YOU AGREE TO THE FOLLOWING “AGREEMENT TO ARBITRATE” WHICH, CONTAINS MANDATORY ARBITRATION PROVISIONS.",
      },
      {
        title: "You must join a call first",
        explanation: "Before any lawsuit or arbitration, you have to submit Discord's dispute form and be personally available for a phone or video call, even if you have a lawyer.",
        severity: "bad",
        quote: "you, along with your counsel if you have one, must be available personally for a telephone or videoconference to resolve your claims",
      },
      {
        title: "Turn down an offer, risk paying costs",
        explanation: "Either side can make a settlement offer before a hearing. If you reject it and then win less, you pay Discord's costs from that point on.",
        severity: "bad",
        quote: "the other Party will not recover its post-offer costs and will pay the offering Party’s costs from the time of the offer.",
      },
      {
        title: "Group claims are slowed down",
        explanation: "If 100 or more people file similar claims, they are handled in batches of 100, one batch at a time, which can delay everyone's case.",
        severity: "bad",
        quote: "to administer the Mass Filing in batches of 100 demands per batch",
      },
      {
        title: "One year to bring any claim",
        explanation: "If you don't act within a year of the problem, you lose the right to bring a claim.",
        severity: "bad",
        quote: "No action, regardless of form, arising out of or relating to a Dispute may be brought by either Party more than one (1) year after the cause of action has accrued.",
      },
      {
        title: "Inactive for two years? Account can go",
        explanation: "Discord can suspend or close your account for any reason, with or without notice. Two years without using it is one of the listed reasons.",
        severity: "caution",
        quote: "Your account has been inactive for more than two years.",
      },
      {
        title: "Parents answer for their kids",
        explanation: "A parent who lets a child use Discord is bound by the terms and responsible for everything the child does, including purchases.",
        severity: "caution",
        quote: "you and your minor child accept and agree to be bound by these terms and are responsible for all use of the Discord services, including your child’s activity on the services and purchases made by them",
      },
      {
        title: "You can opt out of arbitration",
        explanation: "Email an opt-out notice within 30 days of signing up (or of December 22, 2026, whichever is later) to keep your right to go to court.",
        severity: "good",
        quote: "You can decline this Agreement to Arbitrate–and no other provision of these terms–by emailing an opt-out notice to arbitration-opt-out@discord.com within 30 days",
      },
      {
        title: "You can appeal bans and removals",
        explanation: "Any enforcement action, including suspensions, terminations and removed content, can be appealed through a form or in the app.",
        severity: "good",
        quote: "You can appeal any enforcement action we take under these terms or other policies, including terminations, suspensions, or content removals",
      },
    ],
    facts: {
      sellsData: none,
      sharesWithAdvertisers: none,
      usesDataForAITraining: none,
      tracksAcrossSites: none,
      collectsPreciseLocation: none,
      collectsBiometrics: none,
      canDeleteAccount: { value: "yes", quote: "To terminate this agreement, you may delete your Discord account through the Settings page in the Discord app" },
      canExportData: none,
      forcedArbitration: { value: "yes", quote: "IF YOU’RE A U.S. OR CANADIAN RESIDENT YOU AGREE TO THE FOLLOWING “AGREEMENT TO ARBITRATE” WHICH, CONTAINS MANDATORY ARBITRATION PROVISIONS." },
      classActionWaiver: { value: "yes", quote: "you may not bring a claim as a plaintiff or a class member in a class, collective, or representative action." },
      // Advance notice is promised only for material changes, and not for urgent ones.
      changesWithoutNotice: { value: "no", quote: "If these changes materially affect your Discord use or your legal rights, we’ll give you reasonable advance notice (unless the updates are urgent)." },
      sharesWithGovernmentWithoutWarrant: { value: "yes", quote: "You agree that we may disclose your content to third parties outside of the services when we believe we’re required to do so by law or regulation or that doing so is necessary to prevent harm to a person" },
    },
    business: {
      // The content license has no stated end; only the feedback license is called perpetual and irrevocable.
      perpetualContentLicense: { value: "unclear", quote: "This license is worldwide, non-exclusive (which means you can still license your content to others), royalty-free (which means there are no fees for this license), sublicensable, and transferable." },
      liabilityCapLow: { value: "yes", quote: "DISCORD LIMITS OUR LIABILITY TO YOU TO THE GREATER OF (A) THE AMOUNTS YOU HAVE PAID US IN THE THREE MONTHS BEFORE YOU FIRST ASSERT A CLAIM OR (B) $100 USD" },
      shortClaimDeadline: { value: "yes", quote: "No action, regardless of form, arising out of or relating to a Dispute may be brought by either Party more than one (1) year after the cause of action has accrued." },
      internationalTransfers: none,
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Not stated",
    jurisdiction: "California law. Non-arbitrable disputes go to courts in New Castle County, Delaware; US and Canadian users go to individual arbitration (NAM, or ADR Services for California residents). EU consumers can use the courts of Amsterdam or their home country.",
  },
};
