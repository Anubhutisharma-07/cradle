document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textInputA = document.getElementById('textInputA');
  const textInputB = document.getElementById('textInputB');
  const fileInputA = document.getElementById('fileInputA');
  const fileInputB = document.getElementById('fileInputB');
  const fileInfoA = document.getElementById('fileInfoA');
  const fileInfoB = document.getElementById('fileInfoB');
  
  const sideBySideBtn = document.getElementById('sideBySideBtn');
  const unifiedBtn = document.getElementById('unifiedBtn');
  const clearBtn = document.getElementById('clearBtn');
  const demoBtn = document.getElementById('demoBtn');
  
  const sideBySideView = document.getElementById('sideBySideView');
  const unifiedView = document.getElementById('unifiedView');
  const originalContent = document.getElementById('originalContent');
  const modifiedContent = document.getElementById('modifiedContent');
  const unifiedContent = document.getElementById('unifiedContent');
  const diffStatus = document.getElementById('diffStatus');

  const paneOriginal = originalContent.parentElement;
  const paneModified = modifiedContent.parentElement;

  // Sync scroll between side-by-side panes
  let isSyncingScroll = false;
  paneOriginal.addEventListener('scroll', () => {
    if (!isSyncingScroll) {
      isSyncingScroll = true;
      paneModified.scrollTop = paneOriginal.scrollTop;
      paneModified.scrollLeft = paneOriginal.scrollLeft;
      isSyncingScroll = false;
    }
  });

  paneModified.addEventListener('scroll', () => {
    if (!isSyncingScroll) {
      isSyncingScroll = true;
      paneOriginal.scrollTop = paneModified.scrollTop;
      paneOriginal.scrollLeft = paneModified.scrollLeft;
      isSyncingScroll = false;
    }
  });

  // Toggle View Modes
  sideBySideBtn.addEventListener('click', () => {
    sideBySideBtn.classList.add('active');
    unifiedBtn.classList.remove('active');
    sideBySideView.classList.remove('hidden');
    unifiedView.classList.add('hidden');
  });

  unifiedBtn.addEventListener('click', () => {
    unifiedBtn.classList.add('active');
    sideBySideBtn.classList.remove('active');
    unifiedView.classList.remove('hidden');
    sideBySideView.classList.add('hidden');
  });

  // Diff Engine (LCS-based)
  function computeDiff(linesA, linesB) {
    const n = linesA.length;
    const m = linesB.length;
    
    // DP Table for LCS length
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (linesA[i - 1] === linesB[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtracking to find alignment
    let i = n, j = m;
    const result = [];
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
        result.push({
          type: 'equal',
          valA: linesA[i - 1],
          valB: linesB[j - 1],
          lineA: i,
          lineB: j
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.push({
          type: 'add',
          valB: linesB[j - 1],
          lineB: j
        });
        j--;
      } else {
        result.push({
          type: 'remove',
          valA: linesA[i - 1],
          lineA: i
        });
        i--;
      }
    }
    
    result.reverse();
    return postProcessModifications(result);
  }

  // Detect replaced lines (remove followed by add) and group them as 'modify'
  function postProcessModifications(diff) {
    const processed = [];
    let idx = 0;
    
    while (idx < diff.length) {
      const current = diff[idx];
      
      // If we see a remove followed immediately by an add, mark it as modification
      if (current.type === 'remove' && idx + 1 < diff.length && diff[idx + 1].type === 'add') {
        const next = diff[idx + 1];
        processed.push({
          type: 'modify',
          valA: current.valA,
          valB: next.valB,
          lineA: current.lineA,
          lineB: next.lineB
        });
        idx += 2;
      } else {
        processed.push(current);
        idx++;
      }
    }
    
    return processed;
  }

  // Render Diff Output to HTML
  function renderDiff() {
    const textA = textInputA.value;
    const textB = textInputB.value;
    
    if (!textA && !textB) {
      originalContent.innerHTML = '';
      modifiedContent.innerHTML = '';
      unifiedContent.innerHTML = '';
      diffStatus.textContent = 'Paste or load files to see differences';
      return;
    }
    
    const linesA = textA.split(/\r?\n/);
    const linesB = textB.split(/\r?\n/);
    
    const diff = computeDiff(linesA, linesB);
    
    let htmlOrig = '';
    let htmlMod = '';
    let htmlUnif = '';
    
    let adds = 0;
    let dels = 0;
    let mods = 0;
    
    diff.forEach((item, index) => {
      const escapedA = escapeHtml(item.valA || '');
      const escapedB = escapeHtml(item.valB || '');
      
      if (item.type === 'equal') {
        htmlOrig += `<div class="diff-line"><div class="line-number">${item.lineA}</div><div class="line-text">${escapedA}</div></div>`;
        htmlMod += `<div class="diff-line"><div class="line-number">${item.lineB}</div><div class="line-text">${escapedB}</div></div>`;
        htmlUnif += `<div class="diff-line"><div class="line-number">${item.lineA}</div><div class="line-number">${item.lineB}</div><div class="line-text">${escapedA}</div></div>`;
      } 
      else if (item.type === 'add') {
        adds++;
        htmlOrig += `<div class="diff-line line-empty"><div class="line-number">&nbsp;</div><div class="line-text"></div></div>`;
        htmlMod += `<div class="diff-line line-add"><div class="line-number">${item.lineB}</div><div class="line-text">+ ${escapedB}</div></div>`;
        htmlUnif += `<div class="diff-line line-add"><div class="line-number">&nbsp;</div><div class="line-number">${item.lineB}</div><div class="line-text">+ ${escapedB}</div></div>`;
      } 
      else if (item.type === 'remove') {
        dels++;
        htmlOrig += `<div class="diff-line line-remove"><div class="line-number">${item.lineA}</div><div class="line-text">- ${escapedA}</div></div>`;
        htmlMod += `<div class="diff-line line-empty"><div class="line-number">&nbsp;</div><div class="line-text"></div></div>`;
        htmlUnif += `<div class="diff-line line-remove"><div class="line-number">${item.lineA}</div><div class="line-number">&nbsp;</div><div class="line-text">- ${escapedA}</div></div>`;
      } 
      else if (item.type === 'modify') {
        mods++;
        htmlOrig += `<div class="diff-line line-modify"><div class="line-number">${item.lineA}</div><div class="line-text">- ${escapedA}</div></div>`;
        htmlMod += `<div class="diff-line line-modify"><div class="line-number">${item.lineB}</div><div class="line-text">+ ${escapedB}</div></div>`;
        // In unified mode, show modification as deletion immediately followed by addition
        htmlUnif += `<div class="diff-line line-remove"><div class="line-number">${item.lineA}</div><div class="line-number">&nbsp;</div><div class="line-text">- ${escapedA}</div></div>`;
        htmlUnif += `<div class="diff-line line-add"><div class="line-number">&nbsp;</div><div class="line-number">${item.lineB}</div><div class="line-text">+ ${escapedB}</div></div>`;
      }
    });
    
    originalContent.innerHTML = htmlOrig;
    modifiedContent.innerHTML = htmlMod;
    unifiedContent.innerHTML = htmlUnif;
    
    diffStatus.innerHTML = `Comparison results: <span style="color:var(--diff-add-text); font-weight:600;">+ ${adds} additions</span>, <span style="color:var(--diff-remove-text); font-weight:600;">- ${dels} deletions</span>, <span style="color:var(--diff-modify-text); font-weight:600;">✎ ${mods} modifications</span>`;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // File Upload Logic
  function handleFileSelect(event, targetTextarea, targetInfo) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      targetTextarea.value = e.target.result;
      targetInfo.textContent = `${file.name} (${formatBytes(file.size)})`;
      renderDiff();
    };
    reader.readAsText(file);
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  fileInputA.addEventListener('change', (e) => handleFileSelect(e, textInputA, fileInfoA));
  fileInputB.addEventListener('change', (e) => handleFileSelect(e, textInputB, fileInfoB));

  // Drag & Drop Setup
  function setupDragDrop(dropzone, textarea, info) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('highlight');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('highlight');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          textarea.value = event.target.result;
          info.textContent = `${file.name} (${formatBytes(file.size)})`;
          renderDiff();
        };
        reader.readAsText(file);
      }
    });
  }

  setupDragDrop(document.getElementById('dropzoneA'), textInputA, fileInfoA);
  setupDragDrop(document.getElementById('dropzoneB'), textInputB, fileInfoB);

  // Auto-update diff on textarea typing
  textInputA.addEventListener('input', renderDiff);
  textInputB.addEventListener('input', renderDiff);

  // Clear Event
  clearBtn.addEventListener('click', () => {
    textInputA.value = '';
    textInputB.value = '';
    fileInfoA.textContent = 'No file loaded';
    fileInfoB.textContent = 'No file loaded';
    fileInputA.value = '';
    fileInputB.value = '';
    renderDiff();
  });

  // Load Demo Data
  demoBtn.addEventListener('click', () => {
    textInputA.value = `// Welcome to DiffVisualizer!
function calculateTotal(price, tax, discount) {
  const subtotal = price + tax;
  const total = subtotal - discount;
  console.log("Calculated Subtotal: " + subtotal);
  return total;
}

const result = calculateTotal(100, 15, 10);
console.log("Final Result: " + result);`;

    textInputB.value = `// Welcome to DiffVisualizer!
// Optimized calculateTotal function
function calculateTotal(price, tax, discount = 0) {
  if (price < 0) return 0;
  const subtotal = price + (price * tax);
  console.log("Subtotal value: " + subtotal);
  const total = subtotal - discount;
  return total;
}

const finalValue = calculateTotal(120, 0.15, 15);
console.log("Processed Total: " + finalValue);`;

    fileInfoA.textContent = 'demo_original.js (215 Bytes)';
    fileInfoB.textContent = 'demo_modified.js (325 Bytes)';
    renderDiff();
  });
});
