create table if not exists users (
	"userId" bigint generated always as identity primary key,
	"username" text not null unique,
	"createdAt" timestamptz not null default now()
);

create table if not exists spotify_accounts (
    "userId" bigint primary key
        references users("userId")
        on delete cascade,

    spotify_user_id text not null unique,

    account_id text,

    display_name text,

    spotify_profile jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create table if not exists spotify_snapshots (
    snapshot_id bigint generated always as identity primary key,

    "userId" bigint not null
        references users("userId")
        on delete cascade,

    time_range text not null
        check (time_range in ('short_term', 'medium_term', 'long_term')),

    fetched_at timestamptz not null default now(),

    created_at timestamptz not null default now()
);

create index if not exists spotify_snapshots_user_fetched_at_idx
    on spotify_snapshots ("userId", fetched_at desc);

create table if not exists spotify_snapshot_artists (
    snapshot_id bigint not null
        references spotify_snapshots(snapshot_id)
        on delete cascade,

    rank integer not null,

    spotify_artist_id text,

    artist_name text not null,

    genres jsonb not null default '[]'::jsonb,

    artist_data jsonb not null default '{}'::jsonb,

    primary key (snapshot_id, rank),

    check (rank > 0)
);

create table if not exists spotify_snapshot_tracks (
    snapshot_id bigint not null
        references spotify_snapshots(snapshot_id)
        on delete cascade,

    rank integer not null,

    spotify_track_id text,

    track_name text not null,

    artist_name text,

    album_name text,

    duration_ms integer,

    track_data jsonb not null default '{}'::jsonb,

    primary key (snapshot_id, rank),

    check (rank > 0)
);

create table if not exists roasts (
    roast_id bigint generated always as identity primary key,

    "userId" bigint not null
        references users("userId")
        on delete cascade,

    snapshot_id bigint not null
        references spotify_snapshots(snapshot_id)
        on delete cascade,

    roast_content text not null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);