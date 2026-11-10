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
