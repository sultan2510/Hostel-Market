-- ============================================================================
-- Storage: listing-photos bucket
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true, -- public read (photos need to display on listings without auth friction)
  5242880, -- 5MB max per file
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Anyone can view photos (they're meant to be public-facing on listings).
create policy "listing_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

-- Only authenticated users may upload, and only into a folder named after
-- their own user id (enforced by path convention: {user_id}/{filename}).
-- This stops one user from overwriting or flooding another user's folder.
create policy "listing_photos_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_photos_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
