// popup.js
// Main popup logic: adding, listing, editing, deleting, importing/exporting snippets

document.addEventListener('DOMContentLoaded', () => {
  const shortcutInput      = document.getElementById('shortcut');
  const snippetInput       = document.getElementById('snippet');
  const addBtn             = document.getElementById('add-btn');
  const snippetList        = document.getElementById('snippet-list');
  const statusDiv          = document.getElementById('status');
  const openOptionsBtn     = document.getElementById('open-options');
  const exportBtn          = document.getElementById('export-btn');
  const exportBase64Btn    = document.getElementById('export-base64-btn');
  const importBase64Btn    = document.getElementById('import-base64-btn');

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
        snippetInput.value = '';
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

  // Render the list of snippets
  function loadSnippets() {
    snippetList.innerHTML = '';
    chrome.storage.local.get('snippets', ({ snippets = {} }) => {
      Object.entries(snippets).forEach(([key, text]) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-start';

        // snippet content
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = `<strong>${key}</strong>: <span class=\"text-muted\">${text}</span>`;

        // button group
        const btnGroup = document.createElement('div');
        const editBtn  = document.createElement('button');
        const delBtn   = document.createElement('button');
        editBtn.textContent = 'Edit';
        delBtn.textContent  = 'Delete';
        editBtn.className   = 'btn btn-sm btn-outline-primary edit-btn';
        delBtn.className    = 'btn btn-sm btn-outline-danger delete-btn';
        btnGroup.append(editBtn, delBtn);

        li.append(contentDiv, btnGroup);
        snippetList.appendChild(li);

        // Delete handler
        delBtn.addEventListener('click', () => {
          if (confirm(`Delete snippet "${key}"?`)) {
            chrome.storage.local.get('snippets', ({ snippets = {} }) => {
              delete snippets[key];
              chrome.storage.local.set({ snippets }, () => {
                statusDiv.textContent = `🗑️ Deleted "${key}"`;
                loadSnippets();
              });
            });
          }
        });

        // Enhanced in-popup edit handler
        editBtn.addEventListener('click', () => {
          // 1) lock popup height at 500px, disable outer scroll
          document.body.style.height = '500px';
          document.body.style.maxHeight = '500px';
          document.body.style.overflow = 'hidden';

          // 2) build edit form container
          const form = document.createElement('div');
          form.id = 'edit-container';
          form.style.display = 'flex';
          form.style.flexDirection = 'column';
          form.style.height = '100%';

          form.innerHTML = `
            <h4>Edit Snippet</h4>
            <div class="mb-3">
              <label for="edit-key" class="form-label">Shortcut (trigger key):</label>
              <input type="text" id="edit-key" class="form-control" value="${key}">
            </div>
            <div id="textarea-wrapper" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
              <label for="edit-text" class="form-label">Snippet text:</label>
              <textarea id="edit-text" class="form-control" style="flex:1; resize:none; overflow:auto;">${text}</textarea>
            </div>
            <div id="edit-actions" style="padding:8px; display:flex; justify-content:flex-end; gap:8px;">
              <button id="save-edit-btn" class="btn btn-primary">Save</button>
              <button id="cancel-edit-btn" class="btn btn-secondary">Cancel</button>
            </div>
          `;

          // 3) replace entire body content with the form
          document.body.replaceChildren(form);

          // 4) attach cancel action
          document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            window.location.reload();
          });

          // 5) attach save action
          document.getElementById('save-edit-btn').addEventListener('click', () => {
            const newKey = document.getElementById('edit-key').value.trim();
            const newText = document.getElementById('edit-text').value;
            if (!newKey) {
              alert('Trigger key cannot be empty');
              return;
            }
            chrome.storage.local.get('snippets', ({ snippets = {} }) => {
              if (newKey !== key) {
                if (snippets[newKey] && !confirm(`Overwrite existing snippet "${newKey}"?`)) return;
                delete snippets[key];
              }
              snippets[newKey] = newText;
              chrome.storage.local.set({ snippets }, () => window.location.reload());
            });
          });
        });
      });
    });
  }

  // Export as JSON file
  exportBtn.addEventListener('click', () => {
    statusDiv.textContent = '📤 Exporting file…';
    chrome.storage.local.get('snippets', ({ snippets = {} }) => {
      const json = JSON.stringify(snippets, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
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
      try {
        const b64 = btoa(JSON.stringify(snippets));
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
      const imported = JSON.parse(atob(input));
      if (typeof imported !== 'object' || Array.isArray(imported)) throw new Error('Invalid format');
      chrome.storage.local.set({ snippets: imported }, () => {
        statusDiv.textContent = '✅ Base64 import complete!';
        loadSnippets();
      });
    } catch (err) {
      statusDiv.textContent = '❌ Import failed: ' + err.message;
    }
  });

  // Open options page
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Initial setup
  statusDiv.textContent = '🚀 Ready';
  loadSnippets();
});
