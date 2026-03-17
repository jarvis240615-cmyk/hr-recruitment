"""Job Description Generator: generate structured job descriptions using Claude."""

import json
import os

_MOCK_JD = {
    "title": "",
    "summary": "This is a mock job description. Set ANTHROPIC_API_KEY for AI-generated descriptions.",
    "responsibilities": [
        "Lead projects and deliver results",
        "Collaborate with cross-functional teams",
        "Mentor junior team members",
    ],
    "requirements": [
        "3+ years of relevant experience",
        "Strong communication skills",
        "Bachelor's degree or equivalent",
    ],
    "nice_to_have": [
        "Experience with agile methodologies",
        "Industry certifications",
    ],
}


async def generate_job_description(
    job_title: str,
    department: str,
    seniority_level: str,
    key_skills: str,
) -> dict:
    """Generate a full job description using Claude.

    Args:
        job_title: Title of the position.
        department: Department the role belongs to.
        seniority_level: e.g. 'Junior', 'Mid', 'Senior', 'Lead'.
        key_skills: Comma-separated list of key skills.

    Returns:
        dict with title, summary, responsibilities[], requirements[], nice_to_have[].
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        mock = _MOCK_JD.copy()
        mock["title"] = job_title
        return mock

    prompt = f"""Generate a professional job description for the following role.

Job Title: {job_title}
Department: {department}
Seniority Level: {seniority_level}
Key Skills: {key_skills}

Respond in JSON only, no markdown fences:
{{
  "title": "<job title>",
  "summary": "<2-3 sentence overview of the role>",
  "responsibilities": ["<responsibility1>", "<responsibility2>", ...],
  "requirements": ["<requirement1>", "<requirement2>", ...],
  "nice_to_have": ["<nice_to_have1>", "<nice_to_have2>", ...]
}}

Generate 5-8 responsibilities, 5-7 requirements, and 3-5 nice-to-haves."""

    import anthropic

    client = anthropic.AsyncAnthropic(api_key=api_key)
    response = await client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()

    result = json.loads(raw)
    return {
        "title": result.get("title", job_title),
        "summary": result.get("summary", ""),
        "responsibilities": result.get("responsibilities", []),
        "requirements": result.get("requirements", []),
        "nice_to_have": result.get("nice_to_have", []),
    }
