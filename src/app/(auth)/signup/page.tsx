import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTaxonomy } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { SignupWizard } from "@/components/signup/signup-wizard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "List yourself free",
  description:
    "Create a free personal trainer profile in 3 steps. Get found on local Google search and send clients to your Instagram or TikTok.",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) redirect("/dashboard");
  }
  const taxonomy = await getTaxonomy();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Create your free trainer profile</h1>
        <p className="text-text-muted mt-2">
          Three quick steps. No fees, no commission — clients reach you directly.
        </p>
      </header>
      <SignupWizard taxonomy={taxonomy} requireEmail={!user} />
    </div>
  );
}
