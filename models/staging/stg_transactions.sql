select
  cast(transaction_id as integer) as transaction_id,
  cast(product_id as integer) as product_id,
  cast(product_name as varchar) as product_name,
  cast(created_at as timestamp) as created_at,
  cast(amount as double) as amount
from {{ ref('sample_transactions') }}
