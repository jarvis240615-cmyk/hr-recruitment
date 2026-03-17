"""Candidate Ranker: score and rank multiple candidates in parallel."""

import asyncio

from .screening import screen_resume


async def rank_candidates(
    job_id: str,
    job_description: str,
    requirements: list[str] | None,
    job_title: str | None,
    candidates: list[dict],
) -> list[dict]:
    """Score and rank a list of candidates against a job description.

    Args:
        job_id: The job identifier.
        job_description: The job description text.
        requirements: List of job requirements.
        job_title: Title of the job for RAG lookup.
        candidates: List of dicts, each with 'candidate_id' and 'resume_text'.

    Returns:
        Ranked list of dicts with candidate_id, score, reasoning, strengths, gaps.
    """
    async def _score_one(candidate: dict) -> dict:
        result = await screen_resume(
            resume_text=candidate["resume_text"],
            job_description=job_description,
            requirements=requirements,
            job_title=job_title,
            use_rag=True,
        )
        return {
            "candidate_id": candidate["candidate_id"],
            "score": result["score"],
            "reasoning": result["reasoning"],
            "strengths": result["strengths"],
            "gaps": result["gaps"],
        }

    tasks = [_score_one(c) for c in candidates]
    results = await asyncio.gather(*tasks)
    ranked = sorted(results, key=lambda r: r["score"], reverse=True)

    for i, entry in enumerate(ranked):
        entry["rank"] = i + 1

    return ranked
