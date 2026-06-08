// Homepage (Server Component). Fetches real upcoming fixtures from the schedule
// API, then hands them to the client shell which owns the language switcher.

import { getUpcomingFixtures } from "@/app/data";
import { HomeClient } from "./HomeClient";

export default async function Home() {
  const fixtures = await getUpcomingFixtures(9);
  return <HomeClient fixtures={fixtures} />;
}
