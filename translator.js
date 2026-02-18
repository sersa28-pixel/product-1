const translations = languages;
let currentLang = localStorage.getItem('lang') || 'ko';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  updateTexts();
}

function updateTexts() {
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.getAttribute('data-lang');
    if (translations[currentLang] && translations[currentLang][key]) {
      if (el.tagName === 'INPUT' && el.type === 'file') {
        // We can't change the value of a file input, but we could change a placeholder if it had one.
      } else if (el.tagName === 'INPUT' || el.tagName === 'BUTTON') {
        if(el.type === 'submit' || el.type === 'button') {
          el.value = translations[currentLang][key];
        } else {
          el.placeholder = translations[currentLang][key];
        }
      } else {
        el.textContent = translations[currentLang][key];
      }
    }
  });
  // Special cases for dynamic content
  updateDynamicTexts(currentLang);
}

function updateDynamicTexts(lang) {
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const isDark = document.documentElement.dataset.theme === "dark";
    themeToggle.textContent = isDark ? translations[lang].theme_dark : translations[lang].theme_light;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const langKoBtn = document.getElementById('langKo');
  const langEnBtn = document.getElementById('langEn');

  if(langKoBtn) {
    langKoBtn.addEventListener('click', () => setLanguage('ko'));
  }
  if(langEnBtn) {
    langEnBtn.addEventListener('click', () => setLanguage('en'));
  }

  updateTexts();
});
