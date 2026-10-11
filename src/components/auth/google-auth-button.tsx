import { signInWithGoogle } from "@/app/(auth)/oauth-actions";
import { Button } from "@/components/ui/button";

export function GoogleAuthButton({
  next,
  failurePath,
}: {
  next: string;
  failurePath: "/login" | "/signup";
}) {
  const action = signInWithGoogle.bind(null, next, failurePath);

  return (
    <form action={action}>
      <Button type="submit" variant="secondary" size="lg" className="w-full">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.39 13.88A6 6 0 0 1 6.07 12c0-.65.11-1.29.32-1.88V7.51H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.49l3.35-2.61Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.61C7.18 7.75 9.39 5.99 12 5.99Z"
          />
        </svg>
        Continue with Google
      </Button>
    </form>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="bg-border h-px flex-1" />
      <span className="text-text-muted text-xs font-medium uppercase">or</span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
