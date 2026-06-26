// Central testId registry. Use these strings in components for stable selectors.
export const TID = {
    // Shell
    shell: "zp-shell",
    backgroundCanvas: "zp-background-canvas",
    backgroundLayer: "zp-background-layer",

    // Omnibar
    omnibar: "omnibar",
    omnibarInput: "omnibar-input",
    omnibarModeWeb: "omnibar-mode-web",
    omnibarModeApps: "omnibar-mode-apps",
    omnibarModeAI: "omnibar-mode-ai",
    omnibarSuggestions: "omnibar-suggestions",
    omnibarSuggestion: (i) => `omnibar-suggestion-${i}`,

    // Clock
    heroClock: "hero-clock",
    heroDate: "hero-date",
    heroLunar: "hero-lunar",

    // Bookmarks
    bookmarks: "bookmarks",
    bookmarkAdd: "bookmark-add",
    bookmarkCard: (i) => `bookmark-card-${i}`,

    // Widgets
    todoWidget: "todo-widget",
    todoInput: "todo-input",
    todoAdd: "todo-add",
    todoItem: (i) => `todo-item-${i}`,
    todoToggle: (i) => `todo-toggle-${i}`,
    todoDelete: (i) => `todo-delete-${i}`,

    notepadWidget: "notepad-widget",
    notepadInput: "notepad-input",
    notepadAdd: "notepad-add",
    noteCard: (i) => `note-card-${i}`,

    timerWidget: "timer-widget",
    timerInput: "timer-input",
    timerStart: "timer-start",
    timerPause: "timer-pause",
    timerReset: "timer-reset",

    calendarWidget: "calendar-widget",
    calendarPrev: "calendar-prev",
    calendarNext: "calendar-next",

    musicWidget: "music-widget",
    musicPlay: "music-play",
    musicNext: "music-next",
    musicPrev: "music-prev",

    // Sidebars
    socialSidebar: "social-sidebar",
    socialSidebarToggle: "social-sidebar-toggle",
    socialTab: (name) => `social-tab-${name}`,
    socialClose: "social-close",

    settingsDrawer: "settings-drawer",
    settingsToggle: "settings-toggle",
    settingsClose: "settings-close",
    settingsSection: (name) => `settings-section-${name}`,
    settingsToggleWidget: (name) => `settings-toggle-widget-${name}`,
    settingsAccent: (name) => `settings-accent-${name}`,
    settingsBg: (name) => `settings-bg-${name}`,

    // Window manager / dock
    dock: "app-dock",
    dockItem: (id) => `dock-item-${id}`,
    appWindow: (id) => `app-window-${id}`,
    appWindowClose: (id) => `app-window-close-${id}`,
    appWindowMin: (id) => `app-window-min-${id}`,
    appWindowMax: (id) => `app-window-max-${id}`,

    // Apps
    appBoba: "app-boba",
    bobaSize: (s) => `boba-size-${s}`,
    bobaTea: (s) => `boba-tea-${s}`,
    bobaMilk: (s) => `boba-milk-${s}`,
    bobaTopping: (s) => `boba-topping-${s}`,
    bobaRandom: "boba-random",
    bobaOrder: "boba-order",
    bobaSave: "boba-save",
    bobaStore: (s) => `boba-store-${s}`,

    appPomodoro: "app-pomodoro",
    pomoStart: "pomo-start",
    pomoPause: "pomo-pause",
    pomoReset: "pomo-reset",
    pomoTask: "pomo-task",

    appFlipClock: "app-flipclock",

    appStocks: "app-stocks",
    stocksAdd: "stocks-add",
    stocksSymbolInput: "stocks-symbol-input",
    stocksQtyInput: "stocks-qty-input",
    stocksType: (t) => `stocks-type-${t}`,
    stocksCurrency: "stocks-currency",
    stocksTrending: "stocks-trending",
    stocksHolding: (i) => `stocks-holding-${i}`,
    stocksRemove: (i) => `stocks-remove-${i}`,

    appNews: "app-news",
    newsTopic: (t) => `news-topic-${t}`,
    newsItem: (i) => `news-item-${i}`,

    // Launcher results
    launcherItem: (id) => `launcher-item-${id}`,
};
