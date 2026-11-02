import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyOtp = vi.fn(async () => ({ error: null as null | Error }));
const exchangeCodeForSession = vi.fn(async () => ({ error: null as null | Error }));
const finalizePendingProfile = vi.fn(
  async (): Promise<"exists" | "created" | "missing" | "invalid" | "unauthenticated"> => "exists",
);

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { verifyOtp, exchangeCodeForSession } }),
}));
vi.mock("@/lib/db/profile-mutations", () => ({
  finalizePendingProfile: () => finalizePendingProfile(),
}));

import { GET } from "@/app/[locale]/(auth)/auth/callback/route";

function req(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

beforeEach(() => {
  verifyOtp.mockClear().mockResolvedValue({ error: null });
  exchangeCodeForSession.mockClear().mockResolvedValue({ error: null });
  finalizePendingProfile.mockClear().mockResolvedValue("exists");
});

describe("GET /auth/callback", () => {
  it("redirects to /login?error=link when no token is present", async () => {
    const res = await GET(req("/en/auth/callback"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=link");
  });

  it("verifies token_hash via verifyOtp (email template flow)", async () => {
    const res = await GET(req("/en/auth/callback?token_hash=abc123&type=email"));
    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: "abc123", type: "email" });
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("exchanges a PKCE code for a session", async () => {
    const res = await GET(req("/en/auth/callback?code=pkce-code"));
    expect(exchangeCodeForSession).toHaveBeenCalledWith("pkce-code");
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("redirects to /login?error=link when verification fails", async () => {
    verifyOtp.mockResolvedValueOnce({ error: new Error("expired") });
    const res = await GET(req("/en/auth/callback?token_hash=bad&type=email"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=link");
  });

  it.each(["//evil.com", "\\\\evil.com", "javascript:alert(1)", "https://evil.com"])(
    "rejects unsafe next param %j",
    async (next) => {
      const res = await GET(
        req(`/en/auth/callback?token_hash=t&type=email&next=${encodeURIComponent(next)}`),
      );
      expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
    },
  );

  it("honors a safe next path", async () => {
    const res = await GET(
      req("/en/auth/callback?token_hash=t&type=email&next=%2Fdashboard%2Fstats"),
    );
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard/stats");
  });

  it("redirects fresh OAuth users (no pending profile) to /signup", async () => {
    finalizePendingProfile.mockResolvedValueOnce("missing");
    const res = await GET(req("/en/auth/callback?token_hash=t&type=email"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/signup");
  });

  it("sends users with unrecoverable pending data to /signup?error=profile", async () => {
    finalizePendingProfile.mockResolvedValueOnce("invalid");
    const res = await GET(req("/en/auth/callback?token_hash=t&type=email"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/signup?error=profile");
  });

  it("lands newly created profiles on /dashboard?welcome=1", async () => {
    finalizePendingProfile.mockResolvedValueOnce("created");
    const res = await GET(req("/en/auth/callback?token_hash=t&type=email"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard?welcome=1");
  });

  it("treats a finalize exception as a profile error, not a crash", async () => {
    finalizePendingProfile.mockRejectedValueOnce(new Error("db down"));
    const res = await GET(req("/en/auth/callback?token_hash=t&type=email"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/signup?error=profile");
  });

  it("builds redirect URLs from x-forwarded-host (behind a proxy)", async () => {
    const res = await GET(
      req("/en/auth/callback?token_hash=t&type=email", {
        "x-forwarded-host": "app.fitnessmode.co",
        "x-forwarded-proto": "https",
      }),
    );
    expect(res.headers.get("location")).toBe("https://app.fitnessmode.co/dashboard");
  });
});
