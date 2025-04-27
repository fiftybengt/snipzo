// options.js
document.addEventListener('DOMContentLoaded', () => {
    const importFile = document.getElementById('import-file');
    const statusDiv  = document.getElementById('status');
  
    importFile.addEventListener('change', event => {
      statusDiv.textContent = '📂 Import started…';
      const file = event.target.files[0];
      if (!file) {
        statusDiv.textContent = '⚠️ No file selected';
        return;
      }
      statusDiv.textContent = `📖 Reading "${file.name}"…`;
  
      const reader = new FileReader();
      reader.onerror = () => {
        statusDiv.textContent = '❌ Failed to read file';
      };
      reader.onload = e => {
        statusDiv.textContent = '🔍 Parsing JSON…';
        let imported;
        try {
          imported = JSON.parse(e.target.result);
          if (typeof imported !== 'object' || Array.isArray(imported)) {
            throw new Error('Expected an object of key→value pairs');
          }
        } catch (err) {
          statusDiv.textContent = '❌ JSON parse error: ' + err.message;
          return;
        }
  
        statusDiv.textContent = `💾 Saving ${Object.keys(imported).length} snippets…`;
        chrome.storage.local.set({ snippets: imported }, () => {
          statusDiv.textContent = '✅ Import complete!';
        });
      };
      reader.readAsText(file);
    });
  });
  