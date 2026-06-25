const { COOKIE_NAME, signToken, authSecret } = require("../../lib/auth");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const { passcode } = req.body || {};
  if (!passcode || passcode !== process.env.APP_PASSCODE) {
    res.status(401).json({ error: "invalid passcode" });
    return;
  }

  const token = await signToken(authSecret());
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax; Secure`
  );
  res.status(200).json({ ok: true });
}
