(() => {
  const html = document.documentElement;

  const themeToggle = document.getElementById("themeToggle");
  const langToggle = document.getElementById("langToggle");
  const pickBtn = document.getElementById("pickBtn");
  const copyBtn = document.getElementById("copyBtn");
  const clearBtn = document.getElementById("clearBtn");

  const results = document.getElementById("results");
  const statusEl = document.getElementById("status");
  const timeInfo = document.getElementById("timeInfo");

  let lastSets = null;
  let currentLang = localStorage.getItem("lang") || "ko";

  const strings = {
    ko: {
      title: "주희의 로또 번호 추천기",
      subtitle: "버튼을 누르면 1~45 중 중복 없이 6개씩, 5게임이 한 번에 생성됩니다.",
      pick: "🎲 5게임 생성",
      copyAll: "📋 전체 복사",
      reset: "🧼 초기화",
      comments: "댓글",
      statusIdle: "상태: 대기",
      statusDone: "상태: 생성 완료 ✅",
      statusCopied: "상태: 복사 완료 📋✅",
      statusCopyFail: "상태: 복사 실패 ❌",
      timePrefix: "생성 시간: ",
      emptyLabel: "안내",
      emptyText: "아직 생성된 번호가 없습니다.",
      setLabel: (i) => `${i}번 게임`,
      copyLine: (i, nums) => `${i}번: ${nums.join(", ")}`,
      alertCopyFail: "복사에 실패했습니다. 아래 텍스트를 직접 복사해 주세요:\n\n",
      themeDark: "🌙 다크모드",
      themeLight: "☀️ 화이트모드",
      langToggle: "🇺🇸 English",
      locale: "ko-KR",
    },
    en: {
      title: "Joohee's Lotto Number Picker",
      subtitle: "Click the button to generate 5 games of 6 unique numbers from 1–45.",
      pick: "🎲 Generate 5 games",
      copyAll: "📋 Copy all",
      reset: "🧼 Reset",
      comments: "Comments",
      statusIdle: "Status: Idle",
      statusDone: "Status: Generated ✅",
      statusCopied: "Status: Copied 📋✅",
      statusCopyFail: "Status: Copy failed ❌",
      timePrefix: "Generated at: ",
      emptyLabel: "Info",
      emptyText: "No numbers generated yet.",
      setLabel: (i) => `Game ${i}`,
      copyLine: (i, nums) => `Game ${i}: ${nums.join(", ")}`,
      alertCopyFail: "Copy failed. Please copy the text below:\n\n",
      themeDark: "🌙 Dark mode",
      themeLight: "☀️ Light mode",
      langToggle: "🇰🇷 한국어",
      locale: "en-US",
    },
  };

  const i18nTargets = Array.from(document.querySelectorAll("[data-i18n]"));

  function applyTranslations() {
    const t = strings[currentLang];
    html.lang = currentLang;
    i18nTargets.forEach((el) => {
      const key = el.dataset.i18n;
      if (t[key]) el.textContent = t[key];
    });
    setThemeToggleLabel();
    langToggle.textContent = t.langToggle;
    if (!lastSets) renderEmptyState();
    statusEl.textContent = lastSets ? t.statusDone : t.statusIdle;
    if (!lastSets) timeInfo.textContent = t.timePrefix + "-";
  }

  function setThemeToggleLabel() {
    const t = strings[currentLang];
    const isDark = html.dataset.theme === "dark";
    themeToggle.textContent = isDark ? t.themeDark : t.themeLight;
  }

  function renderEmptyState() {
    const t = strings[currentLang];
    results.innerHTML = `
      <div class="set">
        <div class="label">${t.emptyLabel}</div>
        <div class="balls" style="color: var(--muted);">${t.emptyText}</div>
      </div>
    `;
  }

  function pickOneSet() {
    const s = new Set();
    while (s.size < 6) s.add(Math.floor(Math.random() * 45) + 1);
    return [...s].sort((a, b) => a - b);
  }

  function pickFiveSets() {
    const out = [];
    for (let i = 0; i < 5; i++) out.push(pickOneSet());
    return out;
  }

  function ballBg(n) {
    if (n <= 10) {
      return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.65), rgba(255,255,255,0) 36%), linear-gradient(180deg,#ffd84a,#ff8a00)";
    }
    if (n <= 20) {
      return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.65), rgba(255,255,255,0) 36%), linear-gradient(180deg,#46d6ff,#2f6bff)";
    }
    if (n <= 30) {
      return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.65), rgba(255,255,255,0) 36%), linear-gradient(180deg,#ff6b6b,#e7006a)";
    }
    if (n <= 40) {
      return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.55), rgba(255,255,255,0) 36%), linear-gradient(180deg,#cfd3da,#6f7786)";
    }
    return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.65), rgba(255,255,255,0) 36%), linear-gradient(180deg,#67ffb5,#17b86b)";
  }

  function render(sets) {
    results.innerHTML = "";
    sets.forEach((nums, idx) => {
      const t = strings[currentLang];
      const row = document.createElement("div");
      row.className = "set";

      const label = document.createElement("div");
      label.className = "label";
      label.textContent = t.setLabel(idx + 1);

      const balls = document.createElement("div");
      balls.className = "balls";

      nums.forEach((n) => {
        const b = document.createElement("div");
        b.className = "ball";
        b.textContent = n;
        b.style.background = ballBg(n);
        balls.appendChild(b);
      });

      row.appendChild(label);
      row.appendChild(balls);
      results.appendChild(row);
    });
  }

  function updateMeta() {
    const t = strings[currentLang];
    const now = new Date();
    timeInfo.textContent = t.timePrefix + now.toLocaleString(t.locale);
    statusEl.textContent = t.statusDone;
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }

  pickBtn.addEventListener("click", () => {
    lastSets = pickFiveSets();
    render(lastSets);
    updateMeta();
    copyBtn.disabled = false;
  });

  copyBtn.addEventListener("click", async () => {
    if (!lastSets) return;
    const t = strings[currentLang];
    const text = lastSets.map((s, i) => t.copyLine(i + 1, s)).join("\n");
    try {
      await copyToClipboard(text);
      statusEl.textContent = t.statusCopied;
    } catch (e) {
      statusEl.textContent = t.statusCopyFail;
      alert(t.alertCopyFail + text);
    }
  });

  clearBtn.addEventListener("click", () => {
    lastSets = null;
    renderEmptyState();
    copyBtn.disabled = true;
    statusEl.textContent = strings[currentLang].statusIdle;
    timeInfo.textContent = strings[currentLang].timePrefix + "-";
  });

  themeToggle.addEventListener("click", () => {
    const isDark = html.dataset.theme === "dark";
    html.dataset.theme = isDark ? "light" : "dark";
    setThemeToggleLabel();
  });

  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "ko" ? "en" : "ko";
    localStorage.setItem("lang", currentLang);
    applyTranslations();
  });

  applyTranslations();
})();
