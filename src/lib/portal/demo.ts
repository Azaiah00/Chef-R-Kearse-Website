/**
 * DEMO MODE — one switch, read in one place.
 *
 * Controls every affordance that exists only so this build can be shown to the
 * client and clicked through:
 *
 *   • the "Portal" button in the site header and the mobile menu
 *   • the one-tap role buttons on the sign-in page
 *   • the /api/portal/demo-login endpoint those buttons call
 *   • the printed demo credentials on the sign-in page
 *
 * Set NEXT_PUBLIC_DEMO_MODE=false and all of it disappears, including the
 * endpoint, which then refuses with 404 rather than signing anybody in.
 *
 * ── WHY IT DEFAULTS TO ON ───────────────────────────────────────────────────
 * A demo that needs configuration before it demonstrates anything is not much
 * of a demo, and this build's whole job right now is to be handed to the chef.
 * So the useful default is the one that works out of the box, and switching it
 * off is a deliberate, documented launch step — it is in .env.example, in
 * PORTAL.md and on the sign-in page itself, which says "Remove before launch"
 * in plain sight.
 *
 * ── WHAT IT MEANS WHILE IT IS ON ────────────────────────────────────────────
 * Anyone who reaches /portal/login can sign in as the owner with one tap. That
 * is exactly what was asked for and it is fine for a private demonstration on
 * localhost or an unlisted Netlify URL holding nothing but invented data. It is
 * NOT fine the moment a real enquiry lands in that portal. Turning this off is
 * therefore tied to the same moment as connecting real accounts.
 *
 * NEXT_PUBLIC_ is deliberate: the same flag has to be readable in a client
 * component (the header button) and on the server (the endpoint), and one
 * switch that cannot drift out of sync is worth more here than hiding the fact
 * that a demo is a demo.
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
}
