import type { PolicyAnalysis } from "../schema";

const none = { value: "unclear" as const, quote: "" };

/** Reviewed by hand against the combined terms of service and privacy policy, effective and last updated May 25, 2018. */
export const SIGNAL: Record<string, PolicyAnalysis> = {
  "https://signal.org/legal/": {
    serviceName: "Signal",
    documentType: "privacy",
    summary:
      "Signal can't read your messages or calls because they are end-to-end encrypted, and it says it never sells or makes money from your data. You need a phone number to sign up, and Signal can check your contacts to find friends who use it, using scrambled (hashed) versions of their details. The terms have a few standard catches: Signal owes you at most $100 if something goes wrong, and the rules can change with nothing more than a new date on the page.",
    grade: "A",
    highlights: [
      {
        title: "The most they'll owe you: $100",
        explanation: "Whatever goes wrong, Signal's total liability is capped at $100, and lost profits or indirect damages are excluded. The service is free, so there's no fee to refund either.",
        severity: "caution",
        quote: "OUR AGGREGATE LIABILITY RELATING TO, ARISING OUT OF, OR IN ANY WAY IN CONNECTION WITH OUR TERMS, US, OR OUR SERVICES WILL NOT EXCEED ONE HUNDRED DOLLARS ($100).",
      },
      {
        title: "Changes come with only a new date",
        explanation: "When the terms change, Signal only promises to update the date on the page. Keeping the app counts as accepting the new terms, and the privacy policy works the same way.",
        severity: "caution",
        quote: "When we update our Terms, we will update the “Last Modified” date associated with the updated Terms.",
      },
      {
        title: "A phone number is required",
        explanation: "You can't sign up anonymously: every account is tied to a phone number, and you agree to get verification texts or calls from Signal's providers.",
        severity: "caution",
        quote: "To create an account you must register for our Services using your phone number.",
      },
      {
        title: "Your account can be cut off",
        explanation: "Signal can suspend or end your access at any time, for any reason, including anything it sees as legal risk to itself.",
        severity: "caution",
        quote: "We may modify, suspend, or terminate your access to or use of our Services anytime for any reason",
      },
      {
        title: "Contacts are checked, in scrambled form",
        explanation: "If you allow it, details from your address book are hashed and sent to Signal's server to see which contacts use Signal. This feature is optional.",
        severity: "neutral",
        quote: "Information from the contacts on your device may be cryptographically hashed and transmitted to the server in order to determine which of your contacts are registered.",
      },
      {
        title: "Data is handled in the United States",
        explanation: "Your encrypted information and metadata can be moved to the US and other countries where Signal or its providers operate.",
        severity: "neutral",
        quote: "the transfer of your encrypted information and metadata to the United States and other countries where we have or use facilities, service providers or partners",
      },
      {
        title: "Signal can't read your messages",
        explanation: "Messages and calls are end-to-end encrypted, so only you and the people you talk to can see them. Your message history lives on your own devices.",
        severity: "good",
        quote: "Signal cannot decrypt or otherwise access the content of your messages or calls.",
      },
      {
        title: "No selling, no ads, no data business",
        explanation: "Signal says it does not sell, rent or make money from your data or messages at all.",
        severity: "good",
        quote: "Signal does not sell, rent or monetize your personal data or content in any way – ever.",
      },
      {
        title: "Even your profile is encrypted",
        explanation: "Your profile name and picture are end-to-end encrypted too, so Signal can't see them.",
        severity: "good",
        quote: "You may optionally add other information to your account, such as a profile name and profile picture. This information is end-to-end encrypted.",
      },
      {
        title: "Disputes go to a real court",
        explanation: "There's no forced arbitration and no class action waiver. Claims go to a federal or state court in California, under California law.",
        severity: "good",
        quote: "exclusively in the United States District Court for the Northern District of California or a state court in San Mateo County, California.",
      },
    ],
    facts: {
      sellsData: { value: "no", quote: "Signal does not sell, rent or monetize your personal data or content in any way – ever." },
      sharesWithAdvertisers: { value: "no", quote: "Signal does not sell, rent or monetize your personal data or content in any way – ever." },
      // Signal can't decrypt message content, so it has nothing of yours to train on.
      usesDataForAITraining: { value: "no", quote: "Signal cannot decrypt or otherwise access the content of your messages or calls." },
      tracksAcrossSites: none,
      collectsPreciseLocation: none,
      collectsBiometrics: none,
      canDeleteAccount: none,
      canExportData: none,
      forcedArbitration: { value: "no", quote: "exclusively in the United States District Court for the Northern District of California or a state court in San Mateo County, California." },
      classActionWaiver: none,
      // The only notice promised is a new "Last Modified" date; continued use counts as acceptance.
      changesWithoutNotice: { value: "yes", quote: "When we update our Terms, we will update the “Last Modified” date associated with the updated Terms." },
      // Legal requests must be enforceable, but sharing to prevent harm is allowed whenever the law permits it.
      sharesWithGovernmentWithoutWarrant: { value: "unclear", quote: "To protect against harm to the rights, property, or safety of Signal, our users, or the public as required or permitted by law." },
    },
    business: {
      perpetualContentLicense: { value: "no", quote: "You own the information you submit through our Services." },
      liabilityCapLow: { value: "yes", quote: "OUR AGGREGATE LIABILITY RELATING TO, ARISING OUT OF, OR IN ANY WAY IN CONNECTION WITH OUR TERMS, US, OR OUR SERVICES WILL NOT EXCEED ONE HUNDRED DOLLARS ($100)." },
      shortClaimDeadline: none,
      internationalTransfers: { value: "yes", quote: "the transfer of your encrypted information and metadata to the United States and other countries where we have or use facilities, service providers or partners" },
      breachNotification: none,
      namesSubprocessors: { value: "no", quote: "We work with third parties to provide some of our Services." },
    },
    dataRetention: "Messages sit on Signal's servers only until they reach a device that was offline; your message history is stored on your own devices. Support requests are kept only to handle your case. No other retention periods are stated.",
    jurisdiction: "California, USA. Disputes go to federal court in the Northern District of California or state court in San Mateo County, not arbitration.",
  },
};
