-- Function to count and update leads for a specific deal
create or replace function count_deal_leads(deal_id uuid)
returns void
language plpgsql
as $$
begin
  -- Update the leads_received count for the specified deal
  update deals
  set leads_received = (
    select count(*)
    from leads
    where leads.deal_id = count_deal_leads.deal_id
  )
  where id = deal_id;
end;
$$;

-- Function to count and update leads for all deals
create or replace function count_all_deal_leads()
returns void
language plpgsql
as $$
declare
  d record;
begin
  -- Loop through all deals and update their leads count
  for d in (select id from deals) loop
    perform count_deal_leads(d.id);
  end loop;
end;
$$;
