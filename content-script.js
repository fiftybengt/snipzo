// content-script.js
(() => {
    let snippets = {};
  
    function isTextInput(elem) {
      return (
        elem.tagName === 'TEXTAREA' ||
        (elem.tagName === 'INPUT' &&
          ['text','search','email','url','tel'].includes(elem.type))
      );
    }
  
    // Replace lastWord with snippetText in either an input/textarea or a contentEditable
    function replaceSnippet(target, lastWord, snippetText) {
      if (target.isContentEditable) {
        const sel = document.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        try {
          range.setStart(range.endContainer, range.endOffset - lastWord.length);
          range.deleteContents();
          const node = document.createTextNode(snippetText);
          range.insertNode(node);
          range.setStartAfter(node);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (e) {
          console.error('Error replacing snippet:', e);
        }
      } else if (isTextInput(target)) {
        const pos = target.selectionEnd;
        const start = pos - lastWord.length;
        target.value =
          target.value.substring(0, start) +
          snippetText +
          target.value.substring(pos);
        const newPos = start + snippetText.length;
        target.setSelectionRange(newPos, newPos);
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  
    function initListener() {
      let isReplacing = false;
      document.addEventListener('keydown', (e) => {
        // only trigger on space or tab
        if (isReplacing) return;
        if (e.key !== ' ' && e.key !== 'Tab') return;
  
        let tgt = e.target;
        while (tgt && !isTextInput(tgt) && !tgt.isContentEditable) {
          tgt = tgt.parentElement;
        }
        if (!tgt) return;
  
        const editable  = tgt.isContentEditable;
        const textField = isTextInput(tgt);
        if (!editable && !textField) return;
  
        let before = '';
        if (editable) {
          const sel = document.getSelection();
          if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
          const r1 = sel.getRangeAt(0);
          const r2 = r1.cloneRange();
          r2.selectNodeContents(tgt);
          r2.setEnd(r1.endContainer, r1.endOffset);
          before = r2.toString();
        } else {
          const p = tgt.selectionEnd;
          before = tgt.value.substring(0, p);
        }
  
        // match only word‐characters (no punctuation)
        const m = before.match(/(\b\w+)$/);
        const lastWord = m ? m[0] : '';
        if (!lastWord) return;
  
        const snippetText = snippets[lastWord];
        if (!snippetText) return;
  
        isReplacing = true;
        replaceSnippet(tgt, lastWord, snippetText);
        // slight delay before allowing another replacement
        setTimeout(() => { isReplacing = false; }, 50);
      }, true);
    }
  
    // Load on startup
    chrome.storage.local.get('snippets', data => {
      snippets = data.snippets || {};
      initListener();
    });
  
    chrome.storage.onChanged.addListener(chgs => {
      if (chgs.snippets) {
        snippets = chgs.snippets.newValue || {};
      }
    });
  })();
  