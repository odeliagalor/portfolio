// Simple page switching: each <section class="view"> is a "page".
// The URL hash (#branding, #about, ...) decides which one is visible,
// so the back button and direct links work.

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

  // used by the CSS to switch the background on the home page
  document.body.dataset.view = id;

  // underline the current nav item
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === "#" + id) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  window.scrollTo(0, 0);

  // always start a project from its first image
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
    counter.textContent = index + 1 + " / " + slides.length;
  }

  project._resetSlider = () => go(0);

  project.querySelector(".prev").addEventListener("click", () => go(index - 1));
  project.querySelector(".next").addEventListener("click", () => go(index + 1));
  project.querySelector(".slider").addEventListener("click", () => go(index + 1));

  // arrow keys
  document.addEventListener("keydown", (e) => {
    if (!project.classList.contains("active")) return;
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  });

  // swipe on touch screens
  let startX = null;
  project.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  project.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
    startX = null;
  });
});

// ---------- Motion Design additions (added on top of the code above) ----------

// 1. Clicking a video in the Motion Design grid opens the project on THAT video
(function () {
  const project = document.getElementById("motion-project");
  const grid = document.getElementById("motion-design");
  if (!project || !grid || !project._resetSlider) return;

  let pending = 0;
  const originalReset = project._resetSlider;

  // runs every time the project opens: start from the first video, then jump to the chosen one
  project._resetSlider = () => {
    originalReset();
    const next = project.querySelector(".next");
    for (let i = 0; i < pending; i++) next.click();
    pending = 0;
  };

  grid.querySelectorAll(".work-item").forEach((item, i) => {
    item.addEventListener("click", () => { pending = i; });
  });
})();

// 2. Give every project video its real aspect ratio, so the player fits it exactly
document.querySelectorAll("video.slide").forEach((video) => {
  const setRatio = () => {
    if (video.videoWidth && video.videoHeight) {
      video.style.setProperty("--ratio", String(video.videoWidth / video.videoHeight));
    }
  };
  if (video.readyState >= 1) setRatio();
  video.addEventListener("loadedmetadata", setRatio);
});

// 3. Stop a video when you move to another one or leave the project
document.querySelectorAll("video.slide").forEach((video) => {
  new MutationObserver(() => {
    if (!video.classList.contains("active")) video.pause();
  }).observe(video, { attributes: true, attributeFilter: ["class"] });
});
window.addEventListener("hashchange", () => {
  document.querySelectorAll(".view:not(.active) video.slide").forEach((v) => v.pause());
});
