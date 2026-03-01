from __future__ import annotations

from pathlib import Path
import sys

SRC_PATH = Path(__file__).resolve().parents[1] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from snowflake_dbt_tests import calculate_daily_sales, summarize_daily_sales


def main() -> None:
    data_path = Path("tests/data/sample_sales.csv")
    daily_sales = calculate_daily_sales(data_path)
    summary = summarize_daily_sales(daily_sales)
    print(daily_sales.to_string(index=False))
    print(f"\nRows: {summary.rows}, Total Sales: {summary.total_sales:.2f}")


if __name__ == "__main__":
    main()
