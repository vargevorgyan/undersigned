import type { PolicyAnalysis } from "../schema";

const none = { value: "unclear" as const, quote: "" };

/** Reviewed by hand against the June 3, 2026 privacy policy and the January 7, 2025 terms of service. */
export const DUCKDUCKGO: Record<string, PolicyAnalysis> = {
  "https://duckduckgo.com/privacy": {
    serviceName: "DuckDuckGo",
    documentType: "privacy",
    summary:
      "DuckDuckGo doesn't keep a history of your searches, AI chats or browsing, and doesn't store your IP address next to them, so it has nothing to build a profile from. Ads are picked from what you searched for, not from who you are, and it says it has never sold personal information. The limits: clicking an ad goes through Microsoft's ad network, other websites you visit can still track you, and policy changes are only posted on the page.",
    grade: "A",
    highlights: [
      {
        title: "Ad clicks go through Microsoft",
        explanation: "When you click an ad, Microsoft's ad network handles it. DuckDuckGo relies on Microsoft's promise not to tie the click to a profile of you.",
        severity: "caution",
        quote: "Ad clicks are managed by Microsoft's ad network and Microsoft has committed to not associate your ad-click behavior with a user profile",
      },
      {
        title: "Other sites can still track you",
        explanation: "Once you leave DuckDuckGo for another site, that site's rules apply. Your internet provider can also still see your IP address.",
        severity: "caution",
        quote: "While our apps and extensions provide many safeguards against online tracking, we can’t completely protect you when you visit other websites and apps.",
      },
      {
        title: "Changes are only posted here",
        explanation: "DuckDuckGo doesn't email you about policy changes. It posts the new version with a date and a notice at the top, so you'd have to check the page.",
        severity: "caution",
        quote: "We will notify you of changes by posting the modified version on our website.",
      },
      {
        title: "Anonymous searches are kept",
        explanation: "The words people search for are saved, without IP addresses or other IDs, to improve search results.",
        severity: "neutral",
        quote: "we only save these anonymous search queries — completely disconnected from any unique identifiers like IP addresses — to improve our search indexes",
      },
      {
        title: "Support emails reach outside vendors",
        explanation: "If you contact DuckDuckGo for support or send feedback, your message may be visible to the email, project and support software companies it uses.",
        severity: "neutral",
        quote: "your communication may be accessible to the software-as-a-service providers we use in our corporate systems",
      },
      {
        title: "No history of your searches or chats",
        explanation: "Searches, Duck.ai chats and browsing aren't saved or shared, and your IP address is never stored with them.",
        severity: "good",
        quote: "We don’t save or share your search, chat, or browsing history when you search on DuckDuckGo, chat on Duck.ai, or use our apps and extensions.",
      },
      {
        title: "Ads match your search, not you",
        explanation: "Search for cars and you see car ads. Ads aren't based on a profile, because DuckDuckGo doesn't keep one.",
        severity: "good",
        quote: "search ads on DuckDuckGo are based on the search results page you’re viewing, and not based on you as a person.",
      },
      {
        title: "Your location is blurred, even from them",
        explanation: "For local results, DuckDuckGo works with a random location near you instead of your exact position, and doesn't log it.",
        severity: "good",
        quote: "shield your precise location from us and our content providers that sends us a random location nearish to you",
      },
      {
        title: "They fight legal demands and warn you",
        explanation: "DuckDuckGo has no search history to hand over. For the little data it holds, like a newsletter email, it discloses only when legally forced, fights the request, and emails you unless forbidden.",
        severity: "good",
        quote: "If required by law to disclose any of your personal information and we have your email address, we will notify you by email unless legally forbidden to do so.",
      },
      {
        title: "Never sold personal information",
        explanation: "DuckDuckGo says it has never sold anyone's personal information.",
        severity: "good",
        quote: "We have never sold any personal information. Period.",
      },
    ],
    facts: {
      sellsData: { value: "no", quote: "We have never sold any personal information. Period." },
      // Ads are contextual; the only ad partner touchpoint is Microsoft handling ad clicks.
      sharesWithAdvertisers: { value: "no", quote: "search ads on DuckDuckGo are based on the search results page you’re viewing, and not based on you as a person." },
      usesDataForAITraining: none,
      tracksAcrossSites: { value: "no", quote: "We don’t track you through cookies or any other storage methods." },
      collectsPreciseLocation: { value: "no", quote: "shield your precise location from us and our content providers that sends us a random location nearish to you" },
      collectsBiometrics: none,
      // Handled on a separate Privacy Rights page, for the little data optional features or support hold.
      canDeleteAccount: { value: "yes", quote: "For information about these rights, such as requesting deletion or a copy of your personal information, please review our Privacy Rights page." },
      canExportData: { value: "yes", quote: "For information about these rights, such as requesting deletion or a copy of your personal information, please review our Privacy Rights page." },
      forcedArbitration: none,
      classActionWaiver: none,
      // "Notify" here means posting the new version on the page; nothing is sent to you.
      changesWithoutNotice: { value: "yes", quote: "We will notify you of changes by posting the modified version on our website." },
      sharesWithGovernmentWithoutWarrant: { value: "no", quote: "if we are legally forced to do so, and we will use legal means to fight against such disclosure." },
    },
    business: {
      perpetualContentLicense: none,
      liabilityCapLow: none,
      shortClaimDeadline: none,
      internationalTransfers: { value: "yes", quote: "we may transfer this limited personal information (for example, your email address) to countries other than the country in which it was received." },
      breachNotification: none,
      namesSubprocessors: { value: "no", quote: "your communication may be accessible to the software-as-a-service providers we use in our corporate systems" },
    },
    dataRetention: "Searches, chats and browsing are not saved with your IP address or any other identifier. Anonymous search terms are kept to improve results. Information you hand over directly, like a newsletter email, is kept only as long as needed and deleted when you unsubscribe.",
    jurisdiction: "Not stated",
  },

  "https://duckduckgo.com/terms": {
    serviceName: "DuckDuckGo",
    documentType: "terms",
    summary:
      "DuckDuckGo's terms are short and mostly fair. You keep the right to take a dispute to court in New York instead of being forced into private arbitration, and DuckDuckGo says it will cut you off only if you break the rules. The catches: if you haven't paid, the most it owes you is $100, and continuing to use the service after a change means you've accepted the new terms.",
    grade: "B",
    highlights: [
      {
        title: "The most they'll owe you: $100",
        explanation: "Total liability is capped at what you paid in the last 12 months, or $100 if you've never paid. Lost profits and other indirect damages are excluded.",
        severity: "caution",
        quote: "LIMITED TO THE AMOUNT PAID BY YOU FOR USE OF THE RELEVANT SERVICES DURING THE PRIOR 12 MONTHS OR ONE HUNDRED DOLLARS ($100) IF YOU HAVE NOT HAD ANY PAYMENT OBLIGATIONS TO US.",
      },
      {
        title: "Keep using it, and you've agreed",
        explanation: "New terms are posted on the website, with an update message only for substantive changes. Using DuckDuckGo afterwards counts as accepting them.",
        severity: "caution",
        quote: "Continuing to access or use our Services after any changes constitutes your consent and agreement to any new terms.",
      },
      {
        title: "Feedback is theirs to use forever",
        explanation: "If you send feedback, for example in a survey or email, DuckDuckGo can use it forever without paying or crediting you.",
        severity: "caution",
        quote: "you grant us a forever license to use your input to improve our Services without any payment or credit to you.",
      },
      {
        title: "Instant Answers may be wrong",
        explanation: "The quick answers shown above search results come from third-party sources, and DuckDuckGo doesn't promise they're accurate or complete.",
        severity: "neutral",
        quote: "We make no representations or warranties about the accuracy or completeness of the content in our Instant Answers",
      },
      {
        title: "Cut off only for breaking rules",
        explanation: "DuckDuckGo can suspend or end your access if you violate the terms. It doesn't claim the right to do so for any reason.",
        severity: "good",
        quote: "We may suspend or terminate your access to our Services at any time if you violate these Terms.",
      },
      {
        title: "Disputes go to a real court",
        explanation: "There's no forced arbitration and no class action waiver. Claims go to state or federal court in New York, under New York law.",
        severity: "good",
        quote: "Any claim associated with our Services or arising out of these Terms must be filed in the state or federal courts in New York, New York, USA",
      },
      {
        title: "Much of the code is open source",
        explanation: "The source code and data for many DuckDuckGo services are public, so outsiders can check how they work.",
        severity: "good",
        quote: "we make the source code and data for many of our Services available under open-source licenses.",
      },
      {
        title: "A complaints process for EU users",
        explanation: "Users in the EU and EEA can use an internal complaints process required by the Digital Services Act.",
        severity: "good",
        quote: "Users in the EEA may contact legal@duckduckgo.com to access our internal complaints handling process, as defined in the EU Digital Services Act.",
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
      forcedArbitration: { value: "no", quote: "Any claim associated with our Services or arising out of these Terms must be filed in the state or federal courts in New York, New York, USA" },
      classActionWaiver: none,
      // Changes are posted at /terms; only substantive ones get an update message, and nothing is sent to you.
      changesWithoutNotice: { value: "yes", quote: "We will indicate the date it was last modified below with an update message on top if substantive changes were made." },
      sharesWithGovernmentWithoutWarrant: none,
    },
    business: {
      // The forever license covers feedback you send, not content you upload.
      perpetualContentLicense: { value: "unclear", quote: "you grant us a forever license to use your input to improve our Services without any payment or credit to you." },
      liabilityCapLow: { value: "yes", quote: "LIMITED TO THE AMOUNT PAID BY YOU FOR USE OF THE RELEVANT SERVICES DURING THE PRIOR 12 MONTHS OR ONE HUNDRED DOLLARS ($100) IF YOU HAVE NOT HAD ANY PAYMENT OBLIGATIONS TO US." },
      shortClaimDeadline: none,
      internationalTransfers: none,
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Not stated",
    jurisdiction: "New York, USA. Claims go to state or federal court in New York, New York, not arbitration.",
  },
};
