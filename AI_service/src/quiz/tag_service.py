"""
    This service will generate tags for a given video_url (via transcript).
"""

from __future__ import annotations
import asyncio
from typing import List

import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

from ..transcript_service import transcribe_video

MODEL_NAME = "fabiochiu/t5-base-tag-generation"

# Load once at import
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model.to(DEVICE)
model.eval()

_GENERATE_SEM = asyncio.Semaphore(2)


def _generate_tags_sync(transcript_text: str) -> List[str]:
    # Tokenize (sync)
    inputs = tokenizer(
        transcript_text,
        max_length=256,
        truncation=True,
        return_tensors="pt",
    )
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

    with torch.inference_mode():
        output_ids = model.generate(
            **inputs,
            num_beams=4,
            do_sample=True,
            min_new_tokens=5,
            max_new_tokens=64,
            early_stopping=True,
        )

    decoded = tokenizer.batch_decode(output_ids, skip_special_tokens=True)[0]

    parts = [p.strip() for p in decoded.replace("\n", ",").split(",") if p.strip()]

    seen = set()
    tags: List[str] = []
    for p in parts:
        if p not in seen:
            seen.add(p)
            tags.append(p)
    return tags


async def tag_generate(transcript: str) -> List[str]:
    async with _GENERATE_SEM:
        tags = await asyncio.to_thread(_generate_tags_sync, transcript)
    return tags
