import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/portal/auth";
import { isDemoMode } from "@/lib/portal/demo";
import { getStaff } from "@/lib/portal/store";
import { site } from "@/lib/site";
import DemoEntry from "./DemoEntry";
import LoginForm from "./LoginForm";
import "../portal.css";

export const metadata: Metadata = {
  title: "Portal sign in",
  // The portal must never be indexed, and must never leak into the sitemap.
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/portal");

  const demo = isDemoMode();
  const staff = getStaff();

  return (
    <main className="portal-root portal-owner grid place-items-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-block">
          <Image
            src="/images/brand/logo-bone.png"
            alt={`${site.name} — Private Chef & Catering`}
            width={440}
            height={125}
            className="h-11 w-[155px]"
            priority
          />
        </Link>

        <h1 className="t-h3">The Kitchen Office</h1>
        <p className="p-muted mt-2 text-sm">
          Bookings, guests, menus and marketing for {site.name}.
        </p>

        {demo ? (
          <>
            {/*
              One tap into either portal, and it leads the page.

              Nobody should be typing a password into a laptop while the chef
              watches. These issue exactly the same signed session cookie the
              form below issues, so what he sees is the real portal with real
              role gating — not a preview of one.
            */}
            <div className="mt-7">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="p-title">Open a portal</h2>
                <span className="p-badge p-band-C">Demo</span>
              </div>
              <DemoEntry />
            </div>

            {/* The real form still works, and stays available — collapsed, so it
                is there for testing without competing with the two buttons. */}
            <details className="p-card mt-5">
              <summary className="p-card-head cursor-pointer list-none">
                <h2 className="p-title">Sign in with an email and password</h2>
                <span className="p-muted text-[0.8125rem]">Open</span>
              </summary>
              <div className="p-card-pad p-hairline">
                <LoginForm />
                <div className="p-hairline mt-5 pt-4">
                  <p className="p-title">Demo accounts</p>
                  <ul className="mt-3 space-y-2.5">
                    {staff.map((u) => (
                      <li key={u.id}>
                        <p className="text-sm font-medium">
                          {u.name} <span className="p-muted font-normal">— {u.title}</span>
                        </p>
                        <p className="p-muted mt-0.5 font-mono text-[0.8125rem] break-all">
                          {u.email} · {u.demoPassword}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>

            <p className="p-muted mt-6 text-[0.8125rem] leading-relaxed">
              Demonstration sign-in. One switch —{" "}
              <code className="font-mono">NEXT_PUBLIC_DEMO_MODE=false</code> — removes the
              buttons above, the printed accounts and the endpoint behind them. Real accounts,
              password resets, Google sign-in and two-factor come with the production build.
            </p>
          </>
        ) : (
          <>
            <div className="p-card mt-6 p-card-pad">
              <LoginForm />
            </div>
            <p className="p-muted mt-6 text-[0.8125rem] leading-relaxed">
              Trouble signing in? Contact whoever set up your account.
            </p>
          </>
        )}

        <Link href="/" className="p-btn p-btn-sm mt-6">
          Back to the website
        </Link>
      </div>
    </main>
  );
}
