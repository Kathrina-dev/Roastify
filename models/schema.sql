create table if not exists users (
	userId bigint generated always as identity primary key,
	username text not null unique,
	createdAt timestamptz not null default now()
);

create table if not exists spotify (
	userId bigint primary key references users(userId) on delete cascade,
	spotifyUsername text not null unique,
	spotifyAccountDetails jsonb not null default '{}'::jsonb
);

create table if not exists roast (
	userId bigint primary key references users(userId) on delete cascade,
	roastContent text not null,
	createdAt timestamptz not null default now(),
	updatedAt timestamptz not null default now()
);
