import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn(async () => ({ data: { user: null as { id: string } | null } }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

import { updateSession } from "@/lib/supabase/middleware";

function req(path: string) {
  return new NextRequest(`http://localhost:3000${path}`);
}

beforeEach(() => {
  getUser.mockClear().mockResolvedValue({ data: { user: null } });
});

describe("updateSession", () => {
  it("redirects unauthenticated users from /dashboard to /login?next=…", async () => {
    const res = await updateSession(req("/dashboard"), NextResponse.next());
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?next=%2Fdashboard");
  });

  it("keeps the locale prefix on the login redirect", async () => {
    const res = await updateSession(req("/es/dashboard/stats"), NextResponse.next());
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/es/login?next=%2Fes%2Fdashboard%2Fstats",
    );
  });

  it("lets authenticated users through to /dashboard", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "u1" } } });
    const res = await updateSession(req("/dashboard"), NextResponse.next());
    expect(res.headers.get("location")).toBeNull();
  });

  it("does not gate public pages for anonymous users", async () => {
    const res = await updateSession(req("/search"), NextResponse.next());
    expect(res.headers.get("location")).toBeNull();
  });

  it("does not gate auth pages for anonymous users", async () => {
    const res = await updateSession(req("/login"), NextResponse.next());
    expect(res.headers.get("location")).toBeNull();
  });

  it("skips the remote getUser() call on public pages with a fresh session cookie", async () => {
    // sb-<ref>-auth-token cookie holding { expires_at: <future> }, base64-wrapped.
    const future = Math.floor(Date.now() / 1000) + 3600;
    const payload = Buffer.from(JSON.stringify({ expires_at: future })).toString("base64url");
    const request = req("/search");
    request.cookies.set("sb-proqfetgsjlpseyddczg-auth-token", `base64-${payload}`);
    const res = await updateSession(request, NextResponse.next());
    expect(getUser).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBeNull();
  });

  it("supports chunked session cookies (…-auth-token.0/.1)", async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const payload = `base64-${Buffer.from(JSON.stringify({ expires_at: future })).toString("base64url")}`;
    const mid = Math.floor(payload.length / 2);
    const request = req("/search");
    request.cookies.set("sb-proqfetgsjlpseyddczg-auth-token.0", payload.slice(0, mid));
    request.cookies.set("sb-proqfetgsjlpseyddczg-auth-token.1", payload.slice(mid));
    const res = await updateSession(request, NextResponse.next());
    expect(getUser).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBeNull();
  });
});
