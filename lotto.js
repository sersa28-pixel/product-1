const html = document.documentElement;

const themeToggle = document.getElementById("themeToggle");
const pickBtn = document.getElementById("pickBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

const results = document.getElementById("results");
const statusEl = document.getElementById("status");
const timeInfo = document.getElementById("timeInfo");

let lastSets = null;

function setThemeToggleLabel() {
  const isDark = html.dataset.theme === "dark";
  const lang = localStorage.getItem('lang') || 'ko';
  themeToggle.textContent = isDark ? translations[lang].theme_dark : translations[lang].theme_light;
}

function pickOneSet(){
  const s = new Set();
  while(s.size < 6) s.add(Math.floor(Math.random() * 45) + 1);
  return [...s].sort((a,b)=>a-b);
}

function pickFiveSets(){
  const out = [];
  for(let i=0;i<5;i++) out.push(pickOneSet());
  return out;
}

function ballBg(n){
  if(n<=10) return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.65), rgba(255,255,255,0) 36%), linear-gradient(180deg,#ffd84a,#ff8a00)";
  if(n<=20) return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.65), rgba(255,255,255,0) 36%), linear-gradient(180deg,#46d6ff,#2f6bff)";
  if(n<=30) return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.65), rgba(255,255,255,0) 36%), linear-gradient(180deg,#ff6b6b,#e7006a)";
  if(n<=40) return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.55), rgba(255,255,255,0) 36%), linear-gradient(180deg,#cfd3da,#6f7786)";
  return "radial-gradient(circle at 30% 28%, rgba(255,255,255,.65), rgba(255,255,255,0) 36%), linear-gradient(180deg,#67ffb5,#17b86b)";
}

function render(sets){
  results.innerHTML = "";
  const lang = localStorage.getItem('lang') || 'ko';
  sets.forEach((nums, idx) => {
    const row = document.createElement("div");
    row.className = "set";

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = `${idx+1}${translations[lang].lotto_game}`;

    const balls = document.createElement("div");
    balls.className = "balls";

    nums.forEach(n => {
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

function updateMeta(){
  const now = new Date();
  const lang = localStorage.getItem('lang') || 'ko';
  timeInfo.textContent = `${translations[lang].lotto_gen_time}: ` + now.toLocaleString(lang === 'ko' ? "ko-KR" : "en-US");
  statusEl.textContent = translations[lang].lotto_status_done;
}

async function copyToClipboard(text){
  if(navigator.clipboard && window.isSecureContext){
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
  if(!lastSets) return;
  const lang = localStorage.getItem('lang') || 'ko';
  const text = lastSets.map((s,i)=>`${i+1}${translations[lang].lotto_game}: ${s.join(", ")}`).join("\n");
  try{
    await copyToClipboard(text);
    statusEl.textContent = translations[lang].lotto_status_copy_done;
  }catch(e){
    statusEl.textContent = translations[lang].lotto_status_copy_fail;
    alert("복사에 실패했습니다. 아래 텍스트를 직접 복사해 주세요:\n\n" + text);
  }
});

clearBtn.addEventListener("click", () => {
  lastSets = null;
  const lang = localStorage.getItem('lang') || 'ko';
  results.innerHTML = `
    <div class="set">
      <div class="label" data-lang="lotto_guide">${translations[lang].lotto_guide}</div>
      <div class="balls" style="color: var(--muted);" data-lang="lotto_no_number">${translations[lang].lotto_no_number}</div>
    </div>
  `;
  copyBtn.disabled = true;
  statusEl.textContent = translations[lang].lotto_status_wait;
  timeInfo.textContent = `${translations[lang].lotto_gen_time}: -`;
});

themeToggle.addEventListener("click", () => {
  const isDark = html.dataset.theme === "dark";
  html.dataset.theme = isDark ? "light" : "dark";
  setThemeToggleLabel();
});

setThemeToggleLabel();
