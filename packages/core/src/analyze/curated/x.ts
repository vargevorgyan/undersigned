import type { PolicyAnalysis } from "../schema";

const none = { value: "unclear" as const, quote: "" };

/** Reviewed by hand against the X privacy policy as extracted (only its "information we collect" section, no effective date shown) and the October 9, 2026 terms of service. */
export const X: Record<string, PolicyAnalysis> = {
  "https://x.com/en/privacy": {
    serviceName: "X (Twitter)",
    documentType: "privacy",
    summary:
      "X collects your posts, likes and who you follow, plus the contents of your Direct Messages, the apps on your phone, and searches you typed but never sent. It tries to work out who you are even when you're logged out, and combines what advertisers send it with everything else it knows. Only the part of the policy about what X collects could be read here, so how it shares or deletes data isn't covered.",
    grade: "D",
    highlights: [
      {
        title: "Your Direct Messages are collected",
        explanation: "X collects the contents of your DMs, not just who you messaged and when. For encrypted messages it collects the metadata.",
        severity: "bad",
        quote: "when you use Direct Messages, including the contents of the messages, the recipients, and date and time of messages.",
      },
      {
        title: "It guesses who you are when logged out",
        explanation: "Even without signing in, X may work out your identity from the data it collects, and it can link your account to browsers and devices you never signed in on.",
        severity: "bad",
        quote: "When you access X and are not signed in, we may infer your identity based on the information we collect.",
      },
      {
        title: "Lookalike email addresses get linked to you",
        explanation: "X may connect your account to other email addresses that resemble yours, to learn more about who you are.",
        severity: "bad",
        quote: "for example by associating your account with hashes of email addresses that share common components with the email address you have provided to X.",
      },
      {
        title: "Advertisers' data is merged with yours",
        explanation: "Ad partners send X what you viewed and did on their sites and apps, along with hashed emails and interest data. X combines it with everything else it has on you.",
        severity: "bad",
        quote: "Information shared by ad partners and affiliates or collected by X from the websites and apps of ad partners and affiliates may be combined with the other information you share with X",
      },
      {
        title: "Searches you never submitted",
        explanation: "X logs search terms even when you didn't press enter, and does this for people without an account too.",
        severity: "caution",
        quote: "search terms and IDs (including those not submitted as queries)",
      },
      {
        title: "It sees which apps you have installed",
        explanation: "Device data includes your advertising ID, the apps installed on your phone, and even your battery level.",
        severity: "caution",
        quote: "such as device and advertising ID, operating system, carrier, language, memory, apps installed, and battery level.",
      },
      {
        title: "Biometric data, with your consent",
        explanation: "X may collect biometric information for safety and identification. The policy doesn't say what kind.",
        severity: "caution",
        quote: "Based on your consent, we may collect and use your biometric information for safety, security, and identification purposes.",
      },
      {
        title: "Job hunting data is used for ads",
        explanation: "If you use X's job features, your work history and job search activity are shared with employers you apply to and also used to target ads.",
        severity: "caution",
        quote: "to share with potential employers when you apply for a job, to enable connections for professional opportunities, and to show you more relevant advertising.",
      },
      {
        title: "Precise location only if you turn it on",
        explanation: "X always collects your rough location, but exact location and past places are only collected if you enable them.",
        severity: "neutral",
        quote: "You can also choose to share your current precise location or places where you’ve previously used X by enabling these settings in your account.",
      },
      {
        title: "You don't have to use your real name",
        explanation: "Your display name and username are always public, but they can be a pseudonym, and you can have several accounts.",
        severity: "good",
        quote: "Your profile information, which includes your display name and username, is always public, but you can use either your real name or a pseudonym.",
      },
    ],
    // The extracted policy stops after the "information we collect" section, so sharing, rights and retention facts are unclear.
    facts: {
      sellsData: none,
      sharesWithAdvertisers: none,
      usesDataForAITraining: none,
      tracksAcrossSites: { value: "yes", quote: "Some of our ad partners, particularly our advertisers, also enable us to collect similar information directly from their website or app by integrating our advertising technology." },
      collectsPreciseLocation: { value: "yes", quote: "You can also choose to share your current precise location or places where you’ve previously used X by enabling these settings in your account." },
      collectsBiometrics: { value: "yes", quote: "Based on your consent, we may collect and use your biometric information for safety, security, and identification purposes." },
      canDeleteAccount: none,
      canExportData: none,
      forcedArbitration: none,
      classActionWaiver: none,
      changesWithoutNotice: none,
      sharesWithGovernmentWithoutWarrant: none,
    },
    business: {
      perpetualContentLicense: none,
      liabilityCapLow: none,
      shortClaimDeadline: none,
      internationalTransfers: none,
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Not stated",
    jurisdiction: "Not stated",
  },

  "https://x.com/en/tos": {
    serviceName: "X (Twitter)",
    documentType: "terms",
    summary:
      "You still own your posts, but X can use them to train its AI and hand them to other companies, and using X counts as your only payment. If X harms you, the most it owes is $100 or what you paid in the last six months, and any lawsuit has to be filed in Texas, on your own rather than as a class action. X can also close your account for no reason at all.",
    grade: "E",
    highlights: [
      {
        title: "Your posts train X's AI",
        explanation: "The license you give X explicitly covers training its machine learning and AI models, generative or otherwise.",
        severity: "bad",
        quote: "for use with and training of our machine learning and artificial intelligence models, whether generative or another type",
      },
      {
        title: "Using X is your only payment",
        explanation: "X and other companies it shares your content with can use it for any purpose. The terms say access to X is all the compensation you get.",
        severity: "bad",
        quote: "as the use of the Services by you is hereby agreed as being sufficient compensation for the Content and grant of rights herein.",
      },
      {
        title: "The most they'll owe you: $100",
        explanation: "X's total liability is capped at $100, or what you paid in the last six months if that's more.",
        severity: "bad",
        quote: "IN NO EVENT SHALL THE AGGREGATE LIABILITY OF THE X ENTITIES EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS (U.S. $100.00) OR THE AMOUNT YOU PAID US, IF ANY, IN THE PAST SIX MONTHS",
      },
      {
        title: "Any lawsuit must be filed in Texas",
        explanation: "Wherever you live, disputes go only to courts in two Texas counties. If that rule is struck down, private arbitration in Texas applies instead.",
        severity: "bad",
        quote: "shall be brought and must proceed exclusively in the federal or state courts located in Wichita County or Tarrant County, Texas, United States",
      },
      {
        title: "No class actions, even against SpaceX",
        explanation: "You give up jury trials and class actions against X, and the waiver also covers its affiliates SpaceXAI, Cursor and SpaceX.",
        severity: "bad",
        quote: "AGAINST OUR CORPORATE AFFILIATES, INCLUDING BUT NOT LIMITED TO ANY SPACEXAI, CURSOR, OR SPACEX ENTITY.",
      },
      {
        title: "Your account can go for no reason",
        explanation: "Besides rule breaking or inactivity, X may close your account simply because it wants to.",
        severity: "bad",
        quote: "we may also terminate your account or cease providing you with all or part of the Services for any other reason or no reason at our convenience.",
      },
      {
        title: "$15,000 for every million posts viewed",
        explanation: "If you break the terms, for example by scraping, X can charge $15,000 for each million posts you access in a day.",
        severity: "caution",
        quote: "$15,000 USD per 1,000,000 posts.",
      },
      {
        title: "One year for federal claims",
        explanation: "Federal claims must be filed within a year and state claims within two years and a day, or they're lost for good.",
        severity: "caution",
        quote: "you must initiate any proceeding or action asserting a federal claim within one (1) year of the date of the occurrence of the event or facts giving rise to a dispute",
      },
      {
        title: "X only tries to tell you about changes",
        explanation: "X promises to try to notify you of material changes, not to actually do it. Continuing to use X means you accept them.",
        severity: "caution",
        quote: "We will try to notify you of material revisions, for example via a service notification or an email to the email associated with your account.",
      },
      {
        title: "You still own what you post",
        explanation: "Your posts, photos and videos stay yours, even though X gets a broad license to use them.",
        severity: "good",
        quote: "What’s yours is yours — you own your Content",
      },
    ],
    facts: {
      sellsData: none,
      sharesWithAdvertisers: none,
      usesDataForAITraining: { value: "yes", quote: "for use with and training of our machine learning and artificial intelligence models, whether generative or another type" },
      tracksAcrossSites: none,
      collectsPreciseLocation: none,
      collectsBiometrics: none,
      // The terms only mention deactivating, and say they survive it; whether data is deleted is left to the privacy policy.
      canDeleteAccount: { value: "unclear", quote: "You may end your legal agreement with us at any time by deactivating your accounts and discontinuing your use of the Services." },
      canExportData: none,
      // Disputes go to Texas courts; arbitration is only a fallback if the forum clause is unenforceable.
      forcedArbitration: { value: "no", quote: "shall be brought and must proceed exclusively in the federal or state courts located in Wichita County or Tarrant County, Texas, United States" },
      classActionWaiver: { value: "yes", quote: "YOU AND X ARE EACH WAIVING THE RIGHT TO A TRIAL BY JURY OR TO BRING, JOIN, OR PARTICIPATE IN ANY PURPORTED CLASS ACTION" },
      // X only promises to "try" to notify, so changes can take effect without notice.
      changesWithoutNotice: { value: "yes", quote: "We will try to notify you of material revisions, for example via a service notification or an email to the email associated with your account." },
      sharesWithGovernmentWithoutWarrant: { value: "yes", quote: "We also reserve the right to access, read, preserve, and disclose any information as we reasonably believe is necessary to (i) satisfy any applicable law, regulation, legal process or governmental request" },
    },
    business: {
      // The license has no end date and Section 3 survives termination of the account.
      perpetualContentLicense: { value: "yes", quote: "except that the following sections shall continue to apply: 2, 3, 5, 6, and the misuse provisions of Section 4" },
      liabilityCapLow: { value: "yes", quote: "IN NO EVENT SHALL THE AGGREGATE LIABILITY OF THE X ENTITIES EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS (U.S. $100.00) OR THE AMOUNT YOU PAID US, IF ANY, IN THE PAST SIX MONTHS" },
      // One year for federal claims; state-law claims get two years and a day.
      shortClaimDeadline: { value: "yes", quote: "you must initiate any proceeding or action asserting a federal claim within one (1) year of the date of the occurrence of the event or facts giving rise to a dispute" },
      internationalTransfers: { value: "yes", quote: "including the transfer of this information to the United States, Ireland, and/or other countries for storage, processing and use by us and our affiliates." },
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Not stated",
    jurisdiction: "Texas, USA. Disputes go to state or federal courts in Wichita or Tarrant County, Texas, with arbitration in Tarrant County only if that rule is unenforceable.",
  },
};
