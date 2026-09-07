(() => {
  "use strict";

  const CONFIG = Object.freeze({
    storage: {
      usedCards: "metin2-okey-used-cards-v3",
      completedGames: "metin2-okey-completed-games-v3"
    },

    // Buraya gerçek kanal adresini yazacağız.
    youtubeChannelUrl: "https://www.youtube.com/@ELGRISOTV?sub_confirmation=1",

    event: {
      start: "2026-09-08T00:00:00+02:00",
      dropEnd: "2026-09-30T23:59:00+02:00",
      eventEnd: "2026-10-01T23:59:00+02:00"
    }
  });

  const CARD_GROUPS = Object.freeze([
    { key: "red", name: "Kırmızı", color: "#cf251f" },
    { key: "yellow", name: "Sarı", color: "#d2b321" },
    { key: "blue", name: "Mavi", color: "#1680bd" }
  ]);

  const CARD_VALUES = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8]);

  const cards = CARD_GROUPS.flatMap(group =>
    CARD_VALUES.map(value => ({
      id: `${group.key}-${value}`,
      value,
      ...group
    }))
  );

  const elements = {
    cardBoard: document.getElementById("cardBoard"),
    progressText: document.getElementById("progressText"),
    progressBar: document.getElementById("progressBar"),
    progressFill: document.getElementById("progressFill"),
    saveState: document.getElementById("saveState"),
    resetButton: document.getElementById("resetButton"),
    newGameButton: document.getElementById("newGameButton"),
    completedGames: document.getElementById("completedGames"),
    resetCompletedButton: document.getElementById("resetCompletedButton"),
    rulesButton: document.getElementById("rulesButton"),
    rulesDialog: document.getElementById("rulesDialog"),
    dialogClose: document.getElementById("dialogClose"),
    dialogOkay: document.getElementById("dialogOkay"),
    youtubeButton: document.getElementById("youtubeButton"),
    countdownBadgeLabel: document.getElementById("countdownBadgeLabel"),
    countdownBadgeTime: document.getElementById("countdownBadgeTime"),

  };

  const state = {
    usedCards: loadUsedCards(),
    completedGames: loadCompletedGames(),
    saveTimer: null,
    countdownTimer: null
  };

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
      showSavedFeedback();
      return true;
    } catch {
      showStorageError();
      return false;
    }
  }

  function loadUsedCards() {
    try {
      const raw = safeGet(CONFIG.storage.usedCards);
      const parsed = raw ? JSON.parse(raw) : [];
      const validIds = new Set(cards.map(card => card.id));

      return new Set(
        Array.isArray(parsed)
          ? parsed.filter(id => validIds.has(id))
          : []
      );
    } catch {
      return new Set();
    }
  }

  function loadCompletedGames() {
    const raw = safeGet(CONFIG.storage.completedGames);
    const value = Number.parseInt(raw ?? "0", 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  function persistCards() {
    safeSet(CONFIG.storage.usedCards, JSON.stringify([...state.usedCards]));
  }

  function persistCompletedGames() {
    safeSet(CONFIG.storage.completedGames, String(state.completedGames));
  }

  function showSavedFeedback() {
    elements.saveState.innerHTML = '<span class="save-dot"></span>Kaydedildi';
    window.clearTimeout(state.saveTimer);

    state.saveTimer = window.setTimeout(() => {
      elements.saveState.innerHTML = '<span class="save-dot"></span>Otomatik kayıt aktif';
    }, 1100);
  }

  function showStorageError() {
    elements.saveState.innerHTML = '<span class="save-dot"></span>Kayıt kullanılamıyor';
  }

  function renderCards() {
    const fragment = document.createDocumentFragment();

    cards.forEach(card => {
      const button = document.createElement("button");
      const isUsed = state.usedCards.has(card.id);

      button.type = "button";
      button.className = `okey-card${isUsed ? " used" : ""}`;
      button.style.setProperty("--card-color", card.color);
      button.dataset.cardId = card.id;
      button.setAttribute("aria-pressed", String(isUsed));
      button.setAttribute(
        "aria-label",
        `${card.name} ${card.value} kartı${isUsed ? ", kullanıldı" : ", elde"}`
      );

      button.innerHTML = `
        <span class="card-number">${card.value}</span>
        <span class="used-mark" aria-hidden="true">KULLANILDI</span>
      `;

      fragment.appendChild(button);
    });

    elements.cardBoard.replaceChildren(fragment);
    updateProgress();
  }

  function toggleCard(cardId) {
    if (state.usedCards.has(cardId)) {
      state.usedCards.delete(cardId);
    } else {
      state.usedCards.add(cardId);
    }

    persistCards();
    renderCards();
  }

  function updateProgress() {
    const total = cards.length;
    const remaining = total - state.usedCards.size;
    const percentage = (remaining / total) * 100;

    elements.progressText.textContent = `${remaining} / ${total}`;
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressBar.setAttribute("aria-valuenow", String(remaining));
  }

  function renderCompletedGames() {
    elements.completedGames.textContent = String(state.completedGames);
  }

  function resetCards() {
    if (state.usedCards.size === 0) return true;

    state.usedCards.clear();
    persistCards();
    renderCards();
    return true;
  }

  function startNewGame() {
    state.completedGames += 1;
    state.usedCards.clear();

    persistCompletedGames();
    persistCards();

    renderCompletedGames();
    renderCards();
  }

  function resetCompletedGames() {
    if (state.completedGames === 0) return;

    state.completedGames = 0;
    persistCompletedGames();
    renderCompletedGames();
  }

  function openRules() {
    if (typeof elements.rulesDialog.showModal === "function") {
      elements.rulesDialog.showModal();
    } else {
      elements.rulesDialog.setAttribute("open", "");
    }
  }

  function closeRules() {
    if (typeof elements.rulesDialog.close === "function") {
      elements.rulesDialog.close();
    } else {
      elements.rulesDialog.removeAttribute("open");
    }
  }

  function getEventPhase(now) {
    const start = new Date(CONFIG.event.start);
    const dropEnd = new Date(CONFIG.event.dropEnd);
    const eventEnd = new Date(CONFIG.event.eventEnd);

    if (now < start) {
      return {
        type: "before",
        badge: "Henüz başlamadı",
        label: "Etkinliğin başlamasına kalan süre",
        target: start,
        targetLabel: "Başlangıç"
      };
    }

    if (now <= dropEnd) {
      return {
        type: "active",
        badge: "Etkinlik aktif",
        label: "Kart dropunun bitmesine kalan süre",
        target: dropEnd,
        targetLabel: "Drop sonu"
      };
    }

    if (now <= eventEnd) {
      return {
        type: "drop-ended",
        badge: "Drop sona erdi",
        label: "Etkinliğin tamamen bitmesine kalan süre",
        target: eventEnd,
        targetLabel: "Etkinlik sonu"
      };
    }

    return {
      type: "finished",
      badge: "Tamamlandı",
      label: "Etkinlik sona erdi",
      target: null,
      targetLabel: ""
    };
  }

  function formatTargetDate(date) {
    return new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function splitDuration(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function renderCountdown() {
    const now = new Date();
    const phase = getEventPhase(now);

    if (phase.type === "finished") {
      elements.countdownBadgeLabel.textContent = "Etkinlik";
      elements.countdownBadgeTime.textContent = "Sona erdi";
      return;
    }

    const remaining = splitDuration(phase.target.getTime() - now.getTime());

    elements.countdownBadgeLabel.textContent =
      phase.type === "before"
        ? "Başlangıca"
        : phase.type === "active"
          ? "Drop sonuna"
          : "Etkinlik sonuna";

    elements.countdownBadgeTime.textContent =
      `${remaining.days}g ${pad(remaining.hours)}s ${pad(remaining.minutes)}d`;
  }

  function configureYouTubeButton() {
    elements.youtubeButton.href = CONFIG.youtubeChannelUrl;
  }

  function bindEvents() {
    elements.cardBoard.addEventListener("click", event => {
      const cardButton = event.target.closest(".okey-card");
      if (!cardButton) return;
      toggleCard(cardButton.dataset.cardId);
    });

    elements.resetButton.addEventListener("click", () => resetCards());
    elements.newGameButton.addEventListener("click", startNewGame);
    elements.resetCompletedButton.addEventListener("click", resetCompletedGames);

    elements.rulesButton.addEventListener("click", openRules);
    elements.dialogClose.addEventListener("click", closeRules);
    elements.dialogOkay.addEventListener("click", closeRules);

    elements.rulesDialog.addEventListener("click", event => {
      if (event.target === elements.rulesDialog) closeRules();
    });
  }

  function initCountdown() {
    renderCountdown();
    state.countdownTimer = window.setInterval(renderCountdown, 1000);
  }

  function init() {
    configureYouTubeButton();
    bindEvents();
    renderCards();
    renderCompletedGames();
    initCountdown();
  }

  init();
})();
