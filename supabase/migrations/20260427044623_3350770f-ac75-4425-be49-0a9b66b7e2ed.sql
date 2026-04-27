insert into storage.buckets (id, name, public)
values ('brand-guidelines', 'brand-guidelines', false)
on conflict (id) do nothing;

create policy "Users can view own brand guidelines"
on storage.objects for select
to authenticated
using (bucket_id = 'brand-guidelines' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload own brand guidelines"
on storage.objects for insert
to authenticated
with check (bucket_id = 'brand-guidelines' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own brand guidelines"
on storage.objects for update
to authenticated
using (bucket_id = 'brand-guidelines' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own brand guidelines"
on storage.objects for delete
to authenticated
using (bucket_id = 'brand-guidelines' and auth.uid()::text = (storage.foldername(name))[1]);