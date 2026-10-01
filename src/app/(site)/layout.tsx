import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileCtaBar from "@/components/MobileCtaBar";
import SmoothScroll from "@/components/SmoothScroll";
import {
  jsonLd,
  localBusinessSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/schema";

/**
 * THE PUBLIC SITE
 *
 * Everything a guest sees: the header, the footer, the sticky mobile call-to-
 * action bar, and the site-wide structured data.
 *
 * Why this exists as a route group rather than living in the root layout:
 * a root layout wraps EVERY route, so the staff portal and the guests' own
 * event pages were rendering inside the marketing chrome — the site header
 * above the portal navigation, the marketing footer under the dashboard, the
 * sticky "Reserve" bar over the top of it, a second <main> nested inside the
 * first, and the restaurant's LocalBusiness schema on pages that must never be
 * indexed at all. None of that belonged there.
 *
 * `(site)` is a route group, so the brackets do not appear in any URL. The home
 * page is still `/`, `/menus` is still `/menus`. Only the nesting changed.
 *
 * `has-mobile-bar` sits here rather than on <body> for the same reason: the
 * 72px of bottom padding it adds exists to clear the mobile CTA bar, and the
 * portal has no mobile CTA bar to clear.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="has-mobile-bar">
      <SmoothScroll />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLd(organizationSchema(), localBusinessSchema(), websiteSchema()),
          ),
        }}
      />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <MobileCtaBar />
    </div>
  );
}
