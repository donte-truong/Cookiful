import unittest

from apps.api.src.core.cors import parse_cors_origins
from cookiful_db.config import normalize_database_url


class ApiConfigTest(unittest.TestCase):
    def test_parses_comma_separated_cors_origins(self) -> None:
        self.assertEqual(
            parse_cors_origins(
                "https://owner.github.io, https://cookiful.app/,  ",
            ),
            ["https://owner.github.io", "https://cookiful.app"],
        )

    def test_normalizes_render_postgres_url_for_installed_driver(self) -> None:
        self.assertEqual(
            normalize_database_url("postgresql://user:pass@host:5432/cookiful"),
            "postgresql+psycopg://user:pass@host:5432/cookiful",
        )

    def test_preserves_explicit_database_driver(self) -> None:
        self.assertEqual(
            normalize_database_url("postgresql+psycopg://user:pass@host:5432/cookiful"),
            "postgresql+psycopg://user:pass@host:5432/cookiful",
        )


if __name__ == "__main__":
    unittest.main()
