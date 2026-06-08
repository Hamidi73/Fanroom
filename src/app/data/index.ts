// src/app/data/index.ts
//
// Barrel: one place to import the site's static data from.
//   import { getAllNations, getUpcomingFixtures } from "@/app/data";
//
// Fixtures come live from a real API (fixtures.ts); nations are reference data.
// Rooms, accounts and chat are now backed by Supabase (see src/lib/supabase/*
// and the /rooms routes), not by a static module.

export * from "./nations";
export * from "./fixtures";
export * from "./i18n";
