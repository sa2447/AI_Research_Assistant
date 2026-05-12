-- Phase 02 SQL Setup Instructions
-- Run this SQL in the Supabase SQL editor after setting up a new Supabase project

-- Step 1: Enable pgvector extension
create extension if not exists vector;

-- Step 2: Create Documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null,
  created_at timestamptz default now()
);

-- Step 3: Create Chats table
create table chats (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'New Chat',
  document_id uuid not null references documents(id) on delete cascade,
  saved boolean not null default false,
  created_at timestamptz default now()
);

-- Step 4: Create Messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Step 5: Create Chunks table (for vector storage)
create table chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  page_number integer,
  content text not null,
  embedding vector(1536)  -- text-embedding-3-small outputs 1536 dimensions
);

-- Step 6: Create vector similarity search function
create or replace function match_chunks(
  query_embedding vector(1536),
  match_document_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  page_number integer,
  content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    document_id,
    page_number,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from chunks
  where document_id = match_document_id
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Note: Disable Row-Level Security (RLS) since there's no user-based access control
-- In Supabase dashboard, go to Authentication → Policies and ensure RLS is disabled on all tables
-- OR create permissive policies that allow service-role access
