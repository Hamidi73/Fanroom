// Shapes returned from Supabase queries (the columns we actually select).

export type ProfileRef = { display_name: string } | null;

export type RoomRow = {
  id: string;
  title: string;
  match: string | null;
  nation_slug: string | null;
  language: string | null;
  status: string;
  created_at: string;
  host_id: string;
  host: ProfileRef;
  members: { count: number }[];
};

export type MemberRow = {
  user_id: string;
  profiles: ProfileRef;
};

export type MessageRow = {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  profiles: ProfileRef;
};

/** A chat line ready to render (author name resolved). */
export type ChatLine = {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  name: string;
};
