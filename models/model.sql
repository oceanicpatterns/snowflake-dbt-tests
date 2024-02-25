-- This model calculates the average daily close price for each product.

source: 'stg_products' -- Reference another dbt model or table

with daily_prices as (
  select
    product_id,
    date_trunc('day', created_at) as date,
    avg(price) as avg_daily_price
  from stg_transactions
  group by product_id, date
)

select
  dp.product_id,
  p.product_name,
  dp.date,
  dp.avg_daily_price
from daily_prices dp
inner join stg_products p on dp.product_id = p.id;