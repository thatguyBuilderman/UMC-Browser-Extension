// Runs in the extension's isolated world, where chrome.* APIs are available.
// Answers requests from page-shim.js (replaces the ipcMain handlers in main.js).

// TODO: make this match what your main.js "get-background-video-url" handler returned.
const DEFAULT_BACKGROUND_VIDEO = chrome.runtime.getURL("assets/background.mp4");

document.documentElement.dataset.meelandAssets = chrome.runtime.getURL("assets/");

async function getBackgroundVideoUrl() {
  try {
    const { backgroundVideoUrl } = await chrome.storage.local.get("backgroundVideoUrl");
    return backgroundVideoUrl || DEFAULT_BACKGROUND_VIDEO;
  } catch {
    return DEFAULT_BACKGROUND_VIDEO;
  }
}

const handlers = {
  "get-clipboard-text": () => navigator.clipboard.readText(),
  "get-background-video-url": getBackgroundVideoUrl,
};

window.addEventListener("message", async (e) => {
  const d = e.data;
  if (e.source !== window || !d || d.__meeland !== "req") return;
  let result, error;
  try {
    if (!handlers[d.type]) throw new Error("Unknown request: " + d.type);
    result = await handlers[d.type]();
  } catch (err) {
    error = String(err && err.message ? err.message : err);
  }
  window.postMessage({ __meeland: "res", id: d.id, result, error }, location.origin);
});
