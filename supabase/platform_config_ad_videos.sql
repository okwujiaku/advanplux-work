-- Key-value config for platform (e.g. ad video URLs). All devices read the same list.
create table if not exists public.platform_config (
  key text primary key,
  value jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

insert into public.platform_config (key, value)
values ('ad_video_urls', '[]'::jsonb)
on conflict (key) do nothing;

comment on table public.platform_config is 'Platform-wide config; ad_video_urls = array of YouTube URLs for Watch & Earn.';
