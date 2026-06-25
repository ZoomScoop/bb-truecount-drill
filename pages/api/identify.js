const Anthropic = require("@anthropic-ai/sdk");

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const PROMPT = `You are a trading card identification expert covering Pokemon TCG and NHL/hockey cards.
Look at the attached photo of a single card and identify it as precisely as you can.

Respond with ONLY a JSON object (no markdown fences, no commentary) with exactly these fields:
{
  "category": "pokemon" | "nhl" | "other",
  "name": string,            // Pokemon name, or player's full name
  "set_name": string,        // e.g. "Scarlet & Violet: 151", "2023-24 Upper Deck Series 1"
  "year": string,            // release year if visible/known, else ""
  "card_number": string,     // e.g. "006/165", "#221"
  "variant": string,         // parallel/rarity/insert, e.g. "Holo Rare", "Young Guns", "1st Edition", "" if base/none
  "condition_notes": string, // brief visual notes: centering, edge wear, surface scratches, corners
  "confidence": "high" | "medium" | "low"
}

If you cannot identify the card with any confidence, still return your best guess fields but set confidence to "low".`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const { imageBase64, mediaType } = req.body || {};
  if (!imageBase64 || !mediaType) {
    res.status(400).json({ error: "imageBase64 and mediaType are required" });
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text || "{}";
    const jsonText = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    const card = JSON.parse(jsonText);
    res.status(200).json({ card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "identification failed" });
  }
}
