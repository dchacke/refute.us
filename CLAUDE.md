# Refute Us (refute.us)

A small, single-file web app for building **trees of ideas and criticisms**, inspired by Karl Popper's view that theories are never proven, only tentatively accepted until refuted. It is a visual preview of the features on veritula.com (same palette, same fonts, same Bootstrap), built by Dennis Hackethal.

The one rule that drives everything:

> A **leaf** (an idea with no criticisms) is **rationally adoptable**. An idea with criticisms is rationally adoptable **exactly when none of its criticisms are**.

A criticism is itself an idea, so it can be criticized in turn. Criticizing a criticism can bring the idea it attacked back to adoptable.

## Files and delivery

- `index.html` is the whole app: HTML, CSS, JS, Bootstrap 5.3.8 (CSS and JS inlined) and d3 v7.9.0 (inlined). No build step. It is also published as a claude.ai artifact and served as the website's `index.html` on GitHub Pages (`CNAME` = refute.us).
- **The website file and the artifact must always match.**
- External resources at runtime: EB Garamond from Google Fonts, and Torph (text morphing) from jsDelivr. Both degrade gracefully (Georgia/serif, plain text swaps).
- The favicon is an EB Garamond "R" (cream background, red letter) embedded as a PNG data URI in a `<link rel="icon">` in `<head>`.
- Wording rules: American English; the product is written "refute.us" when a URL form is wanted; slogan "Helping You Think."

## Data model

- An **idea** is `{ id, text, children: [idea…], row?, versionOf?, auto? }`.
- `roots` are the **top-level ideas**. Everything below a root is a **criticism** of its parent.
- The same criticism can hang from **more than one parent** (it is held by reference, so it is a single idea). This is how one criticism applies to two versions of an idea.
- `versionOf` links a revision to the version before it. Versions of an idea form a **chain**, oldest first; the last is the one in play.
- `auto: true` marks the criticism the app files itself when a revision replaces an old version ("This idea has been replaced by a later revision. (Added automatically.)").
- `row` records which row of trees a top-level idea sat in (see Layout).
- Evaluation (`evaluate`) is memoized and settles criticisms before the ideas they attack; a shared criticism gets one verdict that counts everywhere.

## Features

### The forest (main canvas)
- Every top-level idea is the root of a tree; all trees are shown together. Criticisms hang below their parent, joined by curved links.
- **Solid disc = rationally adoptable. Hollow disc = not.** Top-level ideas are blue (same blue in light and dark mode); criticisms use the theme red.
- Adoptable nodes have a slow pulsing **glow**: gray on top-level ideas, red on criticisms (the red glow is reserved for criticisms). The pulse is a real circle with a radial fade, animated by opacity, because WebKit will not animate SVG filters.
- Along the links to adoptable nodes, a **moving light travels toward the parent**, built from stacked tapered shapes (also for WebKit's sake). It keeps running when the layout is at rest.
- Labels: a top-level idea shows a short title above its node (18 characters, ellipsized); a criticism shows a short text preview underneath.
- **Hover ring**: any node under the pointer or keyboard focus gets a gray ring (gray in light mode, white in dark). Solid discs otherwise have no outline.
- **Tooltip** (mouse and keyboard focus only): the full text plus the status, e.g. "Rationally adoptable (no pending criticisms)" or "Not rationally adoptable (2 pending criticisms)".
- **Pan** by dragging empty space, **zoom** with wheel/pinch (0.3x to 4x). Double-tap zoom is disabled. Until you pan or zoom yourself, the forest is kept fitted to the pane.
- **Fit** button re-fits the view. **Reset** button (confirmation) deletes everything and clears history. **Key** button shows or hides the legend; the choice is remembered. **i** button opens the About modal (Popper quote, link to veritula.com, credit).
- Empty-canvas hint text: "Tap anywhere in empty space to add your first idea.", then "…add another idea. Tap an idea to criticize, revise, or delete it." once there is one idea.

### Layout
- Force-directed (d3) with a built-in hierarchy: each node is pulled to a row by depth and to a column that keeps its subtree under its parent. Collisions are enforced.
- **Trees wrap into rows like words in a paragraph**, in top-level order. The row split is chosen to maximize zoom and match the pane's proportions, with a balanced-split search.
- Each point in history saves the rows it was shown in (and whether you arranged them by hand), so what you see depends only on saved state plus the pane, never on how you got there. Saved rows are kept while the pane width is within about 20% of what it was; otherwise the trees are rebalanced. Only **width** is compared, so a phone keyboard opening never rearranges anything.
- Nodes keep their positions when others are added or deleted. A new top-level idea appears where you tapped and is slotted into the rows at that spot.
- Reduced motion (`prefers-reduced-motion`): the layout is computed up front, the glow/flow animations are off or static, and fits do not animate.

### Adding, criticizing, revising, deleting
- **Tap empty space** to add a top-level idea (modal with a text area).
- **Tap a node** to open its menu: **Criticize**, **Revise**, **Delete**. The modal quotes the idea you are acting on.
- **Criticize** adds a child to that idea.
- **Revise** never overwrites. It adds a **new version** beside the old one, at the end of the chain (revising an older version brings it back as the newest). The modal offers:
  - tick boxes for **which existing criticisms still apply** (all ticked by default); ticked ones are carried over and stay a single criticism now attacking both versions;
  - a tick box "The revision replaces it" (on by default) that files the automatic "replaced" criticism against the old version, so the old version stops being adoptable by the ordinary rule rather than by a special case.
- **Delete** asks for confirmation, names the idea and how many criticisms go with it, and warns when the idea is shared between versions ("goes from all of them"). Deleting removes an idea from every parent and everything left only underneath it.
- **Shift+click** on a node deletes immediately with no menu and no confirmation (a demo accelerator).
- Text modals submit with **Cmd/Ctrl+Enter**; **Escape** closes any modal. Empty text is not accepted.

### Versions and piles
- Versions of one idea sit **side by side as one group**, with a thin tie between them. A criticism shared by several versions hangs once, between the versions it attacks. Everything below a group is an ordinary tree again.
- **Older versions that are no longer adoptable fold away** into a **pile**: a small stacked-disc node with chevrons, shown beside the version in play. A run of consecutive non-adoptable older versions becomes one pile; a rehabilitated version stays in view and splits the run. The newest version is never folded.
- **Tap a pile** to open it. An opened run shows a small **fold control** (two chevrons pointing together) on the tie between its versions; tap it to fold back. Folded versions' own criticisms and replacement notes go away with the pile.
- Opening a pile is a way of looking, not a change to the discussion, so it is not saved or recorded. Opening is kept; folding by hand is forgotten when you move along the timeline. When you scrub to a step that changed something inside a folded run, that run is opened automatically so the change is visible.
- Piles are keyboard-operable (Enter/Space) and say how many versions they hold in their accessible name and tooltip ("2 older versions with pending criticisms").

### Reordering by dragging
- Drag a **top-level idea** (with its tree, and with all its versions) to a new spot. The row is chosen by where you drop it (or a new row below the last), the position in the row by which trees it lands between. Recorded in history, e.g. "Moved “X” before “Y”" or "…to a new row".
- Drag a **criticism** left or right past a sibling to reorder siblings. A versions group counts as one sibling and cannot be shuffled internally. Vertical drags, or a drop among someone else's criticisms, spring back and change nothing. Drags under 8 pixels are treated as taps.
- Piles are not draggable.

### The report banner
A one-line, always-visible report at the top, about the **top-level ideas**:
- "No ideas yet."
- "The idea is rationally adoptable." / "The idea is not rationally adoptable." (one idea)
- "All N ideas are rationally adoptable." / "None of the N ideas are rationally adoptable."
- "K of N ideas is/are rationally adoptable."

Text changes morph smoothly (Torph). It is Popper's "concise report evaluating the state … of the critical discussion" from *Objective Knowledge*.

### The timeline (history scrubber)
- Every change (add idea, add criticism, revise, delete, reorder) records a full snapshot. The timeline at the bottom is hidden until there is more than one point.
- A slider plus one **tick per point**. The active tick is the larger **knob** (hollow or solid, white ring). Ticks are **solid blue when some top-level idea is adoptable at that point, hollow when ideas exist and none are**, and neutral at the start.
- Drag the knob, click or drag along the track, click a tick, or use the arrow keys. Moving along the timeline restores the whole page to that moment, refits the view, and shows the entry's text on the left (e.g. "Added criticism “…”") and "n / total" on the right.
- The hint under the track reads "Scrub to time-travel." and swaps to the point's **timestamp** (time only today; full date otherwise) while you hold the knob.
- Hovering a tick shows its description and time.
- **Editing from the past starts a new branch**: everything after that point is discarded.
- Entry wording is generated from the entry's type and details at render time, so wording can improve retroactively.
- Cursors: pointer over the timeline and ticks, resize arrows on the knob and for the whole of a drag.

### Persistence
- Everything lives in `localStorage` under the key **`"discussion"`**, in a versioned envelope `{ version: 3, state: { history, cursor, ui: { legendOpen } } }`. Snapshots are saved as flat graphs (`roots`, `nodes`, `edges`) so a shared criticism stays one idea.
- Migrations run in order from older formats (v0 unversioned, v1 envelope, v2 adds `ui`, v3 flat graph). Shipped migrations are never edited, only added to.
- Data written by a **newer** version is not read (it throws, and the page says it is starting fresh). Corrupt data does the same.
- If storage is unavailable, the app keeps working in memory.
- The page paints the banner, key and timeline straight from saved state before d3 finishes loading, so nothing flashes and corrects itself.

### Look and feel
- **Bootstrap 5.3** throughout (modals, buttons, form controls, `form-range`), with Veritula's overrides copied in; `--theme-color` is Veritula's red.
- **Light and dark mode** follow the system (`data-bs-theme` is set by a script in `<head>`, and updates live).
- **EB Garamond for all user-generated text** (node labels, preview text, tooltip, modal quote and text area, the info button), set about 1.2x larger. **Bootstrap's sans-serif stack for everything the app says** (labels, buttons, banner, legend).
- The red theme color is for criticisms only; top-level ideas are blue/gray.

### Touch devices
- Taps are detected separately from drags (within 6 px and under 500 ms), and touch pointerdown is `preventDefault`-ed so the browser's trailing synthetic click cannot land on the modal that the tap just opened.
- Under **`(pointer: coarse)`** each node has an invisible **hit ring 10 canvas units wider** than the circle, so taps just outside still count. Mouse users are unaffected. Where hit areas overlap, the later-drawn node wins.
- **No tooltip on touch** (the modal already shows the full text). The gray ring shows on press and is cleared as soon as the touch becomes a drag.
- On coarse pointers, the modal's text area is focused as the modal opens, using an invisible proxy input focused during the tap itself, so the on-screen keyboard comes up. Real-device behavior (especially iOS Safari) has not been verified.
- The phone layout moves the buttons (Reset top-left, Fit top-right, Key bottom-left, i bottom-right) and shrinks the legend; the timeline respects the bottom safe-area inset.

### Accessibility
- Nodes and fold controls are focusable; nodes have `aria-label`s ("Idea: … Rationally adoptable … Activate to add a criticism."), piles say "Activate to open." Focus shows the same ring and tooltip as hover. Returning focus to the opener after a modal closes does not re-show its tooltip.
- Modals use Bootstrap's focus trap, Escape, and focus restore. The default focus in non-text modals is **Cancel/Close**, so a stray extra tap cannot delete or submit anything.
- The slider has an `aria-valuetext` of the current entry, and ticks have labels.
- Both buttons in the modal are `type="button"` with their own handlers; the app never relies on native form submission (it may run inside a sandboxed iframe without `allow-forms`).

## Code map (`index.html`)
- `<head>`: favicon, theme script, fonts, Bootstrap CSS + app CSS (sections: forest chart, report banner, timeline, modal).
- Markup: report banner, `#forest` SVG with hint/buttons/tooltip/legend, timeline footer, modal (`#modal-backdrop`), `#kb-proxy`.
- Script sections, in order: data helpers (`allIdeas`, `findIdea`, `removeIdea`, `parentsOf`, `versionsBeside`), saved shape (`ideasToGraph`, `graphToIdeas`, `readGraph`), tap detection (`addPress`), `makeForest()` (layout, rows, piles, force simulation, zoom/fit, drag, tooltip, `update`), storage and migrations, `evaluate`, banner, `commit` / `restoreTo`, timeline, modal (`openModal` modes `form`, `confirm`, `info`, `menu`), interaction handlers (`onBackgroundTap`, `criticizeIdea`, `reviseIdea`, `confirmDelete`, `onNodeTap`), legend, info and reset buttons, boot.
- d3 and Bootstrap JS are inlined after the app script / before it respectively; if d3 fails to load the page still runs but the canvas stays empty.

## Testing
- No test suite. Changes are checked with Playwright driving the container's Chromium, loading `index.html` through a routed fake origin, blocking font requests, and seeding `localStorage['discussion']` with a schema-v3 envelope. Touch behavior is checked with `hasTouch`/`isMobile` contexts and CDP touch events.
- Not covered by that setup: real iOS/Android devices, the actual EB Garamond rendering (fonts are blocked in the sandbox), and Torph (CDN).

## Known gaps
- Loading data from a newer schema discards it (and the next edit overwrites it).
- The banner counts every version of an idea as its own top-level idea.
- No export or import, and no marker saying which build is running.
- Save failures are silent (the app just keeps working in memory).

## Working conventions
- Keep the artifact and the website file identical after every change.
- Replies short; each change comes with a git commit message of the form `commit '…'` (curly quotes written directly, not escaped).
- Build only after the user approves a suggestion; "talk it through" means discuss only.
