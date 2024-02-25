import unittest
import pandas as pd

from scripts.calculate_daily_sales import calculate_daily_sales

class TestCalculateDailySales(unittest.TestCase):

  def test_daily_sales_calculation(self):
    data_path = "tests/data/sample_sales.csv"
    expected_sales = {
    "date": ["2024-02-20", "2024-02-21", "2024-02-22"],
    "amount": [100, 50, 150]
    }

    daily_sales = calculate_daily_sales(data_path)
    self.assertEqual(daily_sales['date'].dt.strftime('%Y-%m-%d').tolist(), expected_sales['date'])
    self.assertEqual(daily_sales['amount'].tolist(), expected_sales['amount'])

if __name__ == "__main__":
  unittest.main()