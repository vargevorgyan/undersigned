import type { PolicyAnalysis } from "../schema";

const none = { value: "unclear" as const, quote: "" };

/** Reviewed by hand against the US versions of the April 10, 2026 privacy statement and terms of use. */
export const NETFLIX: Record<string, PolicyAnalysis> = {
  "https://help.netflix.com/legal/privacy": {
    serviceName: "Netflix",
    documentType: "privacy",
    summary:
      "Netflix records what you watch, search and play, plus your voice if you use voice features. For ads it works with advertisers who send it data about what you do and buy on other sites and apps, and under some US state laws its ad and marketing practices count as selling or sharing your data. You can download your data, ask for it to be deleted, and switch off behavioral ads.",
    grade: "C",
    highlights: [
      {
        title: "Advertisers tell Netflix about you",
        explanation: "Advertising companies send Netflix your demographics and the interests they've worked out from what you do and buy on other sites and apps, so ads can be picked for you.",
        severity: "bad",
        quote: "information provided by Advertising Companies (such as your demographic information, likely interests they have collected or inferred from your interactions and purchases through their own and other websites and apps)",
      },
      {
        title: "Its ads count as selling data",
        explanation: "Netflix admits that its marketing and behavioral ads count as a \"sale\" or \"sharing\" of your data under some US state laws. You can opt out at netflix.com/dnsspi.",
        severity: "bad",
        quote: "We engage in the sale and sharing and also have sold or shared (as defined under some US State Privacy Laws) the following categories of personal information in the last 12 months:",
      },
      {
        title: "Your email is matched on other platforms",
        explanation: "Netflix sends a scrambled (hashed) version of your email or phone number to other platforms to find your account there and show you Netflix marketing. You can turn this off in Privacy and data settings.",
        severity: "caution",
        quote: "The third party compares Netflix’s privacy protective contact information with privacy protective contact information in its own database",
      },
      {
        title: "The cheaper plan is a data trade",
        explanation: "Netflix describes the ad plan's lower price as payment for using your data to target ads, and says it sets the discount based on expected ad revenue and its own profit.",
        severity: "caution",
        quote: "We believe the discount for access to Netflix service and our use of the categories of personal information described above to present relevant advertisements to you represents a fair exchange",
      },
      {
        title: "It guesses things about your household",
        explanation: "Beyond what you do, Netflix draws conclusions about you and the people you live with, such as which kinds of ads your household prefers.",
        severity: "caution",
        quote: "inferences we make about you or your household based on data we collect from or about you",
      },
      {
        title: "Voice commands are recorded",
        explanation: "If you use voice features, Netflix keeps recordings and transcripts of what you say, along with your searches, clicks and text input.",
        severity: "caution",
        quote: "voice inputs (including transcripts and recordings) when using voice-related features",
      },
      {
        title: "Game chats can be monitored",
        explanation: "In Netflix games with text or voice chat, Netflix and its contractors may watch and record what you say. Other players may also save messages you later delete.",
        severity: "caution",
        quote: "We and our Service Providers may monitor and/or record text and voice chat during your use of those features",
      },
      {
        title: "Do Not Track is ignored",
        explanation: "Your browser's Do Not Track setting has no effect. Netflix does honor the Global Privacy Control signal for opting out of data sales where the law requires it.",
        severity: "caution",
        quote: "We do not currently respond to web browser “do not track\" signals.",
      },
      {
        title: "Marketers don't see what you watch",
        explanation: "The companies that run Netflix's marketing on other sites don't get the titles you've picked or watched, and Netflix uses contracts and technical measures to keep it that way.",
        severity: "good",
        quote: "We do not share information about title selections of shows or movies you have watched on our service.",
      },
      {
        title: "You can switch off behavioral ads",
        explanation: "A setting stops ads based on your activity elsewhere, though you'll still see ads on an ad plan. Kids profiles never get behavioral ads. You can also download a copy of your data.",
        severity: "good",
        quote: "If your Behavioral Advertisements setting is off, you will still see advertisements, but they will be non-behavioral advertisements.",
      },
    ],
    facts: {
      // Only the US version of the statement has the state-law sale disclosures.
      sellsData: { value: "yes", quote: "We engage in the sale and sharing and also have sold or shared (as defined under some US State Privacy Laws) the following categories of personal information in the last 12 months:" },
      sharesWithAdvertisers: { value: "yes", quote: "We may disclose certain personal information to Advertising Companies (see definition above) in order to select advertisements shown on Netflix" },
      usesDataForAITraining: none,
      tracksAcrossSites: { value: "yes", quote: "These technologies enable Netflix, Netflix Marketing Providers, and Advertising Companies to collect personal information (such as the pages you visit and device and network information) when you use our services, and about your online activities over time across different websites." },
      // Location is only described as general, derived from your IP address.
      collectsPreciseLocation: { value: "no", quote: "IP addresses (which can be used to tell us the general location of your device, such as your city, state/province, and postal code)" },
      // Voice recordings are kept, but the statement never says voiceprints or other biometric identifiers are made from them.
      collectsBiometrics: { value: "unclear", quote: "voice inputs (including transcripts and recordings) when using voice-related features" },
      canDeleteAccount: { value: "yes", quote: "You may also correct or update out-of-date or inaccurate personal information or request that we delete personal information that we hold about you." },
      canExportData: { value: "yes", quote: "To download a copy of your personal information go to: netflix.com/account/getmyinfo." },
      forcedArbitration: none,
      classActionWaiver: none,
      // Notice is promised only where the law requires it, and continued use counts as acceptance.
      changesWithoutNotice: { value: "unclear", quote: "We will provide notice of any such changes as required by law." },
      sharesWithGovernmentWithoutWarrant: { value: "yes", quote: "We may disclose your personal information as necessary to comply with applicable law, regulation, legal process, or governmental request" },
    },
    business: {
      perpetualContentLicense: none,
      liabilityCapLow: none,
      shortClaimDeadline: none,
      internationalTransfers: { value: "yes", quote: "your personal information may be transferred to other countries that have different data protection laws than those where you reside." },
      breachNotification: none,
      namesSubprocessors: { value: "no", quote: "For example, we use Service Providers to provide communications, security, infrastructure and IT services, game-related services, to personalize and improve our service, and to process payments." },
    },
    dataRetention: "Kept for as long as Netflix needs it for the purposes in the statement, depending on whether you're still a member, the type of data, legal duties and possible legal claims. No fixed periods are given.",
    jurisdiction: "Not stated",
  },

  "https://help.netflix.com/legal/termsofuse": {
    serviceName: "Netflix",
    documentType: "terms",
    summary:
      "If you have a dispute with Netflix, it goes to private arbitration instead of a judge or jury, unless you email an opt-out within 30 days of signing up, and you can never join a class action. Netflix says it isn't liable to you for any damages whatsoever, and these rules also bind everyone you let use your account. On the plus side, you can cancel any time and get a month's notice before price rises.",
    grade: "C",
    highlights: [
      {
        title: "No judge, no jury",
        explanation: "Most disputes go to private arbitration with JAMS, one person at a time, unless you opt out in time.",
        severity: "bad",
        quote: "THESE TERMS OF USE REQUIRE YOU TO RESOLVE MOST DISPUTES WITH NETFLIX IN ARBITRATION, NOT IN COURT, UNLESS YOU EXERCISE YOUR TIME-LIMITED RIGHT TO OPT OUT OF THAT REQUIREMENT.",
      },
      {
        title: "Only Netflix can choose a class action",
        explanation: "You give up class actions for good, even if you opt out of arbitration. Netflix keeps the right to settle claims as a class in court, and if you leave that class you can't arbitrate instead.",
        severity: "bad",
        quote: "The sole exception to this is that Netflix may elect to resolve otherwise arbitrable claims in court on a class, collective, or representative basis",
      },
      {
        title: "Netflix says it owes you nothing",
        explanation: "There's no dollar cap because the terms exclude damages altogether, including for personal injury, as far as the law allows.",
        severity: "bad",
        quote: "BE LIABLE (JOINTLY OR SEVERALLY) TO YOU FOR PERSONAL INJURY OR ANY SPECIAL, INCIDENTAL, INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER.",
      },
      {
        title: "Everyone on your account is bound",
        explanation: "Family members and anyone else you let use your account are held to these terms, including arbitration, even if sharing with them breaks the rules.",
        severity: "caution",
        quote: "All persons to whom you give access to your account, whether or not such sharing of access is permitted by these Terms of Use, are bound by these Terms of Use, including the requirement to arbitrate disputes.",
      },
      {
        title: "Ad-free plans can still show ads",
        explanation: "Even if you pay for no ads, you may see them during live events, replays and linear programming, plus branded content on every plan.",
        severity: "caution",
        quote: "during certain live or special events (including replays), as part of linear programming, or where required by streaming rights or other legal or contractual obligations",
      },
      {
        title: "30 days to opt out of arbitration",
        explanation: "To keep your right to go to court you must email Opt-Out@netflix.com yourself within 30 days of becoming subject to these terms.",
        severity: "caution",
        quote: "To opt out, you must notify Netflix in writing no later than 30 days after first becoming subject to this Arbitration Agreement",
      },
      {
        title: "Changes can apply immediately",
        explanation: "New terms take effect right away. Only material changes for existing members wait a month after notice.",
        severity: "caution",
        quote: "Such revisions shall be effective immediately; provided however, for existing members, material revisions shall, unless otherwise stated, be effective one month following notice to you.",
      },
      {
        title: "Support may control your computer",
        explanation: "Customer service may offer a remote access tool that gives Netflix full access to your computer. You can say no and get help another way.",
        severity: "caution",
        quote: "Customer Service may best be able to assist you by using a remote access support tool through which we have full access to your computer.",
      },
      {
        title: "A month's notice before price rises",
        explanation: "Netflix must tell you at least a month before a price or plan change, so you can cancel before it kicks in. You can cancel any time.",
        severity: "good",
        quote: "We will notify you at least one month before any price changes or changes to your subscription plan will become effective.",
      },
      {
        title: "You can opt out of experiments",
        explanation: "Netflix constantly tests new designs and features on members, but a setting lets you stop taking part.",
        severity: "good",
        quote: "You can turn off test participation at any time by visiting the \"Account\" page and changing the \"Test participation\" settings.",
      },
    ],
    facts: {
      sellsData: none,
      sharesWithAdvertisers: none,
      usesDataForAITraining: none,
      tracksAcrossSites: none,
      collectsPreciseLocation: none,
      collectsBiometrics: none,
      canDeleteAccount: none,
      canExportData: none,
      forcedArbitration: { value: "yes", quote: "THESE TERMS OF USE REQUIRE YOU TO RESOLVE MOST DISPUTES WITH NETFLIX IN ARBITRATION, NOT IN COURT, UNLESS YOU EXERCISE YOUR TIME-LIMITED RIGHT TO OPT OUT OF THAT REQUIREMENT." },
      classActionWaiver: { value: "yes", quote: "you and Netflix will not seek to bring, join, or participate in any class, consolidated, or representative action" },
      // Only material changes for existing members come with notice; everything else applies immediately.
      changesWithoutNotice: { value: "yes", quote: "Such revisions shall be effective immediately; provided however, for existing members, material revisions shall, unless otherwise stated, be effective one month following notice to you." },
      sharesWithGovernmentWithoutWarrant: none,
    },
    business: {
      // "Feedback" covers anything you send or post to the service, not only survey answers.
      perpetualContentLicense: { value: "yes", quote: "worldwide and in perpetuity without further compensation, acknowledgement or payment to you" },
      // No cap amount at all: damages are excluded entirely.
      liabilityCapLow: { value: "yes", quote: "BE LIABLE (JOINTLY OR SEVERALLY) TO YOU FOR PERSONAL INJURY OR ANY SPECIAL, INCIDENTAL, INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER." },
      shortClaimDeadline: { value: "no", quote: "you or Netflix must send a Notice of Dispute within two years from when the Dispute first arose." },
      internationalTransfers: none,
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Not stated",
    jurisdiction: "Delaware, USA. Disputes go to individual arbitration with JAMS unless you opt out within 30 days.",
  },
};
