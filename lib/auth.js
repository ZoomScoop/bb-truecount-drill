const COOKIE_NAME = "cco_auth";
const MESSAGE = "authenticated";

async function signToken(secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(MESSAGE));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function authSecret() {
  return process.env.AUTH_SECRET || process.env.APP_PASSCODE || "";
}

module.exports = { COOKIE_NAME, signToken, authSecret };
