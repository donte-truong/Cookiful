from __future__ import annotations

import argparse
import html
import json
from dataclasses import dataclass
from functools import lru_cache
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import re
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from cookiful_db.paths import REPO_ROOT
from cookiful_db.scripts.import_recipe_box_json import import_recipe_box_json


USER_AGENT = "Mozilla/5.0 (compatible; Cookiful Recipe Box image bootstrap)"
RECIPE_BOX_DATA_DIR = REPO_ROOT / "packages" / "utils" / "recipe-box" / "data"
RECIPE_BOX_IMAGE_DIR = RECIPE_BOX_DATA_DIR / "img"
RECIPE_BOX_UTILS_PATH = REPO_ROOT / "packages" / "utils" / "recipe-box" / "src" / "utils.py"
EPICURIOUS_SCRAPE_PATH = RECIPE_BOX_DATA_DIR / "recipes_raw_epi.json"
JSON_LD_PATTERN = re.compile(
    r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)

DEFAULT_EPICURIOUS_URLS = (
    "https://www.epicurious.com/recipes/food/views/my-favorite-simple-roast-chicken-231348",
    "https://services.epicurious.com/recipes/food/views/quick-roast-chicken",
    "https://www.epicurious.com/recipes/food/views/perfect-roast-chicken-241948",
    "https://www.epicurious.com/recipes/food/views/roast-chicken-with-smothered-cabbage-bacon-and-potatoes",
    "https://www.epicurious.com/recipes/food/views/roast-chicken-with-potatoes-and-onions-360589",
    "https://www.epicurious.com/recipes/food/views/herb-roast-chicken-with-pan-sauce-380350",
    "https://www.epicurious.com/recipes/food/views/roast-chicken-with-carrots-51192210",
    "https://www.epicurious.com/recipes/food/views/roast-chicken-with-pan-gravy-351913",
    "https://www.epicurious.com/recipes/food/views/pasta-with-15-minute-burst-cherry-tomato-sauce-56390060",
    "https://www.epicurious.com/recipes/food/views/cacio-e-pepe-365162",
    "https://www.epicurious.com/recipes/food/views/classic-carbonara-51168110",
    "https://www.epicurious.com/recipes/food/views/spaghetti-with-no-cook-tomato-sauce-and-hazelnuts-56389888",
    "https://www.epicurious.com/recipes/food/views/quick-chicken-piccata",
    "https://www.epicurious.com/recipes/food/views/herby-chicken-kofta-meatballs",
    "https://www.epicurious.com/recipes/food/views/curried-lentil-tomato-and-coconut-soup",
    "https://www.epicurious.com/recipes/food/views/miso-butternut-squash-soup",
    "https://www.epicurious.com/recipes/food/views/ba-syn-mustard-chicken-shallots-cream",
    "https://www.epicurious.com/recipes/food/views/ba-syn-sheet-pan-lemon-chicken-potatoes",
    "https://www.epicurious.com/recipes/food/views/ba-syn-basil-chicken-stir-fry",
    "https://www.epicurious.com/recipes/food/views/best-white-chicken-chili",
    "https://www.epicurious.com/recipes/food/views/ba-syn-crispy-smashed-potatoes",
    "https://www.epicurious.com/recipes/food/views/ba-syn-sheet-pan-chicken-souvlaki",
    "https://www.epicurious.com/recipes/food/views/ba-syn-creamy-chicken-mushroom-soup",
    "https://www.epicurious.com/recipes/food/views/german-potato-salad-with-dill-51236500",
    "https://www.epicurious.com/recipes/food/views/ba-syn-make-ahead-lentil-salad",
    "https://www.epicurious.com/recipes/food/views/ba-syn-millionaires-shortbread",
    "https://www.epicurious.com/recipes/food/views/ba-syn-roasted-tofu-grain-bowls-with-miso-tahini-sauce",
    "https://www.epicurious.com/recipes/food/views/one-pot-gingery-chicken-and-rice-with-peanut-sauce",
    "https://www.epicurious.com/recipes/food/views/oven-risotto-with-crispy-roasted-mushrooms",
    "https://www.epicurious.com/recipes/food/views/ba-syn-crispy-salmon-with-avocado-sauce",
    "https://www.epicurious.com/recipes/food/views/skillet-chicken-parmesan-with-gnocchi",
    "https://www.epicurious.com/recipes/food/views/ba-syn-bobs-chicken-and-cabbage-salad",
    "https://www.epicurious.com/recipes/food/views/ba-syn-crispy-rice-salad-spicy-tahini-dressing",
    "https://www.epicurious.com/recipes/food/views/ba-syn-roasted-cauliflower-salad-with-feta-and-dates",
    "https://www.epicurious.com/recipes/food/views/ba-syn-steak-salad-with-feta-dressing",
    "https://www.epicurious.com/recipes/food/views/ba-syn-pistachio-bundt-cake",
    "https://www.epicurious.com/recipes/food/views/kale-brussels-sprout-salad-368295",
    "https://www.epicurious.com/recipes/food/views/ba-syn-spicy-salmon-bowl",
    "https://www.epicurious.com/recipes/food/views/ba-syn-chicken-quesadillas",
    "https://www.epicurious.com/recipes/food/views/ba-syn-shrimp-green-sauce",
    "https://www.epicurious.com/recipes/food/views/lemon-cookies",
    "https://www.epicurious.com/recipes/food/views/vegetarian-skillet-stuffed-shells",
    "https://www.epicurious.com/recipes/food/views/kung-pao-chicken",
    "https://www.epicurious.com/recipes/food/views/shockingly-easy-no-knead-focaccia",
    "https://www.epicurious.com/recipes/food/views/ba-syn-pad-kra-pao",
    "https://www.epicurious.com/recipes/food/views/flourless-chocolate-cake-14478",
    "https://www.epicurious.com/recipes/food/views/french-onion-soup",
    "https://www.epicurious.com/recipes/food/views/ba-syn-cashew-chicken-asparagus",
    "https://www.epicurious.com/recipes/food/views/ba-syn-chocolate-olive-oil-cake",
    "https://www.epicurious.com/recipes/food/views/ba-syn-gochujang-sesame-noodles",
    "https://www.epicurious.com/recipes/food/views/sticky-rice-with-mango-12066",
    "https://www.epicurious.com/recipes/food/views/spaghetti-al-limone",
    "https://www.epicurious.com/recipes/food/views/ba-syn-meatball-recipe",
    "https://www.epicurious.com/recipes/food/views/ba-syn-dark-and-stormy-braised-pot-roast",
    "https://www.epicurious.com/recipes/food/views/ba-syn-tomato-focaccia",
    "https://www.epicurious.com/recipes/food/views/ba-syn-grilled-buttermilk-chicken-with-summer-salad",
    "https://www.epicurious.com/recipes/food/views/grilled-peruvian-chicken",
    "https://www.epicurious.com/recipes/food/views/citrus-shrimp-rice-bowls",
    "https://www.epicurious.com/recipes/food/views/flan-de-queso-cheese-flan",
    "https://www.epicurious.com/recipes/food/views/ba-syn-no-knead-cheddar-jalapeno-bread",
    "https://www.epicurious.com/recipes/food/views/leek-and-potato-galette-with-pistachio-crust",
    "https://www.epicurious.com/recipes/food/views/ba-syn-muffuletta-potato-salad",
    "https://www.epicurious.com/recipes/food/views/ba-syn-miso-chicken-soba-bowls",
    "https://www.epicurious.com/recipes/food/views/ba-syn-paella-de-pollo-con-verduras",
    "https://www.epicurious.com/recipes/food/views/ba-syn-sheet-pan-shawarma-spiced-chicken",
    "https://www.epicurious.com/recipes/food/views/diner-style-buttermilk-pancakes",
    "https://www.epicurious.com/recipes/food/views/ba-syn-shrimp-fajitas",
    "https://www.epicurious.com/recipes/food/views/ba-syn-summer-yellow-squash-soup",
    "https://www.epicurious.com/recipes/food/views/ba-syn-tiny-tomato-galettes",
    "https://www.epicurious.com/recipes/food/views/ba-syn-spicy-cumin-tofu",
    "https://www.epicurious.com/recipes/food/views/ba-syn-berries-and-cream-mille-feuille",
    "https://www.epicurious.com/recipes/food/views/green-salad",
    "https://www.epicurious.com/recipes/food/views/chicken-salad",
    "https://www.epicurious.com/recipes/food/views/easy-banana-bread-recipe",
    "https://www.epicurious.com/recipes/food/views/amaranth-breakfast-porridge",
    "https://www.epicurious.com/recipes/food/views/cioppino-san-francisco-seafood-stew",
    "https://www.epicurious.com/recipes/food/views/classic-french-vinaigrette",
    "https://www.epicurious.com/recipes/food/views/caramelized-onion-pasta",
    "https://www.epicurious.com/recipes/food/views/easy-lemon-curd",
    "https://www.epicurious.com/recipes/food/views/best-cocoa-brownies",
    "https://www.epicurious.com/recipes/food/views/creme-anglaise",
    "https://www.epicurious.com/recipes/food/views/kugelhopf-gourmet-magazine",
    "https://www.epicurious.com/recipes/food/views/traditional-apple-walnut-charoset",
    "https://www.epicurious.com/recipes/food/views/homemade-ranch-dressing",
    "https://www.epicurious.com/recipes/food/views/fufu",
    "https://www.epicurious.com/recipes/food/views/baked-butter-paneer",
    "https://www.epicurious.com/recipes/food/views/kentucky-hot-brown-recipe",
    "https://www.epicurious.com/recipes/food/views/black-rice-pudding",
    "https://www.epicurious.com/recipes/food/views/vodka-gochujang-pasta",
    "https://www.epicurious.com/recipes/food/views/sofrito-bolognese",
    "https://www.epicurious.com/recipes/food/views/pad-kee-mao",
    "https://www.epicurious.com/recipes/food/views/golden-mushroom-soup-with-orzo-and-a-pat-of-butter",
    "https://www.epicurious.com/recipes/food/views/pasta-alla-mezcal",
    "https://www.epicurious.com/recipes/food/views/spaghetti-with-cabbage-pancetta-and-calabrian-chile",
    "https://www.epicurious.com/recipes/food/views/spaghetti-with-poblano-chile-sauce",
    "https://www.epicurious.com/recipes/food/views/cajun-shrimp-pasta",
    "https://www.epicurious.com/recipes/food/views/halloumi-lasagna",
    "https://www.epicurious.com/recipes/food/views/pasta-with-smoked-salmon-and-capers",
    "https://www.epicurious.com/recipes/food/views/pasta-primavera",
    "https://www.epicurious.com/recipes/food/views/angel-hair-bibimguksu",
    "https://www.epicurious.com/recipes/food/views/tortellini-in-preserved-lemon-brodo",
    "https://www.epicurious.com/recipes/food/views/shrimp-scampi-pasta",
    "https://www.epicurious.com/recipes/food/views/berberger-pasta",
    "https://www.epicurious.com/recipes/food/views/fettuccine-alfredo",
)


@dataclass(frozen=True, slots=True)
class ScrapedRecipeBoxRecord:
    url: str
    title: str
    ingredients: list[str]
    instructions: list[str]
    picture_link: str


@dataclass(frozen=True, slots=True)
class ScrapeRecipeBoxImagesResult:
    scraped: int
    downloaded: int
    skipped: int
    failed: int
    json_path: Path


@lru_cache(maxsize=1)
def load_recipe_box_url_to_filename() -> Callable[[str], str]:
    spec = spec_from_file_location("_cookiful_recipe_box_utils", RECIPE_BOX_UTILS_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load Recipe Box utils from {RECIPE_BOX_UTILS_PATH}.")

    module = module_from_spec(spec)
    spec.loader.exec_module(module)

    url_to_filename = getattr(module, "URL_to_filename", None)
    if not callable(url_to_filename):
        raise RuntimeError("Recipe Box utils.py does not expose URL_to_filename.")

    return url_to_filename


def build_request(url: str) -> Request:
    return Request(
        url,
        headers={
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": USER_AGENT,
        },
    )


def fetch_text(url: str, timeout_seconds: int) -> str:
    with urlopen(build_request(url), timeout=timeout_seconds) as response:
        return response.read().decode("utf-8", errors="replace")


def find_recipe_json_ld(value: Any) -> dict[str, Any] | None:
    if isinstance(value, dict):
        value_type = value.get("@type")
        if value_type == "Recipe" or (isinstance(value_type, list) and "Recipe" in value_type):
            return value

        graph = value.get("@graph")
        if isinstance(graph, list):
            for item in graph:
                recipe = find_recipe_json_ld(item)
                if recipe is not None:
                    return recipe

    if isinstance(value, list):
        for item in value:
            recipe = find_recipe_json_ld(item)
            if recipe is not None:
                return recipe

    return None


def extract_recipe_json_ld(page_html: str) -> dict[str, Any] | None:
    for match in JSON_LD_PATTERN.finditer(page_html):
        try:
            payload = json.loads(html.unescape(match.group(1)))
        except json.JSONDecodeError:
            continue

        recipe = find_recipe_json_ld(payload)
        if recipe is not None:
            return recipe

    return None


def normalize_instruction(value: Any) -> str:
    if isinstance(value, dict):
        return str(value.get("text") or value.get("name") or "").strip()

    return str(value or "").strip()


def normalize_instructions(value: Any) -> list[str]:
    if isinstance(value, list):
        return [step for step in (normalize_instruction(item) for item in value) if step]

    step = normalize_instruction(value)
    return [step] if step else []


def normalize_image(value: Any) -> str | None:
    if isinstance(value, str) and value.startswith(("http://", "https://")):
        return value

    if isinstance(value, list):
        for item in value:
            image = normalize_image(item)
            if image is not None:
                return image

    if isinstance(value, dict):
        return normalize_image(value.get("url") or value.get("contentUrl"))

    return None


def scrape_epicurious_recipe(url: str, timeout_seconds: int) -> ScrapedRecipeBoxRecord:
    page_html = fetch_text(url, timeout_seconds=timeout_seconds)
    recipe = extract_recipe_json_ld(page_html)
    if recipe is None:
        raise ValueError("No Recipe JSON-LD block found.")

    title = str(recipe.get("name") or recipe.get("headline") or "").strip()
    ingredients = [str(item).strip() for item in recipe.get("recipeIngredient") or [] if str(item).strip()]
    instructions = normalize_instructions(recipe.get("recipeInstructions"))
    picture_link = normalize_image(recipe.get("image") or recipe.get("thumbnailUrl"))

    if not title or not ingredients or not instructions or picture_link is None:
        raise ValueError("Recipe JSON-LD is missing required Recipe Box fields.")

    return ScrapedRecipeBoxRecord(
        url=url,
        title=title,
        ingredients=ingredients,
        instructions=instructions,
        picture_link=picture_link,
    )


def recipe_box_image_path(url: str) -> Path:
    return RECIPE_BOX_IMAGE_DIR / f"{load_recipe_box_url_to_filename()(url)}.jpg"


def download_recipe_image(record: ScrapedRecipeBoxRecord, timeout_seconds: int) -> bool:
    image_path = recipe_box_image_path(record.url)
    if image_path.is_file() and image_path.stat().st_size > 0:
        return False

    RECIPE_BOX_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    request = Request(record.picture_link, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=timeout_seconds) as response:
        image_path.write_bytes(response.read())

    return True


def load_existing_recipe_box_json(json_path: Path) -> dict[str, Any]:
    if not json_path.is_file():
        return {}

    with json_path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    if not isinstance(payload, dict):
        raise ValueError(f"Expected a JSON object in {json_path}.")

    return payload


def write_recipe_box_json(json_path: Path, records: dict[str, Any]) -> None:
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with json_path.open("w", encoding="utf-8") as handle:
        json.dump(records, handle, indent=2, sort_keys=True)
        handle.write("\n")


def scrape_recipe_box_images(
    urls: list[str],
    json_path: Path = EPICURIOUS_SCRAPE_PATH,
    timeout_seconds: int = 30,
) -> ScrapeRecipeBoxImagesResult:
    records = load_existing_recipe_box_json(json_path)
    scraped = 0
    downloaded = 0
    skipped = 0
    failed = 0

    for url in urls:
        try:
            record = scrape_epicurious_recipe(url, timeout_seconds=timeout_seconds)
            records[record.url] = {
                "title": record.title,
                "ingredients": record.ingredients,
                "instructions": record.instructions,
                "picture_link": record.picture_link,
            }
            scraped += 1
            if download_recipe_image(record, timeout_seconds=timeout_seconds):
                downloaded += 1
            else:
                skipped += 1
        except (HTTPError, URLError, TimeoutError, ValueError, OSError) as exc:
            failed += 1
            print(f"Could not scrape {url}: {exc}")

    write_recipe_box_json(json_path, records)
    return ScrapeRecipeBoxImagesResult(
        scraped=scraped,
        downloaded=downloaded,
        skipped=skipped,
        failed=failed,
        json_path=json_path,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Scrape Recipe Box image-backed Epicurious recipes.")
    parser.add_argument("urls", nargs="*", help="Epicurious recipe URLs. Defaults to a small curated starter set.")
    parser.add_argument("--json-path", type=Path, default=EPICURIOUS_SCRAPE_PATH)
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--skip-import", action="store_true")
    parser.add_argument("--commit-every", type=int, default=25)
    return parser


def main() -> None:
    args = build_parser().parse_args()
    urls = args.urls or list(DEFAULT_EPICURIOUS_URLS)
    result = scrape_recipe_box_images(
        urls=urls,
        json_path=args.json_path,
        timeout_seconds=args.timeout,
    )
    print(
        "Recipe Box image scrape complete. "
        f"scraped={result.scraped} downloaded={result.downloaded} "
        f"skipped={result.skipped} failed={result.failed} json={result.json_path}"
    )

    if not args.skip_import:
        import_recipe_box_json([result.json_path], commit_every=args.commit_every)


if __name__ == "__main__":
    main()
