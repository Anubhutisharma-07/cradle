/**
 * Export HTML - Generates a standalone, dependency-free HTML file
 * from a portfolio's rendered command output and a theme.
 */
(function (exports) {
  const escapeHtml =
    typeof window !== "undefined" && window.CradleEscape
      ? window.CradleEscape.escapeHtml
      : require("../../../src/components/ui/escapeHtml.js").escapeHtml;

  /**
   * Renders a standalone HTML document showing the portfolio as
   * static terminal output, styled with the given theme, with no
   * external dependencies (no CSS/JS files, no CDN links).
   * @param {Object} portfolio - the raw portfolio data (used for <title>)
   * @param {{commands: Object, autoRunOrder: string[]}} commandOutput - from portfolioEngine.buildCommandOutput
   * @param {Object} theme - a theme object from themes.js (getTheme result)
   * @returns {string} full HTML document as a string
   */
  function generateStandaloneHtml(portfolio, commandOutput, theme) {
    const p = portfolio || {};
    const co = commandOutput && commandOutput.commands ? commandOutput : { commands: {}, autoRunOrder: [] };
    const t = theme && theme.bg ? theme : { bg: "#0c0c0c", fg: "#33ff33", accent: "#00ff00", cursor: "#33ff33", dim: "#1f7a1f", error: "#ff5555" };

    const title = escapeHtml(p.name ? `${p.name} — Terminal Portfolio` : "Terminal Portfolio");

    const blocks = co.autoRunOrder
      .map((cmdName) => {
        const cmd = co.commands[cmdName];
        if (!cmd) return "";
        const lines = cmd.lines.map((line) => `<div class="line">${escapeHtml(line)}</div>`).join("\n");
        return `<div class="block"><div class="prompt">guest@portfolio:~$ <span class="cmd-name">${escapeHtml(cmdName)}</span></div>${lines}</div>`;
      })
      .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  :root {
    --term-bg: ${t.bg};
    --term-fg: ${t.fg};
    --term-accent: ${t.accent};
    --term-cursor: ${t.cursor};
    --term-dim: ${t.dim};
    --term-error: ${t.error};
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 2rem 1rem;
    background: var(--term-bg);
    color: var(--term-fg);
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    min-height: 100vh;
  }
  .terminal {
    max-width: 780px;
    margin: 0 auto;
    border: 1px solid var(--term-dim);
    border-radius: 8px;
    padding: 1.5rem;
    background: color-mix(in srgb, var(--term-bg) 92%, var(--term-fg) 8%);
  }
  .block { margin-bottom: 1.25rem; }
  .prompt { color: var(--term-accent); margin-bottom: 0.25rem; }
  .cmd-name { color: var(--term-fg); font-weight: bold; }
  .line { white-space: pre-wrap; line-height: 1.5; }
  .footer-note { color: var(--term-dim); font-size: 0.8rem; margin-top: 2rem; text-align: center; }
</style>
</head>
<body>
<div class="terminal">
${blocks}
</div>
<div class="footer-note">Generated with the Terminal Portfolio Generator — cradle</div>
</body>
</html>`;
  }

  exports.generateStandaloneHtml = generateStandaloneHtml;
  exports.escapeHtml = escapeHtml;
})(typeof exports === "undefined" ? (window.ExportHtml = {}) : exports);
