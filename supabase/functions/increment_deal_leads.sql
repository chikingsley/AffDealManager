create or replace function increment_deal_leads(deal_id uuid)
returns void
language plpgsql
as $$
begin
  update deals
  set leads_received = leads_received + 1
  where id = deal_id;
end;
$$;
