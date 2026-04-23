# Cinema Advertising — Demo Script

This script maps each Gherkin scenario in `features/` to a concrete click-path
through the app. Use it as the narration for the end-to-end acceptance demo.

> Start: `npm run dev` → open http://localhost:5173/

---

## F1 — Location-based planning
Pages: `Campaigns → New campaign → Targeting`

1. Click **New campaign** from the Campaigns page.
2. Fill the Brief step with any advertiser/flight/budget → **Next**.
3. In **Targeting**, expand the **Location** card.
   - Select **Zone = City Center** → summary shrinks to city-centre theaters.
   - Add **Emirate = Dubai** → summary shows Mall of the Emirates + Deira + Marina Mall.
4. Clear the emirate, switch **Zone = Small Town** → summary shows RAK Mall, Dibba, Kalba.
5. Add the individual theater **Kalba Town Cinema** on top of a City-Center Dubai selection to demo *mix granular + broad*.

## F2 — Cinema type targeting
Same Targeting step → **Cinema type** multi-check.

1. Choose **Luxury** → summary keeps only Mall of the Emirates.
2. Switch to **IMAX** → summary shows MoE + Yas Mall.
3. Combine `Emirate = Dubai` + `Type = Luxury` → only MoE remains.
4. Advance to **Screen** step → bundle cards list IMAX-capable screens only.

## F3 — Movie-based targeting
Targeting step → toggle **Target by movie**.

1. Pick **Avatar: Fire and Ash** → the right panel lists every screen/cinema currently playing it, with session count + next showtime.
2. Switch to **Zootropolis 2** → list re-resolves instantly.
3. Only films with live sessions appear in the dropdown.

## F4 — Audience-based packages
Targeting step → **Audience package** dropdown.

1. Select **Affluent** → genres auto-set to Drama+Sci-Fi, types to Luxury/Ultra-Luxury, daypart to Evening, reach 320K shown in sidebar.
2. Apply `Emirate = Dubai` on top → filter composes correctly.
3. Switch package to **Youth** → derived filters update live.
4. Advance to **Review & submit** → audience name + est reach shown in Campaign brief section.

## F5 — Inventory model
No UI action — show the JSON shape in `src/data/cinemaMeta.ts` and the extended session model in `src/data/mock.ts`.

1. `TheaterMeta` → country/emirate/city/zone/types/programmatic.
2. `DynamicAdSlot` → type (`pre-show-60` | `pre-show-30` | `interval`) + tier + basePrice.
3. `AudiencePackage` → genres/cinemaTypes/dayparts/estReach.

## F6 — Dynamic ad slot generation
Pages: `Ad Slots` (Day view).

1. Pick any session tile → drawer shows **Pre-show 60s (Tier 1 — AED 2,800)**, **Pre-show 30s (Tier 2 — AED 1,600)**, and for Avatar sessions an **Interval (Tier 3 — AED 900)** row.
2. Point to the price column → higher tier = closer to the feature.

## F7 — Non-deterministic scheduling
Pages: `Ad Slots → Week` + topbar feed pill.

1. Week view: point out the same film playing at different start times Thu vs Fri.
2. Click topbar **Feed: Healthy** pill → timestamp becomes *just now* and grids re-render.

## F8 — Programmatic filter
Pages: `Ad Slots` toolbar + `DSP` page.

1. Ad Slots toolbar → toggle **Programmatic only**. Sessions from non-programmatic theaters (e.g. City Centre Deira, Kalba) disappear.
2. Hover any remaining session → tooltip shows **Programmatic ✓** line.
3. Navigate to **DSP** → inventory list excludes non-programmatic theaters.

## F9 — Real-time feed integration
Pages: global topbar + `Ad Slots` banner.

1. Topbar **Feed** pill: green for healthy, amber when any source is stale.
2. Hover → per-source status list (VOX / Reel / Novo).
3. Stale source raises a dismissible banner on Ad Slots.

---

## Success checklist (from the acceptance doc §6)

- [x] Location-based targeting at every level
- [x] Cinema-type filtering
- [x] Movie-based selection
- [x] Audience-based package planning
- [x] Plan → Booking seamless handoff via the wizard
- [x] Dynamic slot creation tied to sessions
- [x] Visibility of only valid ad windows
- [x] Programmatic-only inventory exposure
- [x] Near-real-time feed status + manual refresh
