import type { PolicyAnalysis } from "../schema";

const none = { value: "unclear" as const, quote: "" };

/** Reviewed by hand against the LinkedIn privacy policy (no effective date shown in the extracted text) and the November 3, 2025 user agreement. */
export const LINKEDIN: Record<string, PolicyAnalysis> = {
  "https://www.linkedin.com/legal/privacy-policy": {
    serviceName: "LinkedIn",
    documentType: "privacy",
    summary:
      "LinkedIn uses your profile, activity and posts to train AI, and shares data with Microsoft, including to help Microsoft's own advertising. It guesses things you never told it, like your age, gender and pay bracket, to target ads, and it tracks you on other websites. On the plus side, you can download your data, your employer can't see your job searches, and a closed account is generally deleted within 30 days.",
    grade: "C",
    highlights: [
      {
        title: "Your data trains AI models",
        explanation: "LinkedIn says it may use your personal data to develop and train AI models, alongside improving its services.",
        severity: "bad",
        quote: "We may use your personal data to improve, develop, and provide products and Services, develop and train artificial intelligence (AI) models",
      },
      {
        title: "Microsoft gets your data for its ads",
        explanation: "Subject to separate rules for Europe, LinkedIn may share your public posts with Microsoft and other affiliates, and your personal data to build their advertising services.",
        severity: "bad",
        quote: "personal data to improve, provide or develop their advertising services.",
      },
      {
        title: "It guesses your pay, age and gender",
        explanation: "To target ads, LinkedIn infers your salary bracket from your job title, your age from graduation dates, and your gender from your first name or pronouns.",
        severity: "bad",
        quote: "using job titles from a profile to infer industry, seniority, and compensation bracket; using graduation dates to infer age or using first names or pronoun usage to infer gender",
      },
      {
        title: "Tracked even where you never used LinkedIn",
        explanation: "Outside the EU, LinkedIn or Microsoft collects your device's ad ID, IP address and browser details even when that device has never engaged with LinkedIn, to show members relevant ads.",
        severity: "bad",
        quote: "information about your device where you have not engaged with our Services (e.g., ad ID, IP address, operating system and browser information)",
      },
      {
        title: "Other people's calendars include you",
        explanation: "LinkedIn collects your details when others sync their calendars, upload their contacts or scan your business card, even if you never agreed.",
        severity: "caution",
        quote: "We receive personal data (including contact information) about you when others import or sync their calendar with our Services, associate their contacts with Member profiles, scan and upload business cards",
      },
      {
        title: "Recruiters can export your profile",
        explanation: "Paying customers can export your name, headline, employer, title and general location for sales or hiring lists unless you opt out.",
        severity: "caution",
        quote: "Customers can export limited information from your profile, such as name, headline, current company, current title, and general location (e.g., Dublin), such as to manage sales leads or talent, unless you opt-out.",
      },
      {
        title: "Your name and photo in ads",
        explanation: "Liking a company can put your name and photo next to its sponsored posts, depending on your settings.",
        severity: "caution",
        quote: "For example, when you like a company we may include your name and photo when their sponsored content is shown.",
      },
      {
        title: "Messages scanned for AI helpers",
        explanation: "If your settings allow, LinkedIn scans your messages to draft replies, summarize conversations and suggest next steps.",
        severity: "caution",
        quote: "If your settings allow, we scan messages to provide “bots” or similar tools that facilitate tasks such as scheduling meetings, drafting responses, summarizing messages or recommending next steps.",
      },
      {
        title: "Your employer won't see job searches",
        explanation: "Even when your employer pays for your LinkedIn tools, your job hunting and personal messages aren't shared with it unless you share them yourself.",
        severity: "good",
        quote: "We understand that certain activities such as job hunting and personal messages are sensitive, and so we do not share those with your employer",
      },
      {
        title: "Delete or download your data",
        explanation: "You can get a copy of your data in a machine-readable format. A closed account disappears within 24 hours and is generally deleted within 30 days, though some data is kept for legal and security reasons.",
        severity: "good",
        quote: "We generally delete closed account information within 30 days of account closure, except as noted below.",
      },
    ],
    facts: {
      // The policy never says "sell"; it says it doesn't share data for others' direct marketing without permission.
      sellsData: { value: "unclear", quote: "We currently do not share personal data with third parties for their direct marketing purposes without your permission." },
      sharesWithAdvertisers: { value: "yes", quote: "We do not share your personal data with any non-Affiliated third-party advertisers or ad networks except for: (i) hashed IDs or device identifiers" },
      usesDataForAITraining: { value: "yes", quote: "We may use your personal data to improve, develop, and provide products and Services, develop and train artificial intelligence (AI) models" },
      tracksAcrossSites: { value: "yes", quote: "to recognize you and your device(s) on, off and across different services and devices where you have engaged with our Services." },
      collectsPreciseLocation: { value: "yes", quote: "We will ask you to opt-in before we use GPS or other tools to identify your precise location." },
      collectsBiometrics: none,
      canDeleteAccount: { value: "yes", quote: "We generally delete closed account information within 30 days of account closure, except as noted below." },
      canExportData: { value: "yes", quote: "You can ask us for a copy of your personal data and can ask for a copy of personal data you provided in machine readable form." },
      forcedArbitration: none,
      classActionWaiver: none,
      changesWithoutNotice: { value: "no", quote: "if we make material changes to it, we will provide notice through our Services, or by other means, to provide you the opportunity to review the changes before they become effective." },
      sharesWithGovernmentWithoutWarrant: { value: "yes", quote: "or if we have a good faith belief that disclosure is reasonably necessary to (1) investigate, prevent or take action regarding suspected or actual illegal activities or to assist government enforcement agencies" },
    },
    business: {
      perpetualContentLicense: none,
      liabilityCapLow: none,
      shortClaimDeadline: none,
      internationalTransfers: { value: "yes", quote: "Countries where we process data may have laws which are different from, and potentially not as protective as, the laws of your own country." },
      breachNotification: none,
      namesSubprocessors: { value: "no", quote: "We use others to help us provide our Services (e.g., maintenance, analysis, audit, payments, fraud detection, customer support, marketing and development)." },
    },
    dataRetention: "Most data is kept as long as your account is open, even if you only log in every few years. After you close it, your profile disappears within 24 hours and data is generally deleted within 30 days; some is kept longer for legal, security and fraud reasons, and things you shared with others stay visible.",
    jurisdiction: "Not stated. LinkedIn Ireland is the data controller in the EU, EEA and Switzerland; LinkedIn Corporation everywhere else.",
  },

  "https://www.linkedin.com/legal/user-agreement": {
    serviceName: "LinkedIn",
    documentType: "terms",
    summary:
      "You own what you post, but LinkedIn and Microsoft get a broad right to use, change and pass it on without asking or paying you, until you delete it or close your account. If something goes wrong, LinkedIn owes you at most what you paid or $1,000. Unlike many apps, there's no forced arbitration: disputes go to regular courts, and people in Europe can sue in their home country.",
    grade: "B",
    highlights: [
      {
        title: "A broad license, no notice or pay",
        explanation: "LinkedIn and its affiliates, including Microsoft, can use, modify, distribute and sublicense what you post without asking, telling or paying you.",
        severity: "bad",
        quote: "A worldwide, transferable and sublicensable right to use, copy, modify, distribute, publicly perform and display, host, and process your content and other information without any further consent, notice and/or compensation to you or others.",
      },
      {
        title: "It can bill an expired or backup card",
        explanation: "LinkedIn may keep charging your card after it expires, and if it fails, charge a backup card you saved.",
        severity: "caution",
        quote: "We may store and continue billing your payment method (e.g., credit card), even after it has expired",
      },
      {
        title: "The most they'll owe you: $1,000",
        explanation: "LinkedIn's liability is capped at what you paid or $1,000. The cap doesn't apply to death, injury, fraud or gross negligence.",
        severity: "caution",
        quote: "FOR ANY AMOUNT THAT EXCEEDS (A) THE TOTAL FEES PAID OR PAYABLE BY YOU TO LINKEDIN FOR THE SERVICES DURING THE TERM OF THIS CONTRACT, IF ANY, OR (B) US $1000.",
      },
      {
        title: "Some changes come without warning",
        explanation: "Material changes are usually announced in advance, but not when the law requires them immediately or when they relate to a new feature.",
        severity: "caution",
        quote: "However, we may not always provide prior notice of changes to these terms",
      },
      {
        title: "LinkedIn isn't a backup for your work",
        explanation: "LinkedIn doesn't promise to keep or show anything you post, or to give you a copy, beyond what the law requires.",
        severity: "caution",
        quote: "LinkedIn is not a storage service.",
      },
      {
        title: "Your employer sees your paid-seat use",
        explanation: "If your employer pays for tools like Recruiter or LinkedIn Learning, it controls access and gets reports on how you use them. It has no rights to your personal account.",
        severity: "caution",
        quote: "the party paying for such Service has the right to control access to and get reports on your use of such paid Service",
      },
      {
        title: "One account, real name, 16 or older",
        explanation: "You may only have one account, it must use your real name, and you must be at least 16.",
        severity: "neutral",
        quote: "you will only have one LinkedIn account, which must be in your real name",
      },
      {
        title: "No forced arbitration",
        explanation: "Disputes go to regular courts in California, or for people in Europe, to the courts of their home country.",
        severity: "good",
        quote: "you and LinkedIn agree to choose the courts of the country to which we direct your Services where you have habitual residence",
      },
      {
        title: "Delete a post, end the license",
        explanation: "Deleting content or closing your account ends LinkedIn's license, except for copies others already shared or that were already sublicensed.",
        severity: "good",
        quote: "You can end this license for specific content by deleting such content from the Services, or generally by closing your account",
      },
      {
        title: "Job hunting stays private by default",
        explanation: "Applying for a job or signalling interest is shared only with the job poster, not your connections or the public.",
        severity: "good",
        quote: "For job searching activities, we default to not notifying your connections or the public.",
      },
    ],
    facts: {
      sellsData: none,
      sharesWithAdvertisers: none,
      usesDataForAITraining: none,
      tracksAcrossSites: none,
      collectsPreciseLocation: none,
      collectsBiometrics: none,
      canDeleteAccount: { value: "yes", quote: "If you wish to terminate this Contract at any time, you can do so by closing your account and no longer accessing or using our Services." },
      // The terms deny any duty to give you a copy beyond the law and the privacy policy, which does offer one.
      canExportData: { value: "unclear", quote: "You agree that we have no obligation to store, maintain or provide you a copy of any content or other information that you or others provide" },
      forcedArbitration: { value: "no", quote: "You and LinkedIn both agree that all claims and disputes can be litigated only in the federal or state courts in Santa Clara County, California, USA" },
      classActionWaiver: none,
      // Notice is skipped for legally urgent changes and changes tied to new features.
      changesWithoutNotice: { value: "yes", quote: "However, we may not always provide prior notice of changes to these terms" },
      sharesWithGovernmentWithoutWarrant: none,
    },
    business: {
      // The license ends when content is deleted or the account is closed, with exceptions.
      perpetualContentLicense: { value: "no", quote: "You can end this license for specific content by deleting such content from the Services, or generally by closing your account" },
      // $1,000 is low, but well above the token ~$100 caps this fact targets.
      liabilityCapLow: { value: "no", quote: "FOR ANY AMOUNT THAT EXCEEDS (A) THE TOTAL FEES PAID OR PAYABLE BY YOU TO LINKEDIN FOR THE SERVICES DURING THE TERM OF THIS CONTRACT, IF ANY, OR (B) US $1000." },
      shortClaimDeadline: none,
      internationalTransfers: none,
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Not stated",
    jurisdiction: "California, USA (courts in Santa Clara County) for users outside the EU, EEA and Switzerland. Users there are under Irish law and can sue in their home country's courts.",
  },
};
