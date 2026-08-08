/**
 * RPS Storage Handler - Manages score history, win streaks, and match statistics
 */
(function (exports) {
  const STORAGE_KEY = "cradle_rps_stats";

  let memoryStats = {
    wins: 0,
    losses: 0,
    ties: 0,
    currentStreak: 0,
    bestStreak: 0,
    moveCounts: { rock: 0, paper: 0, scissors: 0, lizard: 0, spock: 0 }
  };

  function isLocalStorageAvailable() {
    try {
      return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    } catch (e) {
      return false;
    }
  }

  function getStats() {
    if (!isLocalStorageAvailable()) return memoryStats;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...memoryStats, ...JSON.parse(raw) } : memoryStats;
    } catch (e) {
      return memoryStats;
    }
  }

  function recordOutcome(outcome, playerChoice) {
    const stats = getStats();
    if (outcome === "player") {
      stats.wins += 1;
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else if (outcome === "computer") {
      stats.losses += 1;
      stats.currentStreak = 0;
    } else {
      stats.ties += 1;
    }

    if (playerChoice && stats.moveCounts[playerChoice] !== undefined) {
      stats.moveCounts[playerChoice] += 1;
    }

    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      } catch (e) {}
    } else {
      memoryStats = stats;
    }

    return stats;
  }

  function resetStats() {
    const fresh = {
      wins: 0,
      losses: 0,
      ties: 0,
      currentStreak: 0,
      bestStreak: 0,
      moveCounts: { rock: 0, paper: 0, scissors: 0, lizard: 0, spock: 0 }
    };
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      } catch (e) {}
    }
    memoryStats = fresh;
    return fresh;
  }

  exports.getStats = getStats;
  exports.recordOutcome = recordOutcome;
  exports.resetStats = resetStats;
})(typeof exports === "undefined" ? (window.RpsStorage = {}) : exports);
