/**
 * JSON Converter — UI Orchestration
 *
 * Wires together the textarea, syntax-highlighting layer,
 * format toggles, action buttons, and error panel.
 */

/* ---- DOM References ---- */
const jsonInput     = document.getElementById('jsonInput');
const highlightLayer = document.getElementById('highlightLayer');
const outputContent  = document.getElementById('outputContent');
const outputLabel    = document.getElementById('outputLabel');
const errorPanel     = document.getElementById('errorPanel');
const errorLine      = document.getElementById('errorLine');
const errorMsg       = document.getElementById('errorMsg');
const errorBadge     = document.getElementById('errorBadge');

const formatBtns     = document.querySelectorAll('.format-btn');
const formatBtn      = document.getElementById('formatBtn');
const minifyBtn      = document.getElementById('minifyBtn');
const copyBtn        = document.getElementById('copyBtn');
const downloadBtn    = document.getElementById('downloadBtn');

/* ---- State ---- */
let currentFormat = 'yaml';   // 'yaml' | 'csv' | 'xml'
let lastValidJSON = null;     // cache the last successfully-parsed object

/* ---- Sync Scroll ---- */
jsonInput.addEventListener('scroll', () => {
  highlightLayer.scrollTop  = jsonInput.scrollTop;
  highlightLayer.scrollLeft = jsonInput.scrollLeft;
});

/* ---- Highlight on input ---- */
jsonInput.addEventListener('input', onInput);
jsonInput.addEventListener('input', syncHighlight);

function syncHighlight() {
  const text = jsonInput.value;
  if (!text) {
    highlightLayer.innerHTML = '';
    return;
  }
  try {
    JSON.parse(text);
    // Valid JSON → full syntax highlight
    highlightLayer.innerHTML = highlightJSON(text);
  } catch {
    // Invalid JSON → escape and display as plain (so cursor stays aligned)
    highlightLayer.textContent = text;
  }
}

/* ---- Core conversion pipeline ---- */
function onInput() {
  const text = jsonInput.value.trim();

  // Clear error state if empty
  if (!text) {
    hideError();
    lastValidJSON = null;
    outputContent.innerHTML = '<span class="empty-hint">Converted output appears here…</span>';
    outputLabel.textContent = 'Output';
    return;
  }

  const result = parseJSON(text);

  if (!result.valid) {
    showError(result.error);
    lastValidJSON = null;
    // Still show partial highlight, but output is blank
    outputContent.textContent = '';
    outputLabel.textContent = 'Output';
    return;
  }

  hideError();
  lastValidJSON = result.value;
  renderOutput(result.value);

  // Clean up the highlight for valid JSON
  highlightLayer.innerHTML = highlightJSON(text);
}

function renderOutput(obj) {
  let outputText;

  switch (currentFormat) {
    case 'csv':
      outputText = toCsv(obj);
      outputLabel.textContent = 'Output — CSV';
      break;
    case 'xml':
      outputText = toXml(obj);
      outputLabel.textContent = 'Output — XML';
      break;
    case 'yaml':
    default:
      outputText = toYaml(obj).trimStart();
      outputLabel.textContent = 'Output — YAML';
      break;
  }

  // Escape and display
  outputContent.textContent = outputText || ' ';
}

/* ---- Format Toggle ---- */
formatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    formatBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFormat = btn.dataset.format;

    if (lastValidJSON !== null) {
      renderOutput(lastValidJSON);
    }
  });
});

/* ---- Format / Pretty-Print ---- */
formatBtn.addEventListener('click', () => {
  const text = jsonInput.value;
  if (!text) return;
  const formatted = formatJSON(text);
  if (formatted !== text) {
    jsonInput.value = formatted;
    syncHighlight();
    onInput();
  }
});

/* ---- Minify ---- */
minifyBtn.addEventListener('click', () => {
  const text = jsonInput.value;
  if (!text) return;
  const minified = minifyJSON(text);
  if (minified !== text) {
    jsonInput.value = minified;
    syncHighlight();
    onInput();
  }
});

/* ---- Copy to Clipboard ---- */
copyBtn.addEventListener('click', async () => {
  const text = outputContent.textContent;
  if (!text || text === 'Converted output appears here…') return;

  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copied!');
  }
});

/* ---- Download ---- */
downloadBtn.addEventListener('click', () => {
  const text = outputContent.textContent;
  if (!text || text === 'Converted output appears here…') return;

  const extMap = { yaml: 'yaml', csv: 'csv', xml: 'xml' };
  const ext = extMap[currentFormat] || 'txt';
  const mimeMap = {
    yaml: 'text/yaml',
    csv:  'text/csv',
    xml:  'application/xml',
  };
  const blob = new Blob([text], { type: mimeMap[currentFormat] || 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `output.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded!');
});

/* ---- Error display ---- */
function showError(err) {
  errorLine.textContent = `Line ${err.line}, Column ${err.column}:`;
  errorMsg.textContent  = err.message;
  errorPanel.classList.add('visible');
  errorBadge.classList.add('visible');
}

function hideError() {
  errorPanel.classList.remove('visible');
  errorBadge.classList.remove('visible');
}

/* ---- Toast notification ---- */
let toastTimer = null;
function showToast(msg) {
  // Remove existing toast if any
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  Object.assign(div.style, {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1e293b',
    color: '#e2e8f0',
    padding: '10px 24px',
    borderRadius: '12px',
    border: '1px solid #334155',
    fontSize: '14px',
    zIndex: '999',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    opacity: '0',
    transition: 'opacity 0.2s',
  });
  document.body.appendChild(div);
  requestAnimationFrame(() => { div.style.opacity = '1'; });

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 200);
  }, 1800);
}

/* ---- Keyboard shortcut: Tab = 2 spaces ---- */
jsonInput.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = jsonInput.selectionStart;
    const end   = jsonInput.selectionEnd;
    jsonInput.value = jsonInput.value.slice(0, start) + '  ' + jsonInput.value.slice(end);
    jsonInput.selectionStart = jsonInput.selectionEnd = start + 2;
    // Trigger input events manually
    jsonInput.dispatchEvent(new Event('input'));
  }
});

/* ---- Initial render with sample data ---- */
const sampleJSON = JSON.stringify({
  name: "Alice",
  age: 30,
  isActive: true,
  hobbies: ["reading", "cycling", "photography"],
  address: {
    city: "San Francisco",
    zip: "94105"
  }
}, null, 2);

jsonInput.value = sampleJSON;
syncHighlight();
onInput();
