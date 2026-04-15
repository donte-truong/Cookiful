import csv
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator


@dataclass(slots=True)
class ImportedRecipeRecord:
    title: str
    ingredients: list[str]
    directions: list[str]
    source_url: str
    source_name: str
    ner: list[str]
    source_site: str


def parse_json_array_field(value: str | None) -> list[str]:
    if value is None:
        return []
    value = value.strip()
    if not value:
        return []
    parsed = json.loads(value)
    if not isinstance(parsed, list):
        raise ValueError("Expected a JSON array field in the recipe CSV.")
    return [str(item) for item in parsed]


def iter_recipe_csv(csv_path: str | Path) -> Iterator[ImportedRecipeRecord]:
    with Path(csv_path).open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            yield ImportedRecipeRecord(
                title=row["title"].strip(),
                ingredients=parse_json_array_field(row["ingredients"]),
                directions=parse_json_array_field(row["directions"]),
                source_url=row["link"].strip(),
                source_name=row["source"].strip(),
                ner=parse_json_array_field(row.get("NER") or row.get("ner") or ""),
                source_site=row["site"].strip(),
            )


def load_recipe_csv(csv_path: str | Path) -> list[ImportedRecipeRecord]:
    return list(iter_recipe_csv(csv_path))
