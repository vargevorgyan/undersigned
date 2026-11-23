import type { PolicyAnalysis } from "../schema";

const none = { value: "unclear" as const, quote: "" };

/** Reviewed by hand against the July 2026 privacy policy and the September 2026 terms of use. */
export const SPOTIFY: Record<string, PolicyAnalysis> = {
  "https://www.spotify.com/us/legal/privacy-policy/": {
    serviceName: "Spotify",
    documentType: "privacy",
    summary:
      "Spotify collects a lot: what you play and search, your voice if you use voice features, and your exact location if you allow it. It shares data with advertising partners to target ads on Spotify and elsewhere online, receives data about you from those partners, and uses your data to train AI features like AI DJ. On the plus side, you get real controls: download your data, delete it, and switch off tailored ads.",
    grade: "C",
    highlights: [
      {
        title: "Advertisers get your data",
        explanation: "Your account and listening data go to advertising partners so they can target you on Spotify and elsewhere online. Marketing partners may combine it with what they already know about you.",
        severity: "bad",
        quote: "So Spotify and our advertising partners can deliver more relevant advertising to you on the Spotify Service and online, and help measure the effectiveness of ads.",
      },
      {
        title: "Your listening and voice train AI",
        explanation: "Account, listening, voice and survey data are used to build machine-learning models. What Spotify collects includes your prompts to AI features and transcripts.",
        severity: "bad",
        quote: "This includes development and training of algorithmic and machine learning models, which help us to keep our service safe and enhance our users’ experience.",
      },
      {
        title: "Ad partners send data about you",
        explanation: "Data flows in as well as out: advertising partners send identifiers such as hashed contact details, plus their own guesses about your interests.",
        severity: "bad",
        quote: "We receive data about you from certain advertising or marketing partners, including device identifiers such as hashed contact information.",
      },
      {
        title: "Authorities, on a good-faith belief",
        explanation: "Data can go to courts, authorities or parties to a lawsuit whenever Spotify believes in good faith it's needed, not only when served with a warrant or court order.",
        severity: "caution",
        quote: "We may process and share your personal data to comply with a request from courts, authorities, parties to litigation, or other authorized third parties.",
      },
      {
        title: "Paying doesn't stop podcast ads",
        explanation: "Even on Premium and with tailored ads switched off, podcast ads continue, chosen from what you're listening to at that moment.",
        severity: "caution",
        quote: "If you are ‘opted out’ of tailored advertising, you will receive less relevant advertising, including on our free Service Option, as well as our paid Service Option, as applicable (for example, advertising in podcasts).",
      },
      {
        title: "It checks which partner apps you have",
        explanation: "The app collects information to tell whether Spotify partner apps are installed on your device.",
        severity: "caution",
        quote: "Spotify partner applications to determine whether the application is installed on your device",
      },
      {
        title: "A photo of your face for age checks",
        explanation: "Some features require an age check by a third party, which can use a photo of your face or your ID. Spotify says this data is deleted right after the check.",
        severity: "caution",
        quote: "facial age estimation: a photo of your face which is used to estimate your age",
      },
      {
        title: "Listening history kept for life",
        explanation: "Everything you've streamed is kept as long as your account exists. Search queries are deleted after 90 days.",
        severity: "neutral",
        quote: "We also keep streaming history for the life of an account",
      },
      {
        title: "Delete or download your data",
        explanation: "You can download a copy of your data and delete it or your whole account. Spotify reports honoring all 8.26 million deletion requests it received in 2025.",
        severity: "good",
        quote: "There are several ways you can delete personal data from Spotify:",
      },
      {
        title: "You can switch off tailored ads",
        explanation: "A setting turns off ads based on your profile, and browsers sending the Global Privacy Control signal are honored too.",
        severity: "good",
        quote: "You can control tailored advertising through the ‘Tailored Ads’ setting.",
      },
    ],
    facts: {
      // Spotify doesn't say it sells data, but says its ad practice is what some state laws call "sharing or selling".
      sellsData: { value: "unclear", quote: "This is also known as interest based advertising, targeted advertising, or what some states may define as, ‘sharing or selling’ for purposes of cross-context behavioural advertising." },
      sharesWithAdvertisers: { value: "yes", quote: "So Spotify and our advertising partners can deliver more relevant advertising to you on the Spotify Service and online, and help measure the effectiveness of ads." },
      usesDataForAITraining: { value: "yes", quote: "This includes development and training of algorithmic and machine learning models, which help us to keep our service safe and enhance our users’ experience." },
      tracksAcrossSites: { value: "yes", quote: "We receive data about you from certain advertising or marketing partners, including device identifiers such as hashed contact information." },
      collectsPreciseLocation: { value: "yes", quote: "Spotify will only use your precise location data with your permission." },
      collectsBiometrics: { value: "yes", quote: "facial age estimation: a photo of your face which is used to estimate your age" },
      canDeleteAccount: { value: "yes", quote: "to request deletion of your account data from Spotify and close your account, follow the steps on our support page." },
      canExportData: { value: "yes", quote: "use the ‘Download your data’ tool on your Account Privacy page, or" },
      forcedArbitration: none,
      classActionWaiver: none,
      changesWithoutNotice: { value: "no", quote: "When we make material changes to this Policy, we’ll provide you with prominent notice as appropriate under the circumstances." },
      sharesWithGovernmentWithoutWarrant: { value: "yes", quote: "for our own or a third party's justifiable interest such as criminal investigations, litigation, protecting someone’s safety, or preventing death or imminent bodily harm" },
    },
    business: {
      perpetualContentLicense: none,
      liabilityCapLow: none,
      shortClaimDeadline: none,
      internationalTransfers: { value: "yes", quote: "Spotify transfers personal data internationally with Spotify group companies, subcontractors and partners when carrying out the activities described in this Policy." },
      breachNotification: none,
      namesSubprocessors: { value: "no", quote: "Examples of such service providers include those we hire to:" },
    },
    dataRetention: "Search queries are deleted after 90 days. Listening history and profile data are kept until you delete your account; some data is kept longer for legal reasons.",
    jurisdiction: "Not stated",
  },

  "https://www.spotify.com/us/legal/end-user-agreement/": {
    serviceName: "Spotify",
    documentType: "terms",
    summary:
      "By using Spotify you give up your right to go to court or join a class action: disputes go to private arbitration. If Spotify harms you, the most it owes is what you paid in the last year, or $30, and you have one year to bring a claim. Anything you upload is licensed to Spotify irrevocably, and what you're shown can be shaped by Spotify's business deals.",
    grade: "D",
    highlights: [
      {
        title: "The most they'll owe you: $30",
        explanation: "Whatever goes wrong, Spotify's total liability is capped at what you paid in the last 12 months. On the free plan, that's $30.",
        severity: "bad",
        quote: "MORE THAN THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO SPOTIFY DURING THE TWELVE MONTHS PRIOR TO THE FIRST CLAIM; OR (B) $30.00.",
      },
      {
        title: "No judge, no jury, no class action",
        explanation: "Disputes go to private arbitration, one person at a time. You can't join other users in a class action or ask for a jury.",
        severity: "bad",
        quote: "THERE IS NO JUDGE OR JURY IN ARBITRATION, AND COURT REVIEW OF AN ARBITRATION AWARD IS LIMITED.",
      },
      {
        title: "Your only fix: uninstall",
        explanation: "The terms say your sole remedy for any problem with the service is to stop using it.",
        severity: "bad",
        quote: "YOU AGREE THAT YOUR SOLE AND EXCLUSIVE REMEDY FOR ANY PROBLEMS OR DISSATISFACTION WITH THE SPOTIFY SERVICE IS TO UNINSTALL ANY SPOTIFY SOFTWARE AND TO STOP USING THE SPOTIFY SERVICE.",
      },
      {
        title: "An irrevocable license to your uploads",
        explanation: "Playlists, covers, titles and anything else you post can be used, modified and sublicensed by Spotify, and you can't take that permission back. You also waive the right to be credited.",
        severity: "bad",
        quote: "you hereby grant to Spotify a non-exclusive, transferable, sublicensable, royalty-free, fully paid, irrevocable, worldwide license",
      },
      {
        title: "One year to bring any claim",
        explanation: "If you don't start a claim within a year of learning about the problem, you lose the right to any remedy.",
        severity: "bad",
        quote: "WITHIN ONE (1) YEAR AFTER THE DATE THE PARTY ASSERTING THE CLAIM FIRST KNOWS OR REASONABLY SHOULD KNOW OF THE ACT, OMISSION, OR DEFAULT GIVING RISE TO THE CLAIM",
      },
      {
        title: "Recommendations can follow business deals",
        explanation: "What you're shown, and where, may be influenced by Spotify's commercial agreements, not only your taste.",
        severity: "caution",
        quote: "the Content that you access, including its selection and placement, may be influenced by commercial considerations, including Spotify's agreements with third parties.",
      },
      {
        title: "Keep using it, and you've agreed",
        explanation: "New terms take effect when they're posted. Only material changes get an email or pop-up, and continuing to use Spotify counts as accepting them.",
        severity: "caution",
        quote: "Your use of the Spotify Service following any changes to these Terms will constitute your acceptance of such changes.",
      },
      {
        title: "Rejecting arbitration changes is hard",
        explanation: "To reject a change to the arbitration rules you must email a personally signed notice from your own address within 30 days. Even then, the previous arbitration rules still apply.",
        severity: "caution",
        quote: "Opting out of a material change to the Arbitration Agreement is not an opt-out of arbitration altogether.",
      },
      {
        title: "Your username isn't yours to keep",
        explanation: "Spotify can take back your username or make you change it, for any reason.",
        severity: "caution",
        quote: "Spotify may reclaim, or require you to change, your username for any reason.",
      },
      {
        title: "Refund if a paid plan is shut down",
        explanation: "If Spotify permanently ends a plan you prepaid for, you get the unused part back. Price changes are announced before they apply.",
        severity: "good",
        quote: "Spotify will refund you the prorated portion of the prepaid fees for the Pre-Paid Period after such discontinuation.",
      },
    ],
    facts: {
      sellsData: none,
      sharesWithAdvertisers: { value: "yes", quote: "(2) to provide advertising and other information to you, and (3) to allow our business partners to do the same." },
      usesDataForAITraining: none,
      tracksAcrossSites: none,
      collectsPreciseLocation: none,
      collectsBiometrics: none,
      canDeleteAccount: none,
      canExportData: none,
      forcedArbitration: { value: "yes", quote: "THERE IS NO JUDGE OR JURY IN ARBITRATION, AND COURT REVIEW OF AN ARBITRATION AWARD IS LIMITED." },
      classActionWaiver: { value: "yes", quote: "Neither party may participate as a plaintiff, claimant, or class member in any class, collective, consolidated, private attorney general, or representative proceeding (whether in court or arbitration)." },
      // Posting the new terms counts as notice; only material changes get an email or pop-up.
      changesWithoutNotice: { value: "no", quote: "We may make changes to these Terms (including any additional Spotify terms and conditions incorporated by reference herein) from time to time by notifying you of such changes by any reasonable means, including by posting the revised Terms on the applicable Spotify Service" },
      sharesWithGovernmentWithoutWarrant: none,
    },
    business: {
      perpetualContentLicense: { value: "yes", quote: "you hereby grant to Spotify a non-exclusive, transferable, sublicensable, royalty-free, fully paid, irrevocable, worldwide license" },
      liabilityCapLow: { value: "yes", quote: "MORE THAN THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO SPOTIFY DURING THE TWELVE MONTHS PRIOR TO THE FIRST CLAIM; OR (B) $30.00." },
      shortClaimDeadline: { value: "yes", quote: "WITHIN ONE (1) YEAR AFTER THE DATE THE PARTY ASSERTING THE CLAIM FIRST KNOWS OR REASONABLY SHOULD KNOW OF THE ACT, OMISSION, OR DEFAULT GIVING RISE TO THE CLAIM" },
      internationalTransfers: none,
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Not stated",
    jurisdiction: "New York, USA. Disputes go to individual arbitration with National Arbitration and Mediation.",
  },
};
