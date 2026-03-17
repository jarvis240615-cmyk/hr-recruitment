"""Export training data from ChromaDB as JSONL for fine-tuning."""

import json
import sys
from pathlib import Path

import chromadb

_CHROMA_PATH = str(Path(__file__).resolve().parent.parent.parent / "chroma_db")
_COLLECTION_NAME = "hiring_decisions"


def export_training_data(output_path: str = "training_data.jsonl") -> int:
    """Export all hiring decisions from ChromaDB as JSONL.

    Args:
        output_path: Path to the output JSONL file.

    Returns:
        Number of records exported.
    """
    client = chromadb.PersistentClient(path=_CHROMA_PATH)
    try:
        collection = client.get_collection(name=_COLLECTION_NAME)
    except Exception:
        print(f"Collection '{_COLLECTION_NAME}' not found. No data to export.")
        return 0

    count = collection.count()
    if count == 0:
        print("No decisions stored yet.")
        return 0

    all_data = collection.get(include=["documents", "metadatas"])

    exported = 0
    with open(output_path, "w") as f:
        for i, (doc, meta) in enumerate(zip(all_data["documents"], all_data["metadatas"])):
            record = {
                "id": all_data["ids"][i],
                "document": doc,
                "candidate_summary": meta.get("candidate_summary", ""),
                "job_title": meta.get("job_title", ""),
                "outcome": meta.get("outcome", ""),
                "reason": meta.get("reason", ""),
                "score": meta.get("score"),
            }
            f.write(json.dumps(record) + "\n")
            exported += 1

    print(f"Exported {exported} records to {output_path}")
    return exported


if __name__ == "__main__":
    output = sys.argv[1] if len(sys.argv) > 1 else "training_data.jsonl"
    export_training_data(output)
