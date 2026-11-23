import type { PolicyAnalysis } from "../schema";

const none = { value: "unclear" as const, quote: "" };

/** Reviewed by hand against the July 15, 2026 US privacy policy and the July 15, 2026 US terms of service. */
export const TIKTOK: Record<string, PolicyAnalysis> = {
  "https://www.tiktok.com/legal/page/us/privacy-policy/en": {
    serviceName: "TikTok",
    documentType: "privacy",
    summary:
      "TikTok collects a huge amount: what you watch and for how long, your messages, what you ask its AI, even the rhythm of your typing, and your precise location if you turn on location services. It may collect faceprints and voiceprints from your videos, scans your content and messages to train its AI, and gets data from advertisers about what you do and buy elsewhere. It says it doesn't sell your data, and you can download your data or delete your account.",
    grade: "D",
    highlights: [
      {
        title: "Faceprints and voiceprints from your videos",
        explanation: "TikTok may pull biometric identifiers out of the videos and audio you post. It only promises to ask first where a law requires it.",
        severity: "bad",
        quote: "We may collect biometric identifiers and biometric information as defined under US laws, such as faceprints and voiceprints, from your user content.",
      },
      {
        title: "Your content and messages train AI",
        explanation: "Your activity is used to train machine-learning models, and the same list of uses includes scanning your posts, messages, AI chats and their metadata.",
        severity: "bad",
        quote: "To review, support, improve, and develop the Services, and train, test, and improve technology, such as machine learning models and algorithms",
      },
      {
        title: "It records how you type",
        explanation: "Besides your device details, TikTok collects your keystroke patterns or rhythms and the names and types of apps and files on your device.",
        severity: "bad",
        quote: "app and file names and types, keystroke patterns or rhythms, battery state, audio settings and connected audio devices",
      },
      {
        title: "Videos you never post can be collected",
        explanation: "Content can be uploaded while you're still creating it, before you decide whether to save or publish it.",
        severity: "bad",
        quote: "We may collect user content through pre-uploading at the time of creation, import, or upload, regardless of whether you choose to save or publish that user content",
      },
      {
        title: "Advertisers report what you do elsewhere",
        explanation: "Advertisers and partners tell TikTok which pages you visit, what you buy and which apps you download outside TikTok, often through the TikTok Pixel on their sites.",
        severity: "bad",
        quote: "Advertisers, publishers, and measurement and other partners provide us with information about you and the actions you have taken outside of our websites and apps",
      },
      {
        title: "It watches you in its browser",
        explanation: "When you open a link inside TikTok, it collects information about what you do on those websites.",
        severity: "caution",
        quote: "We also collect certain information about your interactions with websites when you use our in-app browser.",
      },
      {
        title: "It guesses your age, gender and interests",
        explanation: "TikTok works out things about you that you never told it, and uses them for recommendations and ads.",
        severity: "caution",
        quote: "To infer additional information about you, such as your age, gender, and interests.",
      },
      {
        title: "Data still flows to a global affiliate",
        explanation: "Even under the new US joint venture, data is shared with TT Commerce & Global Services for the global version of the app, and may be sent outside the United States.",
        severity: "caution",
        quote: "TT Commerce & Global Services LLC and its affiliates (“TT Commerce & Global Services”), to facilitate a global and interoperable experience, and for other permitted business purposes.",
      },
      {
        title: "It says it doesn't sell your data",
        explanation: "TikTok says it doesn't sell your personal information. The promise about sharing for cross-site ads only applies where a law restricts it.",
        severity: "neutral",
        quote: "while we do not sell your personal information or share your personal information with third parties for purposes of cross-context behavioral advertising where restricted by applicable law",
      },
      {
        title: "Download your data or delete your account",
        explanation: "In-app settings let you get a copy of your data and deactivate or delete your account. You can also manage how outside activity shapes your ads.",
        severity: "good",
        quote: "Through your in-app settings, you can directly update your account information, request a copy of your data, or deactivate or delete your account",
      },
    ],
    facts: {
      sellsData: { value: "no", quote: "while we do not sell your personal information" },
      sharesWithAdvertisers: { value: "yes", quote: "Advertising, marketing, and analytics partners, who may receive certain Information You Provide, Automatically Collected Information, and Information From Other Sources for the purpose of providing their services." },
      usesDataForAITraining: { value: "yes", quote: "To review, support, improve, and develop the Services, and train, test, and improve technology, such as machine learning models and algorithms" },
      tracksAcrossSites: { value: "yes", quote: "Some of our advertisers and other partners enable us to collect similar information directly from their websites or apps by integrating our TikTok Advertiser Tools (such as TikTok Pixel)." },
      collectsPreciseLocation: { value: "yes", quote: "if you choose to enable location services for the TikTok app within your device settings, we collect approximate or precise location information from your device." },
      collectsBiometrics: { value: "yes", quote: "We may collect biometric identifiers and biometric information as defined under US laws, such as faceprints and voiceprints, from your user content." },
      canDeleteAccount: { value: "yes", quote: "You may submit a request to know, access, correct or delete the information we have collected from or about you" },
      canExportData: { value: "yes", quote: "Through your in-app settings, you can directly update your account information, request a copy of your data, or deactivate or delete your account" },
      forcedArbitration: none,
      classActionWaiver: none,
      // Changing the "Last Updated" date counts as notifying you.
      changesWithoutNotice: { value: "yes", quote: "we will notify you by updating the “Last Updated” date at the top of the new Privacy Policy, posting the new Privacy Policy, or providing any other notice required by applicable law." },
      sharesWithGovernmentWithoutWarrant: { value: "yes", quote: "including to respond to subpoenas, court orders, legal process, law enforcement requests, legal claims, or government inquiries" },
    },
    business: {
      perpetualContentLicense: none,
      liabilityCapLow: none,
      shortClaimDeadline: none,
      internationalTransfers: { value: "yes", quote: "we may transmit your information outside of the United States, for purposes of sharing with recipients as described in this Privacy Policy." },
      breachNotification: none,
      // Names a few (PayPal, Stripe, TT Commerce & Global Services) but gives no full list.
      namesSubprocessors: { value: "no", quote: "Examples of such service providers and business partners include:" },
    },
    dataRetention: "Kept as long as TikTok needs it to run the service and for the other purposes in the policy; account details are kept as long as you have an account. Information about rule violations can be kept after you're removed. No fixed periods are given.",
    jurisdiction: "Not stated",
  },

  "https://www.tiktok.com/legal/page/us/terms-of-service/en": {
    serviceName: "TikTok",
    documentType: "terms",
    summary:
      "Anything you post or send on TikTok, including messages and what you type into its AI, comes with a license TikTok can't lose that lets it train its machine learning. If something goes wrong, TikTok owes you at most $100 or what you paid in the last year, and you have one year to sue. Unlike many apps, disputes go to California courts rather than private arbitration.",
    grade: "D",
    highlights: [
      {
        title: "Your posts and messages can train AI",
        explanation: "\"Your Content\" includes messages and your AI prompts, and TikTok's license lets it use all of it to train its machine-learning models, for itself and its business partners.",
        severity: "bad",
        quote: "developing new technologies (including training, testing, and improving our machine learning models and algorithms)",
      },
      {
        title: "A license you can't take back",
        explanation: "You keep ownership, but TikTok gets an irrevocable, worldwide license it can pass on to others, and it never owes you payment.",
        severity: "bad",
        quote: "non-exclusive, irrevocable, and royalty-free (you retain the rights to use Your Content elsewhere, although we don't owe you any payments for sharing Your Content with us)",
      },
      {
        title: "The most they'll owe you: $100",
        explanation: "Whatever goes wrong, TikTok's total liability is capped at $100 or what you paid it in the last 12 months, whichever is more.",
        severity: "bad",
        quote: "shall, under no circumstance, exceed the greater of $100 or the amount you have paid us in the past 12 months.",
      },
      {
        title: "One year to bring any claim",
        explanation: "The clock starts when the event happens, not when you find out about it. Miss the year and the claim is gone for good.",
        severity: "bad",
        quote: "YOU MUST INITIATE ANY PROCEEDING OR ACTION WITHIN ONE (1) YEAR OF THE DATE OF THE OCCURRENCE OF THE EVENT OR FACTS GIVING RISE TO A DISPUTE",
      },
      {
        title: "Your name and photo in ads, unpaid",
        explanation: "When you interact with ads or sponsored content, TikTok can show your name, profile image and username alongside them. Advertisers may pay TikTok for this; you get nothing.",
        severity: "caution",
        quote: "you give us permission to use your name, profile image and username, in connection with ads, sponsored gifts, offers, and other branded or sponsored content that you interact with, without any compensation to you",
      },
      {
        title: "Other users get a permanent license too",
        explanation: "Depending on your settings, every other user gets a perpetual, irrevocable license to reuse your content. Videos remixed by others can stay up after you delete yours.",
        severity: "caution",
        quote: "you also grant to each user of the Platform a non-exclusive, royalty-free, perpetual and irrevocable, worldwide license to use Your Content",
      },
      {
        title: "Inactive for 180 days? Lose your username",
        explanation: "TikTok can take back your username and give it to someone else if you haven't logged in for six months, or if it bans you.",
        severity: "caution",
        quote: "when you have not logged into your account for 180 days",
      },
      {
        title: "Keep using it, and you've agreed",
        explanation: "Material changes get notice first, but urgent ones may not. Either way, continuing to use TikTok counts as accepting the new terms.",
        severity: "caution",
        quote: "If you continue to use the Platform after any updated Terms are in effect, you agree to be bound by the updated Terms.",
      },
      {
        title: "You can take TikTok to court",
        explanation: "There's no forced arbitration and no class action waiver. After a required informal resolution step, disputes go to a federal or state court in Los Angeles.",
        severity: "good",
        quote: "shall also be resolved exclusively in the U.S. District Court for the Central District of California or the Superior Court of the State of California, County of Los Angeles",
      },
      {
        title: "You still own what you post",
        explanation: "TikTok gets a license, not ownership. That includes the AI output you generate, though other people's output may look the same as yours.",
        severity: "good",
        quote: "as between you and TikTok USDS Joint Venture, you own Your Content.",
      },
    ],
    facts: {
      sellsData: none,
      sharesWithAdvertisers: none,
      usesDataForAITraining: { value: "yes", quote: "developing new technologies (including training, testing, and improving our machine learning models and algorithms)" },
      tracksAcrossSites: { value: "yes", quote: "You agree that we can customize ads and other sponsored content from creators, advertisers, and partners, that you see on and off the Platform based on, among other points, information we receive from third parties." },
      collectsPreciseLocation: none,
      collectsBiometrics: none,
      canDeleteAccount: { value: "yes", quote: "You can delete specific videos from the Platform at any time, or all of Your Content by deleting your account" },
      canExportData: none,
      // Disputes go to California courts; the terms contain no arbitration clause.
      forcedArbitration: { value: "no", quote: "shall also be resolved exclusively in the U.S. District Court for the Central District of California or the Superior Court of the State of California, County of Los Angeles" },
      // The disputes section has no class action waiver.
      classActionWaiver: { value: "no", quote: "" },
      // Urgent changes may skip advance notice, but you're told as soon as reasonably possible.
      changesWithoutNotice: { value: "no", quote: "we will notify you of any material changes to these Terms and give you an opportunity to review them before they apply." },
      sharesWithGovernmentWithoutWarrant: none,
    },
    business: {
      perpetualContentLicense: { value: "yes", quote: "non-exclusive, irrevocable, and royalty-free (you retain the rights to use Your Content elsewhere, although we don't owe you any payments for sharing Your Content with us)" },
      liabilityCapLow: { value: "yes", quote: "shall, under no circumstance, exceed the greater of $100 or the amount you have paid us in the past 12 months." },
      shortClaimDeadline: { value: "yes", quote: "YOU MUST INITIATE ANY PROCEEDING OR ACTION WITHIN ONE (1) YEAR OF THE DATE OF THE OCCURRENCE OF THE EVENT OR FACTS GIVING RISE TO A DISPUTE" },
      internationalTransfers: none,
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Not stated",
    jurisdiction: "California, USA. Disputes go to federal court in the Central District of California or Los Angeles County Superior Court, after a required 60-day informal resolution step.",
  },
};
