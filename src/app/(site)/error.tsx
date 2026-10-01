"use client";

import { useEffect } from "react";
import Link from "next/link";
import { site } from "@/lib/site";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      className="dark-section flex min-h-[80svh] items-center"
      style={{ paddingTop: "var(--header-h)" }}
    >
      <div className="shell py-20">
        <p className="t-label text-accent">Something went wrong</p>
        <h1 className="t-h1 mt-5 max-w-[18ch] text-bone">
          The kitchen dropped a plate.
        </h1>
        <p className="t-lead mt-6 max-w-lg">
          An unexpected error stopped that page loading. Try again — and if it keeps
          happening, call the chef directly, it is faster.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-primary sm:min-w-[14rem]">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost-light">
            Back to the start
          </Link>
          <a href={`tel:${site.contact.phoneHref}`} className="btn btn-ghost-light">
            Call {site.contact.phone}
          </a>
        </div>
        {error.digest && (
          <p className="t-small mt-8 text-muted-dark">Reference: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
