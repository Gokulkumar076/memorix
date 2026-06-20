import json
from anthropic import AsyncAnthropic
from app.core.config import settings
from app.schemas.schemas import AIGenerateRequest

client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None


SYSTEM_PROMPT = """You are an expert educator creating spaced-repetition flashcards.
Generate flashcards as a JSON array. Each card must have this exact shape:
{"front": "question text", "back": "answer text", "tags": ["tag1"]}

Rules:
- Front should be a clear, focused question or prompt.
- Back should be a concise, accurate answer (1-3 sentences).
- Avoid yes/no questions; prefer recall-based questions.
- Make each card test a single atomic fact or concept.
- Return ONLY valid JSON, no markdown formatting, no commentary, no code fences.
"""


async def generate_flashcards(request: AIGenerateRequest) -> list[dict]:
    if not client:
        raise RuntimeError("AI service not configured: missing ANTHROPIC_API_KEY")

    user_prompt = (
        f"Create {request.num_cards} {request.difficulty}-level flashcards about: {request.topic}. "
        f"Return a JSON array only."
    )

    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    text = "".join(block.text for block in response.content if block.type == "text")
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    try:
        cards = json.loads(text)
    except json.JSONDecodeError:
        raise ValueError("AI returned invalid JSON")

    return cards
