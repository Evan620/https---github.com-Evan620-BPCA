-- Create a new storage bucket for building plans
insert into storage.buckets (id, name, public)
values ('building-plans', 'building-plans', false);

-- Set up security policies for the storage bucket
create policy "Authenticated users can upload building plans"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'building-plans' AND auth.uid() = owner );

create policy "Users can view their own building plans"
on storage.objects for select
to authenticated
using ( bucket_id = 'building-plans' AND auth.uid() = owner );

create policy "Users can update their own building plans"
on storage.objects for update
to authenticated
using ( bucket_id = 'building-plans' AND auth.uid() = owner );

create policy "Users can delete their own building plans"
on storage.objects for delete
to authenticated
using ( bucket_id = 'building-plans' AND auth.uid() = owner );
