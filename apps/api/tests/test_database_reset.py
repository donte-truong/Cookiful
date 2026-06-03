import unittest
from types import SimpleNamespace
from unittest.mock import patch

from cookiful_db.scripts.reset_database import is_local_database_url, quote_identifier, reset_database


class DatabaseResetTests(unittest.TestCase):
    def test_identifies_local_database_urls(self) -> None:
        self.assertTrue(is_local_database_url("postgresql+psycopg://postgres:postgres@localhost:5432/cookiful"))
        self.assertTrue(is_local_database_url("postgresql://postgres:postgres@127.0.0.1:5432/cookiful"))
        self.assertFalse(is_local_database_url("postgresql://postgres:postgres@db.example.com:5432/cookiful"))

    def test_quotes_table_identifiers(self) -> None:
        self.assertEqual(quote_identifier('recipe"drafts'), '"recipe""drafts"')

    def test_refuses_non_local_reset_by_default(self) -> None:
        with patch(
            "cookiful_db.scripts.reset_database.get_database_settings",
            return_value=SimpleNamespace(database_url="postgresql://postgres:postgres@db.example.com:5432/cookiful"),
        ):
            with self.assertRaises(RuntimeError):
                reset_database()


if __name__ == "__main__":
    unittest.main()
