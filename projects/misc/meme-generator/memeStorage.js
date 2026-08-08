// --- LOCAL STORAGE & PRESETS ENGINE ---
const STORAGE_KEY = "cradle_meme_presets_v1";

function getSavedMemes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read meme presets from localStorage", e);
    return [];
  }
}

function saveMemePreset(preset) {
  if (!preset || !preset.topText) return getSavedMemes();
  const memes = getSavedMemes();
  const newEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...preset,
  };
  memes.unshift(newEntry);
  const trimmed = memes.slice(0, 10); // Keep max 10 presets
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed to save meme preset to localStorage", e);
  }
  return trimmed;
}

function deleteMemePreset(id) {
  const memes = getSavedMemes().filter(m => m.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memes));
  } catch (e) {
    console.error("Failed to delete meme preset", e);
  }
  return memes;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getSavedMemes,
    saveMemePreset,
    deleteMemePreset,
  };
}
