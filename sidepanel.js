let lastResult = null;

const $ = (id) => document.getElementById(id);

function pretty(value) {
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

function setStatus(message, kind = "") {
  const el = $("status");
  const messageEl = $("statusMessage");
  if (messageEl) messageEl.textContent = message;
  else el.textContent = message;
  el.className = `status ${kind}`.trim();
}

function showError(message) {
  $("result").classList.add("hidden");
  $("error").textContent = message;
  $("error").classList.remove("hidden");
  setStatus("Unable to decode selection", "error-status");
}

function render(result) {
  lastResult = result;
  $("error").classList.add("hidden");
  $("result").classList.remove("hidden");
  $("detected").textContent = result.type;

  if (result.type === "JWT") {
    $("jwtSections").classList.remove("hidden");
    $("normalResult").classList.add("hidden");
    $("jwtHeader").textContent = pretty(result.header);
    $("jwtPayload").textContent = pretty(result.payload);
    $("jwtSignature").textContent = result.signature;
  } else {
    $("jwtSections").classList.add("hidden");
    $("normalResult").classList.remove("hidden");
    $("output").textContent = pretty(result.value);
  }

  setStatus("Decoded successfully", "success-status");
}

async function getCurrentSelection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return "";

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() || "",
    });

    return result?.[0]?.result || "";
  } catch (error) {
    console.error(error);
    return "";
  }
}

async function decodeText(text) {
  const value = text?.trim() || "";
  if (!value) {
    showError("No text is selected. Select a JWT, Base64 value, JSON, or a log line containing one.");
    return;
  }

  $("input").value = value;

  try {
    render(window.LogDecoder.decodeValue(value, $("recursive").checked));
  } catch (error) {
    showError(error.message);
  }
}

async function decode() {
  const typedValue = $("input").value.trim();
  const selectedText = typedValue || await getCurrentSelection();
  await decodeText(selectedText);
}

async function copyResult() {
  if (!lastResult) return;

  const text = lastResult.type === "JWT"
    ? [
        "HEADER",
        pretty(lastResult.header),
        "",
        "PAYLOAD",
        pretty(lastResult.payload),
        "",
        "SIGNATURE",
        lastResult.signature,
      ].join("\n")
    : pretty(lastResult.value);

  await navigator.clipboard.writeText(text);
  $("copy").textContent = "Copied ✓";
  setTimeout(() => ($("copy").textContent = "Copy result"), 1200);
}

async function consumePendingDecode() {
  const stored = await chrome.storage.local.get(["pendingDecode", "pendingDecodeAt"]);
  if (!stored.pendingDecode) return;

  const isRecent = Date.now() - (stored.pendingDecodeAt || 0) < 30000;
  if (!isRecent) {
    await chrome.storage.local.remove(["pendingDecode", "pendingDecodeAt", "pendingView"]);
    return;
  }

  await decodeText(stored.pendingDecode);
  await chrome.storage.local.remove(["pendingDecode", "pendingDecodeAt", "pendingView"]);
}

document.addEventListener("DOMContentLoaded", async () => {
  $("decode").addEventListener("click", decode);
  $("copy").addEventListener("click", copyResult);

  await consumePendingDecode();
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName !== "local" || !changes.pendingDecode?.newValue) return;

  const timestamp = changes.pendingDecodeAt?.newValue || Date.now();
  if (Date.now() - timestamp > 30000) return;

  await decodeText(changes.pendingDecode.newValue);
  await chrome.storage.local.remove(["pendingDecode", "pendingDecodeAt", "pendingView"]);
});
