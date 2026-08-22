let selectedText = "";
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

	// Update only the status message so the privacy notice remains visible.
	messageEl.textContent = message;
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

async function getSelectionFromPage() {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
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

async function decode() {
	$("error").classList.add("hidden");
	selectedText = await getSelectionFromPage();

	if (!selectedText.trim()) {
		showError(
			"No text is selected. Select a JWT, Base64 value, JSON, or a log line containing one.",
		);
		return;
	}

	try {
		const result = window.LogDecoder.decodeValue(
			selectedText,
			$("recursive").checked,
		);
		render(result);
	} catch (error) {
		showError(error.message);
	}
}

async function copyResult() {
	if (!lastResult) return;
	let text;

	if (lastResult.type === "JWT") {
		text = [
			"HEADER",
			pretty(lastResult.header),
			"",
			"PAYLOAD",
			pretty(lastResult.payload),
			"",
			"SIGNATURE",
			lastResult.signature,
		].join("\n");
	} else {
		text = pretty(lastResult.value);
	}

	await navigator.clipboard.writeText(text);
	$("copy").textContent = "Copied ✓";
	setTimeout(() => ($("copy").textContent = "Copy result"), 1200);
}

$("decode").addEventListener("click", decode);
$("copy").addEventListener("click", copyResult);
$("clear").addEventListener("click", () => {
	selectedText = "";
	lastResult = null;
	$("result").classList.add("hidden");
	$("error").classList.add("hidden");
	setStatus("Select a value in your log and click Decode.");
});
$("close").addEventListener("click", () => {
	window.close();
});

document.addEventListener("DOMContentLoaded", async () => {
	const stored = await chrome.storage.local.get([
		"pendingDecode",
		"pendingDecodeAt",
	]);
	if (
		stored.pendingDecode &&
		Date.now() - (stored.pendingDecodeAt || 0) < 30000
	) {
		selectedText = stored.pendingDecode;
		try {
			render(window.LogDecoder.decodeValue(selectedText, true));
			await chrome.storage.local.remove(["pendingDecode", "pendingDecodeAt"]);
		} catch (error) {
			showError(error.message);
		}
	}
});
