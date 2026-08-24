chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'decode-selected',
    title: 'Decode selected log data',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'decode-selected' || !tab?.id) return;

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() || ''
    });

    const selectedText = result?.[0]?.result || '';
    await chrome.storage.local.set({
      pendingDecode: selectedText,
      pendingDecodeAt: Date.now()
    });

    // Open the extension popup as a normal extension page is not possible from
    // a context-menu click. The user can click the toolbar icon to view the result.
  } catch (error) {
    console.error('Unable to read selection:', error);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'decode-selected') return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() || ''
    });

    await chrome.storage.local.set({
      pendingDecode: result?.[0]?.result || '',
      pendingDecodeAt: Date.now()
    });
  } catch (error) {
    console.error('Unable to read selection:', error);
  }
});



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return;

  if (message.type === 'OPEN_VIEW' && message.view === 'window') {
    chrome.windows.create({
      url: chrome.runtime.getURL('decoder-window.html'),
      type: 'popup',
      width: 1100,
      height: 850
    }, () => {
      sendResponse({ ok: !chrome.runtime.lastError, error: chrome.runtime.lastError?.message });
    });
    return true;
  }
});
