from __future__ import annotations

from difflib import SequenceMatcher
from typing import Any, Dict, Iterable, List, Optional, Tuple


def normalize(text: str) -> str:
    return " ".join(
        text.lower()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ü", "u")
        .replace("ñ", "n")
        .replace("¿", "")
        .replace("?", "")
        .replace(",", " ")
        .replace(".", " ")
        .split()
    )


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize(a), normalize(b)).ratio()


def best_match(query: str, options: Iterable[str], threshold: float = 0.55) -> Tuple[Optional[str], float]:
    best_value = None
    best_score = 0.0
    for option in options:
        score = similarity(query, option)
        if score > best_score:
            best_value = option
            best_score = score
    if best_score < threshold:
        return None, best_score
    return best_value, best_score


def resolve_app_name(app_name: str, registry: Dict[str, Any]) -> Dict[str, Any]:
    keys = list(registry.keys())
    best, score = best_match(app_name, keys, threshold=0.45)
    if not best:
        return {"ok": False, "error": f"No encontré una aplicación parecida a '{app_name}'."}
    return {"ok": True, "resolved_key": best, "score": score, "target": registry[best]}


def resolve_contact_name(contact_name: str, contacts: List[Dict[str, Any]]) -> Dict[str, Any]:
    indexed: List[Tuple[str, Dict[str, Any]]] = []
    for contact in contacts:
        indexed.append((contact["name"], contact))
        for alias in contact.get("aliases", []):
            indexed.append((alias, contact))

    best_label = None
    best_contact = None
    best_score = 0.0

    for label, contact in indexed:
        score = similarity(contact_name, label)
        if score > best_score:
            best_score = score
            best_label = label
            best_contact = contact

    if not best_contact or best_score < 0.55:
        return {"ok": False, "error": f"No encontré un contacto parecido a '{contact_name}'."}

    close_candidates = []
    for label, contact in indexed:
        score = similarity(contact_name, label)
        if score >= max(0.70, best_score - 0.08):
            close_candidates.append(
                {
                    "name": contact["name"],
                    "phone": contact.get("phone"),
                    "score": round(score, 3),
                }
            )

    unique = []
    seen = set()
    for item in sorted(close_candidates, key=lambda x: x["score"], reverse=True):
        key = (item["name"], item.get("phone"))
        if key not in seen:
            seen.add(key)
            unique.append(item)

    ambiguous = len(unique) > 1 and unique[0]["score"] - unique[1]["score"] < 0.08

    return {
        "ok": True,
        "resolved_contact": best_contact,
        "matched_label": best_label,
        "score": round(best_score, 3),
        "ambiguous": ambiguous,
        "candidates": unique[:5],
    }
