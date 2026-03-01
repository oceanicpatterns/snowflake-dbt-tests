from pathlib import Path

import pandas as pd
import pytest

from snowflake_dbt_tests.sales import calculate_daily_sales, summarize_daily_sales


def test_daily_sales_calculation() -> None:
    data_path = Path("tests/data/sample_sales.csv")
    daily_sales = calculate_daily_sales(data_path)

    expected = pd.DataFrame(
        {
            "date": pd.to_datetime(["2024-02-20", "2024-02-21", "2024-02-22"]).date,
            "amount": [100, 50, 150],
        }
    )

    pd.testing.assert_frame_equal(daily_sales, expected)


def test_summarize_daily_sales() -> None:
    data = pd.DataFrame(
        {
            "date": pd.to_datetime(["2024-02-20", "2024-02-21"]).date,
            "amount": [10, 20],
        }
    )
    summary = summarize_daily_sales(data)
    assert summary.rows == 2
    assert summary.total_sales == 30.0


def test_calculate_daily_sales_missing_file() -> None:
    with pytest.raises(FileNotFoundError):
        calculate_daily_sales("tests/data/missing.csv")


def test_calculate_daily_sales_missing_columns(tmp_path: Path) -> None:
    path = tmp_path / "bad.csv"
    path.write_text("date,value\n2024-02-20,1\n", encoding="utf-8")
    with pytest.raises(ValueError, match="Missing required columns"):
        calculate_daily_sales(path)
