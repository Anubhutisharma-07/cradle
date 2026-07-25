const STORAGE_KEY = "pairwise_high_score";
const CHALLENGE_STORAGE_KEY = "pairwise_challenge_high_score";

function getHighScore(mode = "standard") {
  const key = mode === "challenge" ? CHALLENGE_STORAGE_KEY : STORAGE_KEY;
  const score = localStorage.getItem(key);
  return score ? parseInt(score, 10) : null;
}

function saveHighScore(score, mode = "standard") {
  const current = getHighScore(mode);
  const key = mode === "challenge" ? CHALLENGE_STORAGE_KEY : STORAGE_KEY;
  if (current === null || score < current) {
    localStorage.setItem(key, score);
    return true; // new high score
  }
  return false;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getHighScore, saveHighScore };
}
