export type Locale = "en" | "bn" | "is";

export type MessageKey =
  | "app.name"
  | "nav.settings"
  | "nav.profile"
  | "footer.offline"
  | "auth.login"
  | "auth.logout"
  | "auth.title"
  | "auth.subtitle"
  | "auth.needSupabase"
  | "auth.emailLabel"
  | "auth.phoneLabel"
  | "auth.sendMagicLink"
  | "auth.sendOtp"
  | "auth.otpCodeLabel"
  | "auth.verifyOtp"
  | "auth.sentLink"
  | "auth.sentOtp"
  | "auth.tabEmail"
  | "auth.tabPhone"
  | "auth.phoneProviderUnsupported"
  | "auth.modeSignIn"
  | "auth.modeSignUp"
  | "auth.passwordLabel"
  | "auth.signIn"
  | "auth.signUp"
  | "auth.createAccount"
  | "auth.haveAccount"
  | "auth.noAccount"
  | "profile.title"
  | "profile.subtitle"
  | "profile.mustSignIn"
  | "profile.nameLabel"
  | "profile.namePlaceholder"
  | "profile.nameRequired"
  | "profile.usernameLabel"
  | "profile.birthdayLabel"
  | "profile.genderLabel"
  | "profile.genderUnspecified"
  | "profile.genderMale"
  | "profile.genderFemale"
  | "profile.genderOther"
  | "profile.phoneLabel"
  | "profile.addressLabel"
  | "profile.addressPlaceholder"
  | "profile.save"
  | "profile.saved"
  | "common.complete"
  | "common.view"
  | "common.week"
  | "common.weekly"
  | "common.monthly"
  | "common.locked"
  | "common.unlocked"
  | "common.paid"
  | "common.markPaid"
  | "common.remaining"
  | "chart.projection"
  | "chart.placeholder"
  | "dashboard.welcomeTitle"
  | "dashboard.welcomeBody"
  | "dashboard.signInPrompt"
  | "dashboard.startSetup"
  | "dashboard.title"
  | "dashboard.subtitle"
  | "dashboard.editSetup"
  | "dashboard.totalSaved"
  | "dashboard.streak"
  | "dashboard.best"
  | "checklist.title"
  | "checklist.subtitle"
  | "checklist.empty"
  | "tips.title"
  | "tips.newQuote"
  | "tips.monthDifficulty"
  | "monthlyBreakdown.title"
  | "monthlyBreakdown.subtitle"
  | "monthlyBreakdown.weeks"
  | "difficulty.easy"
  | "difficulty.moderate"
  | "difficulty.challenging"
  | "difficulty.veryHard"
  | "settings.title"
  | "settings.subtitle"
  | "settings.preferences"
  | "settings.theme"
  | "settings.system"
  | "settings.light"
  | "settings.dark"
  | "settings.language"
  | "settings.cloudSync"
  | "settings.cloudHelp"
  | "settings.pull"
  | "settings.push"
  | "settings.status"
  | "settings.dangerZone"
  | "settings.dangerHelp"
  | "settings.resetConfirm"
  | "settings.reset"
  | "onboarding.title"
  | "onboarding.subtitle"
  | "onboarding.step1"
  | "onboarding.step2"
  | "onboarding.step3"
  | "onboarding.startDate"
  | "onboarding.currency"
  | "onboarding.otherCurrency"
  | "onboarding.otherCurrencyPlaceholder"
  | "onboarding.startAmount"
  | "onboarding.increment"
  | "onboarding.durationWeeks"
  | "onboarding.goalOptional"
  | "onboarding.preview"
  | "onboarding.projectedTotal"
  | "onboarding.peakWeekly"
  | "onboarding.peakMonths"
  | "onboarding.startTracking";

type Messages = Record<MessageKey, string>;

export const messages: Record<Locale, Messages> = {
  en: {
    "app.name": "Savings Challenge",
    "nav.settings": "Settings",
    "nav.profile": "Manage profile",
    "footer.offline":
      "Offline-first · Installable PWA · Your data stays on-device unless you enable sync.",
    "auth.login": "Log in",
    "auth.logout": "Log out",
    "auth.title": "Sign in",
    "auth.subtitle": "Use email login code (OTP) or a magic link. Cloud sync is optional.",
    "auth.needSupabase":
      "Supabase is not configured. Add env vars to enable authentication.",
    "auth.emailLabel": "Email",
    "auth.phoneLabel": "Phone",
    "auth.sendMagicLink": "Send magic link",
    "auth.sendOtp": "Send OTP",
    "auth.otpCodeLabel": "OTP code",
    "auth.verifyOtp": "Verify",
    "auth.sentLink": "Check your email for a sign-in link.",
    "auth.sentOtp": "OTP sent. Enter the code to verify.",
    "auth.tabEmail": "Email",
    "auth.tabPhone": "Phone",
    "auth.phoneProviderUnsupported":
      "Phone OTP is not enabled for this Supabase project. In Supabase Dashboard → Authentication → Phone, configure an SMS provider (e.g. Twilio) and enable phone sign-in. For now, please use Email login.",
    "auth.modeSignIn": "Sign in",
    "auth.modeSignUp": "Create account",
    "auth.passwordLabel": "Password",
    "auth.signIn": "Sign in",
    "auth.signUp": "Create account",
    "auth.createAccount": "Create a new account",
    "auth.haveAccount": "Already have an account?",
    "auth.noAccount": "Don't have an account?",

    "profile.title": "Complete your profile",
    "profile.subtitle": "Add a display name so your account is ready.",
    "profile.mustSignIn": "Please sign in to complete your profile.",
    "profile.nameLabel": "Name",
    "profile.namePlaceholder": "Your name",
    "profile.nameRequired": "Name is required to save.",
    "profile.usernameLabel": "Username (optional)",
    "profile.birthdayLabel": "Birthday",
    "profile.genderLabel": "Gender",
    "profile.genderUnspecified": "Prefer not to say",
    "profile.genderMale": "Male",
    "profile.genderFemale": "Female",
    "profile.genderOther": "Other",
    "profile.phoneLabel": "Phone (optional)",
    "profile.addressLabel": "Address (optional)",
    "profile.addressPlaceholder": "Your address",
    "profile.save": "Save",
    "profile.saved": "Saved.",
    "common.complete": "Complete",
    "common.view": "View",
    "common.week": "Week",
    "common.weekly": "Weekly",
    "common.monthly": "Monthly",
    "common.locked": "Locked",
    "common.unlocked": "Unlocked",
    "common.paid": "Paid",
    "common.markPaid": "Mark paid",
    "common.remaining": "Remaining",

    "chart.projection": "Projection",
    "chart.placeholder":
      "This is a lightweight placeholder chart. (Next: replace with a small chart lib or a custom SVG line.)",

    "dashboard.welcomeTitle": "Welcome",
    "dashboard.welcomeBody":
      "Set up your savings challenge to see your dashboard and start tracking weekly progress.",
    "dashboard.signInPrompt":
      "Sign in to view your dashboard and pick up where you left off. New here? Try a setup preview first.",
    "dashboard.startSetup": "Start setup",
    "dashboard.title": "Dashboard",
    "dashboard.subtitle":
      "Keep your streak alive. Offline-first; updates save automatically.",
    "dashboard.editSetup": "Edit setup",
    "dashboard.totalSaved": "Total saved",
    "dashboard.streak": "Streak",
    "dashboard.best": "Best",

    "checklist.title": "Weekly checklist",
    "checklist.subtitle":
      "Tap to mark a week paid. Use “2×” if you’re catching up.",
    "checklist.empty": "Set up your challenge to start tracking.",

    "tips.title": "Motivation & tips",
    "tips.newQuote": "New quote",
    "tips.monthDifficulty": "This month difficulty",

    "monthlyBreakdown.title": "Monthly breakdown",
    "monthlyBreakdown.subtitle":
      "Totals grouped by calendar month with difficulty labels.",
    "monthlyBreakdown.weeks": "Weeks",

    "difficulty.easy": "Easy",
    "difficulty.moderate": "Moderate",
    "difficulty.challenging": "Challenging",
    "difficulty.veryHard": "Very hard",

    "settings.title": "Settings",
    "settings.subtitle":
      "Theme, language structure, and optional cloud sync (Supabase).",
    "settings.preferences": "Preferences",
    "settings.theme": "Theme",
    "settings.system": "System",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.language": "Language",
    "settings.cloudSync": "Cloud sync (optional)",
    "settings.cloudHelp":
      "Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY to enable.",
    "settings.pull": "Pull from cloud",
    "settings.push": "Push to cloud",
    "settings.status": "Status",
    "settings.dangerZone": "Danger zone",
    "settings.dangerHelp": "This clears your local challenge and progress.",
    "settings.resetConfirm": "Reset local challenge data?",
    "settings.reset": "Reset local data",

    "onboarding.title": "Set up your challenge",
    "onboarding.subtitle":
      "A quick 3-step setup. You can change these later in Settings.",
    "onboarding.step1": "Step 1 · Date & currency",
    "onboarding.step2": "Step 2 · Amounts",
    "onboarding.step3": "Step 3 · Duration & goal",
    "onboarding.startDate": "Start date",
    "onboarding.currency": "Currency",
    "onboarding.otherCurrency": "Other…",
    "onboarding.otherCurrencyPlaceholder": "Enter currency code (e.g. NOK)",
    "onboarding.startAmount": "Start amount",
    "onboarding.increment": "Weekly increment",
    "onboarding.durationWeeks": "Duration (weeks)",
    "onboarding.goalOptional": "Personal goal (optional)",
    "onboarding.preview": "Live preview",
    "onboarding.projectedTotal": "Projected total",
    "onboarding.peakWeekly": "Peak weekly payment",
    "onboarding.peakMonths": "Peak months (top 3)",
    "onboarding.startTracking": "Start tracking",
  },
  bn: {
    "app.name": "সেভিংস চ্যালেঞ্জ",
    "nav.settings": "সেটিংস",
    "nav.profile": "প্রোফাইল ম্যানেজ করুন",
    "footer.offline":
      "অফলাইন-ফার্স্ট · ইনস্টলযোগ্য PWA · সিঙ্ক চালু না করলে ডেটা ডিভাইসেই থাকে।",
    "auth.login": "লগ ইন",
    "auth.logout": "লগ আউট",
    "auth.title": "সাইন ইন",
    "auth.subtitle":
      "ইমেইল লগইন কোড (OTP) অথবা ম্যাজিক লিঙ্ক ব্যবহার করুন। ক্লাউড সিঙ্ক ঐচ্ছিক।",
    "auth.needSupabase":
      "Supabase কনফিগার করা নেই। অথেন্টিকেশন চালু করতে env vars যোগ করুন।",
    "auth.emailLabel": "ইমেইল",
    "auth.phoneLabel": "ফোন",
    "auth.sendMagicLink": "ম্যাজিক লিঙ্ক পাঠান",
    "auth.sendOtp": "OTP পাঠান",
    "auth.otpCodeLabel": "OTP কোড",
    "auth.verifyOtp": "ভেরিফাই",
    "auth.sentLink": "সাইন-ইন লিঙ্কের জন্য ইমেইল চেক করুন।",
    "auth.sentOtp": "OTP পাঠানো হয়েছে। কোড দিয়ে ভেরিফাই করুন।",
    "auth.tabEmail": "ইমেইল",
    "auth.tabPhone": "ফোন",
    "auth.phoneProviderUnsupported":
      "এই Supabase প্রজেক্টে ফোন OTP চালু নেই। Supabase Dashboard → Authentication → Phone থেকে একটি SMS provider (যেমন Twilio) কনফিগার করে ফোন সাইন-ইন চালু করুন। আপাতত ইমেইল দিয়ে লগ ইন করুন।",
    "auth.modeSignIn": "লগ ইন",
    "auth.modeSignUp": "অ্যাকাউন্ট তৈরি",
    "auth.passwordLabel": "পাসওয়ার্ড",
    "auth.signIn": "লগ ইন",
    "auth.signUp": "অ্যাকাউন্ট তৈরি",
    "auth.createAccount": "নতুন অ্যাকাউন্ট তৈরি করুন",
    "auth.haveAccount": "আগে থেকেই অ্যাকাউন্ট আছে?",
    "auth.noAccount": "অ্যাকাউন্ট নেই?",

    "profile.title": "প্রোফাইল সম্পূর্ণ করুন",
    "profile.subtitle": "আপনার নাম যোগ করুন, তাহলে অ্যাকাউন্ট প্রস্তুত হবে।",
    "profile.mustSignIn": "প্রোফাইল সম্পূর্ণ করতে আগে লগ ইন করুন।",
    "profile.nameLabel": "নাম",
    "profile.namePlaceholder": "আপনার নাম",
    "profile.nameRequired": "সংরক্ষণ করতে নাম প্রয়োজন।",
    "profile.usernameLabel": "ইউজারনেম (ঐচ্ছিক)",
    "profile.birthdayLabel": "জন্মতারিখ",
    "profile.genderLabel": "লিঙ্গ",
    "profile.genderUnspecified": "বলতে চাই না",
    "profile.genderMale": "পুরুষ",
    "profile.genderFemale": "নারী",
    "profile.genderOther": "অন্যান্য",
    "profile.phoneLabel": "ফোন (ঐচ্ছিক)",
    "profile.addressLabel": "ঠিকানা (ঐচ্ছিক)",
    "profile.addressPlaceholder": "আপনার ঠিকানা",
    "profile.save": "সেভ",
    "profile.saved": "সেভ হয়েছে।",
    "common.complete": "সম্পন্ন",
    "common.view": "ভিউ",
    "common.week": "সপ্তাহ",
    "common.weekly": "সাপ্তাহিক",
    "common.monthly": "মাসিক",
    "common.locked": "লকড",
    "common.unlocked": "আনলকড",
    "common.paid": "পরিশোধিত",
    "common.markPaid": "পরিশোধ হয়েছে",
    "common.remaining": "বাকি",

    "chart.projection": "প্রজেকশন",
    "chart.placeholder":
      "এটি একটি হালকা প্লেসহোল্ডার চার্ট। (পরবর্তী ধাপে ছোট চার্ট লাইব্রেরি বা কাস্টম SVG লাইন যোগ হবে।)",

    "dashboard.welcomeTitle": "স্বাগতম",
    "dashboard.welcomeBody":
      "ড্যাশবোর্ড দেখতে এবং সাপ্তাহিক ট্র্যাকিং শুরু করতে চ্যালেঞ্জ সেটআপ করুন।",
    "dashboard.signInPrompt":
      "ড্যাশবোর্ড দেখতে এবং আগের জায়গা থেকে চালিয়ে যেতে লগ ইন করুন। নতুন? আগে সেটআপ প্রিভিউ দেখে নিন।",
    "dashboard.startSetup": "সেটআপ শুরু করুন",
    "dashboard.title": "ড্যাশবোর্ড",
    "dashboard.subtitle":
      "স্ট্রিক ধরে রাখুন। অফলাইন-ফার্স্ট; পরিবর্তনগুলো স্বয়ংক্রিয়ভাবে সেভ হয়।",
    "dashboard.editSetup": "সেটআপ বদলান",
    "dashboard.totalSaved": "মোট সঞ্চয়",
    "dashboard.streak": "স্ট্রিক",
    "dashboard.best": "সর্বোচ্চ",

    "checklist.title": "সাপ্তাহিক চেকলিস্ট",
    "checklist.subtitle":
      "ট্যাপ করে সপ্তাহের টাকা পরিশোধ হিসেবে মার্ক করুন। মিসড থাকলে “2×” ব্যবহার করুন।",
    "checklist.empty": "ট্র্যাকিং শুরু করতে চ্যালেঞ্জ সেটআপ করুন।",

    "tips.title": "অনুপ্রেরণা ও টিপস",
    "tips.newQuote": "নতুন উক্তি",
    "tips.monthDifficulty": "এই মাসের কঠিনতা",

    "monthlyBreakdown.title": "মাসিক বিবরণ",
    "monthlyBreakdown.subtitle":
      "ক্যালেন্ডার মাস অনুযায়ী মোট টাকা এবং কঠিনতার লেবেল।",
    "monthlyBreakdown.weeks": "সপ্তাহ",

    "difficulty.easy": "সহজ",
    "difficulty.moderate": "মাঝারি",
    "difficulty.challenging": "কঠিন",
    "difficulty.veryHard": "খুব কঠিন",

    "settings.title": "সেটিংস",
    "settings.subtitle": "থিম, ভাষা, এবং ঐচ্ছিক ক্লাউড সিঙ্ক (Supabase)।",
    "settings.preferences": "পছন্দসমূহ",
    "settings.theme": "থিম",
    "settings.system": "সিস্টেম",
    "settings.light": "লাইট",
    "settings.dark": "ডার্ক",
    "settings.language": "ভাষা",
    "settings.cloudSync": "ক্লাউড সিঙ্ক (ঐচ্ছিক)",
    "settings.cloudHelp":
      "চালু করতে NUXT_PUBLIC_SUPABASE_URL এবং NUXT_PUBLIC_SUPABASE_ANON_KEY সেট করুন।",
    "settings.pull": "ক্লাউড থেকে নিন",
    "settings.push": "ক্লাউডে দিন",
    "settings.status": "স্ট্যাটাস",
    "settings.dangerZone": "ঝুঁকিপূর্ণ অংশ",
    "settings.dangerHelp": "এটি আপনার লোকাল চ্যালেঞ্জ ও প্রগ্রেস মুছে দেবে।",
    "settings.resetConfirm": "লোকাল চ্যালেঞ্জ ডেটা রিসেট করবেন?",
    "settings.reset": "লোকাল ডেটা রিসেট",

    "onboarding.title": "চ্যালেঞ্জ সেটআপ করুন",
    "onboarding.subtitle":
      "দ্রুত ৩ ধাপের সেটআপ। পরে সেটিংস থেকে বদলাতে পারবেন।",
    "onboarding.step1": "ধাপ ১ · তারিখ ও মুদ্রা",
    "onboarding.step2": "ধাপ ২ · টাকা",
    "onboarding.step3": "ধাপ ৩ · সময়কাল ও লক্ষ্য",
    "onboarding.startDate": "শুরুর তারিখ",
    "onboarding.currency": "মুদ্রা",
    "onboarding.otherCurrency": "অন্যান্য…",
    "onboarding.otherCurrencyPlaceholder": "মুদ্রার কোড লিখুন (যেমন NOK)",
    "onboarding.startAmount": "শুরুর পরিমাণ",
    "onboarding.increment": "সাপ্তাহিক বৃদ্ধি",
    "onboarding.durationWeeks": "সময়কাল (সপ্তাহ)",
    "onboarding.goalOptional": "ব্যক্তিগত লক্ষ্য (ঐচ্ছিক)",
    "onboarding.preview": "লাইভ প্রিভিউ",
    "onboarding.projectedTotal": "মোট প্রজেক্টেড",
    "onboarding.peakWeekly": "সর্বোচ্চ সাপ্তাহিক পেমেন্ট",
    "onboarding.peakMonths": "সর্বোচ্চ মাস (শীর্ষ ৩)",
    "onboarding.startTracking": "ট্র্যাকিং শুরু করুন",
  },
  is: {
    "app.name": "Sparnaðaráskorun",
    "nav.settings": "Stillingar",
    "nav.profile": "Sýsla með prófíl",
    "footer.offline":
      "Ótengt fyrst · Uppsetjanlegt PWA · Gögnin þín eru á tækinu nema þú virkjar samstillingu.",

    "auth.login": "Skrá inn",
    "auth.logout": "Skrá út",
    "auth.title": "Innskráning",
    "auth.subtitle": "Notaðu innskráningarkóða í tölvupósti (OTP) eða töfratengil. Samstilling í skýi er valkvæð.",
    "auth.needSupabase": "Supabase er ekki stillt. Bættu við env breytum til að virkja auðkenningu.",
    "auth.emailLabel": "Netfang",
    "auth.phoneLabel": "Sími",
    "auth.sendMagicLink": "Senda töfratengil",
    "auth.sendOtp": "Senda OTP",
    "auth.otpCodeLabel": "OTP-kóði",
    "auth.verifyOtp": "Staðfesta",
    "auth.sentLink": "Athugaðu tölvupóstinn þinn fyrir innskráningartengil.",
    "auth.sentOtp": "OTP sent. Sláðu inn kóðann til að staðfesta.",
    "auth.tabEmail": "Netfang",
    "auth.tabPhone": "Sími",
    "auth.phoneProviderUnsupported":
      "OTP með síma er ekki virkt fyrir þetta Supabase-verkefni. Í Supabase mælaborði → Authentication → Phone, stilltu SMS þjónustu (t.d. Twilio) og virkjaðu innskráningu með síma. Notaðu netfang í bili.",
    "auth.modeSignIn": "Skrá inn",
    "auth.modeSignUp": "Búa til aðgang",
    "auth.passwordLabel": "Lykilorð",
    "auth.signIn": "Skrá inn",
    "auth.signUp": "Búa til aðgang",
    "auth.createAccount": "Búa til nýjan aðgang",
    "auth.haveAccount": "Ertu nú þegar með aðgang?",
    "auth.noAccount": "Ertu ekki með aðgang?",

    "profile.title": "Ljúktu við prófílinn",
    "profile.subtitle": "Bættu við nafni svo aðgangurinn þinn sé tilbúinn.",
    "profile.mustSignIn": "Skráðu þig inn til að ljúka við prófílinn.",
    "profile.nameLabel": "Nafn",
    "profile.namePlaceholder": "Nafnið þitt",
    "profile.nameRequired": "Nafn er nauðsynlegt til að vista.",
    "profile.usernameLabel": "Notandanafn (valkvætt)",
    "profile.birthdayLabel": "Afmælisdagur",
    "profile.genderLabel": "Kyn",
    "profile.genderUnspecified": "Vil ekki segja",
    "profile.genderMale": "Karl",
    "profile.genderFemale": "Kona",
    "profile.genderOther": "Annað",
    "profile.phoneLabel": "Sími (valkvætt)",
    "profile.addressLabel": "Heimilisfang (valkvætt)",
    "profile.addressPlaceholder": "Heimilisfangið þitt",
    "profile.save": "Vista",
    "profile.saved": "Vistað.",

    "common.complete": "Lokið",
    "common.view": "Skoða",
    "common.week": "Vika",
    "common.weekly": "Vikulega",
    "common.monthly": "Mánaðarlega",
    "common.locked": "Læst",
    "common.unlocked": "Ólæst",
    "common.paid": "Greitt",
    "common.markPaid": "Merkja sem greitt",
    "common.remaining": "Eftir",

    "chart.projection": "Spá",
    "chart.placeholder":
      "Þetta er létt sýnishorn af línuriti. (Næst: skipta út fyrir lítið línurit-bókasafn eða sérsmíðað SVG.)",

    "dashboard.welcomeTitle": "Velkomin(n)",
    "dashboard.welcomeBody":
      "Settu upp sparnaðaráskorunina til að sjá stjórnborðið og byrja að fylgjast með vikulegri framvindu.",
    "dashboard.signInPrompt":
      "Skráðu þig inn til að sjá stjórnborðið þitt og halda áfram þar sem frá var horfið. Nýr hér? Prófaðu uppsetningarforskoðun fyrst.",
    "dashboard.startSetup": "Byrja uppsetningu",
    "dashboard.title": "Stjórnborð",
    "dashboard.subtitle": "Haltu seríunni á lífi. Ótengt fyrst; breytingar vistast sjálfkrafa.",
    "dashboard.editSetup": "Breyta uppsetningu",
    "dashboard.totalSaved": "Samtals sparað",
    "dashboard.streak": "Runa",
    "dashboard.best": "Best",

    "checklist.title": "Vikulegur gátlisti",
    "checklist.subtitle": "Pikkaðu til að merkja viku sem greidda. Notaðu „2×“ ef þú ert að bæta upp.",
    "checklist.empty": "Settu upp áskorunina til að byrja að fylgjast með.",

    "tips.title": "Hvatning og ráð",
    "tips.newQuote": "Ný tilvitnun",
    "tips.monthDifficulty": "Erfiðleiki þessa mánaðar",

    "monthlyBreakdown.title": "Mánaðarlegt yfirlit",
    "monthlyBreakdown.subtitle": "Samtölur eftir almanaksmánuðum með erfiðleikamerkingum.",
    "monthlyBreakdown.weeks": "Vikur",

    "difficulty.easy": "Létt",
    "difficulty.moderate": "Miðlungs",
    "difficulty.challenging": "Krefjandi",
    "difficulty.veryHard": "Mjög krefjandi",

    "settings.title": "Stillingar",
    "settings.subtitle": "Þema, tungumál og valkvæð skýjasamstilling (Supabase).",
    "settings.preferences": "Stillingar",
    "settings.theme": "Þema",
    "settings.system": "Kerfi",
    "settings.light": "Ljóst",
    "settings.dark": "Dökkt",
    "settings.language": "Tungumál",
    "settings.cloudSync": "Skýjasamstilling (valkvætt)",
    "settings.cloudHelp": "Stilltu NUXT_PUBLIC_SUPABASE_URL og NUXT_PUBLIC_SUPABASE_ANON_KEY til að virkja.",
    "settings.pull": "Sækja úr skýi",
    "settings.push": "Senda í ský",
    "settings.status": "Staða",
    "settings.dangerZone": "Varúðarsvæði",
    "settings.dangerHelp": "Þetta hreinsar staðbundna áskorun og framvindu.",
    "settings.resetConfirm": "Endurstilla staðbundin gögn?",
    "settings.reset": "Endurstilla staðbundin gögn",

    "onboarding.title": "Settu upp áskorunina þína",
    "onboarding.subtitle": "Fljótleg uppsetning í 3 skrefum. Þú getur breytt þessu síðar í stillingum.",
    "onboarding.step1": "Skref 1 · Dagsetning og gjaldmiðill",
    "onboarding.step2": "Skref 2 · Upphæðir",
    "onboarding.step3": "Skref 3 · Lengd og markmið",
    "onboarding.startDate": "Upphafsdagur",
    "onboarding.currency": "Gjaldmiðill",
    "onboarding.otherCurrency": "Annað…",
    "onboarding.otherCurrencyPlaceholder": "Sláðu inn gjaldmiðilskóða (t.d. NOK)",
    "onboarding.startAmount": "Upphafsupphæð",
    "onboarding.increment": "Vikuleg hækkun",
    "onboarding.durationWeeks": "Lengd (vikur)",
    "onboarding.goalOptional": "Persónulegt markmið (valkvætt)",
    "onboarding.preview": "Lifandi forskoðun",
    "onboarding.projectedTotal": "Áætlað heildarupphæð",
    "onboarding.peakWeekly": "Hæsta vikugreiðsla",
    "onboarding.peakMonths": "Erfiðustu mánuðir (topp 3)",
    "onboarding.startTracking": "Byrja að fylgjast með",
  },
};
