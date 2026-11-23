import type { PolicyAnalysis } from "../schema";

const none = { value: "unclear" as const, quote: "" };

/** Reviewed by hand against the October 16, 2026 privacy policy and the July 30, 2026 terms of service. */
export const GOOGLE: Record<string, PolicyAnalysis> = {
  "https://policies.google.com/privacy?hl=en": {
    serviceName: "Google",
    documentType: "privacy",
    summary:
      "Google collects a huge amount: your searches, the videos you watch, your location from GPS and nearby Wi-Fi, your voice after \"Hey Google\", and what you do on millions of other websites and apps that use Google's ad and analytics tools, even in Incognito mode. It uses this to personalize ads and services, and uses public information from the web to train its AI. It says it doesn't give advertisers your name or email, doesn't target ads on sensitive topics like health or religion, and lets you review and delete your activity.",
    grade: "D",
    highlights: [
      {
        title: "Incognito doesn't hide you from Google",
        explanation: "Incognito mode only hides your browsing from other people on your device. Sites that use Google's ads or analytics still send Google information about your visit.",
        severity: "bad",
        quote: "third party sites and apps that integrate our services still share information with Google when you visit them.",
      },
      {
        title: "Tracked across millions of other sites",
        explanation: "Over 2 million non-Google websites and apps work with Google on ads. What you do on them can be linked together and, depending on your settings, tied to your account.",
        severity: "bad",
        quote: "When you visit sites or use apps that use Google’s ad or analytics services, those services may link information about your activity from that site or app with activity from other sites or apps that use our services.",
      },
      {
        title: "Android phones report your installed apps",
        explanation: "An Android phone with Google apps regularly checks in with Google, sending details like your carrier, crash reports and which apps you have installed.",
        severity: "bad",
        quote: "This information includes things like your device type and carrier name, crash reports, which apps you've installed",
      },
      {
        title: "\"Hey Google\" records a few seconds early",
        explanation: "When your device hears the wake phrase, Google records your voice and also the few seconds of audio from just before you said it.",
        severity: "caution",
        quote: "Google records your voice and audio plus a few seconds before the activation.",
      },
      {
        title: "Public web info trains Google's AI",
        explanation: "Information about you that's publicly available online can be collected and used to train AI models such as Gemini.",
        severity: "caution",
        quote: "we may collect information that’s publicly available online or from other public sources to help train Google’s AI models",
      },
      {
        title: "Logs of who you call and text",
        explanation: "If you use Google's calling or messaging services, Google may keep logs of the numbers involved, when calls happened and how long they lasted.",
        severity: "caution",
        quote: "we may collect call and message log information like your phone number, calling-party number, receiving-party number, forwarding numbers",
      },
      {
        title: "It measures your mouse over ads",
        explanation: "Beyond whether you saw or clicked an ad, Google may measure how you move your mouse over it.",
        severity: "caution",
        quote: "We may also measure other interactions, such as how you move your mouse over an ad or if you interact with the page on which the ad appears.",
      },
      {
        title: "Health data from Fitbit and Pixel Watch",
        explanation: "Google's fitness devices and apps collect body data such as your heart rate, sleep and skin temperature.",
        severity: "caution",
        quote: "such as your sleep patterns, heart rate, skin temperature, calories burned, and steps taken.",
      },
      {
        title: "No ads based on sensitive topics",
        explanation: "Google says it doesn't target ads using your race, religion, sexual orientation or health, and requires the same from advertisers.",
        severity: "good",
        quote: "We don’t show you personalized ads based on sensitive categories, such as race, religion, sexual orientation, or health.",
      },
      {
        title: "Gmail and Photos stay out of ads",
        explanation: "Your emails, Drive files and photos aren't used for personalized ads unless you choose to let other Google services use that data.",
        severity: "good",
        quote: "We don’t show you personalized ads based on your content from Drive, Gmail, or Google Photos, unless you choose to make data from these services available to other Google services that support personalized ads.",
      },
    ],
    facts: {
      sellsData: none,
      // Google targets ads itself; it says advertisers don't get identifying details, only aggregated reports.
      sharesWithAdvertisers: { value: "no", quote: "We don’t share information that personally identifies you with advertisers, such as your name or email, unless you ask us to." },
      usesDataForAITraining: { value: "yes", quote: "we may collect information that’s publicly available online or from other public sources to help train Google’s AI models" },
      tracksAcrossSites: { value: "yes", quote: "When you visit sites or use apps that use Google’s ad or analytics services, those services may link information about your activity from that site or app with activity from other sites or apps that use our services." },
      collectsPreciseLocation: { value: "yes", quote: "GPS and other sensor data from your device" },
      collectsBiometrics: { value: "yes", quote: "Google records your voice and audio plus a few seconds before the activation." },
      canDeleteAccount: { value: "yes", quote: "You can edit or delete your account at any time through your Google Account settings." },
      canExportData: none,
      forcedArbitration: none,
      classActionWaiver: none,
      changesWithoutNotice: none,
      // Google says it reviews every request and pushes back on overbroad ones, but doesn't say a court order is required.
      sharesWithGovernmentWithoutWarrant: { value: "unclear", quote: "Our legal team reviews each and every request, regardless of type, and we frequently push back when a request appears to be overly broad or doesn’t follow the correct process." },
    },
    business: {
      perpetualContentLicense: none,
      liabilityCapLow: none,
      shortClaimDeadline: none,
      internationalTransfers: { value: "yes", quote: "we operate data centers located around the world to help keep our products continuously available for users." },
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Depends on the type of data and your settings; no fixed periods are given. Activity saved to your Google Account, like Search and Web & App Activity, can be reviewed and deleted in My Activity.",
    jurisdiction: "Not stated",
  },

  "https://policies.google.com/terms?hl=en": {
    serviceName: "Google",
    documentType: "terms",
    summary:
      "Google's terms are fairer than most: disputes go to real courts in California (or your local courts where the law requires), and there's no forced arbitration. But Google's systems scan your content as it's sent, received and stored, and the license you give Google over your content lasts as long as its copyright does. Google may also quote your public reviews to promote its own products.",
    grade: "B",
    highlights: [
      {
        title: "Your content is scanned all the time",
        explanation: "Automated systems analyze your emails, files and photos for spam and illegal content, to spot patterns, and to personalize results and ads.",
        severity: "bad",
        quote: "This analysis occurs as the content is sent, received, and when it is stored.",
      },
      {
        title: "A license as long as copyright",
        explanation: "The permission you give Google to use, copy, modify and share your content lasts as long as the content is protected by copyright, and covers developing new Google technologies.",
        severity: "caution",
        quote: "This license lasts for as long as your content is protected by intellectual property rights.",
      },
      {
        title: "Your reviews can promote Google",
        explanation: "Content you've shared publicly, like an app review, can be quoted in Google's own promotions.",
        severity: "caution",
        quote: "For example, to promote a Google app, we might quote a review you wrote.",
      },
      {
        title: "Background data use, including for ads",
        explanation: "Google services may use your internet connection when you aren't using them, for updates and for Google's operations including advertising. Any data charges are yours.",
        severity: "caution",
        quote: "to provide software updates and to improve Google's services, security, user experience, and/or Google’s operations, including advertising",
      },
      {
        title: "Your employer may see your account",
        explanation: "If an organization such as a school or company gives you your Google Account, its administrator may be able to access or disable it.",
        severity: "caution",
        quote: "That administrator might require you to follow additional rules and may be able to access or disable your Google Account.",
      },
      {
        title: "Some changes come without warning",
        explanation: "Material changes get advance notice, except when Google launches a new service or feature, or in urgent cases.",
        severity: "caution",
        quote: "except (1) when we launch a new service or feature, or (2) in urgent situations, such as preventing ongoing abuse or responding to legal requirements",
      },
      {
        title: "Don't train AI on Google's output",
        explanation: "You aren't allowed to use AI-generated content from Google's services to build your own machine-learning models.",
        severity: "neutral",
        quote: "using AI-generated content from our services to develop machine learning models or related AI technology",
      },
      {
        title: "Real courts, not arbitration",
        explanation: "Disputes go to courts in Santa Clara County, California. If your local law requires it, you can use your local courts and laws instead.",
        severity: "good",
        quote: "These disputes will be resolved exclusively in the federal or state courts of Santa Clara County, California, USA",
      },
      {
        title: "A warning before action is taken",
        explanation: "Before removing content or suspending you, Google says it will usually notify you, explain why, and let you respond.",
        severity: "good",
        quote: "we’ll provide you with advance notice when reasonably possible, describe the reason for our action, and give you an opportunity to clarify the issue and address it",
      },
      {
        title: "Export your content if a service ends",
        explanation: "If Google shuts down a service or makes a change that hurts you, you get advance notice and a chance to download your content with Google Takeout.",
        severity: "good",
        quote: "We’ll also provide you with an opportunity to export your content from your Google Account using Google Takeout, subject to applicable law and policies.",
      },
    ],
    facts: {
      sellsData: none,
      sharesWithAdvertisers: none,
      // The license covers developing new technologies, but AI training is not named.
      usesDataForAITraining: { value: "unclear", quote: "developing new technologies and services for Google consistent with these terms" },
      tracksAcrossSites: none,
      collectsPreciseLocation: none,
      collectsBiometrics: none,
      canDeleteAccount: { value: "yes", quote: "You can also end your relationship with us at any time by closing your Google Account." },
      canExportData: { value: "yes", quote: "We’ll also provide you with an opportunity to export your content from your Google Account using Google Takeout, subject to applicable law and policies." },
      forcedArbitration: { value: "no", quote: "These disputes will be resolved exclusively in the federal or state courts of Santa Clara County, California, USA" },
      classActionWaiver: none,
      // Material changes get notice, except for new services or features and urgent cases.
      changesWithoutNotice: { value: "no", quote: "If we materially change these terms or service-specific additional terms, we’ll provide you with reasonable advance notice and the opportunity to review the changes" },
      sharesWithGovernmentWithoutWarrant: none,
    },
    business: {
      // Not called perpetual or irrevocable, but it runs for the life of the IP rights; removal only ends public display.
      perpetualContentLicense: { value: "unclear", quote: "This license lasts for as long as your content is protected by intellectual property rights." },
      // This cap applies to business users only; consumers aren't capped beyond what the law allows.
      liabilityCapLow: { value: "yes", quote: "Google’s total liability arising out of or relating to these terms is limited to the greater of (1) US$500 or (2) 125% of the fees that you paid to use the relevant services in the 12 months before the breach." },
      shortClaimDeadline: none,
      internationalTransfers: none,
      breachNotification: none,
      namesSubprocessors: none,
    },
    dataRetention: "Not stated",
    jurisdiction: "California law, with disputes in the federal or state courts of Santa Clara County, California. Local courts and laws apply where local law requires.",
  },
};
