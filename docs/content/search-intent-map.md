# Search-Intent Map

Each indexable route with its canonical, title, H1, meta description, the primary and supporting
visitor intent it serves, its main internal links, and any routes it could compete with. Used to keep
routes distinct and reduce search-intent ambiguity **without** creating/removing routes, changing
canonicals, stuffing keywords, or adding fake schema.

> Every route below already has a **unique title and a unique H1** (locked by
> `tests/unit/v2-search-intent.test.ts`). The two conversion utilities `/growth-plan` and
> `/troubleshooter` are `noindex, follow` and are intentionally excluded from the indexable set.

| Route                  | Title                                                                        | H1                                                            | Primary intent                                                    | Supporting intent                 | Main internal links                        | Could compete with                            |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------- | ------------------------------------------ | --------------------------------------------- |
| `/`                    | _(root default)_ Infinite Weblinks — Digital growth, built around your goals | "A smarter way to plan and grow your business online."        | Understand who IW is + start                                      | Route to a goal / plan            | /goals, /growth-plan, /how-it-works        | /goals (routing)                              |
| `/goals`               | Your goal                                                                    | "What do you want to achieve right now?"                      | Pick a business goal                                              | Enter by stage / business type    | /goals/[slug], /growth-plan                | / (both route the visitor)                    |
| `/goals/[slug]`        | _goal title_                                                                 | _goal title_                                                  | One specific goal's plan                                          | Services/tools for it             | /services, /tools, /growth-plan            | —                                             |
| `/how-it-works`        | How It Works                                                                 | "One connected system, built around your growth"              | Understand the **method** (8 stages, 3 systems, delivery models)  | How work is delivered             | /services, /connected-growth, /growth-plan | /connected-growth (the "one system" story)    |
| `/connected-growth`    | Connected growth                                                             | "Simple combinations that compound"                           | See **illustrative examples** of combined services                | Understand compounding            | /case-studies, /services                   | /how-it-works, /case-studies                  |
| `/services`            | Services                                                                     | "Everything your business needs, connected around your goals" | Browse **what we build/run** (16 areas)                           | Pick a service area               | /services/[category], /tools               | /tools (build vs connect)                     |
| `/services/[category]` | _category name_                                                              | _category name_                                               | One service area                                                  | Its offerings + related tools     | /tools, /goals                             | —                                             |
| `/tools`               | Tools                                                                        | "Tools we help you choose, configure and connect"             | Browse **what we connect** (tool areas)                           | Choose the right tool             | /tools/[slug], /services                   | /services (connect vs build)                  |
| `/tools/[slug]`        | _tool name_                                                                  | _tool name_                                                   | One tool area: what it does + when you need it                    | Related services                  | /services, /goals                          | —                                             |
| `/roadmaps`            | Roadmaps                                                                     | "Suggested roadmaps for common situations"                    | See the rough order of work by situation                          | Pick a roadmap                    | /roadmaps/[slug], /services                | /how-it-works (order vs method)               |
| `/roadmaps/[slug]`     | _roadmap name_                                                               | _roadmap name_                                                | One roadmap's phases                                              | Services per phase                | /services, /goals                          | —                                             |
| `/learn`               | Learn                                                                        | "Understand how it all fits together"                         | Read **educational guides**                                       | Deepen understanding              | /learn/[slug], /resources                  | /resources (guides vs directory)              |
| `/learn/[slug]`        | _article title_                                                              | _article title_                                               | One guide                                                         | Related goals                     | /goals, /learn                             | —                                             |
| `/resources`           | Resources                                                                    | "Understand your options before you spend a thing"            | **Directory** to guides/roadmaps/tools/FAQ                        | Find the right starting resource  | /learn, /roadmaps, /tools, /faq            | /learn (directory vs the articles themselves) |
| `/case-studies`        | Case studies                                                                 | "How a connected system fits together"                        | See **illustrative** worked examples (labelled, not real clients) | Understand outcomes qualitatively | /case-studies/[slug], /services            | /connected-growth (both illustrative)         |
| `/pricing`             | How pricing works                                                            | "How pricing works"                                           | Understand the **quote-to-scope** model                           | Get a written quote               | /growth-plan, /contact                     | —                                             |
| `/about`               | About                                                                        | "Your digital growth partner"                                 | Who IW is + principles                                            | Trust / ownership stance          | /account-ownership, /how-it-works          | / (positioning)                               |
| `/account-ownership`   | Account ownership                                                            | "Your business is built in your name"                         | The **ownership / no-lock-in** commitment                         | Exit/handover reassurance         | /growth-plan, /how-it-works                | /about (ownership is one /about principle)    |
| `/contact`             | Contact us                                                                   | "Let's plan your next connected step."                        | Get in touch                                                      | Low-pressure enquiry              | /growth-plan, /services                    | —                                             |
| `/faq`                 | FAQ                                                                          | "Questions, answered plainly"                                 | Answer common questions                                           | Pricing / ownership / process     | /pricing, /account-ownership               | /resources (FAQ is one resource)              |

## Overlap review + decisions

- **/how-it-works ⇄ /connected-growth** — the closest pair. **Kept distinct**: how-it-works is the
  _method_ (stages/systems/delivery), connected-growth is _illustrative examples_ of combinations. The
  titles, H1s and descriptions already differ; each links to the other rather than duplicating it. No
  copy change was needed to disambiguate (distinctness is test-locked).
- **/services ⇄ /tools** — _what we build/run_ vs _what we connect_. Distinct H1s and descriptions;
  they cross-link. Kept.
- **/learn ⇄ /resources** — /resources is a **directory** (points to guides/roadmaps/tools/FAQ);
  /learn holds the **articles**. Distinct purpose and H1. Kept.
- **/connected-growth ⇄ /case-studies** — both illustrative, but connected-growth shows _combinations
  of services_, case-studies shows _worked scenarios by business type_, both clearly labelled "not real
  clients". Kept.
- **/ ⇄ /goals** and **/about ⇄ /account-ownership** — homepage/positioning vs goal-routing; about/
  principles vs the ownership commitment as its own page. Distinct intents. Kept.

## What was NOT done (per scope)

No new routes; no route removed to reduce keyword overlap; no canonical URL changed; no keyword
stuffing; no fake/duplicate schema; illustrative scenarios were not turned into proof; no thin filler
articles were added. The only Phase 3B change touching these routes is the distinctness **test**; the
existing metadata was already unique, so no metadata rewrite was required.
