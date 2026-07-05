# Master Catalog Phase 4: NT CI Runtime Asset Analysis

Prepared: 2026-07-04
Status: approved implementation guidance for P-10; P-11 visual acceptance pending
Scope: Master Catalog Phase 4 UI, official Excel export, official PDF/print export

> In this document, "CI" means Corporate Identity / brand identity, not
> continuous integration.

## 1. Executive conclusion

The current Phase 4 architecture is directionally correct for NT CI use:

- `/CI/` should remain local-only and uncommitted.
- Only minimal, optimized runtime derivatives should be committed and deployed.
- Font/logo approval must be separate from final export visual approval.
- The supplied NT guidelines support a restrained, document-first visual system:
  official logo, NT colors, NT typography, high legibility, conventional tables,
  and no decorative redesign of the Master Catalog workflow.

Recommended decision path:

1. Record that the owner confirmed on 2026-07-04 that the project has the right
   to use the NT CI assets under `/CI/` for NT business operations, including
   fonts, logos, guidelines, and supporting graphics.
2. Convert only the approved NT Regular and NT Bold runtime fonts to WOFF2.
3. Commit only the two approved logo derivatives: a compact app logo and a full
   document lockup.
4. Do not approve unused CI graphics, original PDF manuals, original TTF/OTF
   fonts, or the whole `/CI/` directory for repository/deployment.
5. Keep P-11 pending until rendered Excel/PDF samples are inspected and accepted.

This keeps Phase 4 aligned with common international CI practice: preserve the
master brand sources, create traceable runtime derivatives, avoid logo redraws,
protect accessibility and legibility, and gate final visual publication through
human review.

## 2. Source evidence inventory

The following files were inspected from the local `/CI/` source folder and the
current committed public assets. Source manuals were treated as authoritative
brand references, not deployable runtime files.

| Source | Role | Evidence |
|---|---|---|
| `CI/bannt_digit_man_1_2568.pdf` | NT digital brand manual, revision 1/2568 | 79 pages, PDF, SHA-256 `c4cab6eba9b0f3d037082c92b514b28856f67656195bb0b04d023ab94b1327dc` |
| `CI/Brand_Guideline-Final-21-12-23.pdf` | Corporate brand guideline | 109 pages, PDF, SHA-256 `452321055a9a8e12a7c813d7ab00b456c3891ed95e3c1dff0c214d6e3504547a` |
| `CI/NT Regular.ttf` | Candidate runtime body font source | TrueType, 201,144 bytes, SHA-256 `77420e3622ba097c1d18f894c1d7e1b64c737a9522932468e26d6b8e9afb627b` |
| `CI/NT Bold.ttf` | Candidate runtime heading/emphasis font source | TrueType, 199,500 bytes, SHA-256 `07dbeb5ea19f678ab7d1cee52c9a6498179aed655a92a4a51a280e48e9197038` |
| `CI/NT_1_v3.png` | Candidate primary NT mark/compact logo source | PNG, 746 x 497, SHA-256 `89e8c55a070a4a7985863ea72ec5a856c210d4e170b7d4d0afa8eb1dfb07d84e` |
| `CI/NT_2_v3.png` | Candidate National Telecom English lockup source | PNG, 1225 x 551, SHA-256 `2365a9048508b6b5412f14e587b546e8f1397c250f71a26a35f930cc024a51ca` |
| `CI/NT_3_v3.png` | Candidate National Telecom Thai lockup source | PNG, 1230 x 514, SHA-256 `d1e8ab06212f8cac13766004e32d2db597052e97ad6fa4abd1e663892cbaa7ef` |
| `CI/NT_4_v3.png` | Candidate full NT company lockup source | PNG, 2755 x 529, SHA-256 `2d19ae57a7523eb1ecaeafbdb8623f97e4e2ae5e946f916b2c5b66e761c24e0f` |
| `public/nt_logo.png` | Existing tracked runtime logo | PNG, 441 x 85, SHA-256 `a619e9df010143826ecfde9c9be2a1eedd852c8dac714f784b5a0048af976297`; visually a reduced full company lockup and must be reconciled against P-10 before final CI acceptance |
| `public/nt_logo.svg` | Existing tracked runtime logo | SVG, SHA-256 `1361e8d61bc801e6f44cd467d71b75b7a33a1b071da232ee836d157225b6727c`; appears to be a vectorized full company lockup and must be reconciled against P-10 before final CI acceptance |
| `public/fonts/THSarabunNew*.ttf` | Existing print/export Thai fonts | Existing BOQ print assets; not equivalent to P-10 approval for NT CI |

Source priority remains as defined in the Phase 4 architecture:

1. `CI/bannt_digit_man_1_2568.pdf`
2. `CI/Brand_Guideline-Final-21-12-23.pdf`
3. Fonts, logos, and graphic assets under `CI/`

If two sources conflict, the 1/2568 digital manual wins for digital app/export
implementation.

## 3. International CI principles applied

### 3.1 Controlled master assets

Common brand governance practice separates master sources from runtime copies.
The PDFs, original fonts, and original large logo files should remain controlled
source evidence. Application code should consume only approved, optimized,
purpose-specific derivatives.

Phase 4 implication:

- keep `/CI/` ignored and local-only;
- never bulk-stage `/CI/`;
- never commit `.DS_Store`, original guideline PDFs, or unused brand graphics;
- record source fingerprints for each runtime derivative;
- do not let a developer choose additional brand assets ad hoc.

### 3.2 Fidelity over recreation

Official logos and identity marks should not be redrawn, retyped, approximated,
traced manually, recolored outside approved variants, stretched, cropped, or
used with unapproved effects.

Phase 4 implication:

- derive runtime PNG/WebP/SVG assets from the supplied source files only;
- preserve aspect ratio and transparent background behavior;
- no CSS-generated substitute logo;
- no manual SVG reconstruction unless the source is an official vector asset
  and the transformation is reviewed;
- no decorative use of Vital Sign or Dot Sign graphics unless explicitly
  approved for the Phase 4 visual sample.

### 3.3 Provenance, permission, and repository scope

The font metadata shows Fontcraft authorship and the embedded statement "This
font is only for National Telecom PLC." The owner confirmed on 2026-07-04 that
the project may use all NT CI assets under `/CI/` for NT business operations,
including fonts, logos, guidelines, and supporting graphics. This is sufficient
to treat the supplied CI assets as eligible sources for Phase 4 implementation
and P-10 runtime derivatives.

This permission does not change the repository governance rule: broad usage
right is not the same as approval to commit or deploy every source file. The
repository should still contain only the minimal runtime derivatives needed by
Master Catalog Phase 4, because that keeps provenance traceable, payload small,
and developer choices bounded.

Phase 4 implication:

- approval must name each runtime asset, source file, purpose, and path;
- approval should not say "approve `/CI/`";
- do not treat usage rights as approval to commit the original PDFs, TTF/OTF
  fonts, source PNGs, or unused graphics;
- do not deploy NT CI assets outside the NT business scope recorded in P-10;
- if the deployment target changes to public/external use, require a fresh
  permission check.

### 3.4 Accessibility and legibility

International UX/accessibility practice, including WCAG 2.2 AA principles,
requires readable contrast, status not conveyed by color alone, selectable text,
stable table headers, and no dependence on hover-only UI for official records.

Phase 4 implication:

- NT Yellow should be used as an identity accent, not as body text background
  for dense data;
- yellow controls require dark text;
- official exports should use simple borders, spacing, and hierarchy, not
  dashboard cards, gradients, or low-contrast treatments;
- PDF text must remain searchable/selectable;
- Excel headers and data should remain plain text and filterable;
- Thai text wrapping must be visually checked.

### 3.5 Performance and operational resilience

Modern web delivery normally uses WOFF2 for web fonts, font-display fallback,
and minimal image payloads. For operational tools, brand polish must not make
the catalog unusable when fonts load slowly or fail.

Phase 4 implication:

- use `next/font/local` for the approved NT WOFF2 files;
- set `font-display: swap`;
- retain Thai-capable fallbacks: `system-ui`, `Leelawadee UI`, Tahoma,
  sans-serif;
- verify that the approved NT runtime font supports the required Thai glyphs,
  marks, numerals, and tabular number behavior;
- do not subset Thai fonts until glyph coverage is verified;
- block final CI acceptance on missing logo/font assets rather than silently
  shipping a broken official layout.

## 4. NT CI facts confirmed from the supplied guideline set

### 4.1 Core color tokens

The corporate guideline defines the core logo color system. These are safe
Phase 4 tokens:

| Token | Value | Notes |
|---|---|---|
| NT Yellow | `#FFD100` | Pantone 109 C, RGB 255/209/0, CMYK 0/17/100/0 |
| NT Dark Gray | `#545859` | Pantone 425 C, RGB 84/88/89, CMYK 63/41/45/33 |
| Logo Black | `#101820` | Pantone Black 6 C, RGB 16/24/32, CMYK 100/61/32/96 |
| White | `#FFFFFF` | RGB 255/255/255, CMYK 0/0/0/0 |

Implementation guidance:

- use NT Yellow sparingly for identity, active state, and document accents;
- use neutral table surfaces for dense Master Catalog data;
- avoid turning the application into a yellow-dominant UI;
- use dark gray/black for text and official metadata;
- do not create unapproved tints as primary brand colors.

The Phase 4 architecture also lists supporting teal, coral, and brown tokens.
Those should remain secondary and should not be required for P-10 unless a
specific P-11 visual sample needs them and the reviewer accepts the use.

### 4.2 Logo proportions and spacing

The guideline establishes the official mark proportions and clear-space model.
The relevant implementation rules are:

- preserve the official logo proportions;
- maintain at least the required clear space around the logo;
- keep the printed logo above the stated minimum size;
- use approved contrast variants when the background requires it;
- write `NT` uppercase in prose; lowercase `nt` is reserved for the logo mark.

Observed guideline details useful for QA:

- logo proportion: 12.25 Dot Sign wide by 8 Dot Sign high;
- Vital Sign width equals the width of the `nt` wordmark;
- clear space: at least 2 Dot Sign around the logo;
- printed minimum size: 0.77 cm x 0.5 cm;
- white/outline and contrast variants exist for non-light backgrounds.

Phase 4 should use the simplest compliant placement:

- primary NT mark/compact logo for app shell contexts where the full company
  lockup would be unreadable;
- full NT company lockup for official PDF/print cover/header if the document
  needs formal organization identity;
- do not squeeze the full company lockup into tiny header slots where the Thai
  and English company names become illegible;
- no decorative mark pattern unless the final P-11 sample explicitly requires
  and approves it.

### 4.3 Typography

The guideline provides NT Regular and NT Bold assets. The Phase 4 architecture
already sets the correct direction:

- NT Regular for body text;
- NT Bold for headings and emphasis;
- WOFF2 derivatives for web runtime;
- Thai-capable fallback stack;
- tabular-number verification for prices, counts, hashes, and version metadata.

Important caveat:

Excel does not reliably embed or distribute web fonts the same way a browser
does. The official Excel export may set the NT font family, but it must remain
usable in Excel installations that fall back to a supported Thai font.

## 5. Approved P-10 runtime asset manifest

P-10 approves a narrow bill of materials, not the whole `/CI/` folder.
The following manifest is recommended for Phase 4 Core:

| Runtime asset | Source | Proposed path | Purpose | P-10 condition |
|---|---|---|---|---|
| NT Regular WOFF2 | `CI/NT Regular.ttf` | `app/fonts/nt/NT-Regular.woff2` | Master Catalog UI body text and export print/PDF body text | Owner confirmed NT business CI asset use on 2026-07-04; derive WOFF2 only, do not commit original TTF/OTF |
| NT Bold WOFF2 | `CI/NT Bold.ttf` | `app/fonts/nt/NT-Bold.woff2` | UI headings, labels, official document emphasis | Owner confirmed NT business CI asset use on 2026-07-04; derive WOFF2 only, do not commit original TTF/OTF |
| Primary NT mark PNG | `CI/NT_1_v3.png` | `public/brand/nt/nt-logo-primary.png` | App shell, compact Master Catalog header, and other places where full company lockup is too small to read | Owner approves this exact runtime logo derivative; preserve aspect ratio, transparency, clear space, and Vital Sign/wordmark relationship |
| Full NT company lockup PNG | `CI/NT_4_v3.png` | `public/brand/nt/nt-logo-company-lockup.png` | Login, official PDF/print/export header, and formal document identity | Owner approves this exact runtime logo derivative; preserve aspect ratio, transparency, clear space, and minimum readable size |

Implemented WP-6 runtime derivative evidence:

| Runtime asset | Source SHA-256 | Runtime SHA-256 | Implementation evidence |
|---|---|---|---|
| `app/fonts/nt/NT-Regular.woff2` | `77420e3622ba097c1d18f894c1d7e1b64c737a9522932468e26d6b8e9afb627b` | `dbb2f8434191537cdc8f3ab42d497ac34e3a5690440e150e93b5669c751efd5b` | Generated from `CI/NT Regular.ttf`; used by the Master Catalog PDF/print route through `next/font/local`; latest `pdffonts` proof shows embedded `NTRegular` |
| `app/fonts/nt/NT-Bold.woff2` | `07dbeb5ea19f678ab7d1cee52c9a6498179aed655a92a4a51a280e48e9197038` | `d2a022492a949e7dfb4b74aa1b1e3efad1be57fc9086088a41172726367667e2` | Generated from `CI/NT Bold.ttf`; used for PDF headings/emphasis through `next/font/local`; latest `pdffonts` proof shows embedded `NTBold` |
| `public/brand/nt/nt-logo-company-lockup.png` | `2d19ae57a7523eb1ecaeafbdb8623f97e4e2ae5e946f916b2c5b66e761c24e0f` | `2d19ae57a7523eb1ecaeafbdb8623f97e4e2ae5e946f916b2c5b66e761c24e0f` | Copied from `CI/NT_4_v3.png` for the formal Master Catalog PDF/print header; latest rendered PDF pages show the full company lockup at a readable size |

Not recommended for Phase 4 Core unless separately approved:

- original guideline PDFs;
- original TTF/OTF files;
- unused logo variants;
- Dot Sign / Vital Sign decorative graphics;
- source files under `/CI/`;
- ad hoc recolored logo variants;
- app-wide replacement of unrelated screens outside Master Catalog scope.

Existing assets `public/nt_logo.png` and `public/nt_logo.svg` should be treated
as legacy/current runtime assets. They visually match the full company lockup
family, but their provenance is not recorded in the Phase 4 source inventory.
They must be reconciled during implementation under P-10: either explicitly
retain them as approved derivatives with source evidence, or replace references
with derivatives from `CI/NT_4_v3.png`. They should not silently remain as
"approved" without source and provenance evidence.

## 6. Current implementation gaps

The current codebase is partially aligned with the P-10 runtime asset model for
WP-6 export artifacts. Remaining gaps:

- `app/layout.tsx` still loads Google `IBM_Plex_Sans_Thai`; Phase 4 CI
  implementation should switch Master Catalog surfaces to approved local NT
  fonts through `next/font/local`, while avoiding an unrelated app-wide redesign
  unless that is separately approved.
- `app/globals.css` maps `--font-sans` to `--font-ibm-plex-sans-thai` and still
  has legacy `--nt-blue` / `--nt-orange` tokens. Master Catalog Phase 4 should
  add semantic NT CI tokens (`--nt-yellow`, `--nt-dark-gray`, `--nt-logo-black`,
  `--nt-white`) and use them through component semantics.
- The existing BOQ print page uses `/fonts/THSarabunNew*.ttf` and
  `/nt_logo.svg`. That should not be changed incidentally as part of Master
  Catalog P-10 unless the BOQ print surface is explicitly in scope.
- Existing app pages use `/nt_logo.svg` in login, dashboard header, and BOQ
  print. Phase 4 must either retain this asset through P-10 provenance
  reconciliation or migrate Master Catalog-only references to the new approved
  derivatives.
- WP-6 official PDF/print now uses `app/fonts/nt/NT-Regular.woff2`,
  `app/fonts/nt/NT-Bold.woff2`, and
  `public/brand/nt/nt-logo-company-lockup.png`; this resolves only the official
  export artifact slice, not app-wide CI completeness.
- `public/nt_logo.png` is a small full company lockup. It is suitable for
  larger login/export contexts, but squeezing the full lockup into very small
  app chrome makes the company name unreadable. Compact contexts should use the
  primary NT mark or a header layout with separate readable text.

## 7. Recommended implementation controls

### 7.1 Repository controls

Before any CI asset commit:

- `git ls-files CI` must return no files;
- `/CI/` must remain ignored;
- the commit must contain only approved runtime derivatives and code references;
- generated assets must include source fingerprints in the P-10 record;
- no raw source PDFs/fonts/logos should be staged.

### 7.2 Build/runtime controls

Required checks:

- app build succeeds with `next/font/local` for approved local NT WOFF2 fonts;
- no font or logo 404 in browser console;
- Master Catalog pages render readable Thai before and after font load;
- official PDF/print render uses approved logo and stable Thai wrapping;
- Excel export remains readable when the NT font is unavailable on the viewer's
  machine;
- dataset hashes are not affected by brand assets, visual style, or export
  binary hash.

### 7.3 Visual QA controls

P-11 should inspect rendered samples, not screenshots of design intent. Minimum
sample set:

- Master Catalog list/search screen;
- item detail or edit view if included in Phase 4 UI;
- official Excel export opened in Microsoft Excel;
- same Excel file opened in one independent reader such as LibreOffice;
- official PDF/print output;
- draft and published visual states;
- edge rows: long Thai descriptions, zero cost, maximum cost, null optional
  English labels, `ITEM-0139` temporary legacy exception, and hash metadata.

P-11 acceptance should confirm:

- logo is recognizable and not distorted;
- clear space is respected;
- NT Yellow is restrained and readable;
- table density remains operational;
- Thai text has no clipping or orphaned marks;
- metadata, short hash, version, effective date, and draft/published labels are
  readable;
- no marketing-style hero, gradients, card-heavy official document layout, or
  decorative marks distract from the catalog record.

## 8. Risk analysis

| Risk | Severity | Why it matters | Control |
|---|---:|---|---|
| Committing the whole `/CI/` folder | High | Leaks large source manuals/fonts/assets and weakens brand governance | Keep `/CI/` ignored; require `git ls-files CI` check |
| Deploying CI assets outside the confirmed NT business scope | High | Owner confirmation is scoped to NT business use, not arbitrary external distribution | P-10 must record scope, exact derivatives, and runtime paths |
| Existing `public/nt_logo.*` treated as implicitly approved | Medium | Source/proportion/variant may not match the approved P-10 asset | Reconcile or replace explicitly |
| Recreating logo in CSS/SVG by hand | High | High chance of proportion/color drift | Derive only from supplied source assets |
| Overusing NT Yellow in dense tables | Medium | Poor readability and non-operational UI | Use yellow as accent; keep data tables neutral |
| Font lacks tabular-number behavior | Medium | Prices/hashes/counts may align poorly | Visual test and fallback strategy |
| Excel viewer lacks NT font | Medium | Official file may appear inconsistent on some machines | Use safe fallback and verify in supported Excel |
| Full company lockup used too small | Medium | Formal identity becomes visually present but unreadable | Use primary mark for small chrome; reserve lockup for readable sizes |
| P-10 approval mistaken for P-11 approval | High | Runtime asset approval could be misused as final visual acceptance | Keep Decision Register states separate |
| Brand visual changes affect data hash | High | Official evidence could appear inconsistent | Keep canonical data hash independent from binary/export styling |

## 9. Approved owner decision wording for P-10

Approved decision:

> Approve P-10 in limited form: approve only the following runtime derivatives
> for Master Catalog Phase 4 internal application and official exports:
> `NT-Regular.woff2` from `CI/NT Regular.ttf`, `NT-Bold.woff2` from
> `CI/NT Bold.ttf`, `nt-logo-primary.png` from `CI/NT_1_v3.png`, and
> `nt-logo-company-lockup.png` from `CI/NT_4_v3.png`. Owner confirms the project
> has rights to use all supplied NT CI assets under `/CI/` for NT business
> operations, including fonts, logos, guidelines, and supporting graphics. The
> original `/CI/` source files, PDFs, TTF/OTF files, unused logo variants, and
> decorative CI graphics remain local-only and unapproved for repository/deploy
> by default. Existing `public/nt_logo.svg` and
> `public/nt_logo.png` must be either replaced by the approved derivatives or
> explicitly retained with source/provenance evidence. P-11 visual sample
> approval remains pending.

If exact runtime provenance is later superseded or missing:

> Stop CI asset deployment for the affected replacement asset. Prepare the
> revised runtime manifest and visual sample using local-only assets for
> rehearsal only. Do not commit or deploy the replacement NT CI runtime
> derivative until source-to-runtime provenance and owner approval for the exact
> derivative name/path are recorded.

## 10. P-11 handoff

P-11 should not be approved from this analysis alone. P-11 requires actual
rendered evidence:

- final Excel workbook sample;
- final PDF/print sample;
- field order and metadata placement;
- visual comparison against the CI rules above;
- accessibility and Thai text checks;
- owner acceptance of the official look.

The clean decision boundary is:

- P-10 approves what runtime brand assets may exist in the repo/deployable app.
- P-11 approves whether the generated official documents look correct.
- Neither P-10 nor P-11 approves Production publication by itself.

## 11. Final recommendation

Phase 4 should proceed with the limited P-10 approval for the named runtime
derivatives only. CI asset rights are owner-confirmed for NT business use, and
the runtime filenames, logo derivative selection, existing `public/nt_logo.*`
reconciliation requirement, and repository controls are now recorded in the
Decision Register. This is the cleanest architecture because it preserves brand
source control, avoids accidental over-commitment, keeps the deployed payload
small, and gives P-11 a concrete visual artifact to accept or reject.

With P-10 approved, implementation may generate and commit only the named
runtime derivatives and code references required for Master Catalog Phase 4.
P-11 remains pending until the official Excel/PDF visual sample and field order
are rendered, reviewed, and accepted.
