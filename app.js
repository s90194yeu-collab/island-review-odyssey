/**
 * 11501 普二文組・3D 複習造島計畫 (Island Review Odyssey) 主應用邏輯
 */

(function () {
  const STORAGE_KEY = "nssh_11501_island_review_v1";
  const CUSTOM_EXAM_KEY = "nssh_11501_custom_exam_v1";
  const CUSTOM_SPRITES_KEY = "nssh_11501_custom_sprites_v1";
  const DATA = window.ISLAND_DATA;

  function restoreLocalExamAndSprites() {
    try {
      const spRaw = localStorage.getItem(CUSTOM_SPRITES_KEY);
      if (spRaw && window.PANTHER_3D_SPRITES) {
        const sp = JSON.parse(spRaw);
        Object.assign(window.PANTHER_3D_SPRITES, sp);
      }
    } catch (e) {}

    try {
      const exRaw = localStorage.getItem(CUSTOM_EXAM_KEY);
      if (!exRaw) return;
      const cfg = JSON.parse(exRaw);
      if (cfg && cfg.meta) Object.assign(DATA.meta, cfg.meta);
      if (Array.isArray(cfg.islands) && cfg.islands.length > 0) DATA.islands = cfg.islands;
      if (Array.isArray(cfg.calendarDays) && cfg.calendarDays.length > 0) DATA.calendarDays = cfg.calendarDays;
      if (cfg.defaultSchedule && typeof cfg.defaultSchedule === "object") DATA.defaultSchedule = cfg.defaultSchedule;
    } catch (e) {}
  }

  restoreLocalExamAndSprites();

  let state = loadState();
  let sceneManager = null;
  let activeIslandId = null;
  let activeQuizCtx = null; // { islandId, nodeId, answers: {} }
  let activeEditCtx = null; // { islandId, nodeId }
  let activeEncounterCtx = null;
  let panelAllExpanded = false;
  let activeLifeTab = "builder"; // builder | backpack | intel
  let activeIntelFilter = "all";
  let activeAdminTab = "gallery"; // gallery | exam
  let adminGallerySex = "m";
  let adminSubjectIdx = 0;
  let nearIslandRef = null;
  let pomodoroMins = 25;
  let pomodoroSecs = 25 * 60;
  let pomodoroTotalSecs = 25 * 60;
  let pomodoroPhase = "focus";
  let pomodoroTimerId = null;
  let pomodoroTargetNodeId = null;
  let focusDistractions = 0;
  let focusOverlayOpen = false;
  let lastDanceRewardAt = 0;

  let activeLifeState = null;
  const activityCooldownAt = {};

  const BGM_TRACKS = {
    island_day: { id: "island_day", label: "晴空海島", src: "assets/audio/bgm_island_day.m4a?v=10" },
    cafe_chill: { id: "cafe_chill", label: "海風咖啡", src: "assets/audio/bgm_cafe_chill.m4a?v=10" },
    focus_lofi: { id: "focus_lofi", label: "深度 Lo-Fi", src: "assets/audio/bgm_focus_lofi.m4a?v=10" },
    night_study: { id: "night_study", label: "夜讀星海", src: "assets/audio/bgm_night_study.m4a?v=10" }
  };
  const BGM_TRACK_ORDER = ["auto", "island_day", "cafe_chill", "focus_lofi", "night_study"];
  const bgmPlayers = {};
  let currentBgmTrackId = null;
  let bgmFadeInterval = null;
  let audioUnlocked = false;
  let sfxAudioCtx = null;

  /* ==================== 自訂複習日與情報收集輔助 ==================== */
  function makeDayEntryForDate(dateStr, examStartIso, isExtra = false) {
    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
    const dt = new Date(`${dateStr}T00:00:00+08:00`);
    const exDt = new Date(`${examStartIso}T00:00:00+08:00`);
    if (Number.isNaN(dt.getTime()) || Number.isNaN(exDt.getTime())) return null;
    const dow = dt.getDay();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const offset = Math.round((exDt - dt) / 86400000);
    const countdown = offset > 0 ? `倒數 ${offset} 天` : offset === 0 ? "段考當天" : "自訂複習";
    if (dow === 0 || dow === 6) {
      return {
        date: dateStr,
        label: `${mm}/${dd} (${dayNames[dow]})`,
        phase: isExtra ? "✨ 自訂加排週末複習日" : offset <= 4 ? "☀️ 週末雙時段｜考前總檢" : "☀️ 週末雙時段｜衝刺深耕",
        countdown,
        isExam: false,
        isWeekend: true,
        isExtra,
        dayType: "weekend",
        slots: [
          { id: "am", label: "☀️ 上午 09:00–12:00", mins: 180, defaultOn: true },
          { id: "pm", label: "🌤️ 下午 14:00–17:00", mins: 180, defaultOn: true },
          { id: "night", label: "🌙 晚間 19:30–21:00", mins: 90, defaultOn: false }
        ]
      };
    }
    if (dow === 1 || dow === 2 || dow === 4) {
      return {
        date: dateStr,
        label: `${mm}/${dd} (${dayNames[dow]})`,
        phase: isExtra ? "✨ 自訂加排平日晚自習" : offset === 1 ? "🏫 晚自習考前定錨（早點休息）" : "🏫 晚自習日｜夜間累積",
        countdown,
        isExam: false,
        isWeekend: false,
        isExtra,
        dayType: "mon_tue_thu",
        slots: [
          { id: "study", label: "🏫 晚自習 18:40–20:25", mins: 105, defaultOn: true },
          { id: "home", label: "🌙 返家 21:00–21:50", mins: 50, defaultOn: false }
        ]
      };
    }
    return {
      date: dateStr,
      label: `${mm}/${dd} (${dayNames[dow]})`,
      phase: isExtra ? "✨ 自訂加排彈性複習日" : "🎧 週三/五彈性｜補習/自主",
      countdown,
      isExam: false,
      isWeekend: false,
      isExtra,
      dayType: "wed_fri",
      slots: [
        { id: "flex", label: "🌙 夜間彈性 20:00–21:00", mins: 60, defaultOn: true },
        { id: "extra", label: "✨ 空檔加碼 +30m", mins: 30, defaultOn: false }
      ]
    };
  }

  function getActiveCalendarDays(cfgOverride) {
    const cfg = cfgOverride !== undefined ? cfgOverride : typeof state !== "undefined" && state ? state.customReviewConfig : null;
    if (!cfg) return DATA.calendarDays;

    const defaultExamStart = (DATA.meta && DATA.meta.examDates && DATA.meta.examDates[0]) || "2026-12-01";
    const defaultExamEnd = (DATA.meta && DATA.meta.examDates && DATA.meta.examDates[DATA.meta.examDates.length - 1]) || defaultExamStart;
    const defaultStart = (DATA.meta && DATA.meta.startDate) || (DATA.calendarDays[0] && DATA.calendarDays[0].date) || "2026-11-17";

    const examStart = cfg.examStartDate || defaultExamStart;
    const examEnd = cfg.examEndDate && cfg.examEndDate >= examStart ? cfg.examEndDate : cfg.examStartDate ? examStart : defaultExamEnd;
    const start = cfg.startDate || defaultStart;

    let baseDays;
    if (!cfg.startDate && !cfg.examStartDate && !cfg.examEndDate) {
      baseDays = DATA.calendarDays.map((d) => ({ ...d, slots: (d.slots || []).map((s) => ({ ...s })) }));
    } else {
      const sDt = new Date(`${start}T00:00:00+08:00`);
      const eDt = new Date(`${examStart}T00:00:00+08:00`);
      const diffDays = Number.isNaN(sDt.getTime()) || Number.isNaN(eDt.getTime())
        ? 14
        : Math.max(3, Math.min(45, Math.round((eDt - sDt) / 86400000)));
      baseDays = generateReviewCalendarDays(examStart, examEnd, (DATA.meta && DATA.meta.examName) || "第二次段考", diffDays);
    }

    const byDate = new Map();
    baseDays.forEach((d) => byDate.set(d.date, { ...d }));

    (cfg.extraDates || []).forEach((dStr) => {
      if (!dStr || byDate.has(dStr)) return;
      const extraEntry = makeDayEntryForDate(dStr, examStart, true);
      if (extraEntry) byDate.set(dStr, extraEntry);
    });

    const excluded = new Set(cfg.excludedDates || []);
    return Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        isRestDay: !d.isExam && excluded.has(d.date)
      }));
  }

  function getActiveExamDates() {
    const cfg = typeof state !== "undefined" && state ? state.customReviewConfig : null;
    if (cfg && cfg.examStartDate) {
      return cfg.examEndDate && cfg.examEndDate > cfg.examStartDate
        ? [cfg.examStartDate, cfg.examEndDate]
        : [cfg.examStartDate];
    }
    return (DATA.meta && Array.isArray(DATA.meta.examDates) && DATA.meta.examDates) || ["2026-12-01", "2026-12-02"];
  }

  /* ==================== 狀態初始化與存取 ==================== */
  function createDefaultDaySlots(cfgOverride = null) {
    const daySlots = {};
    getActiveCalendarDays(cfgOverride).forEach((d) => {
      const slotMap = {};
      (d.slots || []).forEach((s) => {
        slotMap[s.id] = Boolean(s.defaultOn);
      });
      daySlots[d.date] = slotMap;
    });
    return daySlots;
  }

  function createDefaultState() {
    const nodeProgress = {};
    const nodePomodoros = {};
    DATA.islands.forEach((island) => {
      island.nodes.forEach((node) => {
        nodePomodoros[node.id] = 0;
        nodeProgress[node.id] = {
          checked: node.checklist.map(() => false),
          proficiency: "none",
          quizPassed: false,
          quizBestScore: 0,
          note: "",
          customTitle: "",
          customSections: ""
        };
      });
    });

    const schedule = {};
    const customDayMins = {};
    getActiveCalendarDays(null).forEach((d) => {
      schedule[d.date] = Array.isArray(DATA.defaultSchedule[d.date])
        ? [...DATA.defaultSchedule[d.date]]
        : [];
      customDayMins[d.date] = null;
    });

    const catHearts = {};
    const catQuoteIdx = {};
    DATA.islands.forEach((isl) => {
      catHearts[isl.id] = 0;
      catQuoteIdx[isl.id] = 0;
    });

    return {
      student: {
        className: "普二速（文組）",
        seatNo: "",
        name: ""
      },
      nodeProgress,
      nodePomodoros,
      schedule,
      daySlots: createDefaultDaySlots(null),
      customDayMins,
      customReviewConfig: null,
      dailyDone: {},
      checkinDates: [],
      ownedBuildings: [],
      backpack: [],
      collectedIntel: [],
      unlockedAchievements: [],
      pantherSex: "m",
      gasUrl: (DATA.meta && DATA.meta.defaultGasUrl) || "",
      audio: {
        enabled: true,
        volume: 0.38,
        manualTrack: "auto"
      },
      lifeStats: {
        focusCompleted: 0,
        focusMinutes: 0,
        fishCaught: 0,
        activitiesDone: {}
      },
      catStats: {
        hearts: catHearts,
        quoteIdx: catQuoteIdx,
        spentFish: 0,
        bonusFish: 0,
        walkSteps: 0,
        walkCombo: 0,
        atmosphere: "day"
      }
    };
  }

  function loadState() {
    const base = createDefaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw);

      if (parsed.student) base.student = { ...base.student, ...parsed.student };
      if (parsed.nodeProgress) {
        Object.keys(base.nodeProgress).forEach((nodeId) => {
          const saved = parsed.nodeProgress[nodeId];
          if (!saved) return;
          const expectedLen = base.nodeProgress[nodeId].checked.length;
          const checked = Array.isArray(saved.checked)
            ? base.nodeProgress[nodeId].checked.map((_, i) => Boolean(saved.checked[i]))
            : base.nodeProgress[nodeId].checked;
          base.nodeProgress[nodeId] = {
            ...base.nodeProgress[nodeId],
            ...saved,
            checked: checked.slice(0, expectedLen)
          };
        });
      }
      if (parsed.nodePomodoros) base.nodePomodoros = { ...base.nodePomodoros, ...parsed.nodePomodoros };
      if (parsed.customReviewConfig && typeof parsed.customReviewConfig === "object") {
        base.customReviewConfig = {
          startDate: parsed.customReviewConfig.startDate || "",
          examStartDate: parsed.customReviewConfig.examStartDate || "",
          examEndDate: parsed.customReviewConfig.examEndDate || "",
          excludedDates: Array.isArray(parsed.customReviewConfig.excludedDates) ? [...new Set(parsed.customReviewConfig.excludedDates)] : [],
          extraDates: Array.isArray(parsed.customReviewConfig.extraDates) ? [...new Set(parsed.customReviewConfig.extraDates)] : []
        };
      }
      const activeDays = getActiveCalendarDays(base.customReviewConfig);
      base.daySlots = { ...createDefaultDaySlots(base.customReviewConfig), ...base.daySlots };
      if (parsed.schedule) {
        activeDays.forEach((d) => {
          const date = d.date;
          if (!Array.isArray(base.schedule[date])) {
            base.schedule[date] = Array.isArray(DATA.defaultSchedule[date]) ? [...DATA.defaultSchedule[date]] : [];
          }
          if (Array.isArray(parsed.schedule[date])) {
            base.schedule[date] = parsed.schedule[date].filter((id) => Boolean(findNode(id)));
          }
          if (!(date in base.customDayMins)) base.customDayMins[date] = null;
        });
      }
      if (parsed.daySlots) {
        activeDays.forEach((d) => {
          const date = d.date;
          if (parsed.daySlots[date]) {
            base.daySlots[date] = { ...(base.daySlots[date] || {}), ...parsed.daySlots[date] };
          }
        });
      }
      if (parsed.customDayMins) base.customDayMins = { ...base.customDayMins, ...parsed.customDayMins };
      if (parsed.dailyDone && typeof parsed.dailyDone === "object") base.dailyDone = { ...parsed.dailyDone };
      if (Array.isArray(parsed.checkinDates)) base.checkinDates = [...new Set(parsed.checkinDates)];
      if (Array.isArray(parsed.ownedBuildings)) base.ownedBuildings = [...new Set(parsed.ownedBuildings)];
      if (Array.isArray(parsed.backpack)) base.backpack = [...new Set(parsed.backpack)];
      if (Array.isArray(parsed.collectedIntel)) {
        const validIntel = new Set((DATA.intelItems || []).map((it) => it.id));
        base.collectedIntel = [...new Set(parsed.collectedIntel)].filter((id) => validIntel.has(id));
      }
      if (Array.isArray(parsed.unlockedAchievements)) {
        base.unlockedAchievements = [...new Set(parsed.unlockedAchievements)];
      }
      if (parsed.pantherSex === "f" || parsed.pantherSex === "m") base.pantherSex = parsed.pantherSex;
      if (typeof parsed.gasUrl === "string" && parsed.gasUrl.trim()) {
        base.gasUrl = parsed.gasUrl.trim();
      } else if (DATA.meta && DATA.meta.defaultGasUrl) {
        base.gasUrl = DATA.meta.defaultGasUrl;
      }
      if (parsed.catStats && typeof parsed.catStats === "object") {
        base.catStats = {
          ...base.catStats,
          ...parsed.catStats,
          hearts: { ...base.catStats.hearts, ...(parsed.catStats.hearts || {}) },
          quoteIdx: { ...base.catStats.quoteIdx, ...(parsed.catStats.quoteIdx || {}) }
        };
      }
      if (parsed.audio && typeof parsed.audio === "object") {
        base.audio = {
          enabled: parsed.audio.enabled !== false,
          volume: typeof parsed.audio.volume === "number" ? Math.max(0, Math.min(1, parsed.audio.volume)) : 0.38,
          manualTrack: typeof parsed.audio.manualTrack === "string" ? parsed.audio.manualTrack : "auto"
        };
      }
      if (parsed.lifeStats && typeof parsed.lifeStats === "object") {
        base.lifeStats = {
          focusCompleted: Number(parsed.lifeStats.focusCompleted) || 0,
          focusMinutes: Number(parsed.lifeStats.focusMinutes) || 0,
          fishCaught: Number(parsed.lifeStats.fishCaught) || 0,
          activitiesDone:
            parsed.lifeStats.activitiesDone && typeof parsed.lifeStats.activitiesDone === "object"
              ? { ...parsed.lifeStats.activitiesDone }
              : {}
        };
      }
    } catch (err) {
      console.warn("Failed to parse saved state, using defaults:", err);
    }
    return base;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("LocalStorage save error:", err);
    }
  }

  /* ==================== 工具查詢與進度計算 ==================== */
  function findIsland(islandId) {
    return DATA.islands.find((isl) => isl.id === islandId) || null;
  }

  function findNode(nodeId) {
    for (const island of DATA.islands) {
      const node = island.nodes.find((n) => n.id === nodeId);
      if (node) return { island, node };
    }
    return null;
  }

  function getNodeDisplayTitle(node) {
    const p = state.nodeProgress[node.id];
    return p && p.customTitle ? p.customTitle : node.title;
  }

  function stripDuplicateCodePrefix(code, title) {
    const cleanCode = code.replace(" ⚠️", "").trim();
    if (title.startsWith(`${cleanCode}：`)) return title.slice(cleanCode.length + 1).trim();
    if (title.startsWith(`${cleanCode} `)) return title.slice(cleanCode.length + 1).trim();
    if (title.startsWith(`${cleanCode}〈`)) return title.slice(cleanCode.length).trim();
    return title;
  }

  function getNodeDisplaySections(node) {
    const p = state.nodeProgress[node.id];
    return p && p.customSections ? p.customSections : node.sections;
  }

  function getNodeStatus(islandId, nodeId) {
    const found = findNode(nodeId);
    const p = state.nodeProgress[nodeId];
    if (!found || !p) {
      return { percent: 0, conquered: false, checkedCount: 0, totalChecks: 0, quizPassed: false, proficiency: "none" };
    }
    const totalChecks = found.node.checklist.length;
    const checkedCount = p.checked.filter(Boolean).length;
    const checkRatio = totalChecks > 0 ? checkedCount / totalChecks : 0;
    const percent = Math.round(checkRatio * 70 + (p.quizPassed ? 30 : 0));
    const conquered = checkedCount === totalChecks && p.quizPassed;
    return {
      percent,
      conquered,
      checkedCount,
      totalChecks,
      quizPassed: p.quizPassed,
      proficiency: p.proficiency
    };
  }

  function getIslandStats(island) {
    let totalPct = 0;
    let conqueredCount = 0;
    island.nodes.forEach((n) => {
      const st = getNodeStatus(island.id, n.id);
      totalPct += st.percent;
      if (st.conquered) conqueredCount += 1;
    });
    const avgPercent = Math.round(totalPct / Math.max(island.nodes.length, 1));
    return {
      avgPercent,
      conqueredCount,
      totalNodes: island.nodes.length,
      allConquered: conqueredCount === island.nodes.length
    };
  }

  function getGlobalStats() {
    let totalNodes = 0;
    let conqueredNodes = 0;
    let totalPctSum = 0;
    let quizPassedCount = 0;
    let masterCount = 0;
    let weakCount = 0;
    let totalChecked = 0;

    DATA.islands.forEach((isl) => {
      isl.nodes.forEach((n) => {
        totalNodes += 1;
        const st = getNodeStatus(isl.id, n.id);
        totalPctSum += st.percent;
        totalChecked += st.checkedCount;
        if (st.conquered) conqueredNodes += 1;
        if (st.quizPassed) quizPassedCount += 1;
        if (st.proficiency === "master") masterCount += 1;
        if (st.proficiency === "weak") weakCount += 1;
      });
    });

    const bonusFish = (state.catStats && state.catStats.bonusFish) || 0;
    const earnedFish = 3 + totalChecked * 2 + quizPassedCount * 5 + bonusFish;
    const spentFish = (state.catStats && state.catStats.spentFish) || 0;
    const availableFish = Math.max(0, earnedFish - spentFish);

    return {
      totalNodes,
      conqueredNodes,
      overallPercent: Math.round(totalPctSum / Math.max(totalNodes, 1)),
      quizPassedCount,
      masterCount,
      weakCount,
      availableFish
    };
  }

  function handleCatInteraction(islandId, useFish = false) {
    const island = findIsland(islandId);
    if (!island || !island.guardianCat) return;

    if (useFish) {
      const stats = getGlobalStats();
      if (stats.availableFish < 1) {
        showToast("🐟 小魚乾不足囉！多勾選複習考點 (+2🐟) 或通過測驗 (+5🐟) 就能獲得！");
        return;
      }
      state.catStats.spentFish = (state.catStats.spentFish || 0) + 1;
      state.catStats.hearts[islandId] = (state.catStats.hearts[islandId] || 0) + 3;
      showToast(`🐟 餵食成功！${island.guardianCat.name} 超開心 (+3 ❤️)`);
    } else {
      state.catStats.hearts[islandId] = (state.catStats.hearts[islandId] || 0) + 1;
      showToast(`🐾 摸了摸 ${island.guardianCat.name} (+1 ❤️)`);
    }

    const quotes = island.guardianCat.quotes || [];
    if (quotes.length > 0) {
      const curIdx = state.catStats.quoteIdx[islandId] || 0;
      state.catStats.quoteIdx[islandId] = (curIdx + 1) % quotes.length;
    }

    saveState();
    renderGlobalHUD();
    if (sceneManager) {
      sceneManager.triggerCatCelebration(islandId);
    }
    if (activeIslandId === islandId) {
      renderIslandPanel(island);
    }
  }

  function updateAtmosphereButton() {
    const btn = document.getElementById("atmosphere-toggle-btn");
    if (!btn) return;
    const labels = {
      day: "☀️ 晴空海域",
      sunset: "🌅 魔法夕陽",
      night: "🌌 星夜螢光海"
    };
    const mode = (state.catStats && state.catStats.atmosphere) || "day";
    btn.textContent = labels[mode] || labels.day;
  }

  function showToast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      el.classList.remove("is-visible");
    }, 2600);
  }

  /* ==================== 頂部狀態列與快速傳送列 ==================== */
  function formatExamMmDdRange() {
    const dates = getActiveExamDates();
    const sorted = [...dates].sort();
    const fmt = (iso) => {
      const parts = String(iso).split("-");
      return parts.length === 3 ? `${parts[1]}/${parts[2]}` : iso;
    };
    return sorted.length > 1 && sorted[0] !== sorted[sorted.length - 1]
      ? `${fmt(sorted[0])}–${fmt(sorted[sorted.length - 1])}`
      : fmt(sorted[0]);
  }

  function updateCountdown() {
    const el = document.getElementById("exam-countdown-text");
    const subEl = document.querySelector(".brand-sub");
    const dates = getActiveExamDates();
    const sorted = [...dates].sort();
    const startIso = sorted[0];
    const endIso = sorted[sorted.length - 1] || startIso;
    const rangeLabel = formatExamMmDdRange();
    const examName = (DATA.meta && DATA.meta.examName) || "第二次段考";

    if (subEl) {
      subEl.textContent = `南山中學${examName}（${rangeLabel}）六科整合節點確認與闖關系統`;
    }
    if (!el) return;

    const now = new Date();
    const examStart = new Date(`${startIso}T08:00:00+08:00`);
    const diffMs = examStart.getTime() - now.getTime();
    if (diffMs <= 0) {
      const examEnd = new Date(`${endIso}T17:00:00+08:00`);
      if (now <= examEnd) {
        el.textContent = `${examName}進行中！(${rangeLabel})`;
      } else {
        el.textContent = `${examName}已圓滿完成 (${rangeLabel})`;
      }
      return;
    }
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    el.textContent = `倒數 ${days} 天 (${rangeLabel})`;
  }

  function getTodayDateStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function getStreakDays() {
    const dates = [...new Set(state.checkinDates || [])].sort();
    if (dates.length === 0) return 0;
    // Count consecutive days ending at today or yesterday (or simply longest recent streak / total signed days)
    let streak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const d1 = new Date(dates[i] + "T00:00:00");
      const d2 = new Date(dates[i - 1] + "T00:00:00");
      const diffDays = Math.round((d1 - d2) / 86400000);
      if (diffDays === 1) streak += 1;
      else break;
    }
    return streak;
  }

  /* ==================== 4 軌情境交叉淡入音樂與 Web Audio 音效 ==================== */
  function getDesiredBgmTrack() {
    if (!state.audio || !state.audio.enabled) return null;
    const manual = state.audio.manualTrack || "auto";
    if (manual !== "auto" && BGM_TRACKS[manual]) return manual;
    if (pomodoroTimerId && pomodoroPhase === "focus") return "focus_lofi";
    if (pomodoroTimerId && pomodoroPhase === "break") return "cafe_chill";
    if (activeLifeState && activeLifeState.act) {
      const t = activeLifeState.act.type;
      if (t === "study") return "focus_lofi";
      if (t === "cafe" || t === "lounge" || t === "fishing") return "cafe_chill";
    }
    const atmo = (state.catStats && state.catStats.atmosphere) || "day";
    if (atmo === "sunset") return "cafe_chill";
    if (atmo === "night") return "night_study";
    return "island_day";
  }

  function getOrCreateBgmPlayer(trackId) {
    if (bgmPlayers[trackId]) return bgmPlayers[trackId];
    const meta = BGM_TRACKS[trackId];
    if (!meta || typeof Audio !== "function") return null;
    try {
      const audio = new Audio(meta.src);
      audio.loop = true;
      audio.preload = "none";
      audio.volume = 0;
      bgmPlayers[trackId] = audio;
      return audio;
    } catch (e) {
      return null;
    }
  }

  function updateAudioControlsUI() {
    const enabled = Boolean(state.audio && state.audio.enabled);
    const want = getDesiredBgmTrack() || "island_day";
    const meta = BGM_TRACKS[want] || BGM_TRACKS.island_day;
    const hudBtn = document.getElementById("hud-audio-btn");
    const hudIcon = document.getElementById("hud-audio-icon");
    const hudText = document.getElementById("hud-audio-text");
    if (hudBtn) hudBtn.classList.toggle("is-muted", !enabled);
    if (hudIcon) hudIcon.textContent = enabled ? "🔊" : "🔇";
    if (hudText) hudText.textContent = enabled ? meta.label : "靜音中";

    const trackBtn = document.getElementById("focus-audio-track-btn");
    if (trackBtn) {
      const m = (state.audio && state.audio.manualTrack) || "auto";
      trackBtn.textContent = m === "auto"
        ? `🎵 曲目：自動 (${meta.label})`
        : `🎵 曲目：${(BGM_TRACKS[m] && BGM_TRACKS[m].label) || m}`;
    }
    const muteBtn = document.getElementById("focus-mute-btn");
    if (muteBtn) muteBtn.textContent = enabled ? "🔊 音樂開啟" : "🔇 已靜音";
    const slider = document.getElementById("focus-volume-slider");
    if (slider && state.audio) slider.value = String(Math.round((state.audio.volume || 0.38) * 100));
  }

  function syncBgmTrack() {
    updateAudioControlsUI();
    const wantId = getDesiredBgmTrack();
    const targetVol = state.audio && typeof state.audio.volume === "number" ? state.audio.volume : 0.38;

    if (!wantId) {
      if (bgmFadeInterval) {
        clearInterval(bgmFadeInterval);
        bgmFadeInterval = null;
      }
      currentBgmTrackId = null;
      Object.keys(bgmPlayers).forEach((k) => {
        try {
          bgmPlayers[k].volume = 0;
          bgmPlayers[k].pause();
        } catch (e) {}
      });
      return;
    }

    if (!audioUnlocked) return;
    const targetPlayer = getOrCreateBgmPlayer(wantId);
    if (!targetPlayer) return;

    if (wantId === currentBgmTrackId) {
      if (!bgmFadeInterval) targetPlayer.volume = targetVol;
      if (targetPlayer.paused) {
        const p = targetPlayer.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
      return;
    }

    currentBgmTrackId = wantId;
    if (bgmFadeInterval) clearInterval(bgmFadeInterval);

    const starts = {};
    Object.keys(bgmPlayers).forEach((k) => {
      starts[k] = bgmPlayers[k].volume || 0;
    });
    if (!(wantId in starts)) starts[wantId] = 0;

    if (targetPlayer.paused) {
      const p = targetPlayer.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }

    let step = 0;
    const steps = 20;
    bgmFadeInterval = setInterval(() => {
      step += 1;
      const ratio = step / steps;
      Object.keys(bgmPlayers).forEach((k) => {
        const pl = bgmPlayers[k];
        if (!pl) return;
        const v0 = starts[k] || 0;
        if (k === wantId) {
          pl.volume = Math.max(0, Math.min(1, v0 + (targetVol - v0) * ratio));
        } else {
          pl.volume = Math.max(0, Math.min(1, v0 * (1 - ratio)));
          if (step >= steps) {
            pl.volume = 0;
            try {
              pl.pause();
            } catch (e) {}
          }
        }
      });
      if (step >= steps) {
        clearInterval(bgmFadeInterval);
        bgmFadeInterval = null;
      }
    }, 45);
  }

  function playSfx(kind) {
    if (state.audio && !state.audio.enabled) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!sfxAudioCtx) sfxAudioCtx = new Ctx();
      if (sfxAudioCtx.state === "suspended") sfxAudioCtx.resume().catch(() => {});
      const now = sfxAudioCtx.currentTime;
      const tone = (freq, start, dur, vol = 0.08, type = "sine") => {
        const osc = sfxAudioCtx.createOscillator();
        const gain = sfxAudioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.exponentialRampToValueAtTime(vol, now + start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(sfxAudioCtx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      };
      if (kind === "splash") {
        tone(740, 0, 0.09, 0.09, "triangle");
        tone(987, 0.09, 0.14, 0.1, "triangle");
      } else if (kind === "catch") {
        tone(523.25, 0, 0.1, 0.08);
        tone(659.25, 0.08, 0.1, 0.08);
        tone(783.99, 0.16, 0.12, 0.09);
        tone(1046.5, 0.25, 0.22, 0.1);
      } else if (kind === "complete") {
        tone(523.25, 0, 0.18, 0.09);
        tone(659.25, 0.15, 0.18, 0.09);
        tone(783.99, 0.3, 0.2, 0.09);
        tone(1046.5, 0.45, 0.38, 0.11);
      } else {
        tone(620, 0, 0.06, 0.05);
      }
    } catch (e) {}
  }

  /* ==================== 深度灰階專注番茄鐘系統 ==================== */
  function populateFocusNodeSelect() {
    const sel = document.getElementById("focus-node-select");
    if (!sel) return;
    const prev = pomodoroTargetNodeId || "";
    const opts = ['<option value="">🌱 自由複習（不指定單元）</option>'];
    DATA.islands.forEach((isl) => {
      isl.nodes.forEach((n) => {
        const title = (state.nodeProgress[n.id] && state.nodeProgress[n.id].customTitle) || n.title;
        opts.push(`<option value="${n.id}">${escapeHtml(isl.subject)} · ${escapeHtml(n.code)} ${escapeHtml(title)}</option>`);
      });
    });
    sel.innerHTML = opts.join("");
    sel.value = prev;
  }

  function updatePomodoroDisplay() {
    const mins = String(Math.floor(pomodoroSecs / 60)).padStart(2, "0");
    const secs = String(pomodoroSecs % 60).padStart(2, "0");
    const isFocusRunning = Boolean(pomodoroTimerId && pomodoroPhase === "focus");
    const isBreakRunning = Boolean(pomodoroTimerId && pomodoroPhase === "break");
    const found = pomodoroTargetNodeId ? findNode(pomodoroTargetNodeId) : null;

    const btn = document.getElementById("pomodoro-btn");
    if (btn) {
      btn.classList.toggle("is-running", Boolean(pomodoroTimerId));
      if (isBreakRunning) {
        btn.textContent = `☕ 休息 ${mins}:${secs}`;
      } else if (isFocusRunning) {
        const tag = found ? `${found.island.subject}${found.node.code}` : "專注中";
        btn.textContent = `🍅 ${tag} ${mins}:${secs}`;
      } else {
        btn.textContent = `🍅 ${mins}:${secs} 專注`;
      }
    }

    const clockEl = document.getElementById("focus-clock-text");
    if (clockEl) clockEl.textContent = `${mins}:${secs}`;
    const ringEl = document.getElementById("focus-ring-fg");
    if (ringEl) {
      const circ = 603.19;
      const ratio = Math.max(0, Math.min(1, pomodoroSecs / Math.max(pomodoroTotalSecs, 1)));
      ringEl.style.strokeDashoffset = String((circ * (1 - ratio)).toFixed(2));
    }
    const badgeEl = document.getElementById("focus-phase-badge");
    if (badgeEl) {
      badgeEl.classList.toggle("is-break", pomodoroPhase === "break");
      badgeEl.textContent = pomodoroPhase === "break" ? "☕ 5 分鐘大腦休息中" : isFocusRunning ? "🍅 深度專注鎖定中" : "🍅 深度專注模式";
    }
    const tgtLabel = document.getElementById("focus-target-label");
    if (tgtLabel) {
      tgtLabel.textContent = pomodoroPhase === "break" ? "放鬆喝水伸展一下" : found ? `${found.island.subject} · ${found.node.code}` : "自由複習衝刺";
    }
    const distEl = document.getElementById("focus-distract-text");
    if (distEl) {
      distEl.classList.toggle("has-distract", focusDistractions > 0);
      distEl.textContent = focusDistractions > 0 ? `👀 切換分頁：${focusDistractions} 次` : "✨ 零分心專注保持中";
    }
    const startBtn = document.getElementById("focus-start-pause-btn");
    if (startBtn) {
      startBtn.textContent = pomodoroTimerId ? "⏸ 暫停倒數" : pomodoroSecs < pomodoroTotalSecs ? "▶ 繼續專注" : "▶ 開始深度專注";
    }
    document.querySelectorAll(".focus-dur-btn").forEach((b) => {
      const m = Number(b.dataset.mins);
      b.classList.toggle("is-active", pomodoroPhase === "focus" && m === pomodoroMins);
      b.disabled = Boolean(pomodoroTimerId);
    });
    const nodeSel = document.getElementById("focus-node-select");
    if (nodeSel) nodeSel.disabled = Boolean(pomodoroTimerId);

    const deepGray = Boolean(isFocusRunning && focusOverlayOpen);
    document.body.classList.toggle("is-focus-mode", deepGray);
    if (sceneManager && typeof sceneManager.setFocusMode === "function") {
      sceneManager.setFocusMode(deepGray);
    }
  }

  function startFocusCountdown() {
    audioUnlocked = true;
    if (pomodoroTimerId) clearInterval(pomodoroTimerId);
    document.getElementById("focus-break-btn")?.classList.add("is-hidden");

    pomodoroTimerId = setInterval(() => {
      pomodoroSecs -= 1;
      if (pomodoroSecs <= 0) {
        clearInterval(pomodoroTimerId);
        pomodoroTimerId = null;

        if (pomodoroPhase === "focus") {
          const baseReward = pomodoroMins >= 45 ? 8 : pomodoroMins >= 25 ? 4 : 2;
          const bonusZero = focusDistractions === 0 ? 1 : 0;
          const totalFish = baseReward + bonusZero;
          pomodoroSecs = pomodoroMins * 60;
          pomodoroTotalSecs = pomodoroSecs;
          state.catStats.bonusFish = (state.catStats.bonusFish || 0) + totalFish;
          if (!state.lifeStats) state.lifeStats = { focusCompleted: 0, focusMinutes: 0, fishCaught: 0, activitiesDone: {} };
          state.lifeStats.focusCompleted = (state.lifeStats.focusCompleted || 0) + 1;
          state.lifeStats.focusMinutes = (state.lifeStats.focusMinutes || 0) + pomodoroMins;
          if (pomodoroTargetNodeId) {
            state.nodePomodoros[pomodoroTargetNodeId] = (state.nodePomodoros[pomodoroTargetNodeId] || 0) + 1;
          }
          saveState();
          renderGlobalHUD();
          if (activeIslandId) {
            renderIslandPanel(findIsland(activeIslandId), null, true);
            if (sceneManager) sceneManager.triggerCatCelebration(activeIslandId);
          }
          if (sceneManager) sceneManager.doPantherAction("cheer");
          playSfx("complete");
          document.getElementById("focus-break-btn")?.classList.remove("is-hidden");
          showToast(
            `🍅 ${pomodoroMins} 分鐘專注達成！獲得 +${totalFish} 🐟${bonusZero ? "（含零分心獎勵 +1 🐟）" : ""}，建議休息 5 分鐘！`
          );
        } else {
          pomodoroPhase = "focus";
          pomodoroSecs = pomodoroMins * 60;
          pomodoroTotalSecs = pomodoroSecs;
          document.getElementById("focus-break-btn")?.classList.add("is-hidden");
          playSfx("catch");
          showToast("☕ 5 分鐘休息結束，恢復色彩＆活力迎接下一段衝刺！");
        }
        syncBgmTrack();
      }
      updatePomodoroDisplay();
    }, 1000);

    updatePomodoroDisplay();
    syncBgmTrack();
  }

  function pauseFocusCountdown() {
    if (!pomodoroTimerId) return;
    clearInterval(pomodoroTimerId);
    pomodoroTimerId = null;
    updatePomodoroDisplay();
    syncBgmTrack();
    showToast("⏸ 已暫停計時，畫面恢復彩色");
  }

  function resetFocusCountdown() {
    if (pomodoroTimerId) {
      clearInterval(pomodoroTimerId);
      pomodoroTimerId = null;
    }
    pomodoroPhase = "focus";
    focusDistractions = 0;
    pomodoroTotalSecs = pomodoroMins * 60;
    pomodoroSecs = pomodoroTotalSecs;
    document.getElementById("focus-break-btn")?.classList.add("is-hidden");
    updatePomodoroDisplay();
    syncBgmTrack();
  }

  function startBreakCountdown() {
    if (pomodoroTimerId) clearInterval(pomodoroTimerId);
    pomodoroTimerId = null;
    pomodoroPhase = "break";
    pomodoroTotalSecs = 5 * 60;
    pomodoroSecs = 5 * 60;
    startFocusCountdown();
    showToast("☕ 開始 5 分鐘大腦休息（畫面恢復彩色＋播放咖啡輕音樂）");
  }

  function openFocusOverlay(autoStart = false) {
    focusOverlayOpen = true;
    populateFocusNodeSelect();
    document.getElementById("focus-overlay")?.classList.add("is-open");
    if (autoStart && !pomodoroTimerId) {
      startFocusCountdown();
    } else {
      updatePomodoroDisplay();
      syncBgmTrack();
    }
  }

  function minimizeFocusOverlay() {
    focusOverlayOpen = false;
    document.getElementById("focus-overlay")?.classList.remove("is-open");
    updatePomodoroDisplay();
    syncBgmTrack();
    if (pomodoroTimerId) {
      showToast("🍅 番茄鐘已縮小至頂部繼續倒數（背景運行中）");
    }
  }

  function startNodePomodoro(nodeId) {
    pomodoroTargetNodeId = nodeId;
    if (pomodoroTimerId) {
      clearInterval(pomodoroTimerId);
      pomodoroTimerId = null;
    }
    pomodoroPhase = "focus";
    pomodoroMins = 25;
    pomodoroTotalSecs = 25 * 60;
    pomodoroSecs = pomodoroTotalSecs;
    focusDistractions = 0;
    const found = findNode(nodeId);
    openFocusOverlay(true);
    showToast(found ? `🍅 已為「${found.island.subject} ${found.node.code}」啟動深度灰階專注！` : "🍅 已啟動深度專注番茄鐘！");
  }

  function togglePomodoro() {
    openFocusOverlay(false);
  }

  /* ==================== 島嶼生活互動站 ＆ 釣魚小遊戲 ==================== */
  function findLifeActivity(activityId) {
    const list = (DATA && DATA.lifeActivities) || [];
    return list.find((a) => a.id === activityId) || null;
  }

  function renderLifeActionBar() {
    const bar = document.getElementById("life-action-bar");
    if (!bar) return;
    if (!activeLifeState || !activeLifeState.act) {
      bar.classList.remove("is-open");
      return;
    }
    const { act, phase, statusMsg } = activeLifeState;
    const emojiEl = document.getElementById("life-action-emoji");
    const titleEl = document.getElementById("life-action-title");
    const statusEl = document.getElementById("life-action-status");
    const reelBtn = document.getElementById("fishing-reel-btn");
    const againBtn = document.getElementById("fishing-again-btn");
    const focusBtn = document.getElementById("life-start-focus-btn");

    if (emojiEl) emojiEl.textContent = act.emoji || "🐾";
    if (titleEl) titleEl.textContent = act.name;
    if (statusEl) statusEl.textContent = statusMsg || act.emote || act.desc;
    if (reelBtn) reelBtn.classList.toggle("is-hidden", !(act.type === "fishing" && phase === "bite"));
    if (againBtn) againBtn.classList.toggle("is-hidden", !(act.type === "fishing" && (phase === "caught" || phase === "missed")));
    if (focusBtn) focusBtn.classList.toggle("is-hidden", act.type !== "study");
    bar.classList.add("is-open");
  }

  function stopLifeActivityUI(fromScene = false) {
    if (activeLifeState) {
      if (activeLifeState.timerId) clearTimeout(activeLifeState.timerId);
      if (activeLifeState.biteWindowId) clearTimeout(activeLifeState.biteWindowId);
      activeLifeState = null;
    }
    if (!fromScene && sceneManager && typeof sceneManager.stopPantherActivity === "function") {
      sceneManager.stopPantherActivity();
    }
    renderLifeActionBar();
    syncBgmTrack();
  }

  function castFishingLine() {
    if (!activeLifeState || activeLifeState.act.type !== "fishing") return;
    if (activeLifeState.timerId) clearTimeout(activeLifeState.timerId);
    if (activeLifeState.biteWindowId) clearTimeout(activeLifeState.biteWindowId);
    if (sceneManager && typeof sceneManager.setFishingBite === "function") {
      sceneManager.setFishingBite(false);
    }
    activeLifeState.phase = "waiting_bite";
    activeLifeState.statusMsg = "🎣 甩竿下海囉！緊盯紅白浮標等待訊號…";
    renderLifeActionBar();

    const waitMs = 2200 + Math.round(Math.random() * 2400);
    activeLifeState.timerId = setTimeout(() => {
      if (!activeLifeState || activeLifeState.act.type !== "fishing") return;
      activeLifeState.phase = "bite";
      activeLifeState.statusMsg = "❗ 浮標下沉啦！快按「收竿」或空白鍵 (Space)！";
      if (sceneManager && typeof sceneManager.setFishingBite === "function") {
        sceneManager.setFishingBite(true);
      }
      playSfx("splash");
      renderLifeActionBar();

      activeLifeState.biteWindowId = setTimeout(() => {
        if (!activeLifeState || activeLifeState.phase !== "bite") return;
        activeLifeState.phase = "missed";
        activeLifeState.statusMsg = "💨 哎呀慢了一步，魚群溜走了！可按「再拋一竿」";
        if (sceneManager && typeof sceneManager.setFishingBite === "function") {
          sceneManager.setFishingBite(false);
        }
        renderLifeActionBar();
      }, 2500);
    }, waitMs);
  }

  function reelFishingCatch() {
    if (!activeLifeState || activeLifeState.act.type !== "fishing" || activeLifeState.phase !== "bite") return;
    if (activeLifeState.biteWindowId) clearTimeout(activeLifeState.biteWindowId);
    if (sceneManager && typeof sceneManager.setFishingBite === "function") {
      sceneManager.setFishingBite(false);
    }
    const r = Math.random();
    const catchItem =
      r < 0.08
        ? { label: "🏆 黃金旗魚王", fish: 6 }
        : r < 0.28
          ? { label: "🐡 幸運刺河豚", fish: 4 }
          : r < 0.72
            ? { label: "🐠 繽紛島嶼鯛", fish: 3 }
            : { label: "🐟 銀鱗鮮沙丁", fish: 2 };

    state.catStats.bonusFish = (state.catStats.bonusFish || 0) + catchItem.fish;
    if (!state.lifeStats) state.lifeStats = { focusCompleted: 0, focusMinutes: 0, fishCaught: 0, activitiesDone: {} };
    state.lifeStats.fishCaught = (state.lifeStats.fishCaught || 0) + 1;
    state.lifeStats.activitiesDone.fishing = (state.lifeStats.activitiesDone.fishing || 0) + 1;
    saveState();
    renderGlobalHUD();
    playSfx("catch");
    activeLifeState.phase = "caught";
    activeLifeState.statusMsg = `🎉 釣獲【${catchItem.label}】！小魚乾 +${catchItem.fish} 🐟（累計釣魚 ${state.lifeStats.fishCaught} 條）`;
    renderLifeActionBar();
    showToast(`🎣 太棒了！釣到 ${catchItem.label}，獲得 +${catchItem.fish} 🐟 小魚乾！`);
  }

  function triggerLifeActivity(activityId) {
    const act = findLifeActivity(activityId);
    if (!act) return;
    audioUnlocked = true;
    stopLifeActivityUI(true);

    if (sceneManager && typeof sceneManager.startPantherActivity === "function") {
      sceneManager.startPantherActivity(activityId, act);
    }
    activeLifeState = {
      activityId,
      act,
      phase: "running",
      timerId: null,
      biteWindowId: null,
      statusMsg: act.emote || act.desc
    };
    syncBgmTrack();

    if (act.type === "fishing") {
      castFishingLine();
      return;
    }

    const now = Date.now();
    const lastAt = activityCooldownAt[act.type] || 0;
    const rewardReady = now - lastAt >= 12000;
    activeLifeState.statusMsg = rewardReady
      ? `${act.emote}（稍候片刻即可獲得 +${act.fishReward || 1} 🐟）`
      : `${act.emote}（愜意體驗中～）`;
    renderLifeActionBar();

    if (rewardReady) {
      const waitMs = Math.min(Number(act.durationSec) || 5, 5) * 1000;
      activeLifeState.timerId = setTimeout(() => {
        if (!activeLifeState || activeLifeState.activityId !== activityId) return;
        activityCooldownAt[act.type] = Date.now();
        const gain = Number(act.fishReward) || 1;
        state.catStats.bonusFish = (state.catStats.bonusFish || 0) + gain;
        if (!state.lifeStats) state.lifeStats = { focusCompleted: 0, focusMinutes: 0, fishCaught: 0, activitiesDone: {} };
        state.lifeStats.activitiesDone[act.type] = (state.lifeStats.activitiesDone[act.type] || 0) + 1;
        saveState();
        renderGlobalHUD();
        playSfx("catch");
        activeLifeState.statusMsg = `✨ 體驗完成！獲得 +${gain} 🐟 小魚乾，可隨時起身或繼續放鬆`;
        renderLifeActionBar();
        showToast(`${act.emoji} 完成「${act.name}」！獲得 +${gain} 🐟 小魚乾！`);
      }, waitMs);
    }
  }

  function renderGlobalHUD() {
    const stats = getGlobalStats();
    const pctEl = document.getElementById("global-progress-text");
    const barEl = document.getElementById("global-progress-fill");
    const flagsEl = document.getElementById("global-flags-text");
    const fishEl = document.getElementById("fish-count-text");
    const intelEl = document.getElementById("intel-count-text");
    const stepsEl = document.getElementById("walk-steps-text");
    const checkinBtn = document.getElementById("nav-checkin-btn");

    if (pctEl) pctEl.textContent = `${stats.overallPercent}%`;
    if (barEl) barEl.style.width = `${stats.overallPercent}%`;
    if (flagsEl) flagsEl.textContent = `${stats.conqueredNodes}/${stats.totalNodes} 🏅`;
    if (fishEl) fishEl.textContent = String(stats.availableFish);
    if (intelEl) intelEl.textContent = `${(state.collectedIntel || []).length}/${(DATA.intelItems || []).length}`;
    if (stepsEl) stepsEl.textContent = `${(state.catStats && state.catStats.walkSteps) || 0} 步`;

    if (checkinBtn) {
      const today = getTodayDateStr();
      const signed = (state.checkinDates || []).includes(today);
      const streak = getStreakDays();
      checkinBtn.textContent = signed ? `✅ 已簽到 (${streak}天)` : `📅 簽到 (${streak}天)`;
    }

    updatePomodoroDisplay();
    updateAtmosphereButton();
    renderQuickDock();
    if (sceneManager) {
      sceneManager.refreshAllStates();
      sceneManager.syncDecorations(state.ownedBuildings || []);
      sceneManager.syncCollectedIntel(state.collectedIntel || []);
    }
  }

  function renderQuickDock() {
    const dock = document.getElementById("island-dock-bar");
    if (!dock) return;

    const overviewActive = activeIslandId === null ? "is-active" : "";
    let html = `<button type="button" class="dock-btn ${overviewActive}" data-dock-island="overview" style="--dock-color: #0ea5e9">
      <span>🌊 群島總覽</span>
    </button>`;

    DATA.islands.forEach((isl) => {
      const st = getIslandStats(isl);
      const isAct = activeIslandId === isl.id ? "is-active" : "";
      const icon = st.allConquered ? "🌟" : "";
      html += `<button type="button" class="dock-btn ${isAct}" data-dock-island="${isl.id}" style="--dock-color: ${isl.colors.primary}">
        <span class="dock-dot"></span>
        <span>${isl.subject} ${icon}(${st.conqueredCount}/${st.totalNodes})</span>
      </button>`;
    });

    dock.innerHTML = html;
    dock.querySelectorAll("[data-dock-island]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-dock-island");
        if (target === "overview") {
          closeIslandPanel();
        } else {
          openIsland(target);
        }
      });
    });
  }

  /* ==================== 右側登島指揮所面板 ==================== */
  function updateCameraModeBtn() {
    const btn = document.getElementById("panther-focus-btn");
    if (!btn || !sceneManager) return;
    btn.textContent = sceneManager.cameraMode === "overview" ? "🐆 跟隨" : "🗺️ 鳥瞰";
  }

  function updateIslandFloatPill() {
    const pill = document.getElementById("island-float-pill");
    const title = document.getElementById("island-float-title");
    if (!pill || !title) return;
    const panelOpen = document.getElementById("island-panel")?.classList.contains("is-open");
    if (activeIslandId && !panelOpen) {
      const isl = findIsland(activeIslandId);
      title.textContent = isl ? `🏝️ ${isl.name}` : "🏝️ 探索島嶼";
      const header = document.querySelector(".top-header");
      if (header) {
        const rect = header.getBoundingClientRect();
        if (rect.bottom > 0) {
          pill.style.top = `${Math.ceil(rect.bottom + 8)}px`;
        }
      }
      pill.classList.add("is-visible");
    } else {
      pill.classList.remove("is-visible");
    }
  }

  function collapseIslandPanelTo3D() {
    document.getElementById("island-panel")?.classList.remove("is-open");
    document.body.classList.remove("has-open-panel");
    updateIslandFloatPill();
    if (sceneManager) {
      sceneManager.focusPanther();
      updateCameraModeBtn();
    }
  }

  function openIsland(islandId, focusNodeId = null, skipFly = false) {
    const island = findIsland(islandId);
    if (!island) return;
    activeIslandId = islandId;
    if (sceneManager && !skipFly) {
      sceneManager.flyToIsland(islandId);
    }
    updateCameraModeBtn();
    renderQuickDock();
    renderIslandPanel(island, focusNodeId);
    document.getElementById("island-panel").classList.add("is-open");
    document.body.classList.add("has-open-panel");
    updateIslandFloatPill();
  }

  function closeIslandPanel() {
    activeIslandId = null;
    document.getElementById("island-panel").classList.remove("is-open");
    document.body.classList.remove("has-open-panel");
    updateIslandFloatPill();
    if (sceneManager) {
      sceneManager.flyToOverview();
    }
    updateCameraModeBtn();
    renderQuickDock();
  }

  function renderIslandPanel(island, focusNodeId = null, preserveScroll = false) {
    const stats = getIslandStats(island);
    const headerEl = document.getElementById("panel-header");
    const bodyEl = document.getElementById("panel-body");
    const prevScrollTop = preserveScroll ? bodyEl.scrollTop : 0;

    // Remember which node cards are currently expanded if preserving state
    const expandedIds = new Set();
    if (preserveScroll) {
      bodyEl.querySelectorAll(".node-card.is-expanded").forEach((el) => {
        expandedIds.add(el.id.replace("node-card-", ""));
      });
    } else if (panelAllExpanded) {
      island.nodes.forEach((n) => expandedIds.add(n.id));
    } else {
      expandedIds.add(focusNodeId || island.nodes[0].id);
    }
    if (focusNodeId) expandedIds.add(focusNodeId);

    const lighthouseBadge = stats.allConquered
      ? `<span style="color:#ffd32a;font-size:13px;">💡 主燈塔已點亮！</span>`
      : `<span style="color:#9ec0db;font-size:12px;">完成全部據點即可點亮島嶼燈塔</span>`;

    headerEl.innerHTML = `
      <div class="panel-header-top">
        <div>
          <span class="panel-subject-tag" style="background:${island.colors.primary}">${island.subject} · ${island.subtitle}</span>
          <h2 class="panel-title">${island.name} ${lighthouseBadge}</h2>
          <p class="panel-meta">任課教師：${island.teacher} ｜ 教材：${island.textbook}</p>
        </div>
        <div class="panel-header-btns">
          <button type="button" class="panther-3d-btn" id="collapse-panel-3d-btn" title="收合清單，用方向盤自由操控南山豹逛島">🕹️ 3D走動</button>
          <button type="button" class="close-btn" id="close-panel-btn" title="返回群島總覽">✕</button>
        </div>
      </div>
      <div class="panel-scope-banner">
        <strong>段考範圍：</strong>${island.scopeSummary}
        <div style="margin-top:3px;color:var(--text-muted);font-size:12px;">${island.description}</div>
      </div>
      <div class="panel-island-progress">
        <span>🏫 校園自強進度榜 <strong>${stats.avgPercent}%</strong></span>
        <div class="panel-progress-bar">
          <div class="panel-progress-fill" style="width:${stats.avgPercent}%"></div>
        </div>
        <span>${stats.conqueredCount}/${stats.totalNodes} 站認證 🏅</span>
      </div>
    `;

    document.getElementById("close-panel-btn").addEventListener("click", closeIslandPanel);
    document.getElementById("collapse-panel-3d-btn")?.addEventListener("click", collapseIslandPanelTo3D);

    bodyEl.innerHTML = "";

    // Guardian Cat Card
    if (island.guardianCat) {
      const cat = island.guardianCat;
      const hearts = (state.catStats && state.catStats.hearts && state.catStats.hearts[island.id]) || 0;
      const qIdx = (state.catStats && state.catStats.quoteIdx && state.catStats.quoteIdx[island.id]) || 0;
      const quote = cat.quotes && cat.quotes.length > 0 ? cat.quotes[qIdx % cat.quotes.length] : "";

      const catCard = document.createElement("div");
      catCard.className = "guardian-cat-card";
      catCard.innerHTML = `
        <div class="cat-card-top">
          <div class="cat-identity">
            <div class="cat-avatar">${cat.emoji || "🐱"}</div>
            <div>
              <div class="cat-name">${escapeHtml(cat.name)}</div>
              <div class="cat-role">${escapeHtml(cat.title)}</div>
            </div>
          </div>
          <span class="cat-hearts">❤️ 好感度 ${hearts}</span>
        </div>
        <div class="cat-quote-bubble">💬 「${escapeHtml(quote)}」</div>
        <div class="cat-actions">
          <button type="button" class="cat-btn" id="pet-cat-btn">🐾 擼貓打氣 (+1 ❤️)</button>
          <button type="button" class="cat-btn feed-btn" id="feed-cat-btn">🐟 餵小魚乾 (-1🐟 / +3 ❤️)</button>
        </div>
      `;
      bodyEl.appendChild(catCard);

      catCard.querySelector("#pet-cat-btn").addEventListener("click", () => handleCatInteraction(island.id, false));
      catCard.querySelector("#feed-cat-btn").addEventListener("click", () => handleCatInteraction(island.id, true));
    }

    // 「校園生活自強不息・走路遇點」控制列 + 展開全部按鈕
    const walkBar = document.createElement("div");
    walkBar.className = "walk-encounter-bar";
    walkBar.innerHTML = `
      <div class="walk-stats-text">
        🎒 <strong>自強不息巡禮</strong> · 已走 ${(state.catStats && state.catStats.walkSteps) || 0} 步 · 連勝 ${(state.catStats && state.catStats.walkCombo) || 0} 🔥
      </div>
      <div class="panel-quick-tools">
        <button type="button" class="primary-btn" id="walk-step-btn" style="padding:6px 11px;font-size:12px;">🚶 走路遇點（知識深化）</button>
        <button type="button" class="small-action-btn" id="toggle-expand-all-btn">${panelAllExpanded ? "📁 收合全部" : "📂 展開全部考點"}</button>
      </div>
    `;
    bodyEl.appendChild(walkBar);

    walkBar.querySelector("#walk-step-btn").addEventListener("click", () => triggerWalkStep(island.id));
    walkBar.querySelector("#toggle-expand-all-btn").addEventListener("click", () => {
      panelAllExpanded = !panelAllExpanded;
      renderIslandPanel(island, null, false);
    });

    island.nodes.forEach((node) => {
      const p = state.nodeProgress[node.id];
      const st = getNodeStatus(island.id, node.id);
      const displayTitle = getNodeDisplayTitle(node);
      const displaySections = getNodeDisplaySections(node);
      const isExpanded = expandedIds.has(node.id);

      const card = document.createElement("div");
      card.className = `node-card ${st.conquered ? "is-conquered" : ""} ${isExpanded ? "is-expanded" : ""}`;
      card.id = `node-card-${node.id}`;

      const flagLabel = st.conquered
        ? "🏅 自強認證完成"
        : st.quizPassed
          ? `✅ 小測驗通過 · ${st.checkedCount}/${st.totalChecks}`
          : `📚 ${st.checkedCount}/${st.totalChecks} 學習點`;

      const profWeakCls = p.proficiency === "weak" ? "active-weak" : "";
      const profOkCls = p.proficiency === "ok" ? "active-ok" : "";
      const profMasterCls = p.proficiency === "master" ? "active-master" : "";

      const checklistHtml = node.checklist
        .map((itemText, idx) => {
          const checked = p.checked[idx];
          return `
            <label class="check-item ${checked ? "is-checked" : ""}">
              <input type="checkbox" data-check-node="${node.id}" data-check-idx="${idx}" ${checked ? "checked" : ""} />
              <span>${escapeHtml(itemText)}</span>
            </label>
          `;
        })
        .join("");

      const pomoDone = (state.nodePomodoros && state.nodePomodoros[node.id]) || 0;
      const pomoEst = Math.max(1, Math.ceil((node.estimatedMins || 40) / 25));
      const inBackpack = (state.backpack || []).includes(node.id);

      card.innerHTML = `
        <div class="node-card-head" data-toggle-node="${node.id}">
          <div>
            <div class="node-title-text">
              <span class="node-code">${escapeHtml(node.code)}</span>${escapeHtml(stripDuplicateCodePrefix(node.code, displayTitle))}
            </div>
            <div class="node-sections">${escapeHtml(displaySections)} · 約 ${node.estimatedMins} 分鐘（🍅×${pomoEst} · 已完成 ${pomoDone} 顆）</div>
          </div>
          <div class="node-badges">
            <span class="flag-status ${st.conquered ? "conquered" : ""}">${flagLabel}</span>
            <span style="font-size:11px;color:var(--text-dim);">進度 ${st.percent}%</span>
          </div>
        </div>
        <div class="node-card-body">
          <div class="node-toolbar">
            <div class="proficiency-group" role="group" aria-label="熟練度自評">
              <button type="button" class="prof-btn ${profWeakCls}" data-prof-node="${node.id}" data-prof-val="weak">🔥 待加強</button>
              <button type="button" class="prof-btn ${profOkCls}" data-prof-node="${node.id}" data-prof-val="ok">☀️ 課堂已懂</button>
              <button type="button" class="prof-btn ${profMasterCls}" data-prof-node="${node.id}" data-prof-val="master">🏅 自強精熟</button>
            </div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <button type="button" class="small-action-btn" data-pomo-node="${node.id}">🍅 專注</button>
              <button type="button" class="small-action-btn" data-backpack-node="${node.id}" style="${inBackpack ? "border-color:#ffd32a;color:#fef08a;" : ""}">${inBackpack ? "🎒 已收行囊" : "🎒 收進行囊"}</button>
              <button type="button" class="small-action-btn" data-edit-node="${node.id}">✏️ 編輯</button>
            </div>
          </div>

          <div class="checklist-box">
            <div class="checklist-label">🏫 南山自強學習清單・考點筆記檢核（${st.checkedCount}/${st.totalChecks}）</div>
            ${checklistHtml}
          </div>

          <div>
            <div class="checklist-label" style="margin-bottom:5px;">📝 個人複習筆記 / 易錯提醒</div>
            <textarea class="node-note-input" data-note-node="${node.id}" placeholder="紀錄老師補充的考點、易錯字詞或待詢問問題...">${escapeHtml(p.note || "")}</textarea>
          </div>

          <div class="quiz-launch-row">
            <span style="font-size:11.5px;color:var(--text-muted);">
              ${p.quizPassed ? "🏆 已通過據點小測驗！" : "答對據點小測驗（共 " + node.quiz.length + " 題）即可升起金旗"}
            </span>
            <button type="button" class="primary-btn ${p.quizPassed ? "is-passed" : ""}" data-quiz-node="${node.id}">
              ${p.quizPassed ? "🔄 再測一次" : "⚔️ 據點闖關測驗"}
            </button>
          </div>
        </div>
      `;

      bodyEl.appendChild(card);
    });

    // Bind events inside panel
    bodyEl.querySelectorAll("[data-toggle-node]").forEach((head) => {
      head.addEventListener("click", () => {
        const card = head.closest(".node-card");
        card.classList.toggle("is-expanded");
        if (card.classList.contains("is-expanded")) {
          setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 40);
        }
      });
    });

    bodyEl.querySelectorAll("[data-check-node]").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const nid = cb.getAttribute("data-check-node");
        const idx = Number(cb.getAttribute("data-check-idx"));
        state.nodeProgress[nid].checked[idx] = e.target.checked;
        saveState();
        renderGlobalHUD();
        renderIslandPanel(island, null, true);
      });
    });

    bodyEl.querySelectorAll("[data-prof-node]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nid = btn.getAttribute("data-prof-node");
        const val = btn.getAttribute("data-prof-val");
        state.nodeProgress[nid].proficiency = state.nodeProgress[nid].proficiency === val ? "none" : val;
        saveState();
        renderGlobalHUD();
        renderIslandPanel(island, null, true);
      });
    });

    bodyEl.querySelectorAll("[data-note-node]").forEach((ta) => {
      ta.addEventListener("input", () => {
        const nid = ta.getAttribute("data-note-node");
        state.nodeProgress[nid].note = ta.value;
        saveState();
      });
    });

    bodyEl.querySelectorAll("[data-pomo-node]").forEach((btn) => {
      btn.addEventListener("click", () => {
        startNodePomodoro(btn.getAttribute("data-pomo-node"));
      });
    });

    bodyEl.querySelectorAll("[data-backpack-node]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleBackpackNode(btn.getAttribute("data-backpack-node"));
        renderIslandPanel(island, null, true);
      });
    });

    bodyEl.querySelectorAll("[data-quiz-node]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nid = btn.getAttribute("data-quiz-node");
        openQuizModal(island.id, nid);
      });
    });

    bodyEl.querySelectorAll("[data-edit-node]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nid = btn.getAttribute("data-edit-node");
        openEditNodeModal(island.id, nid);
      });
    });

    if (preserveScroll) {
      bodyEl.scrollTop = prevScrollTop;
    } else if (focusNodeId) {
      const targetCard = document.getElementById(`node-card-${focusNodeId}`);
      if (targetCard) {
        setTimeout(() => targetCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
      }
    }
  }

  /* ==================== 據點闖關小測驗 ==================== */
  function openQuizModal(islandId, nodeId) {
    const found = findNode(nodeId);
    if (!found) return;
    activeQuizCtx = { islandId, nodeId, answers: {}, submitted: false };

    document.getElementById("quiz-modal-title").textContent = `⚔️ ${getNodeDisplayTitle(found.node)} — 闖關測驗`;
    renderQuizBody();
    document.getElementById("quiz-modal").classList.add("is-open");
  }

  function renderQuizBody() {
    const { nodeId, answers, submitted } = activeQuizCtx;
    const found = findNode(nodeId);
    if (!found) return;
    const body = document.getElementById("quiz-modal-body");

    let html = `<p style="font-size:12.5px;color:var(--text-muted);margin-bottom:14px;">
      作答並全數答對即可為此據點插上 🚩 金旗（共 ${found.node.quiz.length} 題）：
    </p>`;

    let score = 0;
    found.node.quiz.forEach((qObj, qIdx) => {
      const picked = answers[qIdx];
      const isRight = picked === qObj.answer;
      if (submitted && isRight) score += 1;

      const optsHtml = qObj.options
        .map((optText, optIdx) => {
          let cls = "";
          if (!submitted && picked === optIdx) cls = "is-selected";
          if (submitted) {
            if (optIdx === qObj.answer) cls = "is-correct";
            else if (picked === optIdx && picked !== qObj.answer) cls = "is-wrong";
          }
          return `<button type="button" class="quiz-opt-btn ${cls}" data-qidx="${qIdx}" data-oidx="${optIdx}" ${submitted ? "disabled" : ""}>
            ${String.fromCharCode(65 + optIdx)}. ${escapeHtml(optText)}
          </button>`;
        })
        .join("");

      html += `
        <div class="quiz-question-block">
          <div class="quiz-q-title">${qIdx + 1}. ${escapeHtml(qObj.q)}</div>
          <div class="quiz-options">${optsHtml}</div>
          ${submitted ? `<div class="quiz-explain"><strong>${isRight ? "✅ 答對了！" : "❌ 解析："}</strong>${escapeHtml(qObj.explain)}</div>` : ""}
        </div>
      `;
    });

    if (!submitted) {
      const answeredCount = Object.keys(answers).length;
      const ready = answeredCount === found.node.quiz.length;
      html += `
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button type="button" class="secondary-btn" id="quiz-cancel-btn">暫時離開</button>
          <button type="button" class="primary-btn" id="quiz-submit-btn" ${ready ? "" : "disabled style='opacity:0.5;cursor:not-allowed;'"}>
            提交答案 (${answeredCount}/${found.node.quiz.length})
          </button>
        </div>
      `;
    } else {
      const passed = score === found.node.quiz.length;
      html += `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:12px;border-radius:10px;background:${passed ? "rgba(16,185,129,0.18)" : "rgba(245,158,11,0.16)"};">
          <div>
            <strong>${passed ? "🎉 恭喜通關！" : "💪 差一點點！"}</strong>
            <span style="font-size:13px;">本次得分：${score} / ${found.node.quiz.length}</span>
          </div>
          <div style="display:flex;gap:8px;">
            ${!passed ? `<button type="button" class="secondary-btn" id="quiz-retry-btn">🔄 重新挑戰</button>` : ""}
            <button type="button" class="primary-btn is-passed" id="quiz-done-btn">返回島嶼</button>
          </div>
        </div>
      `;
    }

    body.innerHTML = html;

    body.querySelectorAll("[data-qidx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (activeQuizCtx.submitted) return;
        const qIdx = Number(btn.getAttribute("data-qidx"));
        const oIdx = Number(btn.getAttribute("data-oidx"));
        activeQuizCtx.answers[qIdx] = oIdx;
        renderQuizBody();
      });
    });

    const cancelBtn = document.getElementById("quiz-cancel-btn");
    if (cancelBtn) cancelBtn.addEventListener("click", closeQuizModal);

    const submitBtn = document.getElementById("quiz-submit-btn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        activeQuizCtx.submitted = true;
        let correctCount = 0;
        found.node.quiz.forEach((qObj, idx) => {
          if (activeQuizCtx.answers[idx] === qObj.answer) correctCount += 1;
        });
        const passed = correctCount === found.node.quiz.length;
        const p = state.nodeProgress[nodeId];
        p.quizBestScore = Math.max(p.quizBestScore, correctCount);
        if (passed) {
          p.quizPassed = true;
          if (p.proficiency === "none") p.proficiency = "ok";
          showToast(`🐾 通過「${found.node.code}」據點測驗！獲得 +5 🐟 小魚乾！`);
          if (sceneManager) {
            sceneManager.triggerCatCelebration(found.island.id);
          }
        }
        saveState();
        renderGlobalHUD();
        if (activeIslandId) renderIslandPanel(findIsland(activeIslandId), nodeId);
        renderQuizBody();
      });
    }

    const retryBtn = document.getElementById("quiz-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        activeQuizCtx.answers = {};
        activeQuizCtx.submitted = false;
        renderQuizBody();
      });
    }

    const doneBtn = document.getElementById("quiz-done-btn");
    if (doneBtn) doneBtn.addEventListener("click", closeQuizModal);
  }

  function closeQuizModal() {
    document.getElementById("quiz-modal").classList.remove("is-open");
    activeQuizCtx = null;
  }

  /* ==================== 編輯據點標題/說明 ==================== */
  function openEditNodeModal(islandId, nodeId) {
    const found = findNode(nodeId);
    if (!found) return;
    activeEditCtx = { islandId, nodeId };

    document.getElementById("edit-node-title").value = getNodeDisplayTitle(found.node);
    document.getElementById("edit-node-sections").value = getNodeDisplaySections(found.node);
    document.getElementById("edit-node-modal").classList.add("is-open");
  }

  function closeEditNodeModal() {
    document.getElementById("edit-node-modal").classList.remove("is-open");
    activeEditCtx = null;
  }

  /* ==================== 「校園生活自強不息・走路遇點」知識深化系統 ==================== */
  function triggerWalkStep(islandId) {
    state.catStats.walkSteps = (state.catStats.walkSteps || 0) + 15;
    saveState();
    renderGlobalHUD();
    if (sceneManager) {
      sceneManager.stepWalkOnIsland(islandId);
    } else {
      const isl = findIsland(islandId);
      if (isl && isl.nodes.length > 0) {
        openWalkEncounter(islandId, isl.nodes[0].id, "encounter");
      }
    }
  }

  function openWalkEncounter(islandId, nodeId, kind = "encounter") {
    const found = findNode(nodeId);
    if (!found) return;

    const p = state.nodeProgress[nodeId];
    const uncheckedIndices = [];
    found.node.checklist.forEach((_, i) => {
      if (!p.checked[i]) uncheckedIndices.push(i);
    });
    const checkIdx =
      uncheckedIndices.length > 0
        ? uncheckedIndices[Math.floor(Math.random() * uncheckedIndices.length)]
        : Math.floor(Math.random() * found.node.checklist.length);

    const quizIdx = Math.floor(Math.random() * found.node.quiz.length);
    const campusList = DATA.campusEncounters || [{ scene: "🌳 校園自強步道", badge: "走路遇點" }];
    const campus = campusList[Math.floor(Math.random() * campusList.length)];

    activeEncounterCtx = {
      islandId,
      nodeId,
      kind,
      checkIdx,
      quizIdx,
      campus,
      revealed: false,
      recallRated: false,
      quizPicked: null
    };

    document.getElementById("encounter-modal-title").textContent =
      `🐾 ${campus.badge}｜${found.island.subject}・${found.node.code}`;
    renderEncounterBody();
    document.getElementById("encounter-modal").classList.add("is-open");
  }

  function renderEncounterBody() {
    if (!activeEncounterCtx) return;
    const { islandId, nodeId, checkIdx, quizIdx, campus, revealed, recallRated, quizPicked } = activeEncounterCtx;
    const found = findNode(nodeId);
    if (!found) return;

    const body = document.getElementById("encounter-modal-body");
    const targetPoint = found.node.checklist[checkIdx] || found.node.sections;
    const qObj = found.node.quiz[quizIdx] || found.node.quiz[0];
    const catQuote =
      found.island.guardianCat && found.island.guardianCat.quotes
        ? found.island.guardianCat.quotes[quizIdx % found.island.guardianCat.quotes.length]
        : found.node.sections;

    let stage1Html = `
      <div class="encounter-scene-banner">
        <strong>${escapeHtml(campus.scene)}</strong>
        <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">
          🎒 自強貓學員走到了「<strong>${escapeHtml(getNodeDisplayTitle(found.node))}</strong>」知識路標！（目前連勝：${state.catStats.walkCombo || 0} 🔥）
        </div>
      </div>

      <div class="encounter-stage-card">
        <div style="font-size:12px;font-weight:700;color:var(--accent-cyan);margin-bottom:6px;">
          階段一｜🧠 主動回憶（Active Recall）：請先試著在腦中複誦這個考點！
        </div>
        <div style="font-size:14px;font-weight:700;line-height:1.5;color:#fff;">
          「${escapeHtml(targetPoint)}」
        </div>
        ${
          !revealed
            ? `<div style="margin-top:12px;">
                <button type="button" class="primary-btn" id="enc-reveal-btn">👀 翻開守護貓提示核對記憶</button>
              </div>`
            : `<div class="recall-answer-box">
                <div><strong>🐱 守護貓筆記提示：</strong>${escapeHtml(catQuote)}</div>
                <div style="margin-top:4px;font-size:12px;color:var(--text-muted);">單元架構：${escapeHtml(found.node.sections)}</div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
                <button type="button" class="primary-btn is-passed" id="enc-master-btn" ${recallRated ? "disabled" : ""}>
                  ${recallRated === "master" ? "✅ 已完成回憶並勾選此考點" : "💪 記得很熟（自動勾選考點 +1🐟 +25步）"}
                </button>
                <button type="button" class="secondary-btn" id="enc-need-work-btn" ${recallRated ? "disabled" : ""}>
                  ${recallRated === "weak" ? "📌 已標記待加強" : "📌 還需加深（標記待加強 +15步）"}
                </button>
              </div>`
        }
      </div>
    `;

    const optsHtml = qObj.options
      .map((opt, idx) => {
        let cls = "";
        if (quizPicked !== null) {
          if (idx === qObj.answer) cls = "is-correct";
          else if (idx === quizPicked && quizPicked !== qObj.answer) cls = "is-wrong";
        }
        return `<button type="button" class="quiz-opt-btn ${cls}" data-enc-opt="${idx}" ${quizPicked !== null ? "disabled" : ""}>
          ${String.fromCharCode(65 + idx)}. ${escapeHtml(opt)}
        </button>`;
      })
      .join("");

    let stage2Html = `
      <div class="encounter-stage-card">
        <div style="font-size:12px;font-weight:700;color:var(--accent-gold);margin-bottom:8px;">
          階段二｜🔥 知識深化快問（答對 +1 連勝 Combo ＋ 2 🐟 小魚乾）
        </div>
        <div class="quiz-q-title">${escapeHtml(qObj.q)}</div>
        <div class="quiz-options">${optsHtml}</div>
        ${
          quizPicked !== null
            ? `<div class="quiz-explain">
                <strong>${quizPicked === qObj.answer ? "✅ 深化成功！" : "💡 觀念補充："}</strong>${escapeHtml(qObj.explain)}
              </div>`
            : ""
        }
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button type="button" class="secondary-btn" id="enc-close-btn">完成這次遇點</button>
        <button type="button" class="primary-btn" id="enc-next-walk-btn">🚶 繼續往前走遇下一點</button>
      </div>
    `;

    body.innerHTML = stage1Html + stage2Html;

    const revealBtn = document.getElementById("enc-reveal-btn");
    if (revealBtn) {
      revealBtn.addEventListener("click", () => {
        activeEncounterCtx.revealed = true;
        renderEncounterBody();
      });
    }

    const masterBtn = document.getElementById("enc-master-btn");
    if (masterBtn) {
      masterBtn.addEventListener("click", () => {
        activeEncounterCtx.recallRated = "master";
        state.nodeProgress[nodeId].checked[checkIdx] = true;
        state.catStats.bonusFish = (state.catStats.bonusFish || 0) + 1;
        state.catStats.walkSteps = (state.catStats.walkSteps || 0) + 25;
        saveState();
        renderGlobalHUD();
        if (activeIslandId === islandId) renderIslandPanel(findIsland(islandId), null, true);
        renderEncounterBody();
        showToast("💪 主動回憶成功！已勾選此考點並獲得 +1 🐟 小魚乾！");
      });
    }

    const weakBtn = document.getElementById("enc-need-work-btn");
    if (weakBtn) {
      weakBtn.addEventListener("click", () => {
        activeEncounterCtx.recallRated = "weak";
        state.nodeProgress[nodeId].proficiency = "weak";
        state.catStats.walkSteps = (state.catStats.walkSteps || 0) + 15;
        saveState();
        renderGlobalHUD();
        if (activeIslandId === islandId) renderIslandPanel(findIsland(islandId), null, true);
        renderEncounterBody();
        showToast("📌 已標記為待加強，夜間減壓排程會優先幫你安排複習！");
      });
    }

    body.querySelectorAll("[data-enc-opt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const picked = Number(btn.getAttribute("data-enc-opt"));
        activeEncounterCtx.quizPicked = picked;
        if (picked === qObj.answer) {
          state.catStats.walkCombo = (state.catStats.walkCombo || 0) + 1;
          state.catStats.bonusFish = (state.catStats.bonusFish || 0) + 2;
          if (sceneManager) sceneManager.triggerCatCelebration(islandId);
          showToast(`🔥 自強連勝 ${state.catStats.walkCombo}！獲得 +2 🐟 小魚乾！`);
        } else {
          state.catStats.walkCombo = 0;
          showToast("💡 沒關係！看完解析把觀念記起來就是進步！");
        }
        saveState();
        renderGlobalHUD();
        if (activeIslandId === islandId) renderIslandPanel(findIsland(islandId), null, true);
        renderEncounterBody();
      });
    });

    document.getElementById("enc-close-btn").addEventListener("click", closeEncounterModal);
    document.getElementById("enc-next-walk-btn").addEventListener("click", () => {
      closeEncounterModal();
      triggerWalkStep(islandId);
    });
  }

  function closeEncounterModal() {
    document.getElementById("encounter-modal").classList.remove("is-open");
    activeEncounterCtx = null;
  }

  function collectIntel(intelId) {
    const item = (DATA.intelItems || []).find((it) => it.id === intelId);
    if (!item) return;
    if (sceneManager) sceneManager.setPantherInput(0, 0, false);

    if (!Array.isArray(state.collectedIntel)) state.collectedIntel = [];
    if (!Array.isArray(state.unlockedAchievements)) state.unlockedAchievements = [];
    const isNew = !state.collectedIntel.includes(intelId);
    const newlyUnlocked = [];

    if (isNew) {
      state.collectedIntel.push(intelId);
      state.catStats.bonusFish = (state.catStats.bonusFish || 0) + 2;

      const collectedSet = new Set(state.collectedIntel);
      const totalCollected = state.collectedIntel.length;
      const oceanCollected = (DATA.intelItems || []).filter(
        (x) => x.locationType === "ocean" && collectedSet.has(x.id)
      ).length;

      (DATA.intelAchievements || []).forEach((ach) => {
        if (state.unlockedAchievements.includes(ach.id)) return;
        let hit = false;
        if (ach.kind === "total") hit = totalCollected >= ach.target;
        else if (ach.kind === "ocean") hit = oceanCollected >= ach.target;
        else if (ach.kind === "island") {
          const islCnt = (DATA.intelItems || []).filter(
            (x) => x.islandId === ach.islandId && collectedSet.has(x.id)
          ).length;
          hit = islCnt >= ach.target;
        }
        if (hit) {
          state.unlockedAchievements.push(ach.id);
          state.catStats.bonusFish = (state.catStats.bonusFish || 0) + (ach.fishReward || 0);
          newlyUnlocked.push(ach);
        }
      });

      saveState();
      renderGlobalHUD();
      if (document.getElementById("life-modal")?.classList.contains("is-open")) {
        renderLifeContent();
      }
      if (sceneManager) {
        sceneManager.triggerCatCelebration(item.islandId === "ocean" ? "chinese" : item.islandId);
        sceneManager._setPantherEmote(`📜 收集情報：${item.title} (+2🐟)`, 2.4);
      }
    }

    activeEncounterCtx = null;
    const isOcean = item.locationType === "ocean";
    const islObj = !isOcean ? findIsland(item.islandId) : null;
    const locLabel = isOcean ? "🌊 海域漂流瓶（跨科彩蛋）" : `🏝️ ${islObj ? islObj.name : item.subject}・專屬考點`;

    document.getElementById("encounter-modal-title").textContent =
      `📜 ${isNew ? "發現新情報！" : "情報圖鑑回顧"}｜${item.subject}`;

    const unlockHtml = newlyUnlocked
      .map(
        (ach) => `
          <div style="padding:10px 14px;border-radius:14px;background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;color:#78350f;font-weight:800;font-size:13px;">
            🏆 解鎖成就【${escapeHtml(ach.title)}】！${escapeHtml(ach.desc)}（獎勵 +${ach.fishReward} 🐟）
          </div>
        `
      )
      .join("");

    const body = document.getElementById("encounter-modal-body");
    body.innerHTML = `
      <div class="intel-discovery-card">
        <div class="intel-discovery-badge">${escapeHtml(locLabel)}</div>
        <h3 style="font-size:17px;font-weight:900;color:var(--text-main);">${escapeHtml(item.title)}</h3>
        <div class="intel-fact-box">${escapeHtml(item.fact)}</div>
        <div style="font-size:12.5px;color:var(--text-muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <span>📍 探索座標說明：${escapeHtml(item.hint)}</span>
          <strong style="color:var(--accent-gold);">${isNew ? "🎁 首次收集獎勵：+2 🐟 小魚乾" : "✅ 已收入情報成就圖鑑"}</strong>
        </div>
        ${unlockHtml}
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
          <button type="button" class="primary-btn" id="intel-open-codex-btn">📜 查看情報＆成就圖鑑 (${(state.collectedIntel || []).length}/${(DATA.intelItems || []).length})</button>
          ${
            item.nodeId
              ? `<button type="button" class="secondary-btn" id="intel-jump-node-btn">🎯 前往對應單元節點</button>`
              : ""
          }
          <button type="button" class="secondary-btn" id="intel-continue-btn" style="margin-left:auto;">繼續探索</button>
        </div>
      </div>
    `;

    document.getElementById("intel-open-codex-btn")?.addEventListener("click", () => {
      closeEncounterModal();
      openLifeModal("intel");
    });
    document.getElementById("intel-jump-node-btn")?.addEventListener("click", () => {
      closeEncounterModal();
      openIsland(item.islandId, item.nodeId);
    });
    document.getElementById("intel-continue-btn")?.addEventListener("click", closeEncounterModal);
    document.getElementById("encounter-modal").classList.add("is-open");
  }

  /* ==================== 彈性時段＆番茄鐘排程表 ==================== */
  function openScheduleModal() {
    renderScheduleGrid();
    document.getElementById("schedule-modal").classList.add("is-open");
  }

  function closeScheduleModal() {
    document.getElementById("schedule-modal").classList.remove("is-open");
  }

  function getDayBudgetMins(day) {
    if (day.isExam) return 60;
    const custom = state.customDayMins && state.customDayMins[day.date];
    if (typeof custom === "number" && custom >= 0) return custom;
    const slotsMap = (state.daySlots && state.daySlots[day.date]) || {};
    return (day.slots || []).reduce((acc, s) => {
      const enabled = Object.prototype.hasOwnProperty.call(slotsMap, s.id) ? slotsMap[s.id] : s.defaultOn;
      return acc + (enabled ? s.mins : 0);
    }, 0);
  }

  function renderScheduleGrid() {
    const grid = document.getElementById("schedule-grid");
    if (!grid) return;

    const days = getActiveCalendarDays();
    const cfg = state.customReviewConfig || {};
    const defaultStart = (DATA.meta && DATA.meta.startDate) || (DATA.calendarDays[0] && DATA.calendarDays[0].date) || "2026-11-17";
    const defaultExStart = (DATA.meta && DATA.meta.examDates && DATA.meta.examDates[0]) || "2026-12-01";
    const defaultExEnd = (DATA.meta && DATA.meta.examDates && DATA.meta.examDates[DATA.meta.examDates.length - 1]) || defaultExStart;

    const inpStart = document.getElementById("custom-review-start");
    const inpExStart = document.getElementById("custom-exam-start");
    const inpExEnd = document.getElementById("custom-exam-end");
    if (inpStart) inpStart.value = cfg.startDate || defaultStart;
    if (inpExStart) inpExStart.value = cfg.examStartDate || defaultExStart;
    if (inpExEnd) inpExEnd.value = cfg.examEndDate || defaultExEnd;

    const activeReviewCount = days.filter((d) => !d.isExam && !d.isRestDay).length;
    const titleEl = document.getElementById("schedule-modal-title");
    if (titleEl) {
      titleEl.textContent = `📅 考前 ${activeReviewCount} 天彈性時段排程表（支援自訂複習日＆休息日）`;
    }

    const allNodeOptions = DATA.islands
      .map((isl) =>
        isl.nodes
          .map((n) => `<option value="${n.id}">[${isl.subject}] ${escapeHtml(n.code)} ${escapeHtml(getNodeDisplayTitle(n))} (${n.estimatedMins}m)</option>`)
          .join("")
      )
      .join("");

    const todayStr = getTodayDateStr();

    grid.innerHTML = days
      .map((day) => {
        if (!Array.isArray(state.schedule[day.date])) state.schedule[day.date] = [];
        const taskIds = state.schedule[day.date] || [];
        const isToday = day.date === todayStr;
        const budget = day.isRestDay ? 0 : getDayBudgetMins(day);
        const slotsMap = (state.daySlots && state.daySlots[day.date]) || {};
        const customVal = state.customDayMins && state.customDayMins[day.date];

        const slotChipsHtml = (day.slots || [])
          .map((s) => {
            const on = Object.prototype.hasOwnProperty.call(slotsMap, s.id) ? slotsMap[s.id] : s.defaultOn;
            return `<button type="button" class="slot-chip ${on && customVal === null ? "is-on" : ""}" data-toggle-slot="${day.date}::${s.id}" title="點擊開關此時段 (${s.mins}m)">${escapeHtml(s.label)}</button>`;
          })
          .join("");

        let totalMins = 0;
        const tasksHtml =
          taskIds.length === 0
            ? `<div style="font-size:11.5px;color:var(--text-dim);padding:6px 0;">${
                day.isExam
                  ? "🎯 保持作息與考前重點速覽，祝段考順利！"
                  : day.isRestDay
                    ? "🛌 本日設為休息／彈性緩衝日（智慧排程將自動略過）"
                    : "尚未安排據點（可由下方加入）"
              }</div>`
            : taskIds
                .map((nid, idx) => {
                  const found = findNode(nid);
                  if (!found) return "";
                  const mins = found.node.estimatedMins || 40;
                  totalMins += mins;
                  const pomos = Math.max(1, Math.ceil(mins / 25));
                  const key = `${day.date}::${nid}`;
                  const done = Boolean(state.dailyDone[key]);
                  return `
                    <div class="day-task-chip ${done ? "is-done" : ""}" style="--chip-color:${found.island.colors.primary}">
                      <label class="day-task-chip-main">
                        <input type="checkbox" data-day-done="${key}" ${done ? "checked" : ""} />
                        <span><strong>${found.island.subject}</strong> ${escapeHtml(found.node.code)} <em style="color:var(--text-dim);font-style:normal;">(${mins}m·🍅×${pomos})</em></span>
                      </label>
                      <button type="button" class="chip-remove" title="啟動此單元 25m 番茄鐘" data-start-pomo="${nid}" style="color:#fca5a5;">🍅</button>
                      <button type="button" class="chip-remove" title="從當日移除" data-remove-day="${day.date}" data-remove-idx="${idx}">✕</button>
                    </div>
                  `;
                })
                .join("");

        const pomoBudget = Math.floor(budget / 25);
        const pct = budget > 0 ? Math.min(100, Math.round((totalMins / budget) * 100)) : totalMins > 0 ? 100 : 0;
        const budgetCls = totalMins > budget ? "budget-over" : totalMins > budget * 0.85 ? "budget-full" : "budget-ok";
        const overloadWarn = totalMins > budget ? `<span style="color:#fca5a5;font-weight:700;">⚠️ 超載</span>` : "";

        return `
          <div class="day-card ${isToday ? "is-today" : ""} ${day.isExam ? "is-exam" : ""} ${day.isRestDay ? "is-rest-day" : ""}">
            <div class="day-card-head">
              <span class="day-date">${day.label}</span>
              ${
                day.isExam
                  ? ""
                  : `<button type="button" class="day-rest-btn" data-toggle-rest-day="${day.date}" title="切換為休息日或複習日">${day.isRestDay ? "📖 設複習日" : "🛌 改休息"}</button>`
              }
              ${
                day.isExtra
                  ? `<button type="button" class="chip-remove" data-remove-extra-day="${day.date}" title="移除此額外複習日">✕</button>`
                  : ""
              }
              <span class="day-countdown">${day.countdown}</span>
            </div>
            <div class="day-phase">${day.phase}</div>
            ${
              day.isExam || day.isRestDay
                ? ""
                : `<div class="slot-chips-wrap">${slotChipsHtml}</div>
                   <div class="custom-mins-row">
                     <span>或自訂分鐘:</span>
                     <input type="number" min="0" max="600" step="15" class="custom-mins-input" data-custom-mins="${day.date}" placeholder="自動" value="${typeof customVal === "number" ? customVal : ""}" />
                     <span>分 (🍅×${pomoBudget})</span>
                   </div>
                   <div class="day-budget-wrap">
                    <div class="day-budget-label">
                      <span>⏱️ 預估 ${totalMins} / ${budget} 分鐘</span>
                      ${overloadWarn}
                    </div>
                    <div class="day-budget-track">
                      <div class="day-budget-fill ${budgetCls}" style="width:${pct}%"></div>
                    </div>
                  </div>`
            }
            <div class="day-tasks">${tasksHtml}</div>
            ${
              day.isExam || day.isRestDay
                ? ""
                : `<div class="day-add-row">
                    <select class="day-add-select" data-select-day="${day.date}">
                      <option value="">+ 選擇要加入的據點...</option>
                      ${allNodeOptions}
                    </select>
                    <button type="button" class="small-action-btn" data-add-day="${day.date}">加入</button>
                  </div>`
            }
          </div>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-toggle-rest-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dStr = btn.getAttribute("data-toggle-rest-day");
        if (!state.customReviewConfig) {
          state.customReviewConfig = { startDate: "", examStartDate: "", examEndDate: "", excludedDates: [], extraDates: [] };
        }
        const excl = new Set(state.customReviewConfig.excludedDates || []);
        if (excl.has(dStr)) excl.delete(dStr);
        else excl.add(dStr);
        state.customReviewConfig.excludedDates = Array.from(excl);
        saveState();
        renderScheduleGrid();
      });
    });

    grid.querySelectorAll("[data-remove-extra-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dStr = btn.getAttribute("data-remove-extra-day");
        if (state.customReviewConfig && Array.isArray(state.customReviewConfig.extraDates)) {
          state.customReviewConfig.extraDates = state.customReviewConfig.extraDates.filter((x) => x !== dStr);
        }
        saveState();
        renderScheduleGrid();
      });
    });

    grid.querySelectorAll("[data-toggle-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [date, slotId] = btn.getAttribute("data-toggle-slot").split("::");
        if (!state.daySlots[date]) state.daySlots[date] = {};
        state.daySlots[date][slotId] = !state.daySlots[date][slotId];
        state.customDayMins[date] = null;
        saveState();
        renderScheduleGrid();
      });
    });

    grid.querySelectorAll("[data-custom-mins]").forEach((inp) => {
      inp.addEventListener("change", () => {
        const date = inp.getAttribute("data-custom-mins");
        const val = inp.value.trim();
        state.customDayMins[date] = val === "" ? null : Math.max(0, Number(val) || 0);
        saveState();
        renderScheduleGrid();
      });
    });

    grid.querySelectorAll("[data-start-pomo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nid = btn.getAttribute("data-start-pomo");
        closeScheduleModal();
        startNodePomodoro(nid);
      });
    });

    grid.querySelectorAll("[data-day-done]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const key = cb.getAttribute("data-day-done");
        state.dailyDone[key] = cb.checked;
        saveState();
        renderScheduleGrid();
      });
    });

    grid.querySelectorAll("[data-remove-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const date = btn.getAttribute("data-remove-day");
        const idx = Number(btn.getAttribute("data-remove-idx"));
        state.schedule[date].splice(idx, 1);
        saveState();
        renderScheduleGrid();
      });
    });

    grid.querySelectorAll("[data-add-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const date = btn.getAttribute("data-add-day");
        const sel = grid.querySelector(`[data-select-day="${date}"]`);
        if (sel && sel.value) {
          if (!state.schedule[date].includes(sel.value)) {
            state.schedule[date].push(sel.value);
            saveState();
            renderScheduleGrid();
          } else {
            showToast("該據點已安排在這一天囉！");
          }
        }
      });
    });
  }

  function autoGenerateSchedule(mode) {
    const allDays = getActiveCalendarDays();
    const reviewDays = allDays.filter((d) => !d.isExam && !d.isRestDay);
    const newSchedule = {};
    const usedMins = {};
    allDays.forEach((d) => {
      newSchedule[d.date] = [];
      usedMins[d.date] = 0;
    });

    if (mode === "default") {
      allDays.forEach((d) => {
        newSchedule[d.date] = !d.isRestDay && Array.isArray(DATA.defaultSchedule[d.date])
          ? [...DATA.defaultSchedule[d.date]]
          : [];
      });
      allDays.forEach((d) => {
        state.schedule[d.date] = newSchedule[d.date] || [];
      });
      saveState();
      renderScheduleGrid();
      showToast("↺ 已恢復夜間減壓預設建議排程！");
      return;
    }

    if (reviewDays.length === 0) {
      showToast("⚠️ 目前沒有啟用的複習日，請先取消部分休息日再排程！");
      return;
    }

    const allNodes = [];
    DATA.islands.forEach((isl) => {
      isl.nodes.forEach((n) => {
        const st = getNodeStatus(isl.id, n.id);
        allNodes.push({
          id: n.id,
          mins: n.estimatedMins || 40,
          weakScore:
            st.proficiency === "weak" ? 0 : st.proficiency === "ok" ? 1 : st.proficiency === "none" ? 2 : 3,
          conquered: st.conquered ? 1 : 0
        });
      });
    });

    // Helper: fit nodes into active review days while keeping the final eve day slightly lighter
    const lastDayDate = reviewDays[reviewDays.length - 1].date;
    const placeIntoBudget = (items, allowEndDays = true) => {
      const targetDays = allowEndDays || reviewDays.length <= 1 ? reviewDays : reviewDays.slice(0, reviewDays.length - 1);
      items.forEach((item) => {
        let bestDay = null;
        let bestScore = Infinity;
        for (const d of targetDays) {
          const cap = getDayBudgetMins(d);
          const cur = usedMins[d.date];
          const overflow = cur + item.mins > cap ? (cur + item.mins - cap) * 10 : 0;
          const loadRatio = (cur + item.mins) / Math.max(cap, 1);
          const lastDayPenalty = d.date === lastDayDate ? 0.4 : 0;
          const score = overflow + loadRatio + lastDayPenalty;
          if (score < bestScore) {
            bestScore = score;
            bestDay = d;
          }
        }
        if (bestDay && !newSchedule[bestDay.date].includes(item.id)) {
          newSchedule[bestDay.date].push(item.id);
          usedMins[bestDay.date] += item.mins;
        }
      });
    };

    if (mode === "weakFirst") {
      allNodes.sort((a, b) => a.conquered - b.conquered || a.weakScore - b.weakScore || b.mins - a.mins);
      const pending = allNodes.filter((n) => !n.conquered || n.weakScore <= 1);
      placeIntoBudget(pending.length > 0 ? pending : allNodes, true);
    } else {
      const heavy = allNodes.filter((n) => n.mins >= 45);
      const light = allNodes.filter((n) => n.mins < 45);
      const interleaved = [];
      const maxLen = Math.max(heavy.length, light.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < heavy.length) interleaved.push(heavy[i]);
        if (i < light.length) interleaved.push(light[i]);
      }
      placeIntoBudget(interleaved, false);

      const reviewPool = allNodes.filter((n) => n.weakScore < 3).slice(0, 6);
      const tailSpan = Math.min(3, reviewDays.length);
      reviewPool.forEach((n, idx) => {
        const d = reviewDays[Math.max(0, reviewDays.length - tailSpan + (idx % tailSpan))];
        if (!newSchedule[d.date].includes(n.id) && usedMins[d.date] + n.mins <= getDayBudgetMins(d)) {
          newSchedule[d.date].push(n.id);
          usedMins[d.date] += n.mins;
        }
      });
    }

    allDays.forEach((d) => {
      state.schedule[d.date] = newSchedule[d.date] || [];
    });
    saveState();
    renderScheduleGrid();
    showToast(`✨ 已完成 ${reviewDays.length} 天智慧複習排程！`);
  }

  /* ==================== 自強不息・每日簽到與連勝徽章 ==================== */
  function openCheckinModal() {
    renderCheckinContent();
    document.getElementById("checkin-modal").classList.add("is-open");
  }

  function closeCheckinModal() {
    document.getElementById("checkin-modal").classList.remove("is-open");
  }

  function performDailyCheckin() {
    const today = getTodayDateStr();
    if (!Array.isArray(state.checkinDates)) state.checkinDates = [];
    if (state.checkinDates.includes(today)) {
      showToast("✅ 今天已經簽到過囉！明天記得再來登島！");
      return;
    }
    state.checkinDates.push(today);
    state.catStats.bonusFish = (state.catStats.bonusFish || 0) + 5;
    state.catStats.walkSteps = (state.catStats.walkSteps || 0) + 100;
    saveState();
    renderGlobalHUD();
    renderCheckinContent();
    if (sceneManager) {
      sceneManager.triggerCatCelebration(activeIslandId || "chinese");
    }
    showToast(`🐾 今日簽到完成！連勝 ${getStreakDays()} 天，獲得 +5 🐟 與 +100 自強步數！`);
  }

  function renderCheckinContent() {
    const body = document.getElementById("checkin-modal-body");
    if (!body) return;
    const today = getTodayDateStr();
    const signedDates = new Set(state.checkinDates || []);
    const signedToday = signedDates.has(today);
    const streak = getStreakDays();
    const totalSigned = signedDates.size;

    const badgesHtml = (DATA.streakBadges || [])
      .map((b) => {
        const unlocked = streak >= b.days || totalSigned >= b.days;
        return `
          <div class="streak-badge-card ${unlocked ? "is-unlocked" : ""}">
            <div style="font-size:14px;font-weight:800;">${b.title}</div>
            <div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">${b.desc}</div>
            <div style="font-size:11px;margin-top:5px;color:${unlocked ? "#ffd32a" : "var(--text-dim)"};">
              ${unlocked ? "🏆 已解鎖" : `需累積/連勝 ${b.days} 天`}
            </div>
          </div>
        `;
      })
      .join("");

    const activeDays = getActiveCalendarDays();
    const stampsHtml = activeDays
      .map((d) => {
        const stamped = signedDates.has(d.date);
        const isToday = d.date === today;
        return `
          <div class="checkin-stamp ${stamped ? "is-stamped" : ""}" style="${isToday ? "border-color:#38bdf8;" : ""}">
            <div style="font-weight:700;">${d.label}</div>
            <div style="font-size:20px;margin:4px 0;">${stamped ? "🐾" : d.isExam ? "⚔️" : d.isRestDay ? "🛌" : "⬜"}</div>
            <div style="font-size:10.5px;color:var(--text-muted);">${stamped ? "已蓋章" : isToday ? "今日待簽" : d.isExam ? "段考日" : d.isRestDay ? "休息日" : "未簽到"}</div>
          </div>
        `;
      })
      .join("");

    const rangeStartLbl = activeDays[0] ? activeDays[0].label.split(" ")[0] : "";
    const rangeEndLbl = activeDays.length ? activeDays[activeDays.length - 1].label.split(" ")[0] : "";

    body.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;padding:14px;border-radius:12px;background:rgba(255,211,42,0.1);border:1px solid rgba(255,211,42,0.35);">
        <div>
          <div style="font-size:16px;font-weight:800;">🔥 目前自強連勝：${streak} 天（累積簽到 ${totalSigned} 天）</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">今日日期：${today} ｜ 每次簽到送 +5 🐟 小魚乾、+100 步</div>
        </div>
        <button type="button" class="primary-btn ${signedToday ? "is-passed" : ""}" id="do-checkin-btn" ${signedToday ? "disabled" : ""}>
          ${signedToday ? "✅ 今日已蓋貓掌章" : "🐾 立即每日簽到 (+5🐟)"}
        </button>
      </div>
      <h3 style="font-size:14px;margin-bottom:8px;">🏅 自強不息榮譽徽章</h3>
      <div class="streak-badge-row">${badgesHtml}</div>
      <h3 style="font-size:14px;margin-bottom:8px;">📅 ${rangeStartLbl}～${rangeEndLbl} 登島簽到印章卡</h3>
      <div class="checkin-calendar-grid">${stampsHtml}</div>
    `;

    const doBtn = document.getElementById("do-checkin-btn");
    if (doBtn) doBtn.addEventListener("click", performDailyCheckin);
  }

  /* ==================== 群島建設圖鑑、隨身行囊與跨島搜尋 ==================== */
  function openLifeModal(defaultTab = "builder") {
    activeLifeTab = defaultTab;
    renderLifeContent();
    document.getElementById("life-modal").classList.add("is-open");
  }

  function closeLifeModal() {
    document.getElementById("life-modal").classList.remove("is-open");
  }

  function toggleBackpackNode(nodeId) {
    if (!Array.isArray(state.backpack)) state.backpack = [];
    const idx = state.backpack.indexOf(nodeId);
    if (idx >= 0) {
      state.backpack.splice(idx, 1);
      showToast("🎒 已從隨身行囊移除");
    } else {
      state.backpack.push(nodeId);
      showToast("🎒 已收入考前隨身行囊！");
    }
    saveState();
  }

  function buyBuilding(bldId) {
    const item = (DATA.buildingCatalog || []).find((b) => b.id === bldId);
    if (!item) return;
    if (!Array.isArray(state.ownedBuildings)) state.ownedBuildings = [];
    if (state.ownedBuildings.includes(bldId)) {
      showToast(`✅ 「${item.name}」已經建造在島上囉！`);
      return;
    }
    const stats = getGlobalStats();
    if (stats.availableFish < item.cost) {
      showToast(`🐟 還差 ${item.cost - stats.availableFish} 條小魚乾！多做考點、番茄鐘或簽到就能賺取！`);
      return;
    }
    state.catStats.spentFish = (state.catStats.spentFish || 0) + item.cost;
    state.ownedBuildings.push(bldId);
    saveState();
    renderGlobalHUD();
    renderLifeContent();
    if (sceneManager) {
      sceneManager.triggerCatCelebration(item.target === "hub" ? "chinese" : item.target);
    }
    showToast(`🎉 建造完成！${item.emoji}「${item.name}」已出現在 3D 島嶼上！`);
  }

  function renderLifeContent(searchTerm = "") {
    const body = document.getElementById("life-modal-body");
    if (!body) return;
    const stats = getGlobalStats();
    const ownedSet = new Set(state.ownedBuildings || []);
    const collectedIntelSet = new Set(state.collectedIntel || []);
    const totalIntel = (DATA.intelItems || []).length;

    const tabsHtml = `
      <div class="subtabs-row">
        <button type="button" class="nav-btn ${activeLifeTab === "builder" ? "is-active" : ""}" id="tab-life-builder">🏕️ 群島建設圖鑑 (${ownedSet.size}/${(DATA.buildingCatalog || []).length})</button>
        <button type="button" class="nav-btn ${activeLifeTab === "intel" ? "is-active" : ""}" id="tab-life-intel">📜 情報＆成就 (${collectedIntelSet.size}/${totalIntel})</button>
        <button type="button" class="nav-btn ${activeLifeTab === "backpack" ? "is-active" : ""}" id="tab-life-backpack">🎒 隨身行囊 (${(state.backpack || []).length}) ＆ 跨島搜尋</button>
        <span style="margin-left:auto;align-self:center;font-size:13px;color:var(--accent-gold);font-weight:700;">🐟 可用小魚乾：${stats.availableFish}</span>
      </div>
    `;

    let contentHtml = "";
    if (activeLifeTab === "builder") {
      const cardsHtml = (DATA.buildingCatalog || [])
        .map((b) => {
          const isOwned = ownedSet.has(b.id);
          const locName = b.target === "hub" ? "中央自強廣場島" : (findIsland(b.target) || {}).name || "群島";
          return `
            <div class="builder-card ${isOwned ? "is-owned" : ""}">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:28px;">${b.emoji}</span>
                <span class="flag-status ${isOwned ? "conquered" : ""}">${isOwned ? "✅ 已建造" : `🐟 ${b.cost} 條`}</span>
              </div>
              <div style="font-size:14.5px;font-weight:800;">${escapeHtml(b.name)}</div>
              <div style="font-size:11.5px;color:var(--accent-cyan);">📍 建造位置：${escapeHtml(locName)}</div>
              <div style="font-size:12px;color:var(--text-muted);line-height:1.45;flex:1;">${escapeHtml(b.desc)}</div>
              <button type="button" class="primary-btn ${isOwned ? "is-passed" : ""}" data-buy-bld="${b.id}" ${isOwned ? "disabled" : ""}>
                ${isOwned ? "✨ 已在 3D 島嶼展示" : `🔨 兌換建造 (-${b.cost} 🐟)`}
              </button>
            </div>
          `;
        })
        .join("");
      contentHtml = `<div class="builder-grid">${cardsHtml}</div>`;
    } else if (activeLifeTab === "intel") {
      const unlockedSet = new Set(state.unlockedAchievements || []);
      const allAch = DATA.intelAchievements || [];
      const intelPct = totalIntel > 0 ? Math.round((collectedIntelSet.size / totalIntel) * 100) : 0;

      const achHtml = allAch
        .map((ach) => {
          const unlocked = unlockedSet.has(ach.id);
          return `
            <div class="achievement-card ${unlocked ? "is-unlocked" : ""}">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                <strong style="font-size:13px;">${escapeHtml(ach.title)}</strong>
                <span style="font-size:11px;font-weight:800;color:${unlocked ? "#b45309" : "var(--text-dim)"};">+${ach.fishReward}🐟</span>
              </div>
              <div style="font-size:11.5px;color:var(--text-muted);line-height:1.4;">${escapeHtml(ach.desc)}</div>
              <div style="font-size:11px;font-weight:800;color:${unlocked ? "#059669" : "var(--text-dim)"};margin-top:2px;">
                ${unlocked ? "🏆 已解鎖" : "🔒 待達成"}
              </div>
            </div>
          `;
        })
        .join("");

      const filterDefs = [
        { id: "all", label: `🌐 全部 (${collectedIntelSet.size}/${totalIntel})` },
        ...DATA.islands.map((isl) => {
          const subItems = (DATA.intelItems || []).filter((x) => x.islandId === isl.id);
          const got = subItems.filter((x) => collectedIntelSet.has(x.id)).length;
          return { id: isl.id, label: `${isl.name} (${got}/${subItems.length})` };
        }),
        {
          id: "ocean",
          label: `🌊 海域漂流瓶 (${(DATA.intelItems || []).filter((x) => x.locationType === "ocean" && collectedIntelSet.has(x.id)).length}/${(DATA.intelItems || []).filter((x) => x.locationType === "ocean").length})`
        }
      ];

      const filterPillsHtml = filterDefs
        .map(
          (f) =>
            `<button type="button" class="intel-filter-pill ${activeIntelFilter === f.id ? "is-active" : ""}" data-intel-filter="${f.id}">${escapeHtml(f.label)}</button>`
        )
        .join("");

      const filteredIntel = (DATA.intelItems || []).filter((it) => {
        if (activeIntelFilter === "all") return true;
        if (activeIntelFilter === "ocean") return it.locationType === "ocean";
        return it.islandId === activeIntelFilter;
      });

      const intelCardsHtml = filteredIntel
        .map((it) => {
          const got = collectedIntelSet.has(it.id);
          return `
            <div class="intel-card ${got ? "" : "is-locked"}">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                <span class="intel-discovery-badge">${escapeHtml(it.subject)}</span>
                <span style="font-size:11px;font-weight:800;color:${got ? "#059669" : "var(--text-dim)"};">${got ? "✅ 已收集 (+2🐟)" : "🔒 未發現"}</span>
              </div>
              <div style="font-size:14px;font-weight:900;">${got ? escapeHtml(it.title) : "？？？待收集的知識情報"}</div>
              <div style="font-size:12px;color:${got ? "var(--text-main)" : "var(--text-muted)"};line-height:1.5;">
                ${got ? escapeHtml(it.fact) : `📍 探索線索：前往「${escapeHtml(it.hint)}」附近拾取閃光情報！`}
              </div>
            </div>
          `;
        })
        .join("");

      contentHtml = `
        <div class="intel-summary-banner">
          <div style="flex:1;min-width:220px;">
            <div style="font-size:15px;font-weight:900;">📜 島嶼＆海域情報收集進度：${collectedIntelSet.size} / ${totalIntel}（${intelPct}%）</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">已解鎖探險成就：${unlockedSet.size} / ${allAch.length} ｜ 各島情報皆為該科專屬考點，海域則藏有跨科彩蛋！</div>
            <div class="intel-progress-track"><div class="intel-progress-fill" style="width:${intelPct}%"></div></div>
          </div>
        </div>
        <h3 style="font-size:14px;margin-bottom:8px;">🏆 知識情報成就徽章</h3>
        <div class="achievement-grid">${achHtml}</div>
        <h3 style="font-size:14px;margin-bottom:8px;">🗂️ 已收錄情報與線索一覽</h3>
        <div class="intel-filter-row">${filterPillsHtml}</div>
        <div class="intel-grid">${intelCardsHtml}</div>
      `;
    } else {
      const q = searchTerm.trim().toLowerCase();
      const backpackItems = (state.backpack || [])
        .map((nid) => findNode(nid))
        .filter(Boolean)
        .map(
          ({ island, node }) => `
            <div class="day-task-chip" style="--chip-color:${island.colors.primary};padding:8px 10px;">
              <span style="cursor:pointer;flex:1;" data-jump-node="${island.id}::${node.id}">
                <strong>[${island.subject}]</strong> ${escapeHtml(getNodeDisplayTitle(node))} <em style="color:var(--text-muted);font-style:normal;">(點擊飛往該島)</em>
              </span>
              <button type="button" class="chip-remove" data-unbag-node="${node.id}">移除</button>
            </div>
          `
        )
        .join("");

      const searchResults = [];
      DATA.islands.forEach((isl) => {
        isl.nodes.forEach((n) => {
          const hay = `${isl.subject} ${n.code} ${getNodeDisplayTitle(n)} ${n.sections} ${n.checklist.join(" ")}`.toLowerCase();
          if (!q || hay.includes(q)) {
            searchResults.push({ island: isl, node: n });
          }
        });
      });

      const resultsHtml = searchResults
        .slice(0, 12)
        .map(({ island, node }) => {
          const bagged = (state.backpack || []).includes(node.id);
          return `
            <div class="day-task-chip" style="--chip-color:${island.colors.primary};padding:8px 10px;">
              <span style="cursor:pointer;flex:1;" data-jump-node="${island.id}::${node.id}">
                <strong>[${island.subject}]</strong> ${escapeHtml(getNodeDisplayTitle(node))}
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${escapeHtml(node.sections)}</div>
              </span>
              <button type="button" class="small-action-btn" data-bag-toggle="${node.id}">${bagged ? "🎒 已收" : "+ 放入行囊"}</button>
            </div>
          `;
        })
        .join("");

      contentHtml = `
        <h3 style="font-size:14px;margin-bottom:8px;">🎒 我的考前隨身行囊（共 ${(state.backpack || []).length} 個重點據點）</h3>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:18px;">
          ${backpackItems || `<div style="font-size:12.5px;color:var(--text-dim);">目前行囊是空的，可在下方搜尋或各島面板點擊「🎒 收進行囊」！</div>`}
        </div>
        <h3 style="font-size:14px;margin-bottom:8px;">🔍 跨島考點即時搜尋</h3>
        <div class="search-box-row">
          <input type="text" id="cross-island-search" class="search-input" placeholder="輸入關鍵字搜尋六科範圍（例如：火山、勞山、L6、卡特爾、口述歷史...）" value="${escapeHtml(searchTerm)}" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${resultsHtml}
        </div>
      `;
    }

    body.innerHTML = tabsHtml + contentHtml;

    document.getElementById("tab-life-builder").addEventListener("click", () => {
      activeLifeTab = "builder";
      renderLifeContent();
    });
    document.getElementById("tab-life-intel").addEventListener("click", () => {
      activeLifeTab = "intel";
      renderLifeContent();
    });
    document.getElementById("tab-life-backpack").addEventListener("click", () => {
      activeLifeTab = "backpack";
      renderLifeContent();
    });

    body.querySelectorAll("[data-intel-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeIntelFilter = btn.getAttribute("data-intel-filter") || "all";
        renderLifeContent();
      });
    });

    body.querySelectorAll("[data-buy-bld]").forEach((btn) => {
      btn.addEventListener("click", () => buyBuilding(btn.getAttribute("data-buy-bld")));
    });

    const searchInp = document.getElementById("cross-island-search");
    if (searchInp) {
      searchInp.addEventListener("input", (e) => {
        renderLifeContent(e.target.value);
        const ref = document.getElementById("cross-island-search");
        if (ref) {
          ref.focus();
          ref.setSelectionRange(ref.value.length, ref.value.length);
        }
      });
    }

    body.querySelectorAll("[data-jump-node]").forEach((el) => {
      el.addEventListener("click", () => {
        const [islId, nId] = el.getAttribute("data-jump-node").split("::");
        closeLifeModal();
        openIsland(islId, nId);
      });
    });

    body.querySelectorAll("[data-unbag-node]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleBackpackNode(btn.getAttribute("data-unbag-node"));
        renderLifeContent(searchTerm);
      });
    });

    body.querySelectorAll("[data-bag-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleBackpackNode(btn.getAttribute("data-bag-toggle"));
        renderLifeContent(searchTerm);
      });
    });
  }

  /* ==================== Google Apps Script (GAS) 雲端同步 ==================== */
  function buildGasPayload() {
    const g = getGlobalStats();
    let totalPomos = 0;
    Object.values(state.nodePomodoros || {}).forEach((v) => {
      totalPomos += Number(v) || 0;
    });

    const subjectProgress = {};
    DATA.islands.forEach((isl) => {
      subjectProgress[isl.subject] = getIslandStats(isl).avgPercent;
    });

    const collectedSet = new Set(state.collectedIntel || []);
    const oceanIntelCount = (DATA.intelItems || []).filter((x) => x.locationType === "ocean" && collectedSet.has(x.id)).length;
    const achMap = new Map((DATA.intelAchievements || []).map((a) => [a.id, a.title]));
    const unlockedList = (state.unlockedAchievements || []).map((id) => achMap.get(id) || id).join("、");
    const cCfg = state.customReviewConfig;
    const activeDays = getActiveCalendarDays();
    const customRangeStr = cCfg && (cCfg.startDate || cCfg.examStartDate || (cCfg.excludedDates && cCfg.excludedDates.length) || (cCfg.extraDates && cCfg.extraDates.length))
      ? `${activeDays[0]?.date || ""}~${activeDays[activeDays.length - 1]?.date || ""} (${activeDays.filter((d) => !d.isExam && !d.isRestDay).length}天)`
      : "預設 (14天)";

    return {
      action: "sync",
      className: state.student.className || "普二速",
      seatNo: state.student.seatNo || "",
      name: state.student.name || "",
      overallPercent: g.overallPercent,
      conqueredNodes: `${g.conqueredNodes}/${g.totalNodes}`,
      quizPassed: g.quizPassedCount,
      availableFish: g.availableFish,
      walkSteps: (state.catStats && state.catStats.walkSteps) || 0,
      streakDays: getStreakDays(),
      totalPomodoros: totalPomos,
      ownedBuildings: (state.ownedBuildings || []).length,
      collectedIntelCount: (state.collectedIntel || []).length,
      totalIntelCount: (DATA.intelItems || []).length,
      oceanIntelCount,
      unlockedAchievementsCount: (state.unlockedAchievements || []).length,
      unlockedAchievementsList: unlockedList,
      customReviewRange: customRangeStr,
      subjectProgress,
      stateSnapshot: state
    };
  }

  async function syncToGas() {
    const statusEl = document.getElementById("gas-sync-status");
    const url = (state.gasUrl || "").trim();
    const payload = buildGasPayload();

    if (!payload.seatNo || !payload.name) {
      showToast("⚠️ 請先填寫「座號」與「姓名」再同步至雲端！");
      return;
    }

    if (window.google && window.google.script && window.google.script.run) {
      if (statusEl) statusEl.textContent = "⏳ 正在同步至 Google 試算表...";
      window.google.script.run
        .withSuccessHandler((res) => {
          const msg = `✅ 已同步 (${new Date().toLocaleTimeString("zh-TW")})`;
          if (statusEl) statusEl.textContent = msg;
          showToast("☁️ 造島進度已成功寫入 Google 試算表！");
        })
        .withFailureHandler((err) => {
          if (statusEl) statusEl.textContent = "❌ 同步失敗";
          showToast("⚠️ 同步失敗：" + err.message);
        })
        .syncStudentState(payload);
      return;
    }

    if (!url) {
      showToast("⚠️ 尚未設定 GAS Web App 網址，請先部署 GAS 後填入網址！");
      return;
    }

    try {
      if (statusEl) statusEl.textContent = "⏳ 傳送至 GAS 中...";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json && json.ok) {
        if (statusEl) statusEl.textContent = `✅ 已同步 (${new Date().toLocaleTimeString("zh-TW")})`;
        showToast("☁️ 已成功同步至 Google 試算表！");
      } else {
        throw new Error((json && json.error) || "回傳格式異常");
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "⚠️ 連線失敗（請檢查 GAS 權限是否設為任何人可存取）";
      showToast("⚠️ 無法連線至 GAS：" + err.message);
    }
  }

  async function loadFromGas() {
    const statusEl = document.getElementById("gas-sync-status");
    const url = (state.gasUrl || "").trim();
    const className = (state.student.className || "").trim();
    const seatNo = (state.student.seatNo || "").trim();

    if (!seatNo) {
      showToast("⚠️ 請先輸入座號以載入雲端進度！");
      return;
    }

    const applySnapshot = (snapshot) => {
      if (!snapshot || !snapshot.nodeProgress) {
        showToast("ℹ️ 雲端尚未找到您的紀錄");
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      state = loadState();
      renderGlobalHUD();
      renderReportContent();
      if (activeIslandId) renderIslandPanel(findIsland(activeIslandId));
      if (statusEl) statusEl.textContent = `📥 已從雲端還原 (${new Date().toLocaleTimeString("zh-TW")})`;
      showToast("📥 已從 Google 試算表成功載入您的造島進度！");
    };

    if (window.google && window.google.script && window.google.script.run) {
      window.google.script.run
        .withSuccessHandler((res) => applySnapshot(res && res.stateSnapshot))
        .withFailureHandler((err) => showToast("⚠️ 載入失敗：" + err.message))
        .loadStudentState(className, seatNo);
      return;
    }

    if (!url) {
      showToast("⚠️ 尚未設定 GAS Web App 網址！");
      return;
    }

    try {
      if (statusEl) statusEl.textContent = "⏳ 讀取雲端紀錄中...";
      const qUrl = `${url}${url.includes("?") ? "&" : "?"}action=load&className=${encodeURIComponent(className)}&seatNo=${encodeURIComponent(seatNo)}`;
      const res = await fetch(qUrl);
      const json = await res.json();
      if (json && json.ok && json.stateSnapshot) {
        applySnapshot(json.stateSnapshot);
      } else {
        if (statusEl) statusEl.textContent = "ℹ️ 查無該座號雲端紀錄";
        showToast("ℹ️ 雲端尚未找到此座號紀錄");
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "⚠️ 載入失敗";
      showToast("⚠️ 雲端載入失敗：" + err.message);
    }
  }

  /* ==================== 南山豹 3D 八向圖鑑 ＆ 下次段考一鍵改版中心 ==================== */
  function generateReviewCalendarDays(examStartIso, examEndIso, examName, reviewDays = 14) {
    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
    const startDt = new Date(`${examStartIso}T00:00:00+08:00`);
    const endDt = new Date(`${examEndIso || examStartIso}T00:00:00+08:00`);
    if (Number.isNaN(startDt.getTime())) return DATA.calendarDays;

    const toIso = (dt) => {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };
    const toMmDd = (dt) => `${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;

    const daysList = [];
    const safeDays = Math.max(3, Math.min(45, Number(reviewDays) || 14));
    for (let offset = safeDays; offset >= 1; offset--) {
      const dt = new Date(startDt);
      dt.setDate(startDt.getDate() - offset);
      const dow = dt.getDay();
      const dateStr = toIso(dt);
      const label = `${toMmDd(dt)} (${dayNames[dow]})`;
      const countdown = `倒數 ${offset} 天`;

      if (dow === 0 || dow === 6) {
        daysList.push({
          date: dateStr,
          label,
          phase: offset <= 4 ? "☀️ 週末雙時段｜考前總檢" : "☀️ 週末雙時段｜衝刺深耕",
          countdown,
          isExam: false,
          isWeekend: true,
          dayType: "weekend",
          slots: [
            { id: "am", label: "☀️ 上午 09:00–12:00", mins: 180, defaultOn: true },
            { id: "pm", label: "🌤️ 下午 14:00–17:00", mins: 180, defaultOn: true },
            { id: "night", label: "🌙 晚間 19:30–21:00", mins: 90, defaultOn: false }
          ]
        });
      } else if (dow === 1 || dow === 2 || dow === 4) {
        daysList.push({
          date: dateStr,
          label,
          phase: offset === 1 ? "🏫 晚自習考前定錨（早點休息）" : "🏫 晚自習日｜夜間累積",
          countdown,
          isExam: false,
          isWeekend: false,
          dayType: "mon_tue_thu",
          slots: [
            { id: "study", label: "🏫 晚自習 18:40–20:25", mins: 105, defaultOn: true },
            { id: "home", label: "🌙 返家 21:00–21:50", mins: 50, defaultOn: false }
          ]
        });
      } else {
        daysList.push({
          date: dateStr,
          label,
          phase: "🎧 週三/五彈性｜補習/自主",
          countdown,
          isExam: false,
          isWeekend: false,
          dayType: "wed_fri",
          slots: [
            { id: "flex", label: "🌙 夜間彈性 20:00–21:00", mins: 60, defaultOn: true },
            { id: "extra", label: "✨ 空檔加碼 +30m", mins: 30, defaultOn: false }
          ]
        });
      }
    }

    const totalExamDays = Math.max(1, Math.min(4, Math.round((endDt - startDt) / 86400000) + 1));
    for (let eIdx = 0; eIdx < totalExamDays; eIdx++) {
      const dt = new Date(startDt);
      dt.setDate(startDt.getDate() + eIdx);
      const dow = dt.getDay();
      daysList.push({
        date: toIso(dt),
        label: `${toMmDd(dt)} (${dayNames[dow]})`,
        phase: `⚔️ ${examName || "段考"} Day ${eIdx + 1}`,
        countdown: `段考第 ${eIdx + 1} 天`,
        isExam: true,
        isWeekend: dow === 0 || dow === 6,
        slots: []
      });
    }
    return daysList;
  }

  function buildBalancedDefaultSchedule(islands, calendarDays) {
    const sched = {};
    const reviewDates = calendarDays.filter((d) => !d.isExam);
    calendarDays.forEach((d) => {
      sched[d.date] = [];
    });
    if (reviewDates.length === 0) return sched;

    const allNodeIds = [];
    const maxLen = Math.max(...islands.map((i) => i.nodes.length), 1);
    for (let round = 0; round < maxLen; round++) {
      islands.forEach((isl) => {
        if (isl.nodes[round]) allNodeIds.push(isl.nodes[round].id);
      });
    }
    allNodeIds.forEach((nId, idx) => {
      const targetDay = reviewDates[idx % reviewDates.length];
      sched[targetDay.date].push(nId);
    });
    return sched;
  }

  function ensureStateMatchesData() {
    if (!state.nodeProgress) state.nodeProgress = {};
    if (!state.nodePomodoros) state.nodePomodoros = {};
    if (!state.daySlots) state.daySlots = {};
    if (!state.customDayMins) state.customDayMins = {};
    if (!state.schedule) state.schedule = {};

    DATA.islands.forEach((island) => {
      island.nodes.forEach((node) => {
        const existing = state.nodeProgress[node.id];
        const expectedLen = (node.checklist || []).length;
        if (!existing) {
          state.nodeProgress[node.id] = {
            checked: (node.checklist || []).map(() => false),
            proficiency: "none",
            quizPassed: false,
            quizBestScore: 0,
            note: "",
            customTitle: "",
            customSections: ""
          };
          state.nodePomodoros[node.id] = 0;
        } else if ((existing.checked || []).length !== expectedLen) {
          existing.checked = (node.checklist || []).map((_, idx) => Boolean(existing.checked && existing.checked[idx]));
        }
      });
    });

    getActiveCalendarDays().forEach((d) => {
      if (!state.daySlots[d.date]) {
        const sm = {};
        (d.slots || []).forEach((s) => {
          sm[s.id] = Boolean(s.defaultOn);
        });
        state.daySlots[d.date] = sm;
      }
      if (!Array.isArray(state.schedule[d.date])) {
        state.schedule[d.date] = Array.isArray(DATA.defaultSchedule[d.date]) ? [...DATA.defaultSchedule[d.date]] : [];
      }
      if (!(d.date in state.customDayMins)) state.customDayMins[d.date] = null;
    });
  }

  function applyExamConfig(cfg, persistLocal = true) {
    if (!cfg) return;
    if (cfg.meta) Object.assign(DATA.meta, cfg.meta);
    if (Array.isArray(cfg.islands) && cfg.islands.length > 0) DATA.islands = cfg.islands;
    if (Array.isArray(cfg.calendarDays) && cfg.calendarDays.length > 0) DATA.calendarDays = cfg.calendarDays;
    if (cfg.defaultSchedule && typeof cfg.defaultSchedule === "object") DATA.defaultSchedule = cfg.defaultSchedule;

    ensureStateMatchesData();
    saveState();

    if (persistLocal) {
      try {
        localStorage.setItem(
          CUSTOM_EXAM_KEY,
          JSON.stringify({
            updatedAt: cfg.updatedAt || new Date().toISOString(),
            meta: DATA.meta,
            islands: DATA.islands,
            calendarDays: DATA.calendarDays,
            defaultSchedule: DATA.defaultSchedule
          })
        );
      } catch (e) {}
    }

    updateCountdown();
    renderGlobalHUD();
    if (activeIslandId) {
      const cur = findIsland(activeIslandId);
      if (cur) renderIslandPanel(cur, null, true);
    }
    if (sceneManager) {
      sceneManager.refreshAllStates();
    }
  }

  async function fetchCloudExamConfig(silent = false) {
    const applyLoaded = (res) => {
      if (!res || !res.ok || !res.examConfig) {
        if (!silent) showToast("ℹ️ 雲端尚未發布自訂段考範圍（目前使用系統內建範圍）");
        return;
      }
      applyExamConfig({ ...res.examConfig, updatedAt: res.updatedAt }, true);
      if (!silent) showToast(`☁️ 已載入雲端段考範圍：${res.examConfig.meta?.examName || "最新段考"}`);
    };

    if (window.google && window.google.script && window.google.script.run) {
      window.google.script.run
        .withSuccessHandler(applyLoaded)
        .withFailureHandler((err) => {
          if (!silent) showToast("⚠️ 讀取雲端段考失敗：" + err.message);
        })
        .loadExamConfig();
      return;
    }

    const url = (state.gasUrl || "").trim();
    if (!url) {
      if (!silent) showToast("⚠️ 尚未設定 GAS Web App 網址！");
      return;
    }
    try {
      const qUrl = `${url}${url.includes("?") ? "&" : "?"}action=examConfig`;
      const res = await fetch(qUrl);
      const json = await res.json();
      applyLoaded(json);
    } catch (err) {
      if (!silent) showToast("⚠️ 無法連線雲端段考設定：" + err.message);
    }
  }

  async function publishExamConfigToGas(passcode) {
    const cleanCode = String(passcode || "").trim();
    if (!cleanCode) {
      showToast("⚠️ 請先輸入教師發布通關密語！");
      return;
    }
    const payload = {
      action: "saveExamConfig",
      passcode: cleanCode,
      examConfig: {
        meta: DATA.meta,
        islands: DATA.islands,
        calendarDays: DATA.calendarDays,
        defaultSchedule: DATA.defaultSchedule
      }
    };

    if (window.google && window.google.script && window.google.script.run) {
      window.google.script.run
        .withSuccessHandler((res) => {
          if (res && res.ok) showToast(`☁️ 已發布為全班雲端段考範圍！（${res.updatedAt || "剛剛"}）`);
          else showToast("❌ 發布失敗：" + ((res && res.error) || "密語錯誤"));
        })
        .withFailureHandler((err) => showToast("⚠️ 發布失敗：" + err.message))
        .saveExamConfig(payload);
      return;
    }

    const url = (state.gasUrl || "").trim();
    if (!url) {
      showToast("⚠️ 尚未設定 GAS 網址，已先儲存在本機與提供下載 data.js！");
      return;
    }
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json && json.ok) {
        showToast(`☁️ 已發布為全班雲端段考範圍！（${json.updatedAt || "剛剛"}）`);
      } else {
        showToast("❌ 發布失敗：" + ((json && json.error) || "請檢查密語或權限"));
      }
    } catch (err) {
      showToast("⚠️ 發布失敗：" + err.message);
    }
  }

  function downloadDataJsFile() {
    const header = [
      "/**",
      ` * ${DATA.meta.semester || "115學年度"}・${DATA.meta.examName || "段考"}「3D 複習造島計畫」課程資料庫`,
      ` * 段考日期：${(DATA.meta.examDates || []).join(" ~ ")}`,
      " */",
      ""
    ].join("\n");
    const content = `${header}window.ISLAND_DATA = ${JSON.stringify(DATA, null, 2)};\n`;
    const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    a.click();
    URL.revokeObjectURL(url);
    showToast("📥 已匯出最新 data.js！（覆蓋專案中的 data.js 並執行 deploy-gas.sh 即可永久發布）");
  }

  function download8DirPngSheet(sex) {
    const s = sex === "f" ? "f" : "m";
    const sprites = window.PANTHER_3D_SPRITES || {};
    const defs = [
      { key: `${s}_front`, mirror: false, label: "1. 正前 (front · 0°)" },
      { key: `${s}_fr`, mirror: false, label: "2. 右前 (fr · 45°)" },
      { key: `${s}_right`, mirror: false, label: "3. 正右 (right · 90°)" },
      { key: `${s}_br`, mirror: false, label: "4. 右後 (br · 135°)" },
      { key: `${s}_back`, mirror: false, label: "5. 正後 (back · 180°)" },
      { key: `${s}_br`, mirror: true, label: "6. 左後 (bl · 225°)" },
      { key: `${s}_right`, mirror: true, label: "7. 正左 (left · 270°)" },
      { key: `${s}_fr`, mirror: true, label: "8. 左前 (fl · 315°)" }
    ];

    const loadedImgs = [];
    let pending = defs.length;
    defs.forEach((d, idx) => {
      const img = new Image();
      img.onload = () => {
        loadedImgs[idx] = img;
        pending -= 1;
        if (pending === 0) renderCanvas();
      };
      img.onerror = () => {
        pending -= 1;
        if (pending === 0) renderCanvas();
      };
      img.src = sprites[d.key] || sprites[`${s}_front`] || "";
    });

    function renderCanvas() {
      const cw = 260;
      const ch = 320;
      const cols = 4;
      const cv = document.createElement("canvas");
      cv.width = cw * cols + 40;
      cv.height = ch * 2 + 90;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#0b2239";
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 24px "Noto Sans TC", sans-serif';
      ctx.fillText(`南山豹 3D 八向立繪圖鑑（${s === "f" ? "女裝百褶裙" : "男裝灰短褲"}）`, 24, 42);

      defs.forEach((d, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const bx = 20 + col * cw;
        const by = 64 + row * ch;
        ctx.fillStyle = "#143554";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx + 8, by + 8, cw - 16, ch - 16, 16);
        ctx.fill();
        ctx.stroke();

        const img = loadedImgs[idx];
        if (img) {
          const scale = Math.min((cw - 48) / img.width, (ch - 76) / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.save();
          ctx.translate(bx + cw / 2, by + 18 + (ch - 76));
          if (d.mirror) ctx.scale(-1, 1);
          ctx.drawImage(img, -dw / 2, -dh, dw, dh);
          ctx.restore();
        }
        ctx.fillStyle = "#ffd32a";
        ctx.font = 'bold 16px "Noto Sans TC", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(d.label, bx + cw / 2, by + ch - 24);
        ctx.textAlign = "left";
      });

      const a = document.createElement("a");
      a.download = `nanshan_panther_8dir_${s}.png`;
      a.href = cv.toDataURL("image/png");
      a.click();
      showToast(`📥 已下載「南山豹 ${s === "f" ? "女裝" : "男裝"} 8 向圖鑑 PNG」！`);
    }
  }

  function openAdminModal(defaultTab = "gallery") {
    activeAdminTab = defaultTab;
    renderAdminModal();
    document.getElementById("admin-modal").classList.add("is-open");
  }

  function closeAdminModal() {
    document.getElementById("admin-modal").classList.remove("is-open");
  }

  function renderAdminModal() {
    const body = document.getElementById("admin-modal-body");
    if (!body) return;

    const tabsHtml = `
      <div class="subtabs-row">
        <button type="button" class="dock-btn ${activeAdminTab === "gallery" ? "is-active" : ""}" id="tab-admin-gallery">🐆 南山豹 3D 八向圖鑑</button>
        <button type="button" class="dock-btn ${activeAdminTab === "exam" ? "is-active" : ""}" id="tab-admin-exam">📝 下次段考怎麼改？（範圍改版器）</button>
      </div>
    `;

    let innerHtml = "";
    if (activeAdminTab === "gallery") {
      const s = adminGallerySex;
      const sprites = window.PANTHER_3D_SPRITES || {};
      const dirs = [
        { dir: "front", base: `${s}_front`, mirror: false, title: "1. 正前 (0°)", sub: "dir = front" },
        { dir: "fr", base: `${s}_fr`, mirror: false, title: "2. 右前 (45°)", sub: "dir = fr" },
        { dir: "right", base: `${s}_right`, mirror: false, title: "3. 正右 (90°)", sub: "dir = right" },
        { dir: "br", base: `${s}_br`, mirror: false, title: "4. 右後 (135°)", sub: "dir = br" },
        { dir: "back", base: `${s}_back`, mirror: false, title: "5. 正後 (180°)", sub: "dir = back" },
        { dir: "bl", base: `${s}_br`, mirror: true, title: "6. 左後 (225°)", sub: "dir = bl (鏡像)" },
        { dir: "left", base: `${s}_right`, mirror: true, title: "7. 正左 (270°)", sub: "dir = left (鏡像)" },
        { dir: "fl", base: `${s}_fr`, mirror: true, title: "8. 左前 (315°)", sub: "dir = fl (鏡像)" }
      ];

      const cards = dirs
        .map((d) => {
          const src = sprites[d.base] || sprites[`${s}_front`] || "";
          const uploadTarget = d.mirror ? "" : `<label class="sprite-upload-btn">📤 替換此向<input type="file" accept="image/*" data-upload-pose="${d.base}" style="display:none" /></label>`;
          return `
            <div class="sprite-8dir-card">
              <div class="sprite-8dir-label">${d.title}</div>
              <img src="${src}" alt="${d.title}" class="sprite-8dir-img ${d.mirror ? "is-mirrored" : ""}" />
              <div class="sprite-8dir-sub">${d.sub}</div>
              ${uploadTarget || `<span class="sprite-8dir-sub">自動由對應右向鏡像</span>`}
            </div>
          `;
        })
        .join("");

      const curMode = sceneManager ? sceneManager.pantherRenderMode : "sprite";
      const glbSlotOpts = [
        `<option value="panther">🐾 主角：南山豹 (panther)</option>`,
        `<option value="hub">🏛️ 中央：自強廣場鐘樓 (hub)</option>`,
        ...DATA.islands.map((isl) => `<option value="${isl.id}">🏝️ ${escapeHtml(isl.subject)} (${isl.id})</option>`)
      ].join("");

      innerHtml = `
        <div class="admin-guide-box">
          <strong>🐾 已恢復原本 Higgsfield 八向南山豹公仔 ＋ 新增 SVG / .glb 轉 3D 模型掛載！</strong><br />
          主島與六座學科島均已擴大至原本約 3 倍空間，並搭配校園生活「自強不息」學習站與公佈欄。您在 Higgsfield 用 <code>GPT Image 2.6</code> / <code>Nano Banana Pro</code> 生圖後，搭配 <code>Ideogram Vector 1.0</code> 轉出的 <code>.svg</code> 向量檔或 Blender <code>.glb</code> 檔，都可以直接在下方匯入即時擠出為 3D 模型預覽！
        </div>
        <div class="admin-section-card" style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;">
            <strong>🐾 南山豹顯示引擎切換：</strong>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              <button type="button" class="dock-btn ${curMode === "glb" ? "is-active" : ""}" id="mode-glb-btn">🐆 3D 骨架南山豹</button>
              <button type="button" class="dock-btn ${curMode === "sprite" ? "is-active" : ""}" id="mode-sprite-btn">🃏 Higgsfield 8向公仔</button>
              <button type="button" class="dock-btn ${curMode === "mesh" ? "is-active" : ""}" id="mode-mesh-btn">🤖 幾何積木 3D</button>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding-top:8px;border-top:1px solid rgba(255,255,255,0.12);">
            <strong>🧱 SVG / Blender .glb 轉 3D 模型掛載：</strong>
            <select id="adm-glb-slot" class="admin-input" style="max-width:240px;">${glbSlotOpts}</select>
            <label class="sprite-upload-btn" style="cursor:pointer;">📦 匯入 .svg / .glb 模型<input type="file" accept=".svg,.glb,.gltf" id="adm-glb-file" style="display:none" /></label>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <button type="button" class="dock-btn ${s === "m" ? "is-active" : ""}" id="gal-sex-m">👔 男裝 (藍襯衫/灰褲)</button>
            <button type="button" class="dock-btn ${s === "f" ? "is-active" : ""}" id="gal-sex-f">👚 女裝 (粉襯衫/百褶裙)</button>
          </div>
          <button type="button" class="primary-btn" id="dl-8dir-png-btn">📥 下載此款 8 向總表 (PNG)</button>
        </div>
        <div class="sprite-8dir-grid">${cards}</div>
      `;
    } else {
      const dates = (DATA.meta && DATA.meta.examDates) || ["2026-12-01", "2026-12-02"];
      const isl = DATA.islands[adminSubjectIdx] || DATA.islands[0];

      const subjTabs = DATA.islands
        .map(
          (item, i) => `
          <button type="button" class="dock-btn ${i === adminSubjectIdx ? "is-active" : ""}" data-adm-subj="${i}" style="--dock-color:${item.colors.primary}">
            <span class="dock-dot"></span><span>${escapeHtml(item.subject)} (${item.nodes.length})</span>
          </button>`
        )
        .join("");

      const nodesHtml = isl.nodes
        .map(
          (n, idx) => `
          <div class="admin-node-item" data-node-idx="${idx}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <strong>單元 #${idx + 1} (${escapeHtml(n.id)})</strong>
              ${
                isl.nodes.length > 1
                  ? `<button type="button" class="small-action-btn" data-adm-del-node="${idx}" style="color:#fca5a5;">🗑️ 刪除此單元</button>`
                  : ""
              }
            </div>
            <div class="admin-form-grid">
              <label class="admin-field">代號 (如 L9 / 主題七)
                <input type="text" class="admin-input" data-nf="code" data-ni="${idx}" value="${escapeHtml(n.code)}" />
              </label>
              <label class="admin-field">預估複習分鐘數
                <input type="number" min="10" max="240" class="admin-input" data-nf="estimatedMins" data-ni="${idx}" value="${Number(n.estimatedMins || 45)}" />
              </label>
            </div>
            <label class="admin-field">單元標題
              <input type="text" class="admin-input" data-nf="title" data-ni="${idx}" value="${escapeHtml(n.title)}" />
            </label>
            <label class="admin-field">章節／副標重點
              <input type="text" class="admin-input" data-nf="sections" data-ni="${idx}" value="${escapeHtml(n.sections)}" />
            </label>
            <label class="admin-field">課本考點檢核清單（每行一個考點）
              <textarea class="admin-textarea" data-nf="checklist" data-ni="${idx}">${escapeHtml((n.checklist || []).join("\n"))}</textarea>
            </label>
          </div>`
        )
        .join("");

      innerHtml = `
        <div class="admin-guide-box">
          <strong>📝 下次段考（如：第三次段考／期末考）如何改版？三步驟超簡單：</strong><br />
          1️⃣ 修改下方「段考名稱與新日期」→ 點擊 <strong>「📅 自動生成考前排程」</strong>（系統會依新日期自動套用週一二四晚自習＋週末雙時段）。<br />
          2️⃣ 切換下方 6 科頁籤修改「段考範圍」與「各單元考點清單」。<br />
          3️⃣ 若要讓<strong>全班學生打開原本網址就同步切換新段考</strong>，輸入教師密語按 <strong>「☁️ 發布為全班雲端段考範圍」</strong>；或按 <strong>「📥 下載新版 data.js」</strong> 覆蓋專案檔案再部署！
        </div>

        <div class="admin-section-card">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">
            <strong style="font-size:15px;">🗓️ 步驟 1：段考基本資訊與新日期設定</strong>
            <button type="button" class="secondary-btn" id="adm-check-cloud-btn">☁️ 檢查雲端最新發布範圍</button>
          </div>
          <div class="admin-form-grid">
            <label class="admin-field">段考名稱（如：第三次段考）
              <input type="text" id="adm-exam-name" class="admin-input" value="${escapeHtml(DATA.meta.examName || "")}" />
            </label>
            <label class="admin-field">班級名稱
              <input type="text" id="adm-class-group" class="admin-input" value="${escapeHtml(DATA.meta.classGroup || "")}" />
            </label>
            <label class="admin-field">段考第 1 天日期
              <input type="date" id="adm-exam-start" class="admin-input" value="${escapeHtml(dates[0] || "2026-12-01")}" />
            </label>
            <label class="admin-field">段考結束日期
              <input type="date" id="adm-exam-end" class="admin-input" value="${escapeHtml(dates[dates.length - 1] || dates[0] || "2026-12-02")}" />
            </label>
            <label class="admin-field">考前衝刺天數
              <input type="number" id="adm-review-days" class="admin-input" min="3" max="30" value="${Number(DATA.meta.totalReviewDays || 14)}" />
            </label>
          </div>
          <div>
            <button type="button" class="primary-btn" id="adm-regen-cal-btn">📅 依新日期自動重算考前排程日曆與預設分配</button>
          </div>
        </div>

        <div class="admin-section-card">
          <strong style="font-size:15px;">🏝️ 步驟 2：調整六科段考範圍與據點內容</strong>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">${subjTabs}</div>
          <div class="admin-form-grid">
            <label class="admin-field">段考範圍總覽 (顯示於面板)
              <input type="text" id="adm-subj-scope" class="admin-input" value="${escapeHtml(isl.scopeSummary || "")}" />
            </label>
            <label class="admin-field">任課教師
              <input type="text" id="adm-subj-teacher" class="admin-input" value="${escapeHtml(isl.teacher || "")}" />
            </label>
            <label class="admin-field">教材名稱
              <input type="text" id="adm-subj-textbook" class="admin-input" value="${escapeHtml(isl.textbook || "")}" />
            </label>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">${nodesHtml}</div>
          <div>
            <button type="button" class="secondary-btn" id="adm-add-node-btn">➕ 為【${escapeHtml(isl.subject)}】新增一個單元節點</button>
          </div>
        </div>

        <div class="admin-section-card">
          <strong style="font-size:15px;">🚀 步驟 3：套用本機 ／ 全班雲端發布 ／ 匯出備份</strong>
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
            <input type="password" id="adm-passcode" class="admin-input" style="max-width:220px;" placeholder="教師雲端發布通關密語" />
            <button type="button" class="primary-btn" id="adm-save-local-btn">💾 套用並暫存於本機</button>
            <button type="button" class="primary-btn" id="adm-publish-gas-btn" style="background:linear-gradient(135deg,#0ea5e9,#0284c7);">☁️ 發布為全班雲端段考範圍</button>
            <button type="button" class="secondary-btn" id="adm-download-data-btn">📥 下載新版 data.js</button>
            <button type="button" class="secondary-btn" id="adm-reset-progress-btn" style="color:#fca5a5;">🔄 清空舊段考打勾（迎戰新段考）</button>
          </div>
        </div>
      `;
    }

    body.innerHTML = tabsHtml + innerHtml;

    document.getElementById("tab-admin-gallery")?.addEventListener("click", () => {
      activeAdminTab = "gallery";
      renderAdminModal();
    });
    document.getElementById("tab-admin-exam")?.addEventListener("click", () => {
      activeAdminTab = "exam";
      renderAdminModal();
    });

    if (activeAdminTab === "gallery") {
      document.getElementById("mode-glb-btn")?.addEventListener("click", () => {
        if (!sceneManager) return;
        if (sceneManager.panther && sceneManager.panther.customGlbGroup) {
          sceneManager.setPantherRenderMode("glb");
          renderAdminModal();
        } else {
          showToast("⏳ 正在載入 3D 骨架南山豹...");
          sceneManager.loadPantherRig("assets/panther_3d.glb?v=2", (err) => {
            if (err) showToast("⚠️ 3D 模型載入失敗，維持插畫版");
            renderAdminModal();
          });
        }
      });
      document.getElementById("mode-mesh-btn")?.addEventListener("click", () => {
        if (sceneManager) sceneManager.setPantherRenderMode("mesh");
        renderAdminModal();
      });
      document.getElementById("mode-sprite-btn")?.addEventListener("click", () => {
        if (sceneManager) sceneManager.setPantherRenderMode("sprite");
        renderAdminModal();
      });
      document.getElementById("adm-glb-file")?.addEventListener("change", (e) => {
        const slot = document.getElementById("adm-glb-slot")?.value || "panther";
        const file = e.target.files && e.target.files[0];
        if (!file || !sceneManager) return;
        const cb = (err) => {
          if (err) {
            showToast(`⚠️ 模型載入失敗：${err.message || err}`);
          } else {
            showToast(`✨ 已載入並立體化套用至【${slot}】！`);
            renderAdminModal();
          }
        };
        if (/\.svg$/i.test(file.name)) {
          sceneManager.loadSVGModel(slot, file, cb);
        } else {
          sceneManager.loadGLBModel(slot, file, cb);
        }
      });
      document.getElementById("gal-sex-m")?.addEventListener("click", () => {
        adminGallerySex = "m";
        renderAdminModal();
      });
      document.getElementById("gal-sex-f")?.addEventListener("click", () => {
        adminGallerySex = "f";
        renderAdminModal();
      });
      document.getElementById("dl-8dir-png-btn")?.addEventListener("click", () => download8DirPngSheet(adminGallerySex));
      body.querySelectorAll("[data-upload-pose]").forEach((inp) => {
        inp.addEventListener("change", (e) => {
          const poseKey = inp.getAttribute("data-upload-pose");
          const file = e.target.files && e.target.files[0];
          if (!poseKey || !file) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (!window.PANTHER_3D_SPRITES) window.PANTHER_3D_SPRITES = {};
            window.PANTHER_3D_SPRITES[poseKey] = String(reader.result);
            try {
              const saved = JSON.parse(localStorage.getItem(CUSTOM_SPRITES_KEY) || "{}");
              saved[poseKey] = String(reader.result);
              localStorage.setItem(CUSTOM_SPRITES_KEY, JSON.stringify(saved));
            } catch (err) {}
            if (sceneManager) sceneManager._preloadFigurineSprites();
            renderAdminModal();
            showToast(`✨ 已套用新圖至【${poseKey}】並即時更新 3D 南山豹！`);
          };
          reader.readAsDataURL(file);
        });
      });
      return;
    }

    // Bind Exam Config Editor events
    const commitCurrentEditorFields = () => {
      const exName = document.getElementById("adm-exam-name")?.value.trim();
      const clsGrp = document.getElementById("adm-class-group")?.value.trim();
      const sDate = document.getElementById("adm-exam-start")?.value;
      const eDate = document.getElementById("adm-exam-end")?.value || sDate;
      const rDays = Number(document.getElementById("adm-review-days")?.value) || 14;
      if (exName) DATA.meta.examName = exName;
      if (clsGrp) DATA.meta.classGroup = clsGrp;
      if (sDate) DATA.meta.examDates = eDate && eDate !== sDate ? [sDate, eDate] : [sDate];
      DATA.meta.totalReviewDays = rDays;

      const curIsl = DATA.islands[adminSubjectIdx];
      if (curIsl) {
        curIsl.scopeSummary = document.getElementById("adm-subj-scope")?.value.trim() || curIsl.scopeSummary;
        curIsl.teacher = document.getElementById("adm-subj-teacher")?.value.trim() || curIsl.teacher;
        curIsl.textbook = document.getElementById("adm-subj-textbook")?.value.trim() || curIsl.textbook;

        curIsl.nodes.forEach((n, idx) => {
          const codeEl = body.querySelector(`[data-nf="code"][data-ni="${idx}"]`);
          const minsEl = body.querySelector(`[data-nf="estimatedMins"][data-ni="${idx}"]`);
          const titleEl = body.querySelector(`[data-nf="title"][data-ni="${idx}"]`);
          const secEl = body.querySelector(`[data-nf="sections"][data-ni="${idx}"]`);
          const chkEl = body.querySelector(`[data-nf="checklist"][data-ni="${idx}"]`);
          if (codeEl) n.code = codeEl.value.trim() || n.code;
          if (minsEl) n.estimatedMins = Math.max(10, Number(minsEl.value) || 45);
          if (titleEl) n.title = titleEl.value.trim() || n.title;
          if (secEl) n.sections = secEl.value.trim() || n.sections;
          if (chkEl) {
            const lines = chkEl.value
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean);
            if (lines.length > 0) n.checklist = lines;
          }
        });
      }
    };

    body.querySelectorAll("[data-adm-subj]").forEach((btn) => {
      btn.addEventListener("click", () => {
        commitCurrentEditorFields();
        adminSubjectIdx = Number(btn.getAttribute("data-adm-subj")) || 0;
        renderAdminModal();
      });
    });

    body.querySelectorAll("[data-adm-del-node]").forEach((btn) => {
      btn.addEventListener("click", () => {
        commitCurrentEditorFields();
        const ni = Number(btn.getAttribute("data-adm-del-node"));
        const curIsl = DATA.islands[adminSubjectIdx];
        if (curIsl && curIsl.nodes.length > 1) {
          curIsl.nodes.splice(ni, 1);
          renderAdminModal();
        }
      });
    });

    document.getElementById("adm-add-node-btn")?.addEventListener("click", () => {
      commitCurrentEditorFields();
      const curIsl = DATA.islands[adminSubjectIdx];
      if (!curIsl) return;
      const num = curIsl.nodes.length + 1;
      curIsl.nodes.push({
        id: `${curIsl.id.slice(0, 3)}-u${Date.now().toString().slice(-4)}`,
        code: `U${num}`,
        title: `新增第 ${num} 單元複習`,
        sections: "自訂段考範圍單元",
        estimatedMins: 45,
        checklist: ["掌握本單元核心概念與定義", "完成課本練習與歷屆常考題型"],
        quiz: [
          {
            question: `已完成「${curIsl.subject} 第 ${num} 單元」自我檢核了嗎？`,
            options: ["是的，已完成關鍵考點整理", "尚未開始，先看課本大標", "只看標題尚未熟練", "需要再做一輪練習"],
            answerIndex: 0,
            explanation: "建議先完成課本考點勾選與番茄鐘專注複習再來挑戰！"
          }
        ]
      });
      renderAdminModal();
      showToast(`➕ 已為【${curIsl.subject}】新增單元節點！`);
    });

    document.getElementById("adm-regen-cal-btn")?.addEventListener("click", () => {
      commitCurrentEditorFields();
      const sDate = DATA.meta.examDates[0];
      const eDate = DATA.meta.examDates[DATA.meta.examDates.length - 1] || sDate;
      DATA.calendarDays = generateReviewCalendarDays(sDate, eDate, DATA.meta.examName, DATA.meta.totalReviewDays);
      DATA.defaultSchedule = buildBalancedDefaultSchedule(DATA.islands, DATA.calendarDays);
      DATA.meta.startDate = DATA.calendarDays[0]?.date || sDate;
      // 更新舊排程中已不存在的日期至新排程
      state.daySlots = createDefaultDaySlots();
      DATA.calendarDays.forEach((d) => {
        state.schedule[d.date] = [...(DATA.defaultSchedule[d.date] || [])];
        state.customDayMins[d.date] = null;
      });
      applyExamConfig(DATA, true);
      showToast(`📅 已重新計算【${DATA.meta.examName}】前 ${DATA.meta.totalReviewDays} 天排程日曆！`);
    });

    document.getElementById("adm-save-local-btn")?.addEventListener("click", () => {
      commitCurrentEditorFields();
      applyExamConfig(DATA, true);
      showToast("💾 已套用新段考範圍與設定並儲存於本機！");
    });

    document.getElementById("adm-publish-gas-btn")?.addEventListener("click", () => {
      commitCurrentEditorFields();
      applyExamConfig(DATA, true);
      const code = document.getElementById("adm-passcode")?.value || "";
      publishExamConfigToGas(code);
    });

    document.getElementById("adm-download-data-btn")?.addEventListener("click", () => {
      commitCurrentEditorFields();
      downloadDataJsFile();
    });

    document.getElementById("adm-check-cloud-btn")?.addEventListener("click", () => fetchCloudExamConfig(false));

    document.getElementById("adm-reset-progress-btn")?.addEventListener("click", () => {
      if (!confirm("確定要清空所有單元打勾與測驗過關狀態以迎接下次段考嗎？（您的小魚乾、連勝簽到與島嶼建設將會保留！）")) {
        return;
      }
      DATA.islands.forEach((isl) => {
        isl.nodes.forEach((n) => {
          state.nodeProgress[n.id] = {
            checked: (n.checklist || []).map(() => false),
            proficiency: "none",
            quizPassed: false,
            quizBestScore: 0,
            note: "",
            customTitle: "",
            customSections: ""
          };
          state.nodePomodoros[n.id] = 0;
        });
      });
      saveState();
      renderGlobalHUD();
      if (activeIslandId) renderIslandPanel(findIsland(activeIslandId), null, false);
      showToast("🔄 已重設新段考單元進度（小魚乾與造島建設已保留）！");
    });
  }

  /* ==================== 造島成果報告 & 列印/匯出 ==================== */
  function openReportModal() {
    renderReportContent();
    document.getElementById("report-modal").classList.add("is-open");
  }

  function closeReportModal() {
    document.getElementById("report-modal").classList.remove("is-open");
  }

  function renderReportContent() {
    document.getElementById("stu-class").value = state.student.className || "";
    document.getElementById("stu-seat").value = state.student.seatNo || "";
    document.getElementById("stu-name").value = state.student.name || "";
    const gasInput = document.getElementById("gas-url-input");
    if (gasInput) gasInput.value = state.gasUrl || "";

    const g = getGlobalStats();
    document.getElementById("report-kpis").innerHTML = `
      <div class="report-kpi"><div class="report-kpi-val">${g.overallPercent}%</div><div class="report-kpi-label">總體造島完成度</div></div>
      <div class="report-kpi"><div class="report-kpi-val">${g.conqueredNodes}/${g.totalNodes}</div><div class="report-kpi-label">已插旗認證據點</div></div>
      <div class="report-kpi"><div class="report-kpi-val">${g.quizPassedCount}/${g.totalNodes}</div><div class="report-kpi-label">通過闖關測驗</div></div>
      <div class="report-kpi"><div class="report-kpi-val">${g.weakCount}</div><div class="report-kpi-label">標記「待加強」據點</div></div>
    `;

    const profTextMap = {
      none: "尚未自評",
      weak: "🔴 待加強",
      ok: "🟡 普通",
      master: "🟢 精熟"
    };

    const rowsHtml = DATA.islands
      .map((isl) => {
        const islStats = getIslandStats(isl);
        return isl.nodes
          .map((n, idx) => {
            const st = getNodeStatus(isl.id, n.id);
            const p = state.nodeProgress[n.id];
            return `
              <tr>
                ${idx === 0 ? `<td rowspan="${isl.nodes.length}"><strong>${isl.subject}</strong><br><span style="font-size:11px;color:var(--text-muted);">${isl.teacher}<br>進度 ${islStats.avgPercent}%</span></td>` : ""}
                <td>${escapeHtml(getNodeDisplayTitle(n))}</td>
                <td>${st.checkedCount}/${st.totalChecks}</td>
                <td>${p.quizPassed ? "✅ 通過" : "—"}</td>
                <td>${profTextMap[p.proficiency]}</td>
                <td>${escapeHtml(p.note || "—")}</td>
              </tr>
            `;
          })
          .join("");
      })
      .join("");

    document.getElementById("report-table-body").innerHTML = rowsHtml;
  }

  function buildPrintableReportAndPrint() {
    const g = getGlobalStats();
    const profTextMap = {
      none: "尚未自評",
      weak: "待加強",
      ok: "普通",
      master: "精熟"
    };

    const subjectRows = DATA.islands
      .map((isl) =>
        isl.nodes
          .map((n) => {
            const st = getNodeStatus(isl.id, n.id);
            const p = state.nodeProgress[n.id];
            return `
              <tr>
                <td>${isl.subject}</td>
                <td>${escapeHtml(getNodeDisplayTitle(n))}</td>
                <td>${st.checkedCount}/${st.totalChecks} 項 (${st.percent}%)</td>
                <td>${p.quizPassed ? "通過" : "未通過"}</td>
                <td>${profTextMap[p.proficiency]}</td>
                <td>${escapeHtml(p.note || "")}</td>
              </tr>
            `;
          })
          .join("")
      )
      .join("");

    const activeDays = getActiveCalendarDays();
    const activeReviewCount = activeDays.filter((d) => !d.isExam && !d.isRestDay).length;
    const scheduleRows = activeDays
      .map((day) => {
        const items = (state.schedule[day.date] || [])
          .map((nid) => {
            const found = findNode(nid);
            if (!found) return "";
            const done = state.dailyDone[`${day.date}::${nid}`] ? "☑" : "☐";
            return `${done} [${found.island.subject}] ${found.node.code}`;
          })
          .join("　");
        return `
          <tr>
            <td>${day.label}</td>
            <td>${day.countdown}</td>
            <td>${items || (day.isExam ? "第二次段考日" : day.isRestDay ? "自訂休息日" : "自由複習／補漏")}</td>
          </tr>
        `;
      })
      .join("");

    const printRoot = document.getElementById("print-report-root");
    printRoot.innerHTML = `
      <div class="print-header">
        <h2>11501 普二文組（普二速）・第二次段考「複習造島」學習檢核與排程報告</h2>
        <p>班級：${escapeHtml(state.student.className || "普二速")}　座號：${escapeHtml(state.student.seatNo || "____")}　姓名：${escapeHtml(state.student.name || "________")}　段考日：${formatExamMmDdRange()}</p>
        <p>總體造島完成度：<strong>${g.overallPercent}%</strong> ｜ 已插旗認證據點：<strong>${g.conqueredNodes}/${g.totalNodes}</strong> ｜ 已收集情報：<strong>${(state.collectedIntel || []).length}/${(DATA.intelItems || []).length}</strong> ｜ 列印時間：${new Date().toLocaleString("zh-TW")}</p>
      </div>
      <h3>一、六大學科島嶼與 25 個據點確認明細</h3>
      <table class="print-table">
        <thead>
          <tr><th>學科</th><th>單元據點</th><th>節點檢核</th><th>測驗</th><th>熟練度</th><th>個人筆記 / 備忘</th></tr>
        </thead>
        <tbody>${subjectRows}</tbody>
      </table>
      <h3>二、考前 ${activeReviewCount} 天複習排程與段考日總表</h3>
      <table class="print-table">
        <thead>
          <tr><th>日期</th><th>倒數</th><th>排定複習據點</th></tr>
        </thead>
        <tbody>${scheduleRows}</tbody>
      </table>
    `;

    window.print();
  }

  function exportJsonBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `11501_普二文組_複習造島備份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("💾 已下載 JSON 進度備份檔！");
  }

  function importJsonBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.nodeProgress) throw new Error("格式不符");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        state = loadState();
        renderGlobalHUD();
        renderReportContent();
        if (activeIslandId) renderIslandPanel(findIsland(activeIslandId));
        showToast("📂 成功匯入進度備份！");
      } catch (err) {
        showToast("⚠️ 匯入失敗：請確認為有效的造島備份 JSON 檔");
      }
    };
    reader.readAsText(file);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ==================== 啟動與事件綁定 ==================== */
  function bootstrap() {
    updateCountdown();

    const canvasContainer = document.getElementById("canvas-container");
    const labelsContainer = document.getElementById("island-labels");

    sceneManager = new window.IslandSceneManager(canvasContainer, labelsContainer, {
      onSelectIsland: (islandId) => openIsland(islandId),
      onSelectNode: (islandId, nodeId) => openIsland(islandId, nodeId),
      onPetCat: (islandId) => {
        openIsland(islandId);
        handleCatInteraction(islandId, false);
      },
      onWalkEncounter: (islandId, nodeId, kind) => {
        openWalkEncounter(islandId, nodeId, kind);
      },
      onCollectIntel: (intelId) => collectIntel(intelId),
      onSelectHub: () => {
        closeScheduleModal();
        closeReportModal();
        closeLifeModal();
        openCheckinModal();
      },
      onNearInteractable: (spot) => {
        const interactBtn = document.getElementById("panther-interact-btn");
        if (!interactBtn) return;
        if (spot) {
          interactBtn.textContent = spot.label;
          interactBtn.classList.add("is-ready");
        } else {
          interactBtn.textContent = "🙌 歡呼應援";
          interactBtn.classList.remove("is-ready");
        }
      },
      onPantherAction: (actionType) => {
        if (actionType === "dance") {
          const now = Date.now();
          if (now - lastDanceRewardAt >= 4500) {
            lastDanceRewardAt = now;
            state.catStats.bonusFish = (state.catStats.bonusFish || 0) + 1;
            saveState();
            renderGlobalHUD();
            showToast("💃 南山豹熱舞應援！獲得應援小魚乾 +1 🐟");
          } else {
            showToast("💃 南山豹閃亮熱舞中！（自強不息～）");
          }
        } else if (actionType === "cheer") {
          showToast("🐾 南山豹：自強不息！段考加油！");
        }
      },
      onNearIsland: (island) => {
        nearIslandRef = island;
        const banner = document.getElementById("near-island-banner");
        const txt = document.getElementById("near-island-text");
        if (!banner || !txt) return;
        if (island && !activeIslandId) {
          txt.textContent = `🐾 南山豹已抵達【${island.name}】！`;
          banner.classList.add("is-visible");
        } else {
          banner.classList.remove("is-visible");
        }
      },
      onTriggerActivity: (activityId) => triggerLifeActivity(activityId),
      onStopActivity: () => stopLifeActivityUI(true)
    });
    window.sceneManager = sceneManager;
    sceneManager.pantherState.sex = state.pantherSex || "m";
    try {
      sceneManager.init(DATA.islands, getNodeStatus);
      sceneManager.setPantherSex(state.pantherSex || "m", true);
      sceneManager.setAtmosphereMode((state.catStats && state.catStats.atmosphere) || "day");
    } catch (sceneErr) {
      console.warn("場景初始化發生例外，維持基礎介面運作：", sceneErr);
    }

    renderGlobalHUD();
    updateAudioControlsUI();
    updatePomodoroDisplay();
    setTimeout(() => sceneManager && sceneManager.onResize(), 150);
    setTimeout(() => sceneManager && sceneManager.onResize(), 600);

    // 若是在 GAS Web App 網址內執行，自動同步雲端發布的最新段考範圍（如有更新）並回報啟動成功
    if (window.google && window.google.script && window.google.script.run) {
      fetchCloudExamConfig(true);
      if (typeof window.google.script.run.pingBootSuccess === "function") {
        try {
          window.google.script.run.pingBootSuccess({
            webgl: Boolean(sceneManager && sceneManager.isWebGL),
            dockCount: document.querySelectorAll("#island-dock-bar button").length
          });
        } catch (pingErr) {}
      }
    }

    // Daily Check-in, Island Builder & Admin Modals
    document.getElementById("nav-checkin-btn").addEventListener("click", () => {
      closeScheduleModal();
      closeReportModal();
      closeLifeModal();
      closeAdminModal();
      openCheckinModal();
    });
    document.getElementById("close-checkin-btn").addEventListener("click", closeCheckinModal);

    document.getElementById("nav-life-btn").addEventListener("click", () => {
      closeScheduleModal();
      closeReportModal();
      closeCheckinModal();
      closeAdminModal();
      openLifeModal("builder");
    });
    document.getElementById("hud-intel-btn")?.addEventListener("click", () => {
      closeScheduleModal();
      closeReportModal();
      closeCheckinModal();
      closeAdminModal();
      openLifeModal("intel");
    });
    document.getElementById("close-life-btn").addEventListener("click", closeLifeModal);

    document.getElementById("nav-admin-btn")?.addEventListener("click", () => {
      closeScheduleModal();
      closeReportModal();
      closeCheckinModal();
      closeLifeModal();
      openAdminModal("gallery");
    });
    document.getElementById("close-admin-btn")?.addEventListener("click", closeAdminModal);

    // Near Island Dock Prompt & Collapsed Island Float Pill
    document.getElementById("near-island-dock-btn").addEventListener("click", () => {
      if (nearIslandRef) openIsland(nearIslandRef.id);
    });
    document.getElementById("reopen-panel-btn")?.addEventListener("click", () => {
      if (activeIslandId) openIsland(activeIslandId, null, true);
    });
    document.getElementById("float-walk-step-btn")?.addEventListener("click", () => {
      if (activeIslandId) triggerWalkStep(activeIslandId);
    });

    // Ensure keyboard focus works smoothly inside GAS sandboxed iframe
    const focusAppWindow = (e) => {
      const tag = (e && e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      try {
        window.focus();
      } catch (err) {}
    };
    focusAppWindow();
    window.addEventListener("pointerdown", focusAppWindow, { passive: true });
    window.addEventListener("touchstart", focusAppWindow, { passive: true });

    // Q-Version Nanshan Panther Joystick (#joy + #knob), Keyboard WASD & Action Controls
    const keysHeld = new Set();
    const joyV = { x: 0, y: 0 };

    const syncPantherInput = () => {
      let kx = 0;
      let ky = 0;
      if (keysHeld.has("KeyW") || keysHeld.has("ArrowUp")) ky += 1;
      if (keysHeld.has("KeyS") || keysHeld.has("ArrowDown")) ky -= 1;
      if (keysHeld.has("KeyA") || keysHeld.has("ArrowLeft")) kx -= 1;
      if (keysHeld.has("KeyD") || keysHeld.has("ArrowRight")) kx += 1;
      const sprintHeld = keysHeld.has("ShiftLeft") || keysHeld.has("ShiftRight");
      sceneManager.setPantherInput(kx + joyV.x, ky + joyV.y, sprintHeld);
      updateCameraModeBtn();
    };

    const joyEl = document.getElementById("joy");
    const knobEl = document.getElementById("knob");
    if (joyEl && knobEl) {
      let dragPointerId = null;
      let activeTouchId = null;
      let joyStartTime = 0;
      const maxR = 42;

      const updateJoyPos = (clientX, clientY) => {
        if (window.innerWidth <= 780 && document.body.classList.contains("has-open-panel")) {
          collapseIslandPanelTo3D();
        }
        const rect = joyEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > maxR) {
          dx = (dx / dist) * maxR;
          dy = (dy / dist) * maxR;
        }
        knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
        joyV.x = dx / maxR;
        joyV.y = -dy / maxR;
        syncPantherInput();
      };

      const finishJoy = () => {
        const heldMs = Date.now() - joyStartTime;
        const tapVx = joyV.x;
        const tapVy = joyV.y;
        dragPointerId = null;
        activeTouchId = null;
        knobEl.style.transform = "translate(0px, 0px)";
        joyV.x = 0;
        joyV.y = 0;
        syncPantherInput();
        // Quick tap on a cardinal direction gives Panther an unmistakable forward stride
        if (heldMs < 280 && Math.hypot(tapVx, tapVy) > 0.2) {
          sceneManager.nudgePanther(tapVx, tapVy);
        }
      };

      // Native touch events guarantee zero dropped drags on mobile browsers / GAS iframes
      joyEl.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          const t = e.changedTouches[0];
          if (!t) return;
          activeTouchId = t.identifier;
          joyStartTime = Date.now();
          updateJoyPos(t.clientX, t.clientY);
        },
        { passive: false }
      );
      window.addEventListener(
        "touchmove",
        (e) => {
          if (activeTouchId === null) return;
          for (const t of e.changedTouches) {
            if (t.identifier === activeTouchId) {
              e.preventDefault();
              updateJoyPos(t.clientX, t.clientY);
              break;
            }
          }
        },
        { passive: false }
      );
      window.addEventListener("touchend", (e) => {
        if (activeTouchId === null) return;
        for (const t of e.changedTouches) {
          if (t.identifier === activeTouchId) {
            finishJoy();
            break;
          }
        }
      });
      window.addEventListener("touchcancel", (e) => {
        if (activeTouchId === null) return;
        for (const t of e.changedTouches) {
          if (t.identifier === activeTouchId) {
            finishJoy();
            break;
          }
        }
      });

      // Mouse / Pointer events (window-level move/up so dragging outside the circle never drops)
      joyEl.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "touch") return;
        e.preventDefault();
        dragPointerId = e.pointerId;
        joyStartTime = Date.now();
        updateJoyPos(e.clientX, e.clientY);
      });
      window.addEventListener("pointermove", (e) => {
        if (dragPointerId !== null && e.pointerId === dragPointerId) {
          updateJoyPos(e.clientX, e.clientY);
        }
      });
      window.addEventListener("pointerup", (e) => {
        if (dragPointerId !== null && e.pointerId === dragPointerId) finishJoy();
      });
      window.addEventListener("pointercancel", (e) => {
        if (dragPointerId !== null && e.pointerId === dragPointerId) finishJoy();
      });
    }

    const updateSexBtnUI = () => {
      const btn = document.getElementById("panther-sex-btn");
      if (!btn) return;
      btn.textContent = (state.pantherSex || "m") === "f" ? "👚 女裝" : "👔 男裝";
    };
    updateSexBtnUI();
    updateCameraModeBtn();

    document.getElementById("panther-jump-btn")?.addEventListener("click", () => sceneManager.jumpPanther());
    document.getElementById("panther-cheer-btn")?.addEventListener("click", () => sceneManager.doPantherAction("cheer"));
    document.getElementById("panther-dance-btn")?.addEventListener("click", () => sceneManager.doPantherAction("dance"));
    document.getElementById("panther-interact-btn")?.addEventListener("click", () => sceneManager.interactNearest());
    document.getElementById("panther-focus-btn")?.addEventListener("click", () => {
      sceneManager.toggleCameraMode();
      updateCameraModeBtn();
    });
    document.getElementById("panther-home-btn")?.addEventListener("click", () => {
      closeIslandPanel();
      sceneManager.resetPantherToHub();
      updateCameraModeBtn();
    });
    document.getElementById("panther-sprint-btn")?.addEventListener("click", (e) => {
      const on = sceneManager.togglePantherSprint();
      e.currentTarget.classList.toggle("is-active", on);
      showToast(on ? "⚡ 南山豹衝刺模式已開啟！" : "🐾 恢復一般散步速度");
    });
    const toggleChaseCamUI = () => {
      const on = sceneManager.toggleChaseCam();
      document.getElementById("panther-chase-btn")?.classList.toggle("is-active", on);
      showToast(on ? "🏃 跑酷追逐視角：跑動時鏡頭會跟到背後" : "🎥 自由軌道視角：用滑鼠拖曳轉鏡頭");
    };
    document.getElementById("panther-chase-btn")?.addEventListener("click", toggleChaseCamUI);
    window.__toggleChaseCamUI = toggleChaseCamUI;
    document.getElementById("panther-sex-btn")?.addEventListener("click", () => {
      state.pantherSex = (state.pantherSex || "m") === "f" ? "m" : "f";
      saveState();
      updateSexBtnUI();
      sceneManager.setPantherSex(state.pantherSex);
    });

    // Pomodoro Button
    const pomoBtn = document.getElementById("pomodoro-btn");
    if (pomoBtn) {
      pomoBtn.addEventListener("click", togglePomodoro);
    }

    // BGM 解鎖與音訊／專注／生活互動事件綁定
    const unlockAudioOnce = () => {
      if (audioUnlocked) return;
      audioUnlocked = true;
      syncBgmTrack();
    };
    window.addEventListener("pointerdown", unlockAudioOnce, { once: true, passive: true });
    window.addEventListener("keydown", unlockAudioOnce, { once: true, passive: true });

    const toggleAudioEnabled = () => {
      audioUnlocked = true;
      if (!state.audio) state.audio = { enabled: true, volume: 0.38, manualTrack: "auto" };
      state.audio.enabled = !state.audio.enabled;
      saveState();
      syncBgmTrack();
      showToast(state.audio.enabled ? "🔊 已開啟海島情境背景音樂" : "🔇 已切換為靜音模式");
    };
    document.getElementById("hud-audio-btn")?.addEventListener("click", toggleAudioEnabled);
    document.getElementById("focus-mute-btn")?.addEventListener("click", toggleAudioEnabled);

    document.getElementById("focus-audio-track-btn")?.addEventListener("click", () => {
      audioUnlocked = true;
      if (!state.audio) state.audio = { enabled: true, volume: 0.38, manualTrack: "auto" };
      const cur = state.audio.manualTrack || "auto";
      const next = BGM_TRACK_ORDER[(BGM_TRACK_ORDER.indexOf(cur) + 1) % BGM_TRACK_ORDER.length];
      state.audio.manualTrack = next;
      state.audio.enabled = true;
      saveState();
      syncBgmTrack();
    });

    document.getElementById("focus-volume-slider")?.addEventListener("input", (e) => {
      audioUnlocked = true;
      if (!state.audio) state.audio = { enabled: true, volume: 0.38, manualTrack: "auto" };
      state.audio.volume = Math.max(0, Math.min(1, Number(e.target.value) / 100));
      saveState();
      syncBgmTrack();
    });

    document.getElementById("focus-start-pause-btn")?.addEventListener("click", () => {
      if (pomodoroTimerId) pauseFocusCountdown();
      else startFocusCountdown();
    });
    document.getElementById("focus-reset-btn")?.addEventListener("click", resetFocusCountdown);
    document.getElementById("focus-break-btn")?.addEventListener("click", startBreakCountdown);
    document.getElementById("focus-minimize-btn")?.addEventListener("click", minimizeFocusOverlay);

    document.querySelectorAll(".focus-dur-btn").forEach((b) => {
      b.addEventListener("click", () => {
        if (pomodoroTimerId) return;
        const mins = Number(b.dataset.mins);
        if (![15, 25, 45].includes(mins)) return;
        pomodoroPhase = "focus";
        pomodoroMins = mins;
        pomodoroTotalSecs = mins * 60;
        pomodoroSecs = pomodoroTotalSecs;
        focusDistractions = 0;
        updatePomodoroDisplay();
      });
    });

    document.getElementById("focus-node-select")?.addEventListener("change", (e) => {
      if (pomodoroTimerId) return;
      pomodoroTargetNodeId = e.target.value || null;
      updatePomodoroDisplay();
    });

    document.addEventListener("visibilitychange", () => {
      if (!pomodoroTimerId || pomodoroPhase !== "focus") return;
      if (document.hidden) {
        focusDistractions += 1;
      } else {
        updatePomodoroDisplay();
        showToast(`👀 偵測到切換離開專注畫面（累計 ${focusDistractions} 次），回來繼續衝刺！`);
      }
    });

    document.getElementById("fishing-reel-btn")?.addEventListener("click", reelFishingCatch);
    document.getElementById("fishing-again-btn")?.addEventListener("click", castFishingLine);
    document.getElementById("life-start-focus-btn")?.addEventListener("click", () => {
      stopLifeActivityUI(false);
      openFocusOverlay(true);
    });
    document.getElementById("life-stop-btn")?.addEventListener("click", () => stopLifeActivityUI(false));

    // Atmosphere Cycle Button
    const atmoBtn = document.getElementById("atmosphere-toggle-btn");
    if (atmoBtn) {
      atmoBtn.addEventListener("click", () => {
        const order = ["day", "sunset", "night"];
        const cur = (state.catStats && state.catStats.atmosphere) || "day";
        const next = order[(order.indexOf(cur) + 1) % order.length];
        state.catStats.atmosphere = next;
        saveState();
        updateAtmosphereButton();
        sceneManager.setAtmosphereMode(next);
        syncBgmTrack();
      });
    }

    // Unified Keyboard WASD / Arrows + Jump(Space) + Actions(Q/R/E/Shift)
    const normalizeKeyCode = (e) => {
      const k = (e.key || "").toLowerCase();
      if (e.code === "KeyW" || e.code === "ArrowUp" || k === "w" || k === "arrowup") return e.code.startsWith("Arrow") ? "ArrowUp" : "KeyW";
      if (e.code === "KeyS" || e.code === "ArrowDown" || k === "s" || k === "arrowdown") return e.code.startsWith("Arrow") ? "ArrowDown" : "KeyS";
      if (e.code === "KeyA" || e.code === "ArrowLeft" || k === "a" || k === "arrowleft") return e.code.startsWith("Arrow") ? "ArrowLeft" : "KeyA";
      if (e.code === "KeyD" || e.code === "ArrowRight" || k === "d" || k === "arrowright") return e.code.startsWith("Arrow") ? "ArrowRight" : "KeyD";
      if (e.code === "ShiftLeft" || e.code === "ShiftRight" || k === "shift") return "ShiftLeft";
      return e.code;
    };

    window.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const focusEl = document.getElementById("focus-overlay");
      if (focusEl && focusEl.classList.contains("is-open")) {
        if (e.key === "Escape") {
          e.preventDefault();
          minimizeFocusOverlay();
        }
        return;
      }
      if (document.querySelector(".modal-overlay.is-open")) return;

      const norm = normalizeKeyCode(e);
      const k = (e.key || "").toLowerCase();
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft"].includes(norm)) {
        if (norm !== "ShiftLeft") e.preventDefault();
        keysHeld.add(norm);
        syncPantherInput();
      } else if (e.code === "Space" || k === " ") {
        e.preventDefault();
        if (activeLifeState && activeLifeState.act.type === "fishing" && activeLifeState.phase === "bite") {
          reelFishingCatch();
          return;
        }
        sceneManager.jumpPanther();
      } else if (e.code === "KeyQ" || k === "q") {
        e.preventDefault();
        sceneManager.doPantherAction("cheer");
      } else if (e.code === "KeyR" || k === "r") {
        e.preventDefault();
        sceneManager.doPantherAction("dance");
      } else if (e.code === "KeyC" || k === "c") {
        e.preventDefault();
        if (window.__toggleChaseCamUI) window.__toggleChaseCamUI();
      } else if (e.code === "KeyE" || k === "e" || e.code === "Enter") {
        e.preventDefault();
        sceneManager.interactNearest();
      }
    });

    window.addEventListener("keyup", (e) => {
      const norm = normalizeKeyCode(e);
      if (keysHeld.has(norm) || keysHeld.has(e.code)) {
        keysHeld.delete(norm);
        keysHeld.delete(e.code);
        syncPantherInput();
      }
    });

    window.addEventListener("blur", () => {
      if (keysHeld.size > 0) {
        keysHeld.clear();
        syncPantherInput();
      }
    });

    // Top Navigation Buttons
    document.getElementById("nav-explore-btn").addEventListener("click", () => {
      closeScheduleModal();
      closeReportModal();
      closeCheckinModal();
      closeLifeModal();
      closeAdminModal();
    });
    document.getElementById("nav-schedule-btn").addEventListener("click", () => {
      closeReportModal();
      closeCheckinModal();
      closeLifeModal();
      closeAdminModal();
      openScheduleModal();
    });
    document.getElementById("nav-report-btn").addEventListener("click", () => {
      closeScheduleModal();
      closeCheckinModal();
      closeLifeModal();
      closeAdminModal();
      openReportModal();
    });

    // Modal Close Buttons
    document.getElementById("close-schedule-btn").addEventListener("click", closeScheduleModal);
    document.getElementById("close-report-btn").addEventListener("click", closeReportModal);

    // 3 組摺疊資料夾收納邏輯（功能選單／科目傳送／動作視角）
    const folders = [
      { btn: document.getElementById("menu-folder-btn"), drawer: document.getElementById("menu-folder-drawer"), closeOnItem: true },
      { btn: document.getElementById("subject-folder-btn"), drawer: document.getElementById("island-dock-bar"), closeOnItem: true },
      { btn: document.getElementById("action-folder-btn"), drawer: document.getElementById("action-folder-drawer"), closeOnItem: false },
    ].filter((f) => f.btn && f.drawer);

    const setFolderOpen = (target, open) => {
      target.drawer.classList.toggle("is-folder-open", open);
      target.btn.classList.toggle("is-open", open);
      target.btn.setAttribute("aria-expanded", open ? "true" : "false");
    };

    folders.forEach((f) => {
      f.btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const nextOpen = !f.drawer.classList.contains("is-folder-open");
        folders.forEach((other) => {
          if (other !== f) setFolderOpen(other, false);
        });
        setFolderOpen(f, nextOpen);
      });
      if (f.closeOnItem) {
        f.drawer.addEventListener("click", (e) => {
          if (e.target.closest("button")) setFolderOpen(f, false);
        });
      }
    });

    document.addEventListener("click", (e) => {
      folders.forEach((f) => {
        if (f.drawer.classList.contains("is-folder-open") && !f.drawer.contains(e.target) && !f.btn.contains(e.target)) {
          setFolderOpen(f, false);
        }
      });
    });
    document.getElementById("close-quiz-btn").addEventListener("click", closeQuizModal);
    document.getElementById("close-edit-btn").addEventListener("click", closeEditNodeModal);
    document.getElementById("close-encounter-btn").addEventListener("click", closeEncounterModal);

    // Reset Slots & Custom Review Days Controls
    const resetSlotsBtn = document.getElementById("reset-slots-btn");
    if (resetSlotsBtn) {
      resetSlotsBtn.addEventListener("click", () => {
        state.daySlots = createDefaultDaySlots();
        getActiveCalendarDays().forEach((d) => {
          state.customDayMins[d.date] = null;
        });
        saveState();
        renderScheduleGrid();
        showToast("↺ 已重設為週一二四晚自習 (18:40–20:25) 與週末雙時段預設！");
      });
    }

    document.getElementById("apply-custom-review-btn")?.addEventListener("click", () => {
      const sVal = document.getElementById("custom-review-start")?.value || "";
      const esVal = document.getElementById("custom-exam-start")?.value || "";
      const eeVal = document.getElementById("custom-exam-end")?.value || esVal;
      if (sVal && esVal && sVal >= esVal) {
        showToast("⚠️ 開始複習日必須早於段考起始日喔！");
        return;
      }
      const prev = state.customReviewConfig || {};
      state.customReviewConfig = {
        startDate: sVal,
        examStartDate: esVal,
        examEndDate: eeVal && eeVal >= esVal ? eeVal : esVal,
        excludedDates: prev.excludedDates || [],
        extraDates: prev.extraDates || []
      };
      ensureStateMatchesData();
      saveState();
      updateCountdown();
      renderGlobalHUD();
      renderScheduleGrid();
      showToast("✅ 已套用自訂複習日與段考日期範圍！");
    });

    document.getElementById("reset-custom-review-btn")?.addEventListener("click", () => {
      state.customReviewConfig = null;
      ensureStateMatchesData();
      saveState();
      updateCountdown();
      renderGlobalHUD();
      renderScheduleGrid();
      showToast("↺ 已恢復系統預設複習日與段考日程");
    });

    document.getElementById("add-extra-review-date-btn")?.addEventListener("click", () => {
      const exInp = document.getElementById("extra-review-date");
      const dStr = exInp ? exInp.value : "";
      if (!dStr) {
        showToast("⚠️ 請先在左側選擇要加排的日期！");
        return;
      }
      const prev = state.customReviewConfig || { startDate: "", examStartDate: "", examEndDate: "", excludedDates: [], extraDates: [] };
      const extras = new Set(prev.extraDates || []);
      extras.add(dStr);
      const excl = new Set(prev.excludedDates || []);
      excl.delete(dStr);
      state.customReviewConfig = { ...prev, extraDates: Array.from(extras), excludedDates: Array.from(excl) };
      ensureStateMatchesData();
      saveState();
      renderScheduleGrid();
      showToast(`✨ 已新增自訂複習日 ${dStr}！`);
    });

    // GAS Sync Controls
    const gasInp = document.getElementById("gas-url-input");
    if (gasInp) {
      gasInp.addEventListener("input", () => {
        state.gasUrl = gasInp.value.trim();
        saveState();
      });
    }
    document.getElementById("gas-sync-btn").addEventListener("click", syncToGas);
    document.getElementById("gas-load-btn").addEventListener("click", loadFromGas);
    document.getElementById("gas-teacher-btn").addEventListener("click", () => {
      const url = (state.gasUrl || "").trim();
      if (!url) {
        showToast("⚠️ 尚未設定 GAS Web App 網址！");
        return;
      }
      window.open(`${url}${url.includes("?") ? "&" : "?"}page=teacher`, "_blank");
    });

    // Schedule Actions
    document.getElementById("sched-balance-btn").addEventListener("click", () => autoGenerateSchedule("balanced"));
    document.getElementById("sched-weak-btn").addEventListener("click", () => autoGenerateSchedule("weakFirst"));
    document.getElementById("sched-default-btn").addEventListener("click", () => autoGenerateSchedule("default"));

    // Edit Node Save
    document.getElementById("save-edit-node-btn").addEventListener("click", () => {
      if (!activeEditCtx) return;
      const { islandId, nodeId } = activeEditCtx;
      const tVal = document.getElementById("edit-node-title").value.trim();
      const sVal = document.getElementById("edit-node-sections").value.trim();
      state.nodeProgress[nodeId].customTitle = tVal;
      state.nodeProgress[nodeId].customSections = sVal;
      saveState();
      closeEditNodeModal();
      renderIslandPanel(findIsland(islandId), nodeId);
      showToast("✏️ 已更新據點內容！");
    });

    // Report Inputs & Actions
    ["stu-class", "stu-seat", "stu-name"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => {
        state.student.className = document.getElementById("stu-class").value;
        state.student.seatNo = document.getElementById("stu-seat").value;
        state.student.name = document.getElementById("stu-name").value;
        saveState();
      });
    });

    document.getElementById("print-report-btn").addEventListener("click", buildPrintableReportAndPrint);
    document.getElementById("export-json-btn").addEventListener("click", exportJsonBackup);
    document.getElementById("import-json-input").addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        importJsonBackup(e.target.files[0]);
      }
    });
    document.getElementById("reset-all-btn").addEventListener("click", () => {
      if (confirm("確定要重設所有複習造島紀錄與排程嗎？此動作無法復原。")) {
        localStorage.removeItem(STORAGE_KEY);
        state = createDefaultState();
        renderGlobalHUD();
        renderReportContent();
        if (activeIslandId) renderIslandPanel(findIsland(activeIslandId));
        showToast("🗑️ 已重設所有進度");
      }
    });
  }

  let isBootstrapped = false;
  function safeBootstrap() {
    if (isBootstrapped) return;
    if (!document.getElementById("canvas-container")) return;
    isBootstrapped = true;
    bootstrap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeBootstrap);
    window.addEventListener("load", safeBootstrap);
    setTimeout(safeBootstrap, 250);
  } else {
    safeBootstrap();
  }
})();
