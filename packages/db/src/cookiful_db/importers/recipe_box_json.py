from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator
from urllib.parse import urlparse


SOURCE_METADATA = {
    "ar": {
        "source_name": "Recipe Box Allrecipes",
        "source_site": "allrecipes.com",
    },
    "epi": {
        "source_name": "Recipe Box Epicurious",
        "source_site": "epicurious.com",
    },
    "fn": {
        "source_name": "Recipe Box Food Network",
        "source_site": "foodnetwork.com",
    },
}

SOURCE_KEY_PATTERN = re.compile(r"recipes_raw_(?:nosource_)?(?P<source_key>[a-z]+)\.json$")
ADVERTISEMENT_PATTERN = re.compile(r"\bADVERTISEMENT\b", re.IGNORECASE)
HOSTNAME_PATTERN = re.compile(r"^[a-z0-9][a-z0-9.-]*[a-z0-9]$")


@dataclass(frozen=True, slots=True)
class RecipeBoxImage:
    url: str | None
    reference: str | None


@dataclass(frozen=True, slots=True)
class RecipeBoxRecipeRecord:
    record_id: str
    title: str
    ingredients: list[str]
    directions: list[str]
    source_url: str
    source_name: str
    source_site: str
    image: RecipeBoxImage


@dataclass(slots=True)
class RecipeBoxJsonStats:
    total: int = 0
    yielded: int = 0
    discarded: int = 0
    image_urls: int = 0
    image_references: int = 0


def infer_source_key(json_path: str | Path) -> str:
    filename = Path(json_path).name
    match = SOURCE_KEY_PATTERN.match(filename)
    if match is None:
        raise ValueError(f"Cannot infer Recipe Box source key from {filename!r}.")

    source_key = match.group("source_key")
    if source_key not in SOURCE_METADATA:
        raise ValueError(f"Unsupported Recipe Box source key {source_key!r}.")

    return source_key


def clean_ingredient(value: Any) -> str:
    cleaned = ADVERTISEMENT_PATTERN.sub("", str(value))
    return " ".join(cleaned.split()).strip()


def normalize_ingredients(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []

    ingredients = [clean_ingredient(item) for item in value]
    return [ingredient for ingredient in ingredients if ingredient]


def normalize_directions(value: Any) -> list[str]:
    if isinstance(value, list):
        steps = [str(item).strip() for item in value]
    elif isinstance(value, str):
        steps = [line.strip() for line in value.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
    else:
        steps = []

    return [step for step in steps if step]


def is_fetchable_image_url(value: str) -> bool:
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"}:
        return False

    raw_hostname = parsed.netloc.rsplit("@", maxsplit=1)[-1].split(":", maxsplit=1)[0]
    hostname = parsed.hostname or ""
    labels = hostname.split(".")
    if raw_hostname != raw_hostname.lower() or len(labels) < 2:
        return False

    top_level_domain = labels[-1]
    return bool(
        HOSTNAME_PATTERN.fullmatch(hostname)
        and top_level_domain.isalpha()
        and 2 <= len(top_level_domain) <= 24
    )


def normalize_picture_link(value: Any) -> RecipeBoxImage:
    if not isinstance(value, str):
        return RecipeBoxImage(url=None, reference=None)

    picture_link = value.strip()
    if not picture_link:
        return RecipeBoxImage(url=None, reference=None)

    if picture_link.startswith(("http://", "https://")) and is_fetchable_image_url(picture_link):
        return RecipeBoxImage(url=picture_link, reference=picture_link)

    if picture_link.startswith("//"):
        candidate_url = f"https:{picture_link}"
        if is_fetchable_image_url(candidate_url):
            return RecipeBoxImage(url=candidate_url, reference=picture_link)

    return RecipeBoxImage(url=None, reference=picture_link)


def normalize_recipe_box_record(
    record_id: str,
    payload: dict[str, Any],
    source_key: str,
) -> RecipeBoxRecipeRecord | None:
    title = str(payload.get("title") or "").strip()
    ingredients = normalize_ingredients(payload.get("ingredients"))
    directions = normalize_directions(payload.get("instructions"))

    if not title or not ingredients or not directions:
        return None

    source = SOURCE_METADATA[source_key]
    return RecipeBoxRecipeRecord(
        record_id=record_id,
        title=title,
        ingredients=ingredients,
        directions=directions,
        source_url=f"recipe-box://{source_key}/{record_id}",
        source_name=source["source_name"],
        source_site=source["source_site"],
        image=normalize_picture_link(payload.get("picture_link")),
    )


def iter_recipe_box_json(
    json_path: str | Path,
    source_key: str | None = None,
    stats: RecipeBoxJsonStats | None = None,
) -> Iterator[RecipeBoxRecipeRecord]:
    path = Path(json_path)
    resolved_source_key = source_key or infer_source_key(path)

    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)

    if not isinstance(data, dict):
        raise ValueError(f"Expected a Recipe Box JSON object in {path}.")

    for record_id, payload in data.items():
        if stats is not None:
            stats.total += 1

        if not isinstance(payload, dict):
            if stats is not None:
                stats.discarded += 1
            continue

        record = normalize_recipe_box_record(
            record_id=str(record_id),
            payload=payload,
            source_key=resolved_source_key,
        )
        if record is None:
            if stats is not None:
                stats.discarded += 1
            continue

        if stats is not None:
            stats.yielded += 1
            if record.image.url is not None:
                stats.image_urls += 1
            elif record.image.reference is not None:
                stats.image_references += 1

        yield record


def load_recipe_box_json(json_path: str | Path, source_key: str | None = None) -> list[RecipeBoxRecipeRecord]:
    return list(iter_recipe_box_json(json_path=json_path, source_key=source_key))
