(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".sidebar-collapse-toggle");
  if (!toggle) return;

  const storageKey = "visionlab-sidebar-collapsed";
  const label = collapsed => collapsed ? "展开侧边栏" : "收起侧边栏";
  function apply(collapsed, persist = false) {
    root.classList.toggle("sidebar-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", label(collapsed));
    toggle.title = label(collapsed);
    toggle.firstElementChild.textContent = collapsed ? "›" : "‹";
    if (persist) {
      try {
        localStorage.setItem(storageKey, String(collapsed));
      } catch {}
    }
  }

  let collapsed = false;
  try {
    collapsed = localStorage.getItem(storageKey) === "true";
  } catch {}
  apply(collapsed);
  toggle.addEventListener("click", () => {
    apply(!root.classList.contains("sidebar-collapsed"), true);
  });
})();