import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const signOut = vi.fn(async () => ({ error: null }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { signOut } }),
}));

import { POST } from "@/app/[locale]/(auth)/auth/signout/route";

function post(locale: string) {
  return POST(
    new NextRequest(`http://localhost:3000/${locale}/auth/signout`, {
      method: "POST",
    }),
    { params: Promise.resolve({ locale }) },
  );
}

describe("POST /auth/signout", () => {
  it("signs out and redirects to the locale home with 303", async () => {
    const res = await post("en");
    expect(signOut).toHaveBeenCalled();
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("keeps non-default locales on the redirect", async () => {
    const res = await post("es");
    expect(res.headers.get("location")).toBe("http://localhost:3000/es");
  });

  it("falls back to / for unknown locale params", async () => {
    const res = await post("fr");
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });
});
