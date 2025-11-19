export const APP_NAME = "诗隐";
export const SUBTITLE = "Shi Yin";

// Usage Limits
export const FREE_DAILY_LIMIT = 3; // Number of generations before waiting
export const MAX_WAIT_SECONDS = 30; // Cap wait time at 30s

// Multiple ink blot paths for layered animation effects
export const INK_PATHS = [
  // Blob 1: Organic spread
  "M37.5,186c-12.1-10.5-11.8-32.3-7.2-46.7c4.8-15,13.1-29.3,10.1-48.2c-2.7-17.1-19.7-26.4-21.9-43.6C16,28,34.6,16.7,49.4,8.9c21.3-11.2,54.2-1.3,66.2,19.5c8.7,15.1,1.3,36.1-9.3,48.2c-10.8,12.4-25.6,20.3-31.5,36c-6,15.9,0.9,35.9-8.5,49.6C60.3,173.5,49.5,196.5,37.5,186z",
  // Blob 2: More circular/dense
  "M45.1,156.5c-15.5-8.2-24.2-26.7-23.4-44.2c0.8-18.4,13.6-35.8,28.7-44.7c16.6-9.8,37.5-9.5,52.9,1.9c13.9,10.3,21.6,28.1,20.5,45.3c-1,16.4-11.9,31.2-25.9,39.5C83.6,162.7,60.8,164.9,45.1,156.5z",
  // Blob 3: Splatter shape
  "M35.5,128.5c-9.8-13.8-6.5-33.5,4.2-46.8c10.2-12.7,28.1-18.5,43.8-14.2c16.3,4.4,30.2,17.5,32.8,34.2c2.3,15-5.8,30.4-18.7,39.1c-12.6,8.5-29.6,9.1-42.6,1.1C47.9,137.5,41.6,137.1,35.5,128.5z"
];

// Keep legacy export for compatibility if needed, pointing to the first one
export const INK_BLOTS = INK_PATHS;

// Random moods for "Serendipity" (Random Poem) feature - CHINESE
export const POETIC_MOODS_ZH = [
  "看着窗外的雨，心中有些许宁静",
  "登高望远，思念远方的故人",
  "春日迟迟，由于花开而感到喜悦",
  "月色如水，独自酌酒的豪情",
  "感叹时光流逝，往事如烟",
  "山林隐居，与世无争的闲适",
  "大漠孤烟，苍凉壮阔的感慨",
  "江南烟雨，温柔婉约的情思",
  "听闻古寺钟声，顿悟禅意",
  "雪夜围炉，与友畅谈的温暖",
  "落叶纷飞，对季节更替的感伤",
  "长河落日，天地辽阔的震撼"
];

// Random moods for "Serendipity" (Random Poem) feature - ENGLISH
export const POETIC_MOODS_EN = [
  "Watching the rain, feeling a quiet peace",
  "Looking at the moon, missing someone far away",
  "Walking in the woods, feeling solitary but free",
  "Thinking about the passage of time and lost youth",
  "Feeling the overwhelming beauty of spring flowers",
  "A sense of melancholy as autumn leaves fall",
  "Standing by the ocean, feeling small against the vastness",
  "Remembering a lost love with a bittersweet smile",
  "Finding joy in a simple, quiet moment at home",
  "The determination to face a difficult journey",
  "A sudden burst of hope after a long winter",
  "Contemplating the mysteries of the universe under the stars"
];

export const TRANSLATIONS = {
  zh: {
    title: "诗隐",
    subtitle: "神游太虚 · 意会古今",
    myCollection: "我的诗笺",
    placeholder: "说说你最近的一个隐秘感受...",
    randomBtn: "随缘一首",
    searchBtn: "寻诗一首",
    loadingSearch: "寻访中...",
    loadingRandom: "神游太虚",
    loadingLetter: "鸿雁传书",
    loadingAnalysis: "正在描绘风月...",
    tabPoems: "笺中诗",
    tabCards: "诗中风月",
    tabLetters: "书信",
    emptyPoems: "暂无藏诗",
    emptyCards: "未曾采撷风月",
    emptyLetters: "尚无来信",
    collect: "收藏",
    collected: "已收藏",
    collectCard: "收藏此片羽",
    removeCollect: "已收藏",
    toastCollected: "已收藏至我的诗笺",
    toastRemoved: "已移出诗笺",
    resonance: "共鸣",
    context: "背景",
    yourFeeling: "你的心境",
    poetLetter: "的回信",
    letterTitle: "信笺",
    navCards: "诗中风月",
    navLetter: "与之共饮",
    cardCultural: "文化意象",
    stamp: "藏",
    // New translations
    meditation: "灵感汇聚，静心研墨...",
    waitSeconds: (n: number) => `请静候 ${n} 秒`,
    vipUnlock: "成为名士，免去等待",
    vipTitle: "解锁隐士身份",
    vipDesc: "每日无限次寻诗，免去研墨等待，尽享诗意。",
    vipBtn: "确认成为名士 (演示)",
    cancel: "取消",
    vipGift: "正在试用VIP极速生成 (今日赠送)"
  },
  en: {
    title: "Poem Paper",
    subtitle: "Ink & Soul · Timeless Echoes",
    myCollection: "My Collection",
    placeholder: "Share a hidden feeling you have lately...",
    randomBtn: "Serendipity",
    searchBtn: "Find Poem",
    loadingSearch: "Seeking Muse...",
    loadingRandom: "Wandering Thoughts",
    loadingLetter: "The Poet Writes...",
    loadingAnalysis: "Analyzing Imagery...",
    tabPoems: "Poems",
    tabCards: "Imagery & Lore",
    tabLetters: "Letters",
    emptyPoems: "No collected poems yet",
    emptyCards: "No imagery collected",
    emptyLetters: "No letters received",
    collect: "Save",
    collected: "Saved",
    collectCard: "Collect this fragment",
    removeCollect: "Saved",
    toastCollected: "Saved to Collection",
    toastRemoved: "Removed from Collection",
    resonance: "Resonance",
    context: "Context",
    yourFeeling: "Your Feeling",
    poetLetter: "'s Letter",
    letterTitle: "Letter",
    navCards: "Imagery",
    navLetter: "Converse",
    cardCultural: "Symbolic Meaning",
    stamp: "Save",
    // New translations
    meditation: "Grinding ink, gathering thoughts...",
    waitSeconds: (n: number) => `Please wait ${n}s`,
    vipUnlock: "Become a Hermit, Skip Wait",
    vipTitle: "Become a Hermit",
    vipDesc: "Unlimited daily poems. No more waiting for the ink to dry.",
    vipBtn: "Become a Hermit (Demo)",
    cancel: "Cancel",
    vipGift: "Enjoying VIP Speed (Gifted)"
  }
};