(() => {
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const webcamContainer = document.getElementById("webcam-container");
  const labelContainer = document.getElementById("label-container");
  const resultMain = document.getElementById("resultMain");
  const statusEl = document.getElementById("status");
  const timeInfo = document.getElementById("timeInfo");

  const URL = "https://teachablemachine.withgoogle.com/models/gcEeK1LAZK/";

  let model;
  let webcam;
  let maxPredictions = 0;
  let animationId = null;
  let running = false;

  function setThemeToggleLabel() {
    const isDark = html.dataset.theme === "dark";
    themeToggle.textContent = isDark ? "🌙 다크모드" : "☀️ 화이트모드";
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function setTime() {
    const now = new Date();
    timeInfo.textContent = "업데이트: " + now.toLocaleString("ko-KR");
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

  async function init() {
    if (running) return;
    try {
      setStatus("상태: 모델 로딩 중...");

      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      model = await tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();

      const flip = true;
      webcam = new tmImage.Webcam(320, 320, flip);
      await webcam.setup();
      await webcam.play();

      webcamContainer.innerHTML = "";
      webcamContainer.appendChild(webcam.canvas);

      running = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;

      setStatus("상태: 분석 중 ✅");
      loop();
    } catch (err) {
      console.error(err);
      const message =
        err && String(err).includes("fetch")
          ? "모델 로딩에 실패했어요"
          : "카메라 권한을 확인해주세요";
      setStatus("상태: 시작 실패 ❌");
      resultMain.textContent = message;
    }
  }

  function stop() {
    if (!running) return;
    running = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;

    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (webcam) {
      webcam.stop();
    }

    setStatus("상태: 일시정지");
  }

  async function loop() {
    if (!running) return;
    webcam.update();
    await predict();
    animationId = window.requestAnimationFrame(loop);
  }

  async function predict() {
    const prediction = await model.predict(webcam.canvas);
    const sorted = [...prediction].sort((a, b) => b.probability - a.probability);
    const top = sorted[0];

    resultMain.textContent = `${top.className} (${(top.probability * 100).toFixed(1)}%)`;
    renderBars(sorted);
    setTime();
  }

  startBtn.addEventListener("click", init);
  stopBtn.addEventListener("click", stop);

  themeToggle.addEventListener("click", () => {
    const isDark = html.dataset.theme === "dark";
    html.dataset.theme = isDark ? "light" : "dark";
    setThemeToggleLabel();
  });

  setThemeToggleLabel();
})();
