import pandas as pd


def calculate_daily_sales(data_path):
    """
    Calculates daily sales from a CSV file.

    Args:
        data_path (str): Path to the CSV file containing sales data.

    Returns:
        pandas.DataFrame: DataFrame with daily sales data.
    """

    df = pd.read_csv(data_path)

    # Ensure 'date' is a datetime object
    df['date'] = pd.to_datetime(df['date'])

    daily_sales = df.groupby('date')['amount'].sum().reset_index()
    return daily_sales

# Example usage 
if __name__ == "__main__":
  data_path = "data/sales_data.csv"
  daily_sales = calculate_daily_sales(data_path)
  print(daily_sales.to_string())