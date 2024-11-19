create or replace function get_weekly_finance_rollup()
returns table (
  week_start date,
  brand text,
  total_leads bigint,
  total_ftds bigint,
  total_prepay decimal,
  total_received decimal
)
language sql
as $$
  select
    date_trunc('week', d.deal_date)::date as week_start,
    b.name as brand,
    sum(d.leads_received) as total_leads,
    sum(d.ftds) as total_ftds,
    sum(d.prepay_amount) as total_prepay,
    sum(d.prepay_received) as total_received
  from deals d
  join offers o on d.offer_id = o.id
  join brands b on o.brand_id = b.id
  where d.deal_date >= current_date - interval '12 weeks'
  group by 1, 2
  order by 1 desc, 2
$$;
