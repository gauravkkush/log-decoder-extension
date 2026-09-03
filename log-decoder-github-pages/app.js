const $ = (id) => document.getElementById(id);
let lastResult = null;

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

function showError(message) {
  $("emptyState").classList.add("hidden");
  $("result").classList.add("hidden");
  $("error").textContent = message;
  $("error").classList.remove("hidden");
  $("resultMeta").textContent = "Decode failed";
}

function render(result) {
  lastResult = result;
  $("error").classList.add("hidden");
  $("emptyState").classList.add("hidden");
  $("result").classList.remove("hidden");
  $("copy").disabled = false;
  $("detected").textContent = result.type;
  $("resultMeta").textContent = "Decoded locally";

  if (result.type === "JWT") {
    $("jwtSections").classList.remove("hidden");
    $("normalResult").classList.add("hidden");
    $("jwtHeader").textContent = pretty(result.header);
    $("jwtPayload").textContent = pretty(result.payload);
    $("jwtSignature").textContent = result.signature;
  } else {
    $("jwtSections").classList.add("hidden");
    $("normalResult").classList.remove("hidden");
    $("output").value = pretty(result.value);
  }
}

function toggleFullscreen() {
  const panel = document.querySelector(".result-panel");
  const button = $("fullscreen");

  if (!panel || !button) return;

  const isFullscreen = panel.classList.toggle("fullscreen");
  document.body.classList.toggle("fullscreen-active", isFullscreen);
  button.textContent = isFullscreen ? "Exit full screen" : "Full screen";
}
$("fullscreen").addEventListener("click", toggleFullscreen);

function decode() {
  const input = $("input").value;
  if (!input.trim()) {
    showError(
      "Paste a JWT, Base64 value, JSON, URL-encoded value, or a log line first.",
    );
    return;
  }

  try {
    const result = window.LogDecoder.decodeValue(input, $("recursive").checked);
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

  try {
    await navigator.clipboard.writeText(text);
    const button = $("copy");
    button.textContent = "Copied ✓";
    setTimeout(() => (button.textContent = "Copy result"), 1200);
  } catch {
    showError(
      "Clipboard access was blocked by the browser. Copy the output manually.",
    );
  }
}

function clearAll() {
  $("input").value = "";
  lastResult = null;
  $("result").classList.add("hidden");
  $("error").classList.add("hidden");
  $("emptyState").classList.remove("hidden");
  $("copy").disabled = true;
  $("resultMeta").textContent = "Waiting for input";
}

function loadSample() {
  const payload = {
    bookingId: "FD-2026-0825-00192",
    status: "CONFIRMED",
    customer: { id: "CUS-10492", name: "Demo Customer" },
    restaurant: { name: "Spice Route", city: "Gurugram" },
    order: {
      items: [
        { name: "Paneer Tikka", quantity: 2, price: 349 },
        { name: "Veg Biryani", quantity: 1, price: 299 },
        { name: "Masala Dosa", quantity: 2, price: 189 },
      ],
      subtotal: 1375,
      tax: 68.75,
      total: 1443.75,
    },
    payment: {
      method: "CARD",
      status: "CAPTURED",
      transactionId: "TXN-88219401",
    },
  };
  $("input").value = btoa(
    unescape(encodeURIComponent(JSON.stringify(payload))),
  );
  $("resultMeta").textContent = "Sample Base64 loaded";
  $("error").classList.add("hidden");
}

$("decode").addEventListener("click", decode);
$("copy").addEventListener("click", copyResult);
$("clearInput").addEventListener("click", clearAll);
$("sample").addEventListener("click", loadSample);

$("input").addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") decode();
});

$("input").addEventListener("paste", () => {
  setTimeout(() => {
    $("result").classList.add("hidden");
    $("emptyState").classList.remove("hidden");
    $("copy").disabled = true;
    $("resultMeta").textContent = "Ready to decode";
  }, 0);
});
