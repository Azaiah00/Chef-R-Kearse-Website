# Recovering the domain and the Google Business Profile

For the conversation with Chef Kearse. Two separate problems, one of them urgent and one of them merely annoying.

---

## Read this first

**The Google Business Profile matters much more than the domain.**

For a private chef, the Google listing *is* the front door. Someone typing "private chef near me" or "wedding caterer Richmond" is a buyer with intent, and the listing decides whether they find him, what they see, and whether they can reach him. It carries his reviews, his photos, his phone number and his hours.

The domain is a name. If it cannot be recovered, a new one costs about twelve dollars and can be live the same afternoon.

So the honest priority order is:

1. **Start the Google listing recovery today.** It runs on Google's clock and nobody can speed that up, so the sooner it starts the sooner it ends.
2. **Decide about the domain this week** — and if recovery looks slow or uncertain, register a new one and launch. Do not leave a finished website unlaunched while waiting on a domain that may not come back.

---

## Part one: the Google Business Profile

### The situation

Someone he once trusted owns the listing. He cannot edit it, so it still points at a dead website, and every ready-to-book customer who finds him on Google lands on an expired-account notice.

He does not need that person's cooperation. Google has a process for exactly this, because it happens constantly — a former partner, an old marketing agency, a web designer who set it up years ago and disappeared.

### What to do, in order

**Step 1 — Request ownership through Google.**

Sign in with the Google account he wants to own the listing from going forward (not one anyone else has access to — if in doubt, make a fresh one with a clean password). Search for the business on Google, open the listing, and look for the option to claim or request access to it. Google will show that the listing is already managed and offer to send a request to the current manager.

Google then emails the current owner. Two outcomes:

- **They approve it, or they ignore it.** If they do not respond within the window Google gives them (it has historically been around three to seven days, and Google changes it), the request escalates and he can appeal to Google directly to have ownership transferred. This is the normal path and it usually works.
- **They actively refuse.** Then it goes to a verification dispute, and the business paperwork below decides it.

**Step 2 — Have the paperwork ready before starting.**

If it becomes a dispute, Google decides based on who can prove they are the business. Get these together first so there is no scramble:

- Business registration or LLC paperwork in his name
- A utility bill or lease for the business address
- A business bank statement or tax document showing the name
- Photographs of him working, in branded clothing, with the branded knife
- Anything showing the phone number belongs to him — a carrier bill is ideal

**Step 3 — Ask for the mail postcard if offered.**

Google sometimes verifies by posting a card with a code to the business address. Whoever can receive mail at the registered address has a strong claim. If that option appears, take it — it is the fastest decisive route.

**Step 4 — If recovery genuinely fails, create a new listing and ask Google to merge or remove the old one.**

This is the fallback, not the first move, because a new listing starts at zero reviews and loses whatever history the old one has. The process: create the listing properly, verify it, then report the old one as a duplicate with the evidence above. Google will usually remove or merge it. Expect it to take a while.

**What not to do:** do not ask the current owner for it as a favour before starting the Google process, unless the relationship is genuinely fine. A request that puts them on notice can end with the listing deleted, the phone number changed, or the reviews gone. Start the formal process first; the formal process does not depend on their goodwill.

### The day it comes back

Have this ready so the listing starts working immediately:

- [ ] Website link changed to the live site
- [ ] Booking link added — `/book`
- [ ] Menu link added — `/menus`
- [ ] Primary category **Personal Chef**, secondary **Caterer**
- [ ] Service area set to the towns he actually covers, not a radius guess
- [ ] Hours, or "by appointment" if that is the truth
- [ ] Attributes: catering, appointment required, wheelchair accessible where true
- [ ] Eight of the new photographs uploaded, then a weekly cadence
- [ ] Five Q&A entries seeded from `/faq`
- [ ] Every existing review responded to, oldest first
- [ ] A review-request habit started — the portal's referral campaign automates it

His Google review count is the single biggest competitive gap he has. The listing recovery and the review campaign are the same project.

---

## Part two: the domain

### The situation

He cannot access `chefrkearse.com`. It sits behind an expired Squarespace account, and the registrar login is not in his hands.

### Work out which problem it actually is

These need different answers, so establish which one it is before doing anything:

**(a) The domain is registered to him but he has lost the login.** Easiest case. A registrar will do an account recovery to the registrant email or the domain's administrative contact. Start with a WHOIS lookup on the domain — it names the registrar, and often the administrative contact.

**(b) The domain is registered through Squarespace as part of the expired subscription.** Common when a site was built on a platform that bundled the domain. Squarespace support can usually restore access to the account holder with identity verification, and the domain can then be unlocked and transferred out to a registrar he controls.

**(c) The domain is registered to somebody else.** The same person who has the Google listing, most likely. Then it is not a recovery, it is a negotiation or a replacement — and the replacement is almost always the better answer.

**(d) It has expired and is in redemption or has been released.** Expired domains go through a grace period, then redemption (recoverable for a fee), then they are released to anyone. Check the expiry date in WHOIS. If it is about to be released and nobody else wants it, it can simply be re-registered.

### The recommendation

**Do not let this hold up the launch.**

The site is finished, tested and ready. Every week it sits unlaunched is a week of enquiries going to an expired-account notice. Meanwhile the domain recovery may take one phone call or three months, and nobody can tell which in advance.

So: give recovery a genuine week of effort — WHOIS lookup, registrar recovery, one Squarespace support ticket. If it is not resolved or clearly about to be, **register a new domain and launch on it.**

Sensible alternatives, in order of preference:

1. `chefrkearse.com` — if it comes back, use it
2. `chefkearse.com`
3. `chefrkearse.co`
4. `kearseprivatechef.com`
5. `chefrkearsecatering.com`

Check availability at the point of buying; things get taken. Prefer `.com`, and avoid hyphens — they get lost when someone says the address out loud, which for a chef is how most people will receive it.

If the old domain is recovered later, point it at the same site with a permanent redirect. Nothing is lost by launching on a new one first.

### What changes in the build when the domain is settled

One line. `site.url` in `src/lib/site.ts` drives every canonical URL, the sitemap and all the structured data.

Two other places reference it and need the same value:

- `SITE` at the top of `scripts/build-emails.mjs` — then re-run `node scripts/build-emails.mjs` and all ten campaign emails rebuild with the right links
- `INQUIRY_FROM` in the environment, which must be a domain verified with the email provider

### Email needs the domain too

Enquiry emails need a verified sending domain, and so does every campaign in the marketing pack. Both need DNS records (SPF, DKIM, DMARC) on whatever domain he ends up with. That is another reason not to wait: no domain means no email delivery, which means enquiries only land in the portal and nobody gets notified.

---

## What to say to him

Plainly, and without alarming him about the parts that do not matter:

> Your website is built and ready to go live. Two things are in the way and only one of them is serious.
>
> The serious one is your Google listing. Someone else controls it, it is pointing customers at a dead website, and it is the single biggest source of enquiries a chef in your position has. There is a formal Google process for taking it back that does not need that person's cooperation, and we should start it this week because it runs on Google's timetable rather than ours. If you can dig out your business registration and a utility bill for the business address, that covers most of what they might ask for.
>
> The other one is the domain name, and it matters less than it sounds. We will spend a week trying to recover it. If that does not work, a new one costs twelve dollars and we launch on it the same day — and if the old one ever comes back we just point it at the same site. What I do not want is your finished website sitting unlaunched for three months over a name.

---

## Checklist

**This week**

- [ ] Decide which Google account will own the listing going forward
- [ ] Start the ownership request on the existing listing
- [ ] Gather the business paperwork listed above
- [ ] WHOIS lookup on `chefrkearse.com` — note registrar, registrant and expiry
- [ ] One registrar account-recovery attempt
- [ ] One Squarespace support ticket if the domain sits with them

**Within two weeks**

- [ ] Google ownership request escalated or resolved
- [ ] Domain decision made: recovered, or a new one registered
- [ ] `site.url` updated, `scripts/build-emails.mjs` re-run
- [ ] Site deployed and live
- [ ] Email sending domain verified with SPF, DKIM and DMARC

**The day the listing is back**

- [ ] Work through the Google Business Profile list above
- [ ] Update the website field on Instagram, Zola, Yelp, Thumbtack, Fash, Nextdoor, BBB and Facebook
- [ ] Submit the sitemap in Google Search Console
- [ ] Start the review campaign from the portal
