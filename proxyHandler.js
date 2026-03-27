const BACKEND_ORIGIN = "https://api.telisik.org";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "host",
]);

function buildTarget(prefix, req) {
  const pathParts = req.query?.path;
  const path = Array.isArray(pathParts)
    ? pathParts.join("/")
    : pathParts
      ? String(pathParts)
      : "";

  const queryIndex = req.url.indexOf("?");
  const search = queryIndex >= 0 ? req.url.slice(queryIndex) : "";
  return `${BACKEND_ORIGIN}/${prefix}/${path}${search}`;
}

function buildForwardHeaders(req) {
  const headers = {};

  for (const [key, value] of Object.entries(req.headers || {})) {
    const lowered = key.toLowerCase();
    if (!value || HOP_BY_HOP_HEADERS.has(lowered)) continue;
    headers[key] = Array.isArray(value) ? value.join(", ") : value;
  }

  return headers;
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

async function buildRequestBody(req, headers) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body) || typeof req.body === "string") {
      return req.body;
    }

    if (req.body instanceof Uint8Array) {
      return req.body;
    }

    if (typeof req.body === "object") {
      if (!headers["content-type"] && !headers["Content-Type"]) {
        headers["content-type"] = "application/json";
      }
      return JSON.stringify(req.body);
    }
  }

  return readRawBody(req);
}

async function proxyToBackend(req, res, prefix) {
  try {
    const target = buildTarget(prefix, req);
    const headers = buildForwardHeaders(req);

    const init = {
      method: req.method,
      headers,
      redirect: "manual",
    };

    if (!["GET", "HEAD"].includes(req.method)) {
      init.body = await buildRequestBody(req, headers);
    }

    const upstream = await fetch(target, init);

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
      res.setHeader(key, value);
    });

    const data = Buffer.from(await upstream.arrayBuffer());
    res.send(data);
  } catch (error) {
    res.status(502).json({
      error: "Proxy request failed",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

module.exports = { proxyToBackend };
