-- Remove the old normalized snapshot tables
drop table if exists spotify_snapshot_artists cascade;
drop table if exists spotify_snapshot_tracks cascade;

-- Replace spotify_snapshots with a JSON-based snapshot
drop table if exists spotify_snapshots cascade;

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

    top_artists jsonb not null default '[]'::jsonb,

    top_tracks jsonb not null default '[]'::jsonb,

    fetched_at timestamptz not null default now(),

    created_at timestamptz not null default now()
);

create index spotify_snapshots_user_fetched_at_idx
    on spotify_snapshots (user_id, fetched_at desc);


-- Recreate roasts so each snapshot can have exactly one roast
drop table if exists roasts cascade;

create table roasts (
    roast_id bigint generated always as identity primary key,

    user_id bigint not null
        references users(user_id)
        on delete cascade,

    snapshot_id bigint not null unique
        references spotify_snapshots(snapshot_id)
        on delete cascade,

    roast_content text not null,

    created_at timestamptz not null default now()
);