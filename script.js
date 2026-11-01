// Simple page switching: each <section class="view"> is a "page".
const views = Array.from(document.querySelectorAll(".view"));
const viewIds = views.map((v) => v.id);
const navLinks = document.querySelectorAll(".site-nav a");

function showView() {
  let id = window.location.hash.slice(1);
  if (!viewIds.includes(id)) id = "home";

  views.forEach((view) => {
    view.classList.toggle("active", view.id === id);
    if (view.id === id) document.title = view.dataset.title;
  });

  document.body.dataset.view = id;

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === "#" + id) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  window.scrollTo(0, 0);

  const active = views.find((v) => v.id === id);
  if (active && active._resetSlider) active._resetSlider();
}

window.addEventListener("hashchange", showView);
showView();

// ---------- Project sliders ----------
document.querySelectorAll(".project").forEach((project) => {
  const slides = Array.from(project.querySelectorAll(".slide"));
  const counter = project.querySelector(".slider-count");
  let index = 0;

  function go(n) {
    index = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    if (counter) counter.textContent = index + 1 + " / " + slides.length;
  }

  project._resetSlider = () => go(0);

  const prevBtn = project.querySelector(".prev");
  const nextBtn = project.querySelector(".next");
  const sliderEl = project.querySelector(".slider");

  if (prevBtn) prevBtn.addEventListener("click", () => go(index - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => go(index + 1));
  if (sliderEl) sliderEl.addEventListener("click", () => go(index + 1));

  document.addEventListener("keydown", (e) => {
    if (!project.classList.contains("active")) return;
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  });

  let startX = null;
  project.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  project.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
    startX = null;
  });
});

// ---------- Motion Design additions ----------
(function () {
  const project = document.getElementById("motion-project");
  const grid = document.getElementById("motion-design");
  if (!project || !grid || !project._resetSlider) return;

  let pending = 0;
  const originalReset = project._resetSlider;

  project._resetSlider = () => {
    originalReset();
    const next = project.querySelector(".next");
    for (let i = 0; i < pending; i++) if (next) next.click();
    pending = 0;
  };

  grid.querySelectorAll(".work-item").forEach((item, i) => {
    item.addEventListener("click", () => { pending = i; });
  });
})();

document.querySelectorAll("video.slide").forEach((video) => {
  const setRatio = () => {
    if (video.videoWidth && video.videoHeight) {
      video.style.setProperty("--ratio", String(video.videoWidth / video.videoHeight));
    }
  };
  if (video.readyState >= 1) setRatio();
  video.addEventListener("loadedmetadata", setRatio);
});

document.querySelectorAll("video.slide").forEach((video) => {
  new MutationObserver(() => {
    if (!video.classList.contains("active")) video.pause();
  }).observe(video, { attributes: true, attributeFilter: ["class"] });
});

window.addEventListener("hashchange", () => {
  document.querySelectorAll(".view:not(.active) video.slide").forEach((v) => v.pause());
});
