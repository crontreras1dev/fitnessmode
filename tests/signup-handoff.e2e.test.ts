import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/types";
import type { ProfileFormInput } from "@/lib/validation/profile";

// Real finalizePendingProfile, real hosted Supabase — only next-intl's request
// context is unavailable in tests, so the translator is stubbed.
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

import { finalizePendingProfile } from "@/lib/db/profile-mutations";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const RUN = process.env.RUN_SUPABASE_E2E === "1" && Boolean(url && anonKey && serviceKey);

type Client = SupabaseClient<Database>;

/** Narrow generateLink's nullable union to the success shape. */
function requireLink(data: unknown) {
  const link = data as {
    user: { id: string };
    properties: { hashed_token: string };
  } | null;
  expect(link, "generateLink returned no data").toBeTruthy();
  return link!;
}

const anon = () =>
  createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

/** Exchange a generated magic-link token for a session, like /auth/callback does. */
async function verifyMagicLink(client: Client, tokenHash: string) {
  let lastError: unknown = null;
  for (const type of ["email", "magiclink"] as const) {
    const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return;
    lastError = error;
  }
  throw lastError;
}

describe.skipIf(!RUN)("signup → magic-link → profile creation (live Supabase)", () => {
  let admin: Client;
  let profileInput: ProfileFormInput;
  const createdUserIds: string[] = [];
  const pendingEmails: string[] = [];

  beforeAll(async () => {
    admin = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Real taxonomy ids so FK constraints hold.
    const [cities, categories, modalities] = await Promise.all([
      admin.from("cities").select("id").eq("is_published", true).limit(1),
      admin.from("categories").select("id").limit(1),
      admin.from("modalities").select("id").limit(1),
    ]);
    const cityId = cities.data?.[0]?.id ?? 0;
    expect(categories.data?.length, "no categories seeded").toBeGreaterThan(0);
    expect(modalities.data?.length, "no modalities seeded").toBeGreaterThan(0);
    profileInput = {
      displayName: "Smoke Test Trainer",
      cityId,
      customLocation: cityId ? "" : "Testville",
      headline: "E2E smoke test",
      bio: "Temporary profile created by the pre-launch signup smoke test.",
      categoryIds: [String(categories.data![0].id)],
      modalityIds: [String(modalities.data![0].id)],
      specialtyIds: [],
      rateMin: "30",
      rateMax: "80",
      currency: "USD",
      instagramUrl: "@smoke.test.e2e",
      tiktokUrl: "",
      websiteUrl: "",
      whatsapp: "",
      phone: "",
    };
  });

  afterAll(async () => {
    for (const email of pendingEmails) {
      await admin.from("pending_signups").delete().eq("email", email);
    }
    for (const id of createdUserIds) {
      // auth.users delete cascades to profiles and join tables.
      await admin.auth.admin.deleteUser(id);
    }
  });

  it("creates the profile from user_metadata for a brand-new user", async () => {
    const email = `devin-smoke-${Date.now()}@example.com`;
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
        data: { pending_profile: profileInput },
      },
    });
    expect(linkError).toBeNull();
    const l = requireLink(link);
    const userId = l.user.id;
    createdUserIds.push(userId);

    const client = anon();
    await verifyMagicLink(client, l.properties.hashed_token);

    expect(await finalizePendingProfile(client)).toBe("created");

    const { data: profile } = await admin
      .from("profiles")
      .select("display_name, status, tier, instagram_url, city_id, custom_location")
      .eq("id", userId)
      .single();
    expect(profile?.display_name).toBe("Smoke Test Trainer");
    expect(profile?.status).toBe("pending");
    expect(profile?.tier).toBe("free");
    expect(profile?.instagram_url).toBe("https://www.instagram.com/smoke.test.e2e");

    const { data: cats } = await admin
      .from("profile_categories")
      .select("category_id")
      .eq("profile_id", userId);
    expect(cats?.length).toBe(1);

    // user_metadata handoff is consumed after use.
    const { data: refreshed } = await admin.auth.admin.getUserById(userId);
    expect(refreshed.user?.user_metadata?.pending_profile).toBeUndefined();
  });

  it("creates the profile from pending_signups for an existing user", async () => {
    const email = `devin-smoke-existing-${Date.now()}@example.com`;
    pendingEmails.push(email);

    // First magic link: creates the auth user but no profile.
    const { data: first } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
    const l1 = requireLink(first);
    const userId = l1.user.id;
    createdUserIds.push(userId);
    const client = anon();
    await verifyMagicLink(client, l1.properties.hashed_token);
    expect(await finalizePendingProfile(client)).toBe("missing");

    // Server-side copy stored by submitSignup for existing emails.
    const { error: upsertError } = await admin
      .from("pending_signups")
      .upsert({ email, profile: profileInput });
    expect(upsertError).toBeNull();

    // Second magic link: Supabase ignores options.data for existing users, so
    // the profile must come from pending_signups.
    const { data: second } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
    await verifyMagicLink(client, requireLink(second).properties.hashed_token);
    expect(await finalizePendingProfile(client)).toBe("created");

    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();
    expect(profile?.display_name).toBe("Smoke Test Trainer");

    // The pending row is consumed once used.
    const { data: leftover } = await admin
      .from("pending_signups")
      .select("email")
      .eq("email", email);
    expect(leftover).toEqual([]);
  });

  it("is idempotent: a second finalize does not duplicate the profile", async () => {
    const email = `devin-smoke-repeat-${Date.now()}@example.com`;
    const { data: link } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
        data: { pending_profile: profileInput },
      },
    });
    const l = requireLink(link);
    const userId = l.user.id;
    createdUserIds.push(userId);
    const client = anon();
    await verifyMagicLink(client, l.properties.hashed_token);
    expect(await finalizePendingProfile(client)).toBe("created");
    expect(await finalizePendingProfile(client)).toBe("exists");

    const { data: profiles } = await admin.from("profiles").select("id").eq("id", userId);
    expect(profiles?.length).toBe(1);
  });
});
