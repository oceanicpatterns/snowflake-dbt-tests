from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd


REQUIRED_COLUMNS = {"date", "amount"}


@dataclass(frozen=True)
class SalesSummary:
    rows: int
    total_sales: float


def calculate_daily_sales(data_path: str | Path) -> pd.DataFrame:
    path = Path(data_path)
    if not path.exists():
        raise FileNotFoundError(f"Input CSV file does not exist: {path}")

    df = pd.read_csv(path)
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="raise").dt.date
    df["amount"] = pd.to_numeric(df["amount"], errors="raise")

    daily_sales = (
        df.groupby("date", as_index=False)["amount"]
        .sum()
        .sort_values("date")
        .reset_index(drop=True)
    )
    return daily_sales


def summarize_daily_sales(daily_sales: pd.DataFrame) -> SalesSummary:
    if "amount" not in daily_sales.columns:
        raise ValueError("Expected 'amount' column in daily_sales DataFrame")
    return SalesSummary(rows=int(len(daily_sales)), total_sales=float(daily_sales["amount"].sum()))
