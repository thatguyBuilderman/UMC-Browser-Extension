(() => {
  const pending = new Map();
  let nextId = 0;

  window.addEventListener("message", (e) => {
    const d = e.data;
    if (e.source !== window || !d || d.__meeland !== "res") return;
    const p = pending.get(d.id);
    if (!p) return;
    pending.delete(d.id);
    d.error ? p.reject(new Error(d.error)) : p.resolve(d.result);
  });

  const call = (type) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      window.postMessage({ __meeland: "req", id, type }, location.origin);
    });

  const assetBase = () => document.documentElement.dataset.meelandAssets || "";

  window.meelandClient = Object.freeze({
    getClipboardText: () => call("get-clipboard-text"),
    getBackgroundVideoUrl: () => call("get-background-video-url"),
    assetUrl: (path) => assetBase() + path,
  });

  // What the old Electron main.js injected: filename -> URL
  const ASSET_FILES = [
    "LaunchLogo.png",
    "meeland.png",
    "Midnight.png",
    "BackgroundFirst.png",
    "background.webp",
  ];
  const assets = {};
  for (const f of ASSET_FILES) {
    Object.defineProperty(assets, f, { enumerable: true, get: () => assetBase() + f });
  }
  window.__MEELAND_ASSETS__ = assets;

  Object.defineProperty(window, "__MEELAND_FONT_DATA__", {
    get: () => assetBase() + "LilitaOne-Regular.ttf",
  });

  console.log("Meeland Client shim loaded.");
})();