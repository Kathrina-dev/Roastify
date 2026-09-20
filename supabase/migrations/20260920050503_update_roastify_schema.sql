drop table if exists roast cascade;
drop table if exists spotify cascade;
drop table if exists spotify_snapshot_artists cascade;
drop table if exists spotify_snapshot_tracks cascade;
drop table if exists spotify_snapshots cascade;
drop table if exists spotify_accounts cascade;
drop table if exists users cascade;

create table users (
    user_id bigint generated always as identity primary key,
    username text not null unique,
    created_at timestamptz not null default now()
);

create table spotify_accounts (
    user_id bigint primary key
        references users(user_id)
        on delete cascade,

    spotify_user_id text not null unique,

    account_id text,

    display_name text,

    spotify_profile jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create table spotify_snapshots (
    snapshot_id bigint generated always as identity primary key,

    user_id bigint not null
        references users(user_id)
        on delete cascade,

    time_range text not null
        check (
            time_range in (
                'short_term',
                'medium_term',
                'long_term'
            )
        ),

    fetched_at timestamptz not null default now(),

    created_at timestamptz not null default now()
);

create index spotify_snapshots_user_fetched_at_idx
    on spotify_snapshots (user_id, fetched_at desc);

create table spotify_snapshot_artists (
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

create table spotify_snapshot_tracks (
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

    primary key (snapshot_id, rank)
);

create table roasts (
    roast_id bigint generated always as identity primary key,

    user_id bigint not null
        references users(user_id)
        on delete cascade,

    snapshot_id bigint not null unique
        references spotify_snapshots(snapshot_id)
        on delete cascade,

    roast_content text not null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);