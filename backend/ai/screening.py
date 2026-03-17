"""Resume screening: parse PDF, score candidate against job description using Claude."""

import json
import os
import random
from io import BytesIO

from pypdf import PdfReader

from .rag import get_similar_decisions


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text content from PDF bytes."""
    reader = PdfReader(BytesIO(pdf_bytes))
    text_parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            text_parts.append(text)
    return "\n".join(text_parts)


def _build_screening_prompt(
    resume_text: str,
    job_description: str,
    requirements: list[str],
    similar_decisions: list[dict] | None = None,
) -> str:
    """Build the screening prompt for Claude."""
    past_context = ""
    if similar_decisions:
        past_context = "\n\n## Past Hiring Decisions (for reference)\n"
        for d in similar_decisions:
            past_context += (
                f"- {d.get('job_title', 'N/A')}: {d.get('outcome', 'N/A')} "
                f"(score: {d.get('score', 'N/A')}) — {d.get('reason', 'N/A')}\n"
                f"  Summary: {d.get('candidate_summary', 'N/A')}\n"
            )

    requirements_text = "\n".join(f"- {r}" for r in requirements) if requirements else "Not specified"

    return f"""You are an expert HR recruiter. Score this candidate's resume against the job description.

## Job Description
{job_description}

## Requirements
{requirements_text}
{past_context}

## Candidate Resume
{resume_text}

Respond in JSON only, no markdown fences:
{{
  "score": <integer 0-100>,
  "reasoning": "<2-3 sentence explanation>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "gaps": ["<gap1>", "<gap2>", ...]
}}"""


def _mock_screening_result() -> dict:
    """Return a mock screening result when no API key is available."""
    score = random.randint(60, 95)
    return {
        "score": score,
        "reasoning": "Mock screening result — set ANTHROPIC_API_KEY for real AI screening.",
        "strengths": ["Relevant experience", "Strong technical background"],
        "gaps": ["Could not verify specific skills without AI analysis"],
    }


async def screen_resume(
    resume_text: str,
    job_description: str,
    requirements: list[str] | None = None,
    job_title: str | None = None,
    use_rag: bool = True,
) -> dict:
    """Score a candidate's resume against a job description.

    Args:
        resume_text: Plain text of the candidate's resume.
        job_description: The job description text.
        requirements: List of job requirements.
        job_title: Job title for RAG similarity lookup.
        use_rag: Whether to include past hiring decisions as context.

    Returns:
        dict with score (0-100), reasoning, strengths, and gaps.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _mock_screening_result()

    similar_decisions = None
    if use_rag and job_title:
        try:
            similar_decisions = await get_similar_decisions(resume_text, job_title, n=5)
        except Exception:
            similar_decisions = None

    prompt = _build_screening_prompt(
        resume_text, job_description, requirements or [], similar_decisions
    )

    import anthropic

    client = anthropic.AsyncAnthropic(api_key=api_key)
    response = await client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()

    result = json.loads(raw)
    return {
        "score": int(result["score"]),
        "reasoning": result["reasoning"],
        "strengths": result.get("strengths", []),
        "gaps": result.get("gaps", []),
    }
