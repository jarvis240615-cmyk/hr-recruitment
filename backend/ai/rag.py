"""RAG Learning System: store and retrieve past hiring decisions using ChromaDB + sentence-transformers."""

import json
import uuid
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

_CHROMA_PATH = str(Path(__file__).resolve().parent.parent.parent / "chroma_db")
_COLLECTION_NAME = "hiring_decisions"

_model: SentenceTransformer | None = None
_client: chromadb.ClientAPI | None = None


def _get_embedding_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _get_collection() -> chromadb.Collection:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=_CHROMA_PATH)
    return _client.get_or_create_collection(
        name=_COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def _embed(text: str) -> list[float]:
    model = _get_embedding_model()
    return model.encode(text).tolist()


async def store_decision(
    application_id: str,
    outcome: str,
    reason: str,
    candidate_summary: str = "",
    job_title: str = "",
    score: int | None = None,
) -> None:
    """Store a hiring decision in ChromaDB for future RAG retrieval.

    Args:
        application_id: Unique identifier for the application.
        outcome: 'hired' or 'rejected'.
        reason: Explanation for the decision.
        candidate_summary: Brief summary of the candidate.
        job_title: Title of the job applied for.
        score: Screening score (0-100) if available.
    """
    collection = _get_collection()
    doc_text = f"Job: {job_title}\nCandidate: {candidate_summary}\nOutcome: {outcome}\nReason: {reason}"
    embedding = _embed(doc_text)

    metadata = {
        "application_id": application_id,
        "outcome": outcome,
        "reason": reason,
        "candidate_summary": candidate_summary,
        "job_title": job_title,
    }
    if score is not None:
        metadata["score"] = score

    collection.upsert(
        ids=[application_id],
        embeddings=[embedding],
        documents=[doc_text],
        metadatas=[metadata],
    )


async def get_similar_decisions(
    resume_text: str,
    job_title: str,
    n: int = 5,
) -> list[dict]:
    """Retrieve the top-N most similar past hiring decisions.

    Args:
        resume_text: The candidate's resume text.
        job_title: The job title being applied for.
        n: Number of similar decisions to return.

    Returns:
        List of dicts with candidate_summary, job_title, outcome, reason, score.
    """
    collection = _get_collection()
    if collection.count() == 0:
        return []

    query_text = f"Job: {job_title}\nCandidate: {resume_text[:500]}"
    embedding = _embed(query_text)

    results = collection.query(
        query_embeddings=[embedding],
        n_results=min(n, collection.count()),
    )

    decisions = []
    if results and results["metadatas"]:
        for meta in results["metadatas"][0]:
            decisions.append({
                "candidate_summary": meta.get("candidate_summary", ""),
                "job_title": meta.get("job_title", ""),
                "outcome": meta.get("outcome", ""),
                "reason": meta.get("reason", ""),
                "score": meta.get("score"),
            })
    return decisions
