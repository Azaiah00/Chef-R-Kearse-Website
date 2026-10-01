# AGENTS.md

**Read `CLAUDE.md` in this directory before changing anything.** It is the canonical
standing-instructions file for this repo and it applies to every agent and every tool,
not only to Claude.

The three rules most often broken, stated here so an agent that reads only this file
still gets them:

1. **The portal design is locked.** Navigation is a left sidebar (`.p-sidebar`), not a
   top bar. Dark glass over a warm ambient glow, pill nav links, 18px cards. Do not
   redesign it, simplify it, or move the tabs. Build new features in this language.
   Full spec: `CLAUDE.md` §1.

2. **Diff before you write.** More than one agent works in
   `C:\Users\azaia\OneDrive\Chef-R-Kearse-Website`. Hash the files you intend to touch
   against what is on disk, adopt anything newer you did not write, and merge into it.
   Never overwrite a portal file you have not just read.

3. **Real facts only.** No invented phone numbers, addresses, awards, reviews, prices or
   dietary claims. Every price is a placeholder pending client confirmation. "R." is
   part of the brand — never ask what it stands for.

Verification bars, architecture notes and the full design spec are in `CLAUDE.md`.
