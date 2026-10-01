/**
 * APPROACH SCRIPTS
 *
 * The same approach to each prospect, written for every way of actually making
 * it: a phone script, an email, what to say if you walk in, a message on social,
 * and a text.
 *
 * ── TWO RULES FOR WRITING THESE ─────────────────────────────────────────────
 *
 * 1. A channel that would embarrass him gets `suitability: "avoid"` and a reason,
 *    not a script written anyway for the sake of having five. An Instagram DM to
 *    a museum's events office does not make him look modern, it makes him look
 *    like he could not find the phone number. Saying so is the useful answer.
 *
 * 2. The words change with the channel, not just the length. A phone script has
 *    the pause in it. An email can carry the detail. A text has to earn a reply
 *    in two lines and cannot ask for anything big. Rewriting the same paragraph
 *    five times at different lengths is not writing five approaches.
 *
 * These are scripts, NOT sendable records. See the Approach type for why that
 * distinction matters to the briefing's backlog count.
 */

import type { Approach } from "./lead-types";

/* ══════════════ P-0001 · Cultural Arts Center at Glen Allen ═════════════ */

const GLEN_ALLEN: Approach[] = [
  {
    channel: "phone",
    suitability: "good",
    whenToUse:
      "First choice. There is a named person with a direct number, and this is a question rather than a pitch — which is exactly what a phone call is good at.",
    note:
      "Christiana Roberts is the Events Sales Manager, on (804) 261-6211. Ask for her by name. Weekday mornings; an events office is busiest from Thursday.",
    body: `Hello, is Christiana available? … Hi Christiana, my name's Chef R. Kearse — I'm a private chef here in Richmond.

I'm calling about the approved caterer list at The Center. I'm not asking to replace anybody on it, and I know there are already thirteen names — I'd just like to know what it takes to get added to it.

[pause — let her answer]

The reason I'm asking is on your own page: if a client wants a caterer who isn't on the list they leave you a five-hundred-dollar deposit. I'd rather their choice of chef didn't cost them that, and I'd guess it costs you a few bookings a year too.

So — what do you need to see from a caterer before you'll add one?

[write down everything she says — this is also the checklist for every other venue]

That's helpful, thank you. Can I send that through to you, and would it be worth me coming out to walk the kitchen and the service spaces at some point?`,
  },
  {
    channel: "email",
    suitability: "good",
    whenToUse:
      "Right after the call, to put the request in writing. On its own it is a reasonable second choice if she is hard to reach.",
    note:
      "rentals@artsglenallen.com is published on their page. Keep it to one ask — what are the requirements — and do not attach a menu. Nobody adds a caterer to a list because of a PDF.",
    body: `Subject: Joining the approved caterer list at The Center

Hello Christiana,

I'm Chef R. Kearse, a private chef and caterer based in Richmond, working across Richmond, Northern Virginia, DC and Maryland since 2018.

I'd like to be considered for the approved caterer list at the Cultural Arts Center. I'm not asking to replace anyone — I'd like to know what it takes to be added.

The reason I'm asking is on your own page: a client who wants a caterer who isn't on the list leaves a $500 deposit. I'd rather their choice of chef didn't add that to their bill, and I suspect it occasionally costs you a booking.

What do you need to see before you'll add a caterer? I can supply current certificates of insurance and food-safety certification, references from recent events, and a sample menu, and I'd welcome walking the kitchen and service spaces with you at whatever point makes sense.

If there's a form, a fee or a screening process, please point me at it and I'll complete it properly.

Thank you for your time.

Chef R. Kearse
(804) 939-9246
chefrkearse@gmail.com`,
  },
  {
    channel: "in-person",
    suitability: "workable",
    whenToUse:
      "Only after a call or email has opened the door. Turning up cold at an arts centre's events office interrupts somebody's day and starts the relationship on the back foot.",
    note:
      "If he is there for another reason — an event, a show — then asking at the desk is natural and costs nothing. Going specially, unannounced, is not.",
    body: `[at the desk, if he is already in the building]

"Afternoon — is Christiana around, by any chance? No? No problem at all.

I'm Chef R. Kearse, I'm a private chef here in Richmond. I've been meaning to ask about getting onto the approved caterer list. Would you mind passing on that I called by, and I'll follow up properly?

Here's a card. Thanks very much."

[leave. Do not pitch to whoever is on the desk — they do not decide this and putting them on the spot helps nobody]`,
  },
  {
    channel: "social",
    suitability: "avoid",
    whenToUse: "Do not use this here.",
    note:
      "This is a county arts centre with a published phone number, a named Events Sales Manager and a rentals inbox. Messaging them on Instagram instead reads as someone who could not find any of that — it makes the approach look less professional, not more modern. Social is for being seen by couples, not for talking to venue management.",
    body: `Not written on purpose.

Use the phone number — (804) 261-6211 — or rentals@artsglenallen.com.

Social media has a real job for this prospect, but it is not messaging them: it is making sure that when Christiana looks him up after the call, his Instagram shows real food from real events. Make sure it does before dialling.`,
  },
  {
    channel: "text",
    suitability: "avoid",
    whenToUse: "Do not use this here.",
    note:
      "There is no mobile number for the venue, only a main line. Texting an office number either fails or arrives somewhere nobody is reading. Worth revisiting only once he has Christiana's direct mobile and she has given it to him.",
    body: `Not written on purpose.

After a good first call, this becomes useful — a short text confirming the follow-up is read faster than an email. But that is a message to someone who already knows him, and it comes after the conversation, not instead of it.`,
  },
];

/* ══════════════ P-0002 · Maymont ════════════════════════════════════════ */

const MAYMONT: Approach[] = [
  {
    channel: "phone",
    suitability: "good",
    whenToUse:
      "First choice. The supplemental list is not explained anywhere, so the whole point of the call is to get it explained — which only works out loud.",
    note:
      "No named contact is published. Ask for whoever handles catering approvals for events. Expect to be passed on at least once; that is normal.",
    body: `Hello — I'm hoping you can point me in the right direction. Who looks after the caterer approvals for events there?

[once through]

Hi, my name's Chef R. Kearse, I'm a private chef here in Richmond.

Your catering page mentions a supplemental list of Approved Caterers who've been pre-screened, separate from the six Premiere Caterers. That's the one I'd like to be on.

[pause]

What does the pre-screening actually involve, and who handles it?

[listen. Do not argue with the policy — it is theirs and it is reasonable]

That makes sense. I'd rather be screened properly than be somebody's exception. What would you need from me to get that started?`,
  },
  {
    channel: "email",
    suitability: "good",
    whenToUse:
      "A strong opener here, because the ask is specific enough to be understood in writing and it names their own structure back to them.",
    note:
      "No catering email is published — use the general enquiry route on maymont.org and ask for it to be passed to whoever handles caterer approvals. Say 'supplemental Approved Caterers list' by name or you will get the six Premiere names and a polite no.",
    body: `Subject: The supplemental Approved Caterers list

Hello,

I'm Chef R. Kearse, a private chef and caterer based in Richmond, working across Richmond, Northern Virginia, DC and Maryland since 2018.

Your catering page mentions a supplemental list of Approved Caterers who have been pre-screened, alongside the six Premiere Caterers. I'd like to be considered for that supplemental list.

I understand the position the policy takes — an outside caterer who doesn't know the property is a risk to the room and to the event, and the $600 fee reflects that. I'd rather be screened properly than be an exception to a rule.

What does the pre-screening involve? I can provide current certificates of insurance and food-safety certification, references from recent events, and a full service plan covering load-in, timing, staffing and breakdown. I'd welcome walking the property with whoever manages this, so that if I'm ever working there it isn't the first time I've seen the space.

If there's an application or a documentation checklist, please send it over.

Thank you for considering it.

Chef R. Kearse
(804) 939-9246
chefrkearse@gmail.com`,
  },
  {
    channel: "in-person",
    suitability: "workable",
    whenToUse:
      "Maymont's grounds are open to the public, so visiting is normal and free. Useful for seeing the spaces before any conversation — but do not treat a walk round the gardens as a sales call.",
    note:
      "Going and looking first is genuinely worth it: being able to say he has seen the Carriage House and knows the load-in is a different conversation from one where he has not.",
    body: `[visiting the grounds, before any approach]

Walk the event spaces. Look at where a van would park, where food would come in, how far the kitchen is from where people eat, and what the lighting does in the late afternoon.

Do not ask for the events team while you are there. The point of the visit is that the next phone call sounds like this:

"I came out last weekend and had a look at the spaces. The load-in at the back is tighter than it looks, isn't it — how do the Premiere caterers usually handle that?"

That question cannot be faked, and it is worth more than anything on a menu.`,
  },
  {
    channel: "social",
    suitability: "avoid",
    whenToUse: "Do not use this here.",
    note:
      "Maymont is a large nonprofit with a marketing team running its social accounts. A business enquiry sent there reaches somebody with no authority over catering and no route to pass it on, and it will sit unanswered. That is not a slow no — it is nobody seeing it.",
    body: `Not written on purpose.

Use the phone, or their general enquiry route asking to be passed to caterer approvals.

What social IS worth here: following them, and knowing what is on at the property. A note like "I saw you've got the garden glow event coming up" in a later conversation shows he pays attention to the place.`,
  },
  {
    channel: "text",
    suitability: "avoid",
    whenToUse: "Do not use this here.",
    note: "No mobile number exists for this prospect. There is nothing to text.",
    body: `Not written on purpose.

If a conversation goes well and somebody gives him a direct mobile, a short confirming text afterwards is useful. Until then there is no number.`,
  },
];

/* ══════════════ P-0003 · Hanover Chamber ribbon cuttings ════════════════ */

const HANOVER: Approach[] = [
  {
    channel: "phone",
    suitability: "good",
    whenToUse:
      "First choice. A chamber exists to connect its members to each other, so this is a call they are structurally pleased to take.",
    note:
      "Ask how new-member openings are supported, not whether they will recommend him. The first is a question about their programme; the second asks for a favour from a stranger.",
    body: `Hi — I'm Chef R. Kearse, I'm a private chef based in Richmond.

I noticed you've got a couple of ribbon cuttings coming up on the calendar. I wanted to ask how that works at your end — when a new member opens, what does the chamber do for them?

[listen properly. This is genuine curiosity and it is also the research]

The reason I ask: most new businesses opening a location will put on some food, and most of them end up ordering trays from wherever is nearest because nobody told them there was another option. I'd like to be the chef you can point them at.

Is that something the chamber does — have people on hand for members who need something? And what would I need to do to be useful to you that way?`,
  },
  {
    channel: "email",
    suitability: "workable",
    whenToUse:
      "Fine as a follow-up, or if the phone goes unanswered twice. Weaker than the call because the ask needs a conversation to land properly.",
    note:
      "info@hanoverchamberva.com is published. Keep it short — a chamber inbox gets a lot of people asking for things.",
    body: `Subject: A chef for your new-member openings

Hello,

I'm Chef R. Kearse, a private chef based in Richmond, working across the Richmond metro and up into Northern Virginia and DC.

I noticed a couple of ribbon cuttings on your events calendar and wanted to ask how the chamber supports members at an opening.

Most new businesses put on some food for theirs, and most end up ordering from whoever is nearest because nobody mentioned there was another option. I'd like to be somebody you can point them at — either on a list, or just as a name you know.

Is that something the chamber does? And is there anything I'd need to do to be useful to you that way?

Happy to come to a meeting and introduce myself properly rather than doing this over email.

Chef R. Kearse
(804) 939-9246
chefrkearse@gmail.com`,
  },
  {
    channel: "in-person",
    suitability: "good",
    whenToUse:
      "Genuinely the best channel for this one. A chamber runs events specifically so people can meet each other — turning up is the intended behaviour, not an intrusion.",
    note:
      "Business After Hours and the speaker series are both on their public calendar. Go to one before asking for anything. Bring cards, not a menu, and do not hand out food — showing up with samples at somebody else's event is a misread of the room.",
    body: `[at a chamber event, to anyone who asks what he does]

"I'm a private chef — I do events, mostly weddings and corporate things, around Richmond and up towards DC."

[and if they ask what brings him to the chamber]

"Honestly? I noticed you do ribbon cuttings for new members. Every business that opens puts on some food and most of them have no idea who to call. Thought I'd come and be a person they can call rather than a listing."

[to the chamber staff, once, at the end]

"Who should I talk to about being useful at the member openings? I don't want to be a sponsor, I just want to be the name somebody gives a new member when they ask about food."`,
  },
  {
    channel: "social",
    suitability: "workable",
    whenToUse:
      "Worth it as a slow-burn, not as an approach. Follow the chamber, and react to the ribbon-cutting posts for members he would like to work with.",
    note:
      "A chamber's social is run by somebody who will see him engaging over weeks. By the time he calls, he is not a stranger. But do not send the ask as a DM — it goes to the same person with the same lack of authority.",
    body: `[a comment on a ribbon-cutting post, not a DM]

"Congratulations to them — great to see another one opening in Ashland."

That is all. Do it for three or four, over a month, genuinely.

The purpose is that when he does call, the person answering has seen his name before. That is worth more than anything a DM could say.`,
  },
  {
    channel: "text",
    suitability: "avoid",
    whenToUse: "Not for the chamber itself.",
    note:
      "Becomes the right channel LATER, for the individual business owners the chamber introduces him to. A new restaurant owner two weeks from opening answers a text and ignores an email — but that is a warm introduction, not a cold approach.",
    body: `Not written for the chamber.

Once he has been introduced to an opening business, this is the script:

"Hi [name] — Chef R. Kearse here, [who introduced us] passed on your number. Congratulations on the opening. If you haven't sorted food for it yet, I'd be glad to help — happy to keep it simple or do something people will talk about. Either way, good luck with it."

Short, no attachment, no menu, and an exit built in.`,
  },
];

/* ══════════════ P-0004 · VSAE ═══════════════════════════════════════════ */

const VSAE: Approach[] = [
  {
    channel: "phone",
    suitability: "good",
    whenToUse:
      "First choice, because the thing he needs to know — whether a caterer can be a vendor member and what it costs — is not published anywhere.",
    note: "(804) 747-4971. Ask about vendor membership before anything else; if the answer is no, the rest of the conversation does not matter.",
    body: `Hi — I had a question about membership. I'm a private chef in Richmond, and most of your members are people who book catering several times a year.

Do you take vendor members on the catering side? And if so, what does that actually look like — is it a listing, or is it coming to the events?

[if yes]

What does it cost, and when's the next thing worth coming to?

[if no, or unclear]

Fair enough. Is there any other way a supplier gets in front of your members — sponsoring something, or coming as a guest of a member?`,
  },
  {
    channel: "email",
    suitability: "workable",
    whenToUse:
      "Fine, but slower. The membership question has a yes-or-no answer and a price attached, which a phone call settles in two minutes.",
    note: "Use their published contact route. Keep it to the two questions.",
    body: `Subject: Vendor membership for a caterer

Hello,

I'm Chef R. Kearse, a private chef and caterer based in Richmond.

Two questions. Does VSAE take vendor members on the catering side, and if so what does membership involve and cost?

Most of your members book food several times a year for boards, committees and annual meetings, and very few of them own a venue — so I suspect I'd be useful to know. I'd rather be a member who turns up than a name in a directory.

Thank you,

Chef R. Kearse
(804) 939-9246
chefrkearse@gmail.com`,
  },
  {
    channel: "in-person",
    suitability: "good",
    whenToUse:
      "The whole point of this prospect. Its members are the buyers, and they are in one room several times a year in Richmond.",
    note:
      "The Awards Luncheon on 4 December is the one to aim at — association executives at a catered lunch, which is a conversation that writes itself. Confirm first whether a non-member can attend.",
    body: `[at a VSAE event, when somebody asks what he does]

"I'm a private chef — I do a lot of board dinners and annual meetings, which is why I'm here really. Half this room books food four times a year."

[and then, the actual question, to anyone]

"Can I ask you something — when your board meets somewhere that isn't a hotel, who sorts the food? Do you have somebody, or is it a scramble every time?"

[that is the question. It gets a real answer, because it is a real annoyance for most of them]`,
  },
  {
    channel: "social",
    suitability: "workable",
    whenToUse:
      "LinkedIn rather than Instagram for this one. Association executives are on LinkedIn and not looking for a caterer on Instagram.",
    note:
      "Connect after meeting someone, not before. A cold LinkedIn message to an association executive is as ignored as any other cold message; a connection the day after you shook hands is not.",
    body: `[LinkedIn, the day after meeting someone at a VSAE event]

"Good to meet you yesterday — you mentioned the board dinner being a scramble every year. If it's ever useful to have somebody who just handles that, I'm easy to reach. Either way, good to put a face to the name."

No pitch, no menu, no link. The point is being a person they have met rather than a vendor who found them.`,
  },
  {
    channel: "text",
    suitability: "avoid",
    whenToUse: "Not as an approach.",
    note:
      "There is no number, and texting a professional association's office would be odd. It becomes the right channel only with an individual member who has given him their mobile.",
    body: `Not written on purpose. No number, and the wrong register for a first contact with an association.`,
  },
];

/* ══════════════ P-0005 · Weinstein JCC gala ═════════════════════════════ */

const WEINSTEIN: Approach[] = [
  {
    channel: "phone",
    suitability: "good",
    whenToUse:
      "After the research, not before. Confirm this year's gala date, venue and whether a caterer is already named — then call.",
    note:
      "Ask about kosher and dietary requirements early rather than late. A JCC event may have requirements that change the entire proposal, and finding that out after quoting is worse than asking at the start.",
    body: `Hi — I'm trying to reach whoever organises the annual gala.

[once through]

Hi, I'm Chef R. Kearse, a private chef here in Richmond.

I know you work with outside caterers at the Center, so I'm not going to explain why that's possible. I wanted to ask about the gala itself — who's been doing the food, and is that something you look at each year or has it settled?

[pause — let them answer honestly]

And can I ask the important one early, rather than wasting your time later: what are the dietary requirements for that event? Is it kosher, and if so, to what standard?

[write this down exactly. It decides whether this is a job he can do at all]`,
  },
  {
    channel: "email",
    suitability: "workable",
    whenToUse:
      "Reasonable, but the kosher question really wants a conversation — getting it wrong in writing is harder to recover from.",
    note: "If emailing, ask the dietary question plainly. Hedging it reads as not knowing the answer matters.",
    body: `Subject: The annual gala — catering

Hello,

I'm Chef R. Kearse, a private chef and caterer based in Richmond.

I understand the Center works with outside caterers, so I'll skip that part. I'm writing about the gala.

Two questions, and the second one matters more than the first.

Is the catering for the gala something you revisit each year, or has it settled with somebody?

And what are the dietary requirements for the event — is it kosher, and if so to what standard? I'd rather establish that at the start than put a proposal in front of you that doesn't meet it.

If it's a conversation worth having I'd welcome it, and if the answer is that you're happy with who you have, that's a perfectly good answer too.

Chef R. Kearse
(804) 939-9246
chefrkearse@gmail.com`,
  },
  {
    channel: "in-person",
    suitability: "workable",
    whenToUse:
      "The JCC is a community building with public programmes, so visiting is normal. Useful for understanding the space and the kitchen before proposing anything.",
    note:
      "Do not approach the gala committee in person cold. Go, look at the room, understand the kitchen, then call.",
    body: `[visiting]

Look at the kitchen, and ask at the desk whether it is a kosher kitchen and whether outside caterers use it.

That single question, asked of whoever is on the desk, answers more than an hour of research — and asking it in the building is normal, whereas asking it in a cold email reads as homework he should have done.`,
  },
  {
    channel: "social",
    suitability: "avoid",
    whenToUse: "Do not use this here.",
    note:
      "A charity gala is a committee decision involving money and often a long-standing relationship. A DM to the organisation's Instagram reaches a communications volunteer and signals that he treats a significant event casually.",
    body: `Not written on purpose.

This is a committee, a budget and usually an incumbent. It wants a phone call and a proper conversation about dietary requirements, not a message.`,
  },
  {
    channel: "text",
    suitability: "avoid",
    whenToUse: "Not as an approach.",
    note: "No mobile number, and the wrong register for a first approach to a charity's fundraising committee.",
    body: `Not written on purpose. Becomes useful only once he is working with a named person who has given him a mobile.`,
  },
];

/* ══════════════ P-0006 · Greater Richmond Convention Center ═════════════ */

const GRCC: Approach[] = [
  {
    channel: "phone",
    suitability: "avoid",
    whenToUse: "Do not call them.",
    note:
      "A convention centre of this size runs exclusive in-house food and beverage. Ringing to offer catering marks him as somebody who did not check — and the staff there field that call constantly.",
    body: `Not written on purpose.

The calls worth making from this record are to the ASSOCIATIONS on their calendar, not to the building. See the suggested action on this prospect.`,
  },
  {
    channel: "email",
    suitability: "avoid",
    whenToUse: "Do not email them either.",
    note: "Same reason. The building is not the opportunity; its calendar is.",
    body: `Not written on purpose.

Read the calendar monthly. Take the host organisation names. Those become their own prospects, each with their own approach written for them.`,
  },
  {
    channel: "in-person",
    suitability: "workable",
    whenToUse:
      "Not to pitch the venue — to be at the conferences. Many of the events on that calendar are open to attend, and the people running them are in the building.",
    note:
      "If an association on that calendar is a target, attending its conference as a guest puts him in the room with the person who books its off-site dinners. That is a legitimate and quite cheap route in.",
    body: `[at a conference run by an association on that calendar]

"Are you with the association, or just attending?"

[and if they are staff]

"Can I ask — when you bring a conference to a city, who sorts the things that happen outside the building? The board dinner, the sponsor reception. Is that you?"

[that is the whole question. The building does the conference lunch; somebody else is arranging the dinner for twelve people on the Thursday night, and that somebody is standing in front of him]`,
  },
  {
    channel: "social",
    suitability: "avoid",
    whenToUse: "Not for the venue.",
    note: "Nothing to gain. For the associations surfaced from its calendar, LinkedIn is the channel — but that belongs to their own prospect records, not this one.",
    body: `Not written on purpose.`,
  },
  {
    channel: "text",
    suitability: "avoid",
    whenToUse: "Not for the venue.",
    note: "No number and no reason.",
    body: `Not written on purpose.`,
  },
];

/* ══════════════════════════ Registry ════════════════════════════════════ */

export const APPROACHES: Record<string, Approach[]> = {
  p_glenallen: GLEN_ALLEN,
  p_maymont: MAYMONT,
  p_hanover: HANOVER,
  p_vsae: VSAE,
  p_weinstein_gala: WEINSTEIN,
  p_grcc: GRCC,
};

/**
 * The scaffold handed to a prospect promoted from a feed signal.
 *
 * Deliberately not written copy. A promoted signal has not been researched, so
 * pre-filling a confident script for it would produce exactly the thing this
 * engine exists to avoid: convincing words about a business nobody has checked.
 */
export function blankApproaches(): Approach[] {
  const pending = (channel: Approach["channel"], why: string): Approach => ({
    channel,
    suitability: "workable",
    whenToUse: "Not decided yet — this prospect has not been researched.",
    note: why,
    body: `Nothing written yet.

Research this prospect first: who they are, what the event is, who decides, and whether there is a named person to reach. Then write this, and attach the organisation's own page as a source.

Writing a script before any of that is how a confident-sounding call gets corrected in the first thirty seconds.`,
  });

  return [
    pending("phone", "Needs a number and a name first."),
    pending("email", "Needs an address and a reason to write."),
    pending("in-person", "Needs to know where they are and whether visiting is normal."),
    pending("social", "Needs checking whether they are even active, and who runs it."),
    pending("text", "Needs a mobile number that somebody actually gave him."),
  ];
}
