# Phase 2: Fine-Tuning Guide

## When to Fine-Tune

Fine-tuning makes sense when:

- **500+ hiring decisions** have been stored in ChromaDB
- RAG-augmented screening scores are consistently useful but you want faster inference
- You need to reduce API costs by moving from Claude to a smaller fine-tuned model
- Domain-specific terminology or scoring patterns aren't captured well by the base model

## Exporting Training Data

```bash
cd backend/ai
python export_training_data.py training_data.jsonl
```

This exports all stored hiring decisions as JSONL from ChromaDB.

## Data Format

Each line in the JSONL file contains:

```json
{
  "id": "application_123",
  "document": "Job: Software Engineer\nCandidate: ...\nOutcome: hired\nReason: ...",
  "candidate_summary": "...",
  "job_title": "Software Engineer",
  "outcome": "hired",
  "reason": "Strong technical skills...",
  "score": 85
}
```

## Fine-Tuning Steps

1. **Export data**: Run the export script above
2. **Format for your provider**: Convert JSONL to the format required by your fine-tuning provider (Anthropic, OpenAI, etc.)
3. **Create training pairs**: Transform each record into prompt/completion pairs:
   - **Prompt**: Job description + candidate resume
   - **Completion**: Score + reasoning + strengths + gaps
4. **Split data**: 90% training, 10% validation
5. **Train**: Submit to your fine-tuning provider
6. **Evaluate**: Compare fine-tuned model scores against the RAG-augmented Claude baseline
7. **Deploy**: Update `screening.py` to use the fine-tuned model ID

## Recommendations

- Keep the RAG system running alongside the fine-tuned model for at least one quarter to validate
- Re-export and retrain quarterly as new decisions accumulate
- Monitor for score drift between the fine-tuned model and human decisions
