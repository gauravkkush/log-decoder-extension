(function () {
  function isJwt(value) {
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.trim());
  }

  function base64UrlToBytes(value) {
    let normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4) normalized += '=';
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function decodeBase64(value) {
    const bytes = base64UrlToBytes(value.trim());
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }

  function tryJson(value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function decodeJwt(value) {
    const [header, payload, signature] = value.trim().split('.');
    const decodedHeader = decodeBase64(header);
    const decodedPayload = decodeBase64(payload);
    const headerJson = tryJson(decodedHeader);
    const payloadJson = tryJson(decodedPayload);

    return {
      type: 'JWT',
      header: headerJson ?? decodedHeader,
      payload: payloadJson ?? decodedPayload,
      signature
    };
  }

  function looksLikeBase64(value) {
    const v = value.trim();
    if (v.length < 8 || v.length % 4 !== 0) return false;
    return /^[A-Za-z0-9+/=_-]+$/.test(v);
  }

  function extractCandidate(value) {
    const trimmed = value.trim();
    if (isJwt(trimmed) || tryJson(trimmed) !== null || looksLikeBase64(trimmed)) return trimmed;

    const jwt = trimmed.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    if (jwt) return jwt[0];

    const candidates = trimmed.match(/[A-Za-z0-9+/=_-]{12,}/g) || [];
    candidates.sort((a, b) => b.length - a.length);
    return candidates[0] || trimmed;
  }

  function decodeValue(input, recursive = true) {
    const original = input.trim();
    if (!original) throw new Error('No text selected.');

    const candidate = extractCandidate(original);

    if (isJwt(candidate)) {
      return decodeJwt(candidate);
    }

    const directJson = tryJson(candidate);
    if (directJson !== null) {
      return { type: 'JSON', value: recursive ? deepDecode(directJson) : directJson };
    }

    let decoded;
    try {
      decoded = decodeURIComponent(candidate);
    } catch {
      decoded = candidate;
    }

    const urlJson = tryJson(decoded);
    if (urlJson !== null) {
      return { type: 'URL → JSON', value: recursive ? deepDecode(urlJson) : urlJson };
    }

    try {
      const base64Decoded = decodeBase64(candidate);
      const nestedJwt = base64Decoded.trim();

      if (isJwt(nestedJwt)) return decodeJwt(nestedJwt);

      const nestedJson = tryJson(base64Decoded);
      if (nestedJson !== null) {
        return { type: 'Base64 → JSON', value: recursive ? deepDecode(nestedJson) : nestedJson };
      }

      return { type: 'Base64', value: base64Decoded };
    } catch {
      throw new Error('Selected text is not valid JSON, JWT, Base64, or URL-encoded data.');
    }
  }

  function deepDecode(value, depth = 0) {
    if (depth > 5) return value;
    if (Array.isArray(value)) return value.map(v => deepDecode(v, depth + 1));
    if (!value || typeof value !== 'object') {
      if (typeof value !== 'string' || value.length < 12) return value;
      try {
        const candidate = value.trim();
        if (isJwt(candidate)) return decodeJwt(candidate);
        const decoded = decodeBase64(candidate);
        const parsed = tryJson(decoded);
        return parsed !== null ? deepDecode(parsed, depth + 1) : value;
      } catch {
        return value;
      }
    }
    const result = {};
    for (const [key, item] of Object.entries(value)) result[key] = deepDecode(item, depth + 1);
    return result;
  }

  window.LogDecoder = { decodeValue };
})();
