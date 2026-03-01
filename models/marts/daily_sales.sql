select
  product_id,
  product_name,
  date_trunc('day', created_at) as sales_date,
  sum(amount) as total_daily_sales
from {{ ref('stg_transactions') }}
group by 1, 2, 3
