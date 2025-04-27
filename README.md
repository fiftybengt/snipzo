```   ▄████████ ███▄▄▄▄    ▄█     ▄███████▄  ▄███████▄   ▄██████▄  
  ███    ███ ███▀▀▀██▄ ███    ███    ███ ██▀     ▄██ ███    ███ 
  ███    █▀  ███   ███ ███▌   ███    ███       ▄███▀ ███    ███ 
  ███        ███   ███ ███▌   ███    ███  ▀█▀▄███▀▄▄ ███    ███ 
▀███████████ ███   ███ ███▌ ▀█████████▀    ▄███▀   ▀ ███    ███ 
         ███ ███   ███ ███    ███        ▄███▀       ███    ███ 
   ▄█    ███ ███   ███ ███    ███        ███▄     ▄█ ███    ███ 
 ▄████████▀   ▀█   █▀  █▀    ▄████▀       ▀████████▀  ▀██████▀  ```
                                                                

# Snipzo

**Snipzo** is a lightweight browser extension for Chrome, Edge, and Firefox that lets you define custom text snippets and expand them instantly while typing.

## Features

- **Quick snippet expansion**: Type a shortcut (e.g. `addr`) in any text input or contentEditable field and press Space or Tab to replace it with its full snippet.
- **Easy management**: Add, edit, or delete snippets directly from the toolbar popup.
- **Import/Export**:
  - **File-based**: Export your snippets to a JSON file or import from one via the Options page.
  - **Base64**: Copy & paste Base64-encoded JSON strings for quick sharing or backup.
- **Persistent storage**: All snippets are saved in your browser’s local storage and sync across sessions.

## Installation

### Chrome & Edge
1. Open `chrome://extensions` or `edge://extensions`
2. Enable **Developer mode** (Chrome) or **Developer options** (Edge).
3. Click **Load unpacked** and select the extension’s root folder.
4. (Optional) To distribute a single file, use **Pack extension** to generate a `.crx`.

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** and select the root folder or the `snipzo.xpi` package.
3. For permanent distribution, submit the `.xpi` to addons.mozilla.org.

## Usage

1. Click the Snipzo icon in your toolbar to open the popup.
2. **Add Snippet**:
   - Enter a **Shortcut** and **Snippet Text**, then click **Add** or press **Enter**.
3. **Manage Snippets**:
   - Click **Manage Snippets…** to open the Options page for JSON file import/export.
4. **Expand Snippet**:
   - In any text field, type your shortcut followed by Space or Tab. Snipzo will replace it with the full text.
5. **Advanced Export/Import**:
   - In the popup, use **Export File**, **Export Base64**, or **Import Base64** to backup or share snippets.

## Directory Structure
```plaintext
/snippets.json      ← example exported data
/icons/
  48.png
  128.png
/popup.html
/popup.js
/popup.css
/options.html
/options.js
/content-script.js
/manifest.json
```  

## License
MIT © fiftybengt

