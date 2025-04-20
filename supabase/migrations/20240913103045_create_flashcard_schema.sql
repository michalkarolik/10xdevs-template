/*
  Migration: Create Flashcard Generator Schema
  Description: Initial schema setup for AI Flashcard Generator application
  Tables: topics, flashcards
  Author: Database Expert
  Date: 2024-09-13
  Updated: Using auth.users instead of custom users table
*/

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Note: We're now using auth.users provided by Supabase authentication module
-- instead of creating our own users table

-- Topics table to organize flashcards
create table if not exists topics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security on topics table
alter table topics enable row level security;

-- Flashcards table to store the actual flashcard content
create table if not exists flashcards (
  id uuid primary key default uuid_generate_v4(),
  topic_id uuid not null references topics(id) on delete cascade,
  front text not null check (char_length(front) <= 100),
  back text not null check (char_length(back) <= 500),
  source varchar not null check (source in ('ai-generated', 'ai-edited', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security on flashcards table
alter table flashcards enable row level security;

-- Create indexes for better query performance
create index idx_topics_user_id on topics(user_id);
create index idx_flashcards_topic_id on flashcards(topic_id);

-- Create or replace function to check if a user owns a topic
create or replace function public.user_owns_topic(topic_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from topics
    where id = topic_uuid and user_id = auth.uid()
  );
$$ language sql security definer;

-- RLS Policies for topics table
-- Authenticated users can select their own topics
create policy "Authenticated users can view own topics" 
  on topics for select 
  to authenticated 
  using (user_id = auth.uid());

-- Authenticated users can insert their own topics
create policy "Authenticated users can create topics" 
  on topics for insert 
  to authenticated 
  with check (user_id = auth.uid());

-- Authenticated users can update their own topics
create policy "Authenticated users can update own topics" 
  on topics for update 
  to authenticated 
  using (user_id = auth.uid());

-- Authenticated users can delete their own topics
create policy "Authenticated users can delete own topics" 
  on topics for delete 
  to authenticated 
  using (user_id = auth.uid());

-- RLS Policies for flashcards table
-- Authenticated users can select flashcards from their topics
create policy "Authenticated users can view flashcards from own topics" 
  on flashcards for select 
  to authenticated 
  using (user_owns_topic(topic_id));

-- Authenticated users can insert flashcards to their topics
create policy "Authenticated users can create flashcards in own topics" 
  on flashcards for insert 
  to authenticated 
  with check (user_owns_topic(topic_id));

-- Authenticated users can update flashcards in their topics
create policy "Authenticated users can update flashcards in own topics" 
  on flashcards for update 
  to authenticated 
  using (user_owns_topic(topic_id));

-- Authenticated users can delete flashcards in their topics
create policy "Authenticated users can delete flashcards in own topics" 
  on flashcards for delete 
  to authenticated 
  using (user_owns_topic(topic_id));

-- Drop all policies (disable RLS enforcement)
drop policy if exists "Authenticated users can view own topics" on topics;
drop policy if exists "Authenticated users can create topics" on topics;
drop policy if exists "Authenticated users can update own topics" on topics;
drop policy if exists "Authenticated users can delete own topics" on topics;

drop policy if exists "Authenticated users can view flashcards from own topics" on flashcards;
drop policy if exists "Authenticated users can create flashcards in own topics" on flashcards;
drop policy if exists "Authenticated users can update flashcards in own topics" on flashcards;
drop policy if exists "Authenticated users can delete flashcards in own topics" on flashcards;

-- Anonymous users have no access to any tables by default
-- (No policies created for anon role as they should authenticate first)

-- Trigger to update the updated_at timestamp automatically
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for each table
create trigger set_topics_updated_at
before update on topics
for each row execute function update_updated_at_column();

create trigger set_flashcards_updated_at
before update on flashcards
for each row execute function update_updated_at_column();
