create extension if not exists "uuid-ossp";

create table if not exists accounts(
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  domain text,
  tier varchar(10),
  owner uuid,
  notes text,
  created_at timestamp default now()
);

create table if not exists contacts(
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role text,
  tags jsonb
);

create table if not exists opportunities(
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id) on delete cascade,
  stage varchar(16) default 'discover',
  value int default 0,
  close_date timestamp,
  source text
);

create table if not exists projects(
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id) on delete cascade,
  opportunity_id uuid references opportunities(id),
  name text not null,
  status varchar(16) default 'planned',
  start_at timestamp,
  end_at timestamp,
  created_at timestamp default now()
);

create table if not exists sprints(
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  start_at timestamp,
  end_at timestamp,
  goal text
);

create table if not exists tasks(
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  sprint_id uuid references sprints(id),
  title text not null,
  status varchar(12) default 'todo',
  assignee uuid,
  priority varchar(8) default 'med',
  start_at timestamp,
  due_at timestamp,
  points int default 0,
  created_at timestamp default now()
);

create table if not exists approvals(
  id uuid primary key default uuid_generate_v4(),
  entity varchar(12) not null,
  entity_id uuid not null,
  state varchar(16) default 'requested',
  by uuid,
  comment text,
  ts timestamp default now()
);

create table if not exists activity(
  id uuid primary key default uuid_generate_v4(),
  actor uuid,
  verb varchar(16) not null,
  entity varchar(16) not null,
  entity_id uuid not null,
  meta jsonb,
  ts timestamp default now()
);

create table if not exists campaigns(
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  goal varchar(48),
  brief text,
  audience jsonb,
  channels jsonb,
  brand_tokens_id uuid,
  status varchar(24) default 'draft',
  created_at timestamp default now()
);

create table if not exists post_plans(
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  channel varchar(48),
  hypothesis text,
  slot_at timestamp,
  variants int default 2,
  experiment jsonb
);

create table if not exists assets(
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  post_plan_id uuid references post_plans(id),
  type varchar(24),
  variant varchar(12) default 'v1',
  uri text,
  spec jsonb,
  checksum varchar(128),
  rights_ok boolean default true
);

create table if not exists posts(
  id uuid primary key default uuid_generate_v4(),
  post_plan_id uuid references post_plans(id) on delete set null,
  channel varchar(48),
  network varchar(24),
  caption text,
  tags jsonb,
  alt_text text,
  utm_url text,
  status varchar(24) default 'draft',
  scheduled_at timestamp,
  published_at timestamp,
  vendor_object_type varchar(32),
  vendor_object_id text,
  publish_status varchar(16) default 'queued',
  error_code text,
  error_message text
);

create table if not exists metrics(
  post_id uuid primary key references posts(id) on delete cascade,
  impressions int default 0,
  reach int default 0,
  clicks int default 0,
  saves int default 0,
  shares int default 0,
  likes int default 0,
  comments int default 0,
  watch_time_sec int default 0,
  cvr int default 0,
  fetched_at timestamp default now()
);

create table if not exists vendor_tokens(
  id uuid primary key default uuid_generate_v4(),
  vendor varchar(16) not null,
  account_id uuid references accounts(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamp,
  meta jsonb
);

create index if not exists idx_contacts_account on contacts(account_id);
create index if not exists idx_projects_account on projects(account_id);
create index if not exists idx_tasks_project on tasks(project_id);
create index if not exists idx_posts_status on posts(publish_status);
create index if not exists idx_posts_schedule on posts(status, scheduled_at);
create index if not exists idx_activity_entity on activity(entity, entity_id);

-- Auth (prefixed to avoid conflict with CRM accounts)
create table if not exists auth_users(
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  name text,
  image text,
  email_verified timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists auth_accounts(
  user_id uuid references auth_users(id) on delete cascade,
  type varchar(255) not null,
  provider varchar(255) not null,
  provider_account_id varchar(255) not null,
  refresh_token text,
  access_token text,
  expires_at int,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  primary key(provider, provider_account_id)
);

create table if not exists auth_sessions(
  session_token text primary key,
  user_id uuid references auth_users(id) on delete cascade,
  expires timestamp not null,
  created_at timestamp default now()
);

create table if not exists auth_verification_tokens(
  identifier text not null,
  token text not null,
  expires timestamp not null,
  created_at timestamp default now(),
  primary key(identifier, token)
);
