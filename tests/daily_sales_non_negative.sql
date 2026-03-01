select *
from {{ ref('daily_sales') }}
where total_daily_sales < 0
