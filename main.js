(() => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const clearBtn = document.getElementById("clearAnimalBtn");
  const imageInput = document.getElementById("imageInput");
  const preview = document.getElementById("preview");
  const imageHint = document.getElementById("imageHint");
  const labelContainer = document.getElementById("label-container");
  const resultMain = document.getElementById("resultMain");
  const statusEl = document.getElementById("statusAnimal");
  const timeInfo = document.getElementById("timeInfoAnimal");

  if (
    !analyzeBtn ||
    !clearBtn ||
    !imageInput ||
    !preview ||
    !imageHint ||
    !labelContainer ||
    !resultMain ||
    !statusEl ||
    !timeInfo
  ) {
    return;
  }

  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/gcEeK1LAZK/";

  let model;
  let currentObjectUrl = null;
  let imageReady = false;

  function setStatus(key) {
    const lang = localStorage.getItem('lang') || 'ko';
    statusEl.textContent = translations[lang][key];
  }

  function setTime() {
    const now = new Date();
    const lang = localStorage.getItem('lang') || 'ko';
    timeInfo.textContent = `${translations[lang].animal_update_time}: ` + now.toLocaleString(lang === 'ko' ? "ko-KR" : "en-US");
  }

  function renderBars(prediction) {
    labelContainer.innerHTML = "";

    prediction.forEach((p) => {
      const row = document.createElement("div");
      row.className = "bar-row";

      const label = document.createElement("div");
      label.className = "bar-label";
      label.textContent = p.className;

      const track = document.createElement("div");
      track.className = "bar-track";

      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = `${Math.round(p.probability * 100)}%`;
      track.appendChild(fill);

      const val = document.createElement("div");
      val.className = "bar-val";
      val.textContent = `${(p.probability * 100).toFixed(1)}%`;

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(val);
      labelContainer.appendChild(row);
    });
  }

  function resetPrediction() {
    const lang = localStorage.getItem('lang') || 'ko';
    resultMain.textContent = translations[lang].animal_wait;
    labelContainer.innerHTML = "";
    setStatus("animal_status_wait");
    timeInfo.textContent = `${translations[lang].animal_update_time}: -`;
  }

  async function ensureModel() {
    if (model) return model;
    setStatus("animal_status_loading");
    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    return model;
  }

  async function predictImage() {
    if (!imageReady) {
      setStatus("animal_status_fail"); // Using a generic fail key, can be more specific
      return;
    }
    try {
      await ensureModel();
      setStatus("animal_status_analyzing");

      const prediction = await model.predict(preview);
      const sorted = [...prediction].sort((a, b) => b.probability - a.probability);
      const top = sorted[0];

      resultMain.textContent = `${top.className} (${(top.probability * 100).toFixed(1)}%)`;
      renderBars(sorted);
      setTime();
      setStatus("animal_status_done");
    } catch (err) {
      console.error(err);
      const lang = localStorage.getItem('lang') || 'ko';
      const message =
        err && String(err).includes("fetch")
          ? "Model loading failed"
          : "Image analysis failed";
      resultMain.textContent = message;
      setStatus("animal_status_fail");
    }
  }

  function clearImage() {
    if (currentObjectUrl) {
      window.URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    imageInput.value = "";
    preview.hidden = true;
    preview.src = "";
    imageHint.hidden = false;
    imageReady = false;
    analyzeBtn.disabled = true;
    clearBtn.disabled = true;
    resetPrediction();
  }

  imageInput.addEventListener("change", () => {
    const file = imageInput.files && imageInput.files[0];
    if (!file) {
      clearImage();
      return;
    }

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }

    currentObjectUrl = window.URL.createObjectURL(file);
    preview.src = currentObjectUrl;
    preview.hidden = false;
    imageHint.hidden = true;
    analyzeBtn.disabled = false;
    clearBtn.disabled = false;
    imageReady = false;

    preview.onload = () => {
      imageReady = true;
      resetPrediction();
    };
  });

  analyzeBtn.addEventListener("click", () => {
    predictImage();
  });

  clearBtn.addEventListener("click", () => {
    clearImage();
  });

  analyzeBtn.disabled = true;
  clearBtn.disabled = true;
  resetPrediction();
})();
