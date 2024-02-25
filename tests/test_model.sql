-- This test ensures the model returns expected results for sample data.

select count(*)
from {{ ref('model') }}
where product_id = 1
and date = '2024-02-23'
and avg_daily_price = 10.5; -- Expected value based on sample data