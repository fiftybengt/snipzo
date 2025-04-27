// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const shortcutInput   = document.getElementById('shortcut');
    const snippetInput    = document.getElementById('snippet');
    const addBtn          = document.getElementById('add-btn');
    const snippetList     = document.getElementById('snippet-list');
    const statusDiv       = document.getElementById('status');
    const openOptionsBtn  = document.getElementById('open-options');
    const exportBtn       = document.getElementById('export-btn');
    const exportBase64Btn = document.getElementById('export-base64-btn');
    const importBase64Btn = document.getElementById('import-base64-btn');
  
    // Add or update a snippet
    function addSnippet() {
      const key  = shortcutInput.value.trim();
      const text = snippetInput.value.trim();
      if (!key || !text) return;
  
      statusDiv.textContent = `🖋️ Saving "${key}"…`;
      chrome.storage.local.get('snippets', ({ snippets = {} }) => {
        if (snippets[key] && snippets[key] !== text) {
          if (!confirm(`Overwrite existing snippet "${key}"?`)) {
            statusDiv.textContent = '⚠️ Add cancelled';
            return;
          }
        }
        snippets[key] = text;
        chrome.storage.local.set({ snippets }, () => {
          statusDiv.textContent = `✅ Saved "${key}"`;
          shortcutInput.value = '';
          snippetInput.value  = '';
          shortcutInput.focus();
          loadSnippets();
        });
      });
    }
  
    // Bind add button and Enter key
    addBtn.addEventListener('click', addSnippet);
    [shortcutInput, snippetInput].forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addSnippet();
        }
      });
    });
  
    // Render the snippet list
    function loadSnippets() {
      snippetList.innerHTML = '';
      chrome.storage.local.get('snippets', ({ snippets = {} }) => {
        Object.entries(snippets).forEach(([key, text]) => {
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.innerHTML = `
            <div><b>${key}</b>: <span>${text}</span></div>
            <div>
              <button class="btn btn-sm btn-secondary edit-btn">Edit</button>
              <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            </div>
          `;
          // Edit handler
          li.querySelector('.edit-btn').onclick = () => {
            const updated = prompt(`Edit snippet "${key}":`, text);
            if (updated !== null) {
              chrome.storage.local.get('snippets', ({ snippets = {} }) => {
                snippets[key] = updated.trim();
                chrome.storage.local.set({ snippets }, loadSnippets);
                statusDiv.textContent = `✏️ Updated "${key}"`;
              });
            }
          };
          // Delete handler
          li.querySelector('.delete-btn').onclick = () => {
            chrome.storage.local.get('snippets', ({ snippets = {} }) => {
              delete snippets[key];
              chrome.storage.local.set({ snippets }, loadSnippets);
              statusDiv.textContent = `🗑️ Deleted "${key}"`;
            });
          };
          snippetList.appendChild(li);
        });
      });
    }
  
    // Export as JSON file
    exportBtn.addEventListener('click', () => {
      statusDiv.textContent = '📤 Exporting file…';
      chrome.storage.local.get('snippets', ({ snippets = {} }) => {
        const json = JSON.stringify(snippets, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'snippets.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        statusDiv.textContent = '✅ File exported';
      });
    });
  
    // Export as Base64
    exportBase64Btn.addEventListener('click', () => {
      statusDiv.textContent = '📝 Generating Base64…';
      chrome.storage.local.get('snippets', ({ snippets = {} }) => {
        const json = JSON.stringify(snippets);
        try {
          const b64 = btoa(json);
          window.prompt('Copy this Base64 string:', b64);
          statusDiv.textContent = '✅ Base64 generated';
        } catch (err) {
          statusDiv.textContent = '❌ Base64 failed: ' + err.message;
        }
      });
    });
  
    // Import from Base64
    importBase64Btn.addEventListener('click', () => {
      const input = window.prompt('Paste Base64 string to import:');
      if (!input) {
        statusDiv.textContent = '⚠️ Import cancelled';
        return;
      }
      statusDiv.textContent = '🔍 Decoding Base64…';
      try {
        const jsonString = atob(input);
        const imported   = JSON.parse(jsonString);
        if (typeof imported !== 'object' || Array.isArray(imported)) {
          throw new Error('Expected an object of key→value pairs');
        }
        statusDiv.textContent = `💾 Saving ${Object.keys(imported).length} snippets…`;
        chrome.storage.local.set({ snippets: imported }, () => {
          statusDiv.textContent = '✅ Base64 import complete!';
          loadSnippets();
        });
      } catch (err) {
        statusDiv.textContent = '❌ Import failed: ' + err.message;
      }
    });
  
    // Open options page for file-based import/export
    openOptionsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  
    // Initial state
    statusDiv.textContent = '🚀 Ready';
    loadSnippets();
  });
  