"""Interview Question Generator: generate tailored interview questions using Claude."""

import json
import os


_MOCK_QUESTIONS = [
    {"question": "Tell me about a challenging project you led.", "type": "behavioral", "rationale": "Assesses leadership and problem-solving."},
    {"question": "How do you prioritize competing deadlines?", "type": "behavioral", "rationale": "Evaluates time management skills."},
    {"question": "Describe your experience with the core technologies listed.", "type": "technical", "rationale": "Validates technical depth."},
    {"question": "How would you onboard into this role in the first 90 days?", "type": "role-specific", "rationale": "Tests strategic thinking and role understanding."},
    {"question": "Give an example of receiving constructive feedback.", "type": "behavioral", "rationale": "Assesses growth mindset."},
    {"question": "Walk me through your approach to debugging a production issue.", "type": "technical", "rationale": "Evaluates systematic problem-solving."},
    {"question": "What interests you about this department and role?", "type": "role-specific", "rationale": "Gauges motivation and cultural fit."},
    {"question": "Describe a time you disagreed with a teammate. How did you resolve it?", "type": "behavioral", "rationale": "Tests conflict resolution skills."},
]


async def generate_interview_questions(
    job_description: str,
    resume_text: str,
) -> list[dict]:
    """Generate tailored interview questions based on job description and resume.

    Args:
        job_description: The full job description text.
        resume_text: The candidate's resume text.

    Returns:
        List of dicts with question, type ('technical'|'behavioral'|'role-specific'), and rationale.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _MOCK_QUESTIONS

    prompt = f"""You are an expert interviewer. Generate 8-10 tailored interview questions for this candidate.

## Job Description
{job_description}

## Candidate Resume
{resume_text}

Create a mix of technical, behavioral, and role-specific questions. Each question should be tailored to the candidate's background and the job requirements.

Respond in JSON only, no markdown fences:
[
  {{
    "question": "<the interview question>",
    "type": "<technical|behavioral|role-specific>",
    "rationale": "<why this question is relevant for this candidate>"
  }},
  ...
]"""

    import anthropic

    client = anthropic.AsyncAnthropic(api_key=api_key)
    response = await client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()

    questions = json.loads(raw)
    return [
        {
            "question": q["question"],
            "type": q.get("type", "behavioral"),
            "rationale": q.get("rationale", ""),
        }
        for q in questions
    ]
