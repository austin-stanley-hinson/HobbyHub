-- HobbyHub tables. Run this once in the Supabase SQL Editor (SQL Editor > New query > Run).

create table if not exists posts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  title text not null,
  content text,
  image_url text,
  upvotes integer not null default 0
);

create table if not exists comments (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  post_id bigint not null references posts (id) on delete cascade,
  content text not null
);

-- New tables block everything until policies are added.
-- There are no user accounts, so anyone can read, add, update, and delete.
alter table posts enable row level security;
alter table comments enable row level security;

create policy "Anyone can read posts" on posts for select using (true);
create policy "Anyone can add posts" on posts for insert with check (true);
create policy "Anyone can update posts" on posts for update using (true);
create policy "Anyone can delete posts" on posts for delete using (true);

create policy "Anyone can read comments" on comments for select using (true);
create policy "Anyone can add comments" on comments for insert with check (true);
create policy "Anyone can delete comments" on comments for delete using (true);

-- Add one upvote inside the database, so two people clicking at the same time
-- can't overwrite each other's upvote. Returns the new upvote count.
create or replace function increment_upvotes(row_id bigint)
returns integer
language sql
as $$
  update posts set upvotes = upvotes + 1 where id = row_id returning upvotes;
$$;

-- ---------- Secret key (pseudo-authentication) ----------
-- Each post gets a secret key when it's created. Only someone with the key can edit or delete it.

alter table posts add column if not exists secret_key text;

-- Hide the key from the API: anyone can read every column except secret_key
revoke select on posts from anon, authenticated;
grant select (id, created_at, title, content, image_url, upvotes) on posts to anon, authenticated;

-- No direct edits or deletes; they go through the key-checking functions below
drop policy if exists "Anyone can update posts" on posts;
drop policy if exists "Anyone can delete posts" on posts;

-- Upvoting still works for everyone, so it runs with the table owner's rights
create or replace function increment_upvotes(row_id bigint)
returns integer
language sql
security definer
set search_path = public
as $$
  update posts set upvotes = upvotes + 1 where id = row_id returning upvotes;
$$;

-- True if the key matches the post (used to unlock the edit form)
create or replace function check_post_key(post_id bigint, key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from posts where id = post_id and secret_key = key);
$$;

-- Saves the changes and returns true only if the key matches
create or replace function update_post(
  post_id bigint, key text, new_title text, new_content text, new_image_url text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update posts
    set title = new_title, content = new_content, image_url = new_image_url
    where id = post_id and secret_key = key;
  return found;
end;
$$;

-- Deletes the post (and its comments) and returns true only if the key matches
create or replace function delete_post(post_id bigint, key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from posts where id = post_id and secret_key = key;
  return found;
end;
$$;

-- ---------- Reposts ----------
-- A post can point to an earlier post it's reposting. If that post is deleted, the link is cleared.
alter table posts add column if not exists repost_of bigint references posts (id) on delete set null;
grant select (repost_of) on posts to anon, authenticated;
