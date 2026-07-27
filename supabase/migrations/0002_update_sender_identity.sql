-- Replace the legacy seeded sender identity with the CRM owner's details.
update public.settings
set
  sender = 'Dylan Keddie',
  title = case
    when title = 'Managing Partner' then 'Founder & Commercial Partner'
    else title
  end,
  updated_at = now()
where sender = concat('Andrew', ' ', 'Sinclair');
