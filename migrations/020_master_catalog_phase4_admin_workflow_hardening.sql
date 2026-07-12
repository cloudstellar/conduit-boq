-- Migration 020: Master Catalog Phase 4 Admin Workflow Hardening
-- Scope:
-- - Freezes the approved P-02 through P-07 first-rollout mapping and P-06 groups.
-- - Makes categories/groups resolve-only and adds server-owned code allocation.
-- - Adds exact admin read contracts, correction actions, publication provenance,
--   readiness parity, and required schema constraints for WP-6.6.
-- - Enforces one mutable draft per base and adds audited immutable abandon.
-- - Does not implement P-18 placement, reset Local Supabase, touch BOQ rows,
--   touch Factor F rows/pointers, enable the feature, or perform Production work.

BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '90s';

  CREATE SCHEMA IF NOT EXISTS private;

  REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
  GRANT USAGE ON SCHEMA private TO postgres, service_role, authenticated;

  -- ---------------------------------------------------------------------------
  -- 1. Version provenance and frozen authority tables
  -- ---------------------------------------------------------------------------
  ALTER TABLE public.price_list_versions
    ADD COLUMN IF NOT EXISTS physical_archive_reference text;

  ALTER TABLE public.catalog_change_items
    ADD COLUMN IF NOT EXISTS price_authority_reference text;

  INSERT INTO public.app_settings (key, value, description)
  VALUES
    (
      'catalog_new_identity_enabled',
      'false'::jsonb,
      'Release visibility and RPC gate for Master Catalog Add/Supplement new identities; requires accepted P-18 downstream workflow.'
    ),
    (
      'catalog_retirement_enabled',
      'false'::jsonb,
      'Release visibility and RPC gate for Master Catalog retirement effects; requires the affected P-19 workflow decision.'
    )
  ON CONFLICT (key) DO UPDATE
  SET description = EXCLUDED.description;

  CREATE TABLE IF NOT EXISTS public.catalog_code_group_dictionary (
    work_context_code text NOT NULL
      CHECK (work_context_code ~ '^[A-Z0-9]{3}$'),
    item_type_code text NOT NULL
      CHECK (item_type_code ~ '^[A-Z0-9]{3}$'),
    work_context_name_th text NOT NULL CHECK (btrim(work_context_name_th) <> ''),
    work_context_name_en text,
    item_type_name_th text NOT NULL CHECK (btrim(item_type_name_th) <> ''),
    item_type_name_en text,
    display_order integer NOT NULL CHECK (display_order >= 0),
    authority_version text NOT NULL
      CHECK (authority_version = 'phase4-first-rollout-authority/1'),
    authority_sha256 text NOT NULL
      CHECK (authority_sha256 = '28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a'),
    PRIMARY KEY (work_context_code, item_type_code),
    CONSTRAINT uq_catalog_code_group_dictionary_display UNIQUE (display_order)
  );

  CREATE TABLE IF NOT EXISTS public.catalog_first_rollout_mappings (
    identity_id uuid PRIMARY KEY
      REFERENCES public.catalog_item_identities(id) ON DELETE RESTRICT,
    legacy_item_code text NOT NULL,
    source_item_code text,
    target_item_code text NOT NULL,
    identity_outcome text NOT NULL CHECK (identity_outcome IN ('retain', 'recode')),
    work_context_code text,
    item_type_code text,
    authority_version text NOT NULL
      CHECK (authority_version = 'phase4-first-rollout-authority/1'),
    authority_sha256 text NOT NULL
      CHECK (authority_sha256 = '28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a'),
    CONSTRAINT uq_catalog_first_rollout_legacy UNIQUE (legacy_item_code),
    CONSTRAINT uq_catalog_first_rollout_source UNIQUE (source_item_code),
    CONSTRAINT uq_catalog_first_rollout_target UNIQUE (target_item_code),
    CONSTRAINT fk_catalog_first_rollout_legacy_identity
      FOREIGN KEY (legacy_item_code, identity_id)
      REFERENCES public.catalog_item_codes(item_code, identity_id)
      ON DELETE RESTRICT,
    CONSTRAINT fk_catalog_first_rollout_group
      FOREIGN KEY (work_context_code, item_type_code)
      REFERENCES public.catalog_code_group_dictionary(work_context_code, item_type_code)
      ON DELETE RESTRICT,
    CONSTRAINT check_catalog_first_rollout_mapping CHECK (
      (
        identity_outcome = 'retain'
        AND legacy_item_code = 'ITEM-0139'
        AND target_item_code = legacy_item_code
        AND work_context_code IS NULL
        AND item_type_code IS NULL
      )
      OR
      (
        identity_outcome = 'recode'
        AND target_item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'
        AND work_context_code = substring(target_item_code from '^([A-Z0-9]{3})-')
        AND item_type_code = substring(target_item_code from '^[A-Z0-9]{3}-([A-Z0-9]{3})-')
      )
    ),
    CONSTRAINT check_catalog_first_rollout_source_format CHECK (
      source_item_code IS NULL
      OR source_item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'
    )
  );

  CREATE TABLE IF NOT EXISTS public.catalog_first_rollout_source_exclusions (
    source_item_code text PRIMARY KEY
      CHECK (source_item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'),
    disposition text NOT NULL CHECK (disposition = 'deferred_not_publishable'),
    reason text NOT NULL CHECK (btrim(reason) <> '' AND length(reason) <= 500),
    authority_version text NOT NULL
      CHECK (authority_version = 'phase4-first-rollout-authority/1'),
    authority_sha256 text NOT NULL
      CHECK (authority_sha256 = '28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a')
  );

  CREATE TABLE IF NOT EXISTS private.catalog_code_sequences (
    work_context_code text NOT NULL,
    item_type_code text NOT NULL,
    last_issued_sequence integer NOT NULL
      CHECK (last_issued_sequence >= 0 AND last_issued_sequence < 900),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (work_context_code, item_type_code),
    CONSTRAINT fk_catalog_code_sequences_dictionary
      FOREIGN KEY (work_context_code, item_type_code)
      REFERENCES public.catalog_code_group_dictionary(work_context_code, item_type_code)
      ON DELETE RESTRICT
  );

  REVOKE ALL ON TABLE private.catalog_code_sequences
    FROM PUBLIC, anon, authenticated;
  GRANT SELECT, INSERT, UPDATE ON TABLE private.catalog_code_sequences
    TO postgres, service_role;

  -- ---------------------------------------------------------------------------
  -- 2. Generated and independently checked authority payload
  -- ---------------------------------------------------------------------------
  CREATE TEMP TABLE phase4_wp66_authority (
    payload jsonb NOT NULL
  ) ON COMMIT DROP;

  -- BEGIN GENERATED WP-6.6 AUTHORITY JSON
  INSERT INTO phase4_wp66_authority (payload)
  VALUES (
    $phase4_wp66_authority$
  {
    "schema_version": "phase4-first-rollout-authority/1",
    "source_evidence_path": "docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv",
    "source_evidence_sha256": "4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a",
    "decision_set": "P-02..P-07 approved 2026-07-04",
    "mappings": [
      {
        "identity_id": "fa1b3f6d-9505-4b23-b96c-8c9a998b3ae2",
        "legacy_item_code": "ITEM-0001",
        "source_item_code": "CIC-PVC-001",
        "target_item_code": "CIC-PVC-001",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "fa56f4ea-d24f-4404-ac23-c7f41e32911b",
        "legacy_item_code": "ITEM-0002",
        "source_item_code": "CIC-PVC-002",
        "target_item_code": "CIC-PVC-002",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "a8033ea1-0e12-4c84-a1e4-9b8cdcbc260d",
        "legacy_item_code": "ITEM-0003",
        "source_item_code": "CIC-PVC-003",
        "target_item_code": "CIC-PVC-003",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "6e43ea73-3fec-44c4-bf71-b4a259e1d394",
        "legacy_item_code": "ITEM-0004",
        "source_item_code": "CIC-PVC-004",
        "target_item_code": "CIC-PVC-004",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "c410595d-bd3f-477a-a816-e8085cf3af38",
        "legacy_item_code": "ITEM-0005",
        "source_item_code": "CIC-PVC-005",
        "target_item_code": "CIC-PVC-005",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "181ff543-8bd2-4d36-bfa0-2f7c0890c744",
        "legacy_item_code": "ITEM-0006",
        "source_item_code": "CIC-PVC-006",
        "target_item_code": "CIC-PVC-006",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "6e1651a6-84e6-4844-9ba7-1555bbafb844",
        "legacy_item_code": "ITEM-0007",
        "source_item_code": "CIC-PVC-007",
        "target_item_code": "CIC-PVC-007",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "eb17519e-f51e-4e96-821d-ce1a1e620f43",
        "legacy_item_code": "ITEM-0008",
        "source_item_code": "CIC-PVC-008",
        "target_item_code": "CIC-PVC-008",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "2f958a27-d77d-4f04-82fb-39392ee1bd72",
        "legacy_item_code": "ITEM-0009",
        "source_item_code": "CIC-PVC-009",
        "target_item_code": "CIC-PVC-009",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "e037b936-d887-4eb0-beed-5b65c7202a4c",
        "legacy_item_code": "ITEM-0010",
        "source_item_code": "CIC-PVC-010",
        "target_item_code": "CIC-PVC-010",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "3f562143-702f-418e-911d-85030302531d",
        "legacy_item_code": "ITEM-0011",
        "source_item_code": "CIC-PVC-011",
        "target_item_code": "CIC-PVC-011",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "ff6bc4dd-d95c-4abf-a3af-dec76314b70b",
        "legacy_item_code": "ITEM-0012",
        "source_item_code": "CIC-PVC-012",
        "target_item_code": "CIC-PVC-012",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "095d8d81-8cdf-4ccf-a4e6-88699e5c495b",
        "legacy_item_code": "ITEM-0013",
        "source_item_code": "CIC-PV2-001",
        "target_item_code": "CIC-PV2-001",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "e576c139-2541-42a7-b7d6-143206a04b36",
        "legacy_item_code": "ITEM-0014",
        "source_item_code": "CIC-PV2-002",
        "target_item_code": "CIC-PV2-002",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "003b2cec-04f0-4ab6-ae2e-613d3ccb6d15",
        "legacy_item_code": "ITEM-0015",
        "source_item_code": "CIC-PV2-003",
        "target_item_code": "CIC-PV2-003",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "73543734-9bc7-49c3-aebf-a6b331d697d8",
        "legacy_item_code": "ITEM-0016",
        "source_item_code": "CIC-H08-001",
        "target_item_code": "CIC-H08-001",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "51c82df5-356c-4604-8cde-fa8f31989003",
        "legacy_item_code": "ITEM-0017",
        "source_item_code": "CIC-H08-002",
        "target_item_code": "CIC-H08-002",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "c97a52cc-6f3b-4b47-8602-55dd5f70f7b0",
        "legacy_item_code": "ITEM-0018",
        "source_item_code": "CIC-H08-003",
        "target_item_code": "CIC-H08-003",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "9b473aab-71dd-43ff-b6f0-40a2fb16a7a4",
        "legacy_item_code": "ITEM-0019",
        "source_item_code": "CIC-H08-004",
        "target_item_code": "CIC-H08-004",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "60ba2921-34c5-4a70-b3eb-141ee2cd0d6a",
        "legacy_item_code": "ITEM-0020",
        "source_item_code": "CIC-H08-005",
        "target_item_code": "CIC-H08-005",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "ae12592d-c360-4030-a254-5721d633808f",
        "legacy_item_code": "ITEM-0021",
        "source_item_code": "CIC-H08-006",
        "target_item_code": "CIC-H08-006",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "277bb7db-473c-44dc-85f9-a337df44bb27",
        "legacy_item_code": "ITEM-0022",
        "source_item_code": "CIC-H08-007",
        "target_item_code": "CIC-H08-007",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "376861e6-01c6-4767-9ad6-0fb20760adfe",
        "legacy_item_code": "ITEM-0023",
        "source_item_code": "CIC-H08-008",
        "target_item_code": "CIC-H08-008",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "b8dcbf0a-f1be-485d-8dab-e2175f07bdfa",
        "legacy_item_code": "ITEM-0024",
        "source_item_code": "CIC-H08-009",
        "target_item_code": "CIC-H08-009",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "4ed8e198-5946-4927-b47e-9404c00f2548",
        "legacy_item_code": "ITEM-0025",
        "source_item_code": "CIC-H08-010",
        "target_item_code": "CIC-H08-010",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H08"
      },
      {
        "identity_id": "62922196-02a6-41a6-9a3c-390dad3db690",
        "legacy_item_code": "ITEM-0026",
        "source_item_code": "CIC-H10-001",
        "target_item_code": "CIC-H10-001",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "1fcde9f1-c230-4a59-940f-5b53e0101111",
        "legacy_item_code": "ITEM-0027",
        "source_item_code": "CIC-H10-002",
        "target_item_code": "CIC-H10-002",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "144debd0-a634-4b4f-b434-a15ca29b5013",
        "legacy_item_code": "ITEM-0028",
        "source_item_code": "CIC-H10-003",
        "target_item_code": "CIC-H10-003",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "bab2b9e5-3e53-4bd1-8bc9-6ff8aaa76b70",
        "legacy_item_code": "ITEM-0029",
        "source_item_code": "CIC-H10-004",
        "target_item_code": "CIC-H10-004",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "2b6c5c64-ab76-4fab-be65-dfb8d0dc83ab",
        "legacy_item_code": "ITEM-0030",
        "source_item_code": "CIC-H10-005",
        "target_item_code": "CIC-H10-005",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "92821d1c-3f62-4204-8b26-c8dec3809dc8",
        "legacy_item_code": "ITEM-0031",
        "source_item_code": "CIC-H10-006",
        "target_item_code": "CIC-H10-006",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "393bd24a-432a-4b7a-91b2-0c867f77845c",
        "legacy_item_code": "ITEM-0032",
        "source_item_code": "CIC-H10-007",
        "target_item_code": "CIC-H10-007",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "2a4fc2df-a594-420c-a598-ced344e0796b",
        "legacy_item_code": "ITEM-0033",
        "source_item_code": "CIC-H10-008",
        "target_item_code": "CIC-H10-008",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "ad458463-7399-4e78-bb85-e75103879e82",
        "legacy_item_code": "ITEM-0034",
        "source_item_code": "CIC-H10-009",
        "target_item_code": "CIC-H10-009",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "122c171b-09a2-462d-a604-f1cec8332266",
        "legacy_item_code": "ITEM-0035",
        "source_item_code": "CIC-H10-010",
        "target_item_code": "CIC-H10-010",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H10"
      },
      {
        "identity_id": "704780fc-59cb-4f1e-afaa-d3d92cadb968",
        "legacy_item_code": "ITEM-0036",
        "source_item_code": "CIC-GIP-001",
        "target_item_code": "CIC-GIP-001",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "4ff10125-8709-4b90-991d-7295df6d1802",
        "legacy_item_code": "ITEM-0037",
        "source_item_code": "CIC-GIP-002",
        "target_item_code": "CIC-GIP-002",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "82866e60-955c-4743-b74d-7eef8f169488",
        "legacy_item_code": "ITEM-0038",
        "source_item_code": "CIC-GIP-003",
        "target_item_code": "CIC-GIP-003",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "efcb18ac-43f3-4c1f-b5a9-e6c61e95b72e",
        "legacy_item_code": "ITEM-0039",
        "source_item_code": "CIC-GIP-004",
        "target_item_code": "CIC-GIP-004",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "24f6d456-b0f9-44d6-be14-1619cc2c1bf2",
        "legacy_item_code": "ITEM-0040",
        "source_item_code": "CIC-GIP-005",
        "target_item_code": "CIC-GIP-005",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "fca48f56-5be2-4511-8dee-ef5fd09eecd0",
        "legacy_item_code": "ITEM-0041",
        "source_item_code": "CIC-GIP-006",
        "target_item_code": "CIC-GIP-006",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "eb7f90bf-5718-4890-aa52-7f338358932a",
        "legacy_item_code": "ITEM-0042",
        "source_item_code": "CIS-PVC-001",
        "target_item_code": "CIS-PVC-001",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "b71d8c10-b208-4329-805a-bc455db7acb9",
        "legacy_item_code": "ITEM-0043",
        "source_item_code": "CIS-PVC-002",
        "target_item_code": "CIS-PVC-002",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "76bc1e33-470e-4c8c-bdf4-6cc30001a613",
        "legacy_item_code": "ITEM-0044",
        "source_item_code": "CIS-PVC-003",
        "target_item_code": "CIS-PVC-003",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "3c249fd4-4a5d-429f-91f8-367bbf859f12",
        "legacy_item_code": "ITEM-0045",
        "source_item_code": "CIS-PVC-004",
        "target_item_code": "CIS-PVC-004",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "28906efe-3fe9-4b5b-a453-b85de5c09025",
        "legacy_item_code": "ITEM-0046",
        "source_item_code": "CIS-PVC-005",
        "target_item_code": "CIS-PVC-005",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "94833ddf-fc52-4bde-943c-07b53f38dc80",
        "legacy_item_code": "ITEM-0047",
        "source_item_code": "CIS-PVC-006",
        "target_item_code": "CIS-PVC-006",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "e117b464-1c48-4fe8-a7e0-3bc002705beb",
        "legacy_item_code": "ITEM-0048",
        "source_item_code": "CIS-PVC-007",
        "target_item_code": "CIS-PVC-007",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "0aec4118-17e7-45f8-931f-652338a21969",
        "legacy_item_code": "ITEM-0049",
        "source_item_code": "CIS-PVC-008",
        "target_item_code": "CIS-PVC-008",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "c1449ab1-65d4-46ca-ad74-2cb5b94fea62",
        "legacy_item_code": "ITEM-0050",
        "source_item_code": "CIS-PVC-009",
        "target_item_code": "CIS-PVC-009",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "a6f4b563-fcfc-4a64-80e7-3de16787e4ff",
        "legacy_item_code": "ITEM-0051",
        "source_item_code": "CIS-PVC-010",
        "target_item_code": "CIS-PVC-010",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "ac93a14a-84d3-4db6-9aa1-f45f78fdd430",
        "legacy_item_code": "ITEM-0052",
        "source_item_code": "CIS-PVC-011",
        "target_item_code": "CIS-PVC-011",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "79d9f093-cddc-4075-8e2c-97e792982d02",
        "legacy_item_code": "ITEM-0053",
        "source_item_code": "CIS-PVC-012",
        "target_item_code": "CIS-PVC-012",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "395b7da1-cf87-4c00-b0a9-2438d8611ba6",
        "legacy_item_code": "ITEM-0054",
        "source_item_code": "CIS-PVC-013",
        "target_item_code": "CIS-PVC-013",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "6e15896a-1ed6-49fa-a9ff-0f6313b70b2d",
        "legacy_item_code": "ITEM-0055",
        "source_item_code": "CIS-PVC-014",
        "target_item_code": "CIS-PVC-014",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "ef775946-2488-40d3-932a-48cc9de4fa07",
        "legacy_item_code": "ITEM-0056",
        "source_item_code": "CIS-PVC-015",
        "target_item_code": "CIS-PVC-015",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "f06ec160-1ff3-4915-b0cc-08cd4d73ad4d",
        "legacy_item_code": "ITEM-0057",
        "source_item_code": "CIS-PVC-016",
        "target_item_code": "CIS-PVC-016",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "b2e21b5f-e2e8-4c09-be26-08372bb3e4f0",
        "legacy_item_code": "ITEM-0058",
        "source_item_code": "CIS-PVC-017",
        "target_item_code": "CIS-PVC-017",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "a3de31af-8bab-43c7-a905-2acf350ada39",
        "legacy_item_code": "ITEM-0059",
        "source_item_code": "CIS-PVC-018",
        "target_item_code": "CIS-PVC-018",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "28aa3300-5cce-471b-8f0e-b0aa119196f8",
        "legacy_item_code": "ITEM-0060",
        "source_item_code": "CIS-PVC-019",
        "target_item_code": "CIS-PVC-019",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "4420f7be-71af-4c68-bc95-7960065a49f4",
        "legacy_item_code": "ITEM-0061",
        "source_item_code": "CIS-PVC-020",
        "target_item_code": "CIS-PVC-020",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "3ead7bd3-4502-49ab-8eb6-819fd874271c",
        "legacy_item_code": "ITEM-0062",
        "source_item_code": "CIS-PVC-021",
        "target_item_code": "CIS-PVC-021",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "45e25fc4-1729-4615-a87c-ce2761865599",
        "legacy_item_code": "ITEM-0063",
        "source_item_code": "CIS-PVC-022",
        "target_item_code": "CIS-PVC-022",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "05ddab7e-ecbe-4994-a169-1057ff5c1538",
        "legacy_item_code": "ITEM-0064",
        "source_item_code": "CIS-PVC-023",
        "target_item_code": "CIS-PVC-023",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "fbd92a12-d336-4437-a379-d54d3d24c562",
        "legacy_item_code": "ITEM-0065",
        "source_item_code": "CIS-PVC-024",
        "target_item_code": "CIS-PVC-024",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "27adc5f7-2244-4b3c-b75a-16eedcab17b2",
        "legacy_item_code": "ITEM-0066",
        "source_item_code": "CIS-PVC-025",
        "target_item_code": "CIS-PVC-025",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "97f212ea-e024-45e5-aa1d-b781a1515fa2",
        "legacy_item_code": "ITEM-0067",
        "source_item_code": "CIS-PVC-026",
        "target_item_code": "CIS-PVC-026",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "35ed99fc-d9c1-47c5-9829-6b8d5ba442b5",
        "legacy_item_code": "ITEM-0068",
        "source_item_code": "CIS-PVC-027",
        "target_item_code": "CIS-PVC-027",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "b177bd11-9abd-4748-9160-4d9463fcc079",
        "legacy_item_code": "ITEM-0069",
        "source_item_code": "CIS-PVC-028",
        "target_item_code": "CIS-PVC-028",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "28baf23a-f2c5-467a-9985-f4470f5d3f16",
        "legacy_item_code": "ITEM-0070",
        "source_item_code": "CIS-PVC-029",
        "target_item_code": "CIS-PVC-029",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "3333ea30-9a2b-488a-8f2a-b3df8052e069",
        "legacy_item_code": "ITEM-0071",
        "source_item_code": "CIS-PVC-030",
        "target_item_code": "CIS-PVC-030",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "1cb5b8cf-e3fd-4677-aad2-fb2edb1bda8e",
        "legacy_item_code": "ITEM-0072",
        "source_item_code": "CIS-PVC-031",
        "target_item_code": "CIS-PVC-031",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "0b096dd1-fabe-42e8-b079-1fa1af356663",
        "legacy_item_code": "ITEM-0073",
        "source_item_code": "CIS-PV2-001",
        "target_item_code": "CIS-PV2-001",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "dab15102-fa2a-4df3-8603-9091446259db",
        "legacy_item_code": "ITEM-0074",
        "source_item_code": "CIS-PV2-002",
        "target_item_code": "CIS-PV2-002",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "2276213e-42a1-44ce-ad6a-a9752fba5172",
        "legacy_item_code": "ITEM-0075",
        "source_item_code": "CIS-PV2-003",
        "target_item_code": "CIS-PV2-003",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "e5e470bd-e5cb-437a-9793-b7eff93a48a1",
        "legacy_item_code": "ITEM-0076",
        "source_item_code": "CIS-PV2-004",
        "target_item_code": "CIS-PV2-004",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "1d28498a-e4b9-4449-8f53-ed1129dd7948",
        "legacy_item_code": "ITEM-0077",
        "source_item_code": "CIS-PV2-005",
        "target_item_code": "CIS-PV2-005",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "f897b33c-8897-4e89-a75f-060fd65c3846",
        "legacy_item_code": "ITEM-0078",
        "source_item_code": "CIS-PV2-006",
        "target_item_code": "CIS-PV2-006",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "4fcbbf86-6983-44c6-ab04-c4d2279f4a1b",
        "legacy_item_code": "ITEM-0079",
        "source_item_code": "CIS-PV2-007",
        "target_item_code": "CIS-PV2-007",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "PV2"
      },
      {
        "identity_id": "b2b1dfa1-e73f-4b8f-b60e-1784d8ae8eb6",
        "legacy_item_code": "ITEM-0080",
        "source_item_code": "CIS-H10-001",
        "target_item_code": "CIS-H10-001",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "49f552e4-4fc4-467b-95b1-bcca90135ac8",
        "legacy_item_code": "ITEM-0081",
        "source_item_code": "CIS-H10-002",
        "target_item_code": "CIS-H10-002",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "07bf6091-9bc9-4ded-befa-a01837043da6",
        "legacy_item_code": "ITEM-0082",
        "source_item_code": "CIS-H10-003",
        "target_item_code": "CIS-H10-003",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "5d0d21d3-a3c7-4919-b6d9-07c590d8f15d",
        "legacy_item_code": "ITEM-0083",
        "source_item_code": "CIS-H10-004",
        "target_item_code": "CIS-H10-004",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "fdcc2336-0817-49c6-9120-0c3713c7f3cf",
        "legacy_item_code": "ITEM-0084",
        "source_item_code": "CIS-H10-005",
        "target_item_code": "CIS-H10-005",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "2b92fbcb-1d8a-4616-830b-a430a3249095",
        "legacy_item_code": "ITEM-0085",
        "source_item_code": "CIS-H10-006",
        "target_item_code": "CIS-H10-006",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "b54d9539-aae9-4036-840f-45f5dfe14097",
        "legacy_item_code": "ITEM-0086",
        "source_item_code": "CIS-H10-007",
        "target_item_code": "CIS-H10-007",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "d1329c38-a3f7-4752-8653-fdac374a66f8",
        "legacy_item_code": "ITEM-0087",
        "source_item_code": "CIS-H10-008",
        "target_item_code": "CIS-H10-008",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "a75fd41d-e1ae-4d88-b294-4716c74c0ca6",
        "legacy_item_code": "ITEM-0088",
        "source_item_code": "CIS-H10-009",
        "target_item_code": "CIS-H10-009",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "ed412208-265d-414d-a778-657045cd73b1",
        "legacy_item_code": "ITEM-0089",
        "source_item_code": "CIS-H10-010",
        "target_item_code": "CIS-H10-010",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "d5bea554-7e32-4d0b-8ad1-ef356117286c",
        "legacy_item_code": "ITEM-0090",
        "source_item_code": "CIS-H10-011",
        "target_item_code": "CIS-H10-011",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "30e0dea6-404c-4180-bad3-3d1176815f9b",
        "legacy_item_code": "ITEM-0091",
        "source_item_code": "CIS-H10-012",
        "target_item_code": "CIS-H10-012",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "d3accd83-0313-4bb0-838c-48b689192304",
        "legacy_item_code": "ITEM-0092",
        "source_item_code": "CIS-H10-013",
        "target_item_code": "CIS-H10-013",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "2e9d44dc-28e4-418c-a6f6-1314f0a53c09",
        "legacy_item_code": "ITEM-0093",
        "source_item_code": "CIS-H10-014",
        "target_item_code": "CIS-H10-014",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "40b4760d-0c99-453b-b2f5-8b2811cfb410",
        "legacy_item_code": "ITEM-0094",
        "source_item_code": "CIS-H10-015",
        "target_item_code": "CIS-H10-015",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "8e0bac75-fed5-43e1-acdd-1b789f6cc823",
        "legacy_item_code": "ITEM-0095",
        "source_item_code": "CIS-H10-016",
        "target_item_code": "CIS-H10-016",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "90fb92b4-c8d2-420d-82c2-febd39597480",
        "legacy_item_code": "ITEM-0096",
        "source_item_code": "CIS-H10-017",
        "target_item_code": "CIS-H10-017",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H10"
      },
      {
        "identity_id": "b110db9b-fcf8-442c-8f07-57d9b5e8ed85",
        "legacy_item_code": "ITEM-0097",
        "source_item_code": "CIS-D02-001",
        "target_item_code": "CIS-D02-001",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "D02"
      },
      {
        "identity_id": "c0ea917b-803f-4ad5-b20f-e45100050115",
        "legacy_item_code": "ITEM-0098",
        "source_item_code": "CIS-GIP-001",
        "target_item_code": "CIS-GIP-001",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "9d430257-bf24-45ff-a87e-ef418abfdbf2",
        "legacy_item_code": "ITEM-0099",
        "source_item_code": "CIS-GIP-002",
        "target_item_code": "CIS-GIP-002",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "a7eb7157-0a9e-414c-b311-caf604c8d431",
        "legacy_item_code": "ITEM-0100",
        "source_item_code": "CIS-GIP-003",
        "target_item_code": "CIS-GIP-003",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "654ba9fb-691d-45bd-a7c8-1c6ba2fff239",
        "legacy_item_code": "ITEM-0101",
        "source_item_code": "CIS-GIP-004",
        "target_item_code": "CIS-GIP-004",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "4997e014-8118-4506-aeae-3d7f420531e7",
        "legacy_item_code": "ITEM-0102",
        "source_item_code": "CIS-GIP-005",
        "target_item_code": "CIS-GIP-005",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "49f8d8a0-8193-437e-9513-57680696535d",
        "legacy_item_code": "ITEM-0103",
        "source_item_code": "CIS-GIP-006",
        "target_item_code": "CIS-GIP-006",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "9763deff-6845-4fdf-8451-6de137becdbc",
        "legacy_item_code": "ITEM-0104",
        "source_item_code": "CIS-GIP-007",
        "target_item_code": "CIS-GIP-007",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "9fec4a1b-a1d9-4351-a7eb-1a02431c7b02",
        "legacy_item_code": "ITEM-0105",
        "source_item_code": "CIS-GIP-008",
        "target_item_code": "CIS-GIP-008",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "7fac622a-c672-4b14-a731-3ec1283b38fc",
        "legacy_item_code": "ITEM-0106",
        "source_item_code": "CIS-GIP-009",
        "target_item_code": "CIS-GIP-009",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "a80d6d7b-5988-4394-a977-00d76229a8c5",
        "legacy_item_code": "ITEM-0107",
        "source_item_code": "CRS-GIP-001",
        "target_item_code": "CRS-GIP-001",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "57bd6bbd-ec01-484c-824f-c286702fc85a",
        "legacy_item_code": "ITEM-0108",
        "source_item_code": "CRS-GIP-002",
        "target_item_code": "CRS-GIP-002",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "2db762a1-f705-43e3-947d-bf84eecd6a62",
        "legacy_item_code": "ITEM-0109",
        "source_item_code": "CRS-GIP-003",
        "target_item_code": "CRS-GIP-003",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "320838d2-8ac5-401a-8aa2-149f83ea436a",
        "legacy_item_code": "ITEM-0110",
        "source_item_code": "CRS-GIP-004",
        "target_item_code": "CRS-GIP-004",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "90ace6d4-fa21-49da-bcbf-8a7ee4d0f3fe",
        "legacy_item_code": "ITEM-0111",
        "source_item_code": "CRS-GIP-005",
        "target_item_code": "CRS-GIP-005",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "b100f090-34fc-49dc-a0d1-5e37e5808335",
        "legacy_item_code": "ITEM-0112",
        "source_item_code": "CRS-GIP-006",
        "target_item_code": "CRS-GIP-006",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "1a8277b6-9052-40dd-85dc-8b861a381f37",
        "legacy_item_code": "ITEM-0113",
        "source_item_code": "CRS-GIP-007",
        "target_item_code": "CRS-GIP-007",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "b79ca9c7-01be-44fc-b96f-b605bc936d4c",
        "legacy_item_code": "ITEM-0114",
        "source_item_code": "CRS-GIP-008",
        "target_item_code": "CRS-GIP-008",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "cd4f6ee6-114b-42f1-8353-f4506188457d",
        "legacy_item_code": "ITEM-0115",
        "source_item_code": "CRS-GIP-009",
        "target_item_code": "CRS-GIP-009",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "06b406e4-8c6c-4f9d-9aed-cdb2451a5615",
        "legacy_item_code": "ITEM-0116",
        "source_item_code": "CRS-GIP-010",
        "target_item_code": "CRS-GIP-010",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "93341ced-24c0-4780-99e3-5f2816f28273",
        "legacy_item_code": "ITEM-0117",
        "source_item_code": "CRS-GIP-011",
        "target_item_code": "CRS-GIP-011",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "9425f5b3-c684-4f9a-a1c6-1785f43e4021",
        "legacy_item_code": "ITEM-0118",
        "source_item_code": "CRS-GIP-012",
        "target_item_code": "CRS-GIP-012",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "bebf9e7e-8c97-4191-aad2-a1e501f025f8",
        "legacy_item_code": "ITEM-0119",
        "source_item_code": "CRS-GIP-013",
        "target_item_code": "CRS-GIP-013",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "ea485bf5-0342-49ad-bba9-35bebea10677",
        "legacy_item_code": "ITEM-0120",
        "source_item_code": "CRS-GIP-014",
        "target_item_code": "CRS-GIP-014",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "84214bdf-b22b-4e0a-b9d2-aa35e133bde9",
        "legacy_item_code": "ITEM-0121",
        "source_item_code": "CRS-GIP-015",
        "target_item_code": "CRS-GIP-015",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "08eee222-7873-4570-87f1-7a221162aa3c",
        "legacy_item_code": "ITEM-0122",
        "source_item_code": "CRS-GIP-016",
        "target_item_code": "CRS-GIP-016",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "07a38e89-f38d-454d-bb04-a7c532e62b24",
        "legacy_item_code": "ITEM-0123",
        "source_item_code": "CRS-GIP-017",
        "target_item_code": "CRS-GIP-017",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "GIP"
      },
      {
        "identity_id": "0096556f-1935-4fbc-ac3d-487fb2fc99d4",
        "legacy_item_code": "ITEM-0124",
        "source_item_code": "CRS-GIP-018",
        "target_item_code": "CRS-H06-001",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "e59461a4-91ef-44f9-8f5a-c013aed68093",
        "legacy_item_code": "ITEM-0125",
        "source_item_code": "CRS-GIP-019",
        "target_item_code": "CRS-H06-002",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "d88bfe0e-9364-4de1-babc-ee6d628b32be",
        "legacy_item_code": "ITEM-0126",
        "source_item_code": "CRS-GIP-020",
        "target_item_code": "CRS-H06-003",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "a3ade330-4ce4-4b74-b80d-4362468817cd",
        "legacy_item_code": "ITEM-0127",
        "source_item_code": "CRS-GIP-021",
        "target_item_code": "CRS-H06-004",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "56b2930d-6676-452e-9631-994c064f8fd2",
        "legacy_item_code": "ITEM-0128",
        "source_item_code": "CRS-GIP-022",
        "target_item_code": "CRS-H06-005",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "9922eb15-bfa9-4077-af6f-bbf93f0b7f5f",
        "legacy_item_code": "ITEM-0129",
        "source_item_code": "CRS-GIP-023",
        "target_item_code": "CRS-H06-006",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "f86713eb-481d-4a60-b3bb-a9fcf51475ec",
        "legacy_item_code": "ITEM-0130",
        "source_item_code": "CRS-GIP-024",
        "target_item_code": "CRS-H06-007",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "0ef71f8d-074b-4cbe-9e85-c62c414d8164",
        "legacy_item_code": "ITEM-0131",
        "source_item_code": "CRS-GIP-033",
        "target_item_code": "CRS-H08-001",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "667e4aa6-23f6-4a76-a743-bc8ffe3ab503",
        "legacy_item_code": "ITEM-0132",
        "source_item_code": "CRS-GIP-026",
        "target_item_code": "CRS-H08-002",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "2425f349-2f22-4a20-a75e-3d66855bcdda",
        "legacy_item_code": "ITEM-0133",
        "source_item_code": "CRS-GIP-027",
        "target_item_code": "CRS-H08-003",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "aa3df7b3-0d24-4f3f-b695-7ae99dada017",
        "legacy_item_code": "ITEM-0134",
        "source_item_code": "CRS-GIP-028",
        "target_item_code": "CRS-H08-004",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "61c1cd79-2f42-4a9c-8292-c97216799cac",
        "legacy_item_code": "ITEM-0135",
        "source_item_code": "CRS-GIP-029",
        "target_item_code": "CRS-H08-005",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "16a48e17-b722-4675-ba55-0b500f064a50",
        "legacy_item_code": "ITEM-0136",
        "source_item_code": "CRS-GIP-030",
        "target_item_code": "CRS-H08-006",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "7689636f-215b-4d28-9dcb-45578df104b7",
        "legacy_item_code": "ITEM-0137",
        "source_item_code": "CRS-GIP-031",
        "target_item_code": "CRS-H08-007",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "401d3916-4a87-4613-8184-17eaead6943d",
        "legacy_item_code": "ITEM-0138",
        "source_item_code": "CRS-GIP-032",
        "target_item_code": "CRS-H08-008",
        "identity_outcome": "recode",
        "work_context_code": "CRS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "2289df03-0dc3-456e-9b1d-fb4c4f393912",
        "legacy_item_code": "ITEM-0139",
        "source_item_code": null,
        "target_item_code": "ITEM-0139",
        "identity_outcome": "retain",
        "work_context_code": null,
        "item_type_code": null
      },
      {
        "identity_id": "7812e648-b4dc-4f8a-a335-f247bd7df290",
        "legacy_item_code": "ITEM-0140",
        "source_item_code": "HDD-PJK-001",
        "target_item_code": "HDD-PJK-001",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "PJK"
      },
      {
        "identity_id": "d70bae4b-789d-4202-9dbf-bc3827d37ee5",
        "legacy_item_code": "ITEM-0141",
        "source_item_code": "HDD-PJK-002",
        "target_item_code": "HDD-PJK-002",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "PJK"
      },
      {
        "identity_id": "89e3b955-aada-4cea-b861-d399544d4633",
        "legacy_item_code": "ITEM-0142",
        "source_item_code": "HDD-PJK-003",
        "target_item_code": "HDD-PJK-003",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "PJK"
      },
      {
        "identity_id": "c3adc0d8-0648-4124-b599-febc69b91580",
        "legacy_item_code": "ITEM-0143",
        "source_item_code": "HDD-GJK-001",
        "target_item_code": "HDD-GJK-001",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "GJK"
      },
      {
        "identity_id": "9b67b16e-ce66-44a5-83a5-96999f9d8d2b",
        "legacy_item_code": "ITEM-0144",
        "source_item_code": "HDD-GJK-002",
        "target_item_code": "HDD-GJK-002",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "GJK"
      },
      {
        "identity_id": "6f4b9994-28db-4a11-9cf3-510ddbbcede2",
        "legacy_item_code": "ITEM-0145",
        "source_item_code": "HDD-GJK-003",
        "target_item_code": "HDD-GJK-003",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "GJK"
      },
      {
        "identity_id": "ea87554a-c6c2-423d-9a43-6c5d196ebac6",
        "legacy_item_code": "ITEM-0146",
        "source_item_code": "HDD-GJK-004",
        "target_item_code": "HDD-GJK-004",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "GJK"
      },
      {
        "identity_id": "f1d1f1fe-d8c9-413c-bfa3-c8bb7e3a3aa8",
        "legacy_item_code": "ITEM-0147",
        "source_item_code": "HDD-GJK-005",
        "target_item_code": "HDD-GJK-005",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "GJK"
      },
      {
        "identity_id": "be1bfa55-72e4-456e-a6a9-1bc8b78296fe",
        "legacy_item_code": "ITEM-0148",
        "source_item_code": "HDD-GJK-006",
        "target_item_code": "HDD-GJK-006",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "GJK"
      },
      {
        "identity_id": "b960c992-0687-4dd1-ab5e-e3cd2c14b3c9",
        "legacy_item_code": "ITEM-0149",
        "source_item_code": "HDD-GJK-007",
        "target_item_code": "HDD-GJK-007",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "GJK"
      },
      {
        "identity_id": "cdb6a53d-01b0-4ae9-bda2-f9a297e001ec",
        "legacy_item_code": "ITEM-0150",
        "source_item_code": "HDD-H06-001",
        "target_item_code": "HDD-H06-001",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H06"
      },
      {
        "identity_id": "6b040d43-e83d-481e-9ca0-022bf791ab2a",
        "legacy_item_code": "ITEM-0151",
        "source_item_code": "HDD-H06-002",
        "target_item_code": "HDD-H06-002",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H06"
      },
      {
        "identity_id": "a1e686d8-346d-4eb1-ac13-07824f0956b9",
        "legacy_item_code": "ITEM-0152",
        "source_item_code": "HDD-H06-003",
        "target_item_code": "HDD-H06-003",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H06"
      },
      {
        "identity_id": "b54c6b8b-ae55-4687-a819-0ee722992a31",
        "legacy_item_code": "ITEM-0153",
        "source_item_code": "HDD-H08-001",
        "target_item_code": "HDD-H08-001",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "8957b7d8-bc84-4bd4-b2ed-f659702d18fc",
        "legacy_item_code": "ITEM-0154",
        "source_item_code": "HDD-H08-002",
        "target_item_code": "HDD-H08-002",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "50733f00-92f4-41da-a7cd-b75cfa1d44be",
        "legacy_item_code": "ITEM-0155",
        "source_item_code": "HDD-H08-003",
        "target_item_code": "HDD-H08-003",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "04dff8e7-0581-40f0-8541-b3ca093f168c",
        "legacy_item_code": "ITEM-0156",
        "source_item_code": "HDD-H08-004",
        "target_item_code": "HDD-H08-004",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "5fb1401a-9986-415a-b093-a1b25916bc7c",
        "legacy_item_code": "ITEM-0157",
        "source_item_code": "HDD-H08-005",
        "target_item_code": "HDD-H08-005",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "df79d8d3-5bb3-4ff9-9a02-acc02f9a1e4e",
        "legacy_item_code": "ITEM-0158",
        "source_item_code": "HDD-H08-006",
        "target_item_code": "HDD-H08-006",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "74f5a4be-367b-4ce4-84ec-58b3d22caa8b",
        "legacy_item_code": "ITEM-0159",
        "source_item_code": "HDD-H08-007",
        "target_item_code": "HDD-H08-007",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "1b1b70dd-f7df-49f7-a3ca-0a7f47bf8292",
        "legacy_item_code": "ITEM-0160",
        "source_item_code": "HDD-H08-008",
        "target_item_code": "HDD-H08-008",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "267eb575-c739-4ba8-be86-3d9a723f75dd",
        "legacy_item_code": "ITEM-0161",
        "source_item_code": "HDD-H08-009",
        "target_item_code": "HDD-H08-009",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "fb260361-b695-4e37-8e2a-20962eec5d90",
        "legacy_item_code": "ITEM-0162",
        "source_item_code": "HDD-H08-010",
        "target_item_code": "HDD-H08-010",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "b5b39d4b-8c42-4aa3-98bb-07793f01b2f5",
        "legacy_item_code": "ITEM-0163",
        "source_item_code": "HDD-H08-011",
        "target_item_code": "HDD-H08-011",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "ec5b22ac-81a5-4f19-a881-ea8146997fef",
        "legacy_item_code": "ITEM-0164",
        "source_item_code": "HDD-H08-012",
        "target_item_code": "HDD-H08-012",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "b4aff872-03c8-4f31-b66f-826922693811",
        "legacy_item_code": "ITEM-0165",
        "source_item_code": "HDD-H08-013",
        "target_item_code": "HDD-H08-013",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "c09963b2-1e31-4112-ae42-63a6759b17b2",
        "legacy_item_code": "ITEM-0166",
        "source_item_code": "HDD-H08-014",
        "target_item_code": "HDD-H08-014",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "a6741c87-8a6e-491b-a36f-7361afa5a6c6",
        "legacy_item_code": "ITEM-0167",
        "source_item_code": "HDD-H08-015",
        "target_item_code": "HDD-H08-015",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "82deeed6-a85a-495a-a1f3-1ada3fe1754b",
        "legacy_item_code": "ITEM-0168",
        "source_item_code": "HDD-H08-016",
        "target_item_code": "HDD-H08-016",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "68bdd054-30c0-4d61-9111-850a63cb473d",
        "legacy_item_code": "ITEM-0169",
        "source_item_code": "HDD-H08-017",
        "target_item_code": "HDD-H08-017",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "8e78f9db-4a0a-4d68-9dc1-7d1dd9ada429",
        "legacy_item_code": "ITEM-0170",
        "source_item_code": "HDD-H08-018",
        "target_item_code": "HDD-H08-018",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "fb44d2e8-a168-4e3b-921d-612affcba84f",
        "legacy_item_code": "ITEM-0171",
        "source_item_code": "HDD-H08-019",
        "target_item_code": "HDD-H08-019",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "ef677f21-31da-4f29-b1c9-e52b53977612",
        "legacy_item_code": "ITEM-0172",
        "source_item_code": "HDD-H08-020",
        "target_item_code": "HDD-H08-020",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "a673b6b1-e1f8-4df2-ae10-501176433e84",
        "legacy_item_code": "ITEM-0173",
        "source_item_code": "HDD-H08-021",
        "target_item_code": "HDD-H08-021",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "742ca14c-5306-45b3-8f38-c76c8ad879e3",
        "legacy_item_code": "ITEM-0174",
        "source_item_code": "HDD-H08-022",
        "target_item_code": "HDD-H08-022",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "c82bea76-723d-4d49-976c-75e7f5242843",
        "legacy_item_code": "ITEM-0175",
        "source_item_code": "HDD-H08-023",
        "target_item_code": "HDD-H08-023",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "f0ae30fb-5234-4ca1-87fc-33cf384c6d90",
        "legacy_item_code": "ITEM-0176",
        "source_item_code": "HDD-H08-024",
        "target_item_code": "HDD-H08-024",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H08"
      },
      {
        "identity_id": "1a98b39c-12c2-4e1a-856b-4820df7a4b22",
        "legacy_item_code": "ITEM-0177",
        "source_item_code": "HDD-H10-001",
        "target_item_code": "HDD-H10-001",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "95658df3-1254-4d18-b089-6587580f2da1",
        "legacy_item_code": "ITEM-0178",
        "source_item_code": "HDD-H10-002",
        "target_item_code": "HDD-H10-002",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "2fdd0c0d-016a-4f3c-92e7-d05a5925fe41",
        "legacy_item_code": "ITEM-0179",
        "source_item_code": "HDD-H10-003",
        "target_item_code": "HDD-H10-003",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "be00df3a-418a-434a-a54d-94de20583e42",
        "legacy_item_code": "ITEM-0180",
        "source_item_code": "HDD-H10-004",
        "target_item_code": "HDD-H10-004",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "172de182-ef88-42db-b03a-1fab48315702",
        "legacy_item_code": "ITEM-0181",
        "source_item_code": "HDD-H10-005",
        "target_item_code": "HDD-H10-005",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "ed605029-ab6f-407d-89e8-fcf298d3a7cf",
        "legacy_item_code": "ITEM-0182",
        "source_item_code": "HDD-H10-006",
        "target_item_code": "HDD-H10-006",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "98f38f71-0b01-4f48-9bf8-c421fead3395",
        "legacy_item_code": "ITEM-0183",
        "source_item_code": "HDD-H10-007",
        "target_item_code": "HDD-H10-007",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "d33382ed-d5cb-4e99-8536-aa93cf568203",
        "legacy_item_code": "ITEM-0184",
        "source_item_code": "HDD-H10-008",
        "target_item_code": "HDD-H10-008",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "262c7bcb-1938-4e75-a4ce-663e8c55c93c",
        "legacy_item_code": "ITEM-0185",
        "source_item_code": "HDD-H10-009",
        "target_item_code": "HDD-H10-009",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "71fb4072-c790-4bf5-9b06-0606984b05e0",
        "legacy_item_code": "ITEM-0186",
        "source_item_code": "HDD-H10-010",
        "target_item_code": "HDD-H10-010",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "2a4abbfe-9016-4795-8a38-cc6ac630cc67",
        "legacy_item_code": "ITEM-0187",
        "source_item_code": "HDD-H10-011",
        "target_item_code": "HDD-H10-011",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "531f399d-c94e-4ee8-9f46-633911fa4802",
        "legacy_item_code": "ITEM-0188",
        "source_item_code": "HDD-H10-012",
        "target_item_code": "HDD-H10-012",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "6106c7ea-8269-4b72-bc3a-f9fe39ae8c9b",
        "legacy_item_code": "ITEM-0189",
        "source_item_code": "HDD-H10-013",
        "target_item_code": "HDD-H10-013",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "aa2e8c07-74ea-4e83-94e8-1b99e2a277ab",
        "legacy_item_code": "ITEM-0190",
        "source_item_code": "HDD-H10-014",
        "target_item_code": "HDD-H10-014",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "a9d1a78c-71cd-4cb2-bb51-a7a3345b552e",
        "legacy_item_code": "ITEM-0191",
        "source_item_code": "HDD-H10-015",
        "target_item_code": "HDD-H10-015",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "ff9a3223-2a05-4cc4-be19-f165b61c6fa9",
        "legacy_item_code": "ITEM-0192",
        "source_item_code": "HDD-H10-016",
        "target_item_code": "HDD-H10-016",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "44867bee-b7b8-404e-a174-b6f9eb2648cb",
        "legacy_item_code": "ITEM-0193",
        "source_item_code": "HDD-H10-017",
        "target_item_code": "HDD-H10-017",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "1700fc5a-a44f-43fa-abd5-ccb8ac185c3c",
        "legacy_item_code": "ITEM-0194",
        "source_item_code": "HDD-H10-018",
        "target_item_code": "HDD-H10-018",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "d51b9b6f-7794-4cf7-b016-c990849463fa",
        "legacy_item_code": "ITEM-0195",
        "source_item_code": "HDD-H10-019",
        "target_item_code": "HDD-H10-019",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "25fcdffc-452e-4271-8c70-3e2bc813dad9",
        "legacy_item_code": "ITEM-0196",
        "source_item_code": "HDD-H10-020",
        "target_item_code": "HDD-H10-020",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "fa9e93d7-e876-4f1f-880f-51ff846d9867",
        "legacy_item_code": "ITEM-0197",
        "source_item_code": "HDD-H10-021",
        "target_item_code": "HDD-H10-021",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "16524ac0-6c7b-47e1-8c35-4d125612d781",
        "legacy_item_code": "ITEM-0198",
        "source_item_code": "HDD-H10-022",
        "target_item_code": "HDD-H10-022",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "19d2523e-85ec-4b47-941b-8752063a9580",
        "legacy_item_code": "ITEM-0199",
        "source_item_code": "HDD-H10-023",
        "target_item_code": "HDD-H10-023",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "ed3304e3-116b-4449-9691-7823667fd814",
        "legacy_item_code": "ITEM-0200",
        "source_item_code": "HDD-H10-024",
        "target_item_code": "HDD-H10-024",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "b75cc5b6-e0f2-46eb-9eb0-6887111b0db8",
        "legacy_item_code": "ITEM-0201",
        "source_item_code": "HDD-H10-025",
        "target_item_code": "HDD-H10-025",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "8f26156e-9b5f-411c-96db-773d99babdb2",
        "legacy_item_code": "ITEM-0202",
        "source_item_code": "HDD-H10-026",
        "target_item_code": "HDD-H10-026",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "00248069-1c02-4946-80eb-218f1f54a9f4",
        "legacy_item_code": "ITEM-0203",
        "source_item_code": "HDD-H10-027",
        "target_item_code": "HDD-H10-027",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "H10"
      },
      {
        "identity_id": "2b17e967-72db-4143-9e58-ff0a820fd798",
        "legacy_item_code": "ITEM-0204",
        "source_item_code": "HDD-D02-001",
        "target_item_code": "HDD-D02-001",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "D02"
      },
      {
        "identity_id": "df45ae9d-afd2-4ae1-89ac-c8f18b0aed5a",
        "legacy_item_code": "ITEM-0205",
        "source_item_code": "HDD-D02-002",
        "target_item_code": "HDD-D02-002",
        "identity_outcome": "recode",
        "work_context_code": "HDD",
        "item_type_code": "D02"
      },
      {
        "identity_id": "6d6ede1f-308d-46d0-92fc-37117d00fbb9",
        "legacy_item_code": "ITEM-0206",
        "source_item_code": "JNT-PVC-001",
        "target_item_code": "JNT-PVC-001",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "341ee3f4-7139-4821-9fb4-d35dc6392724",
        "legacy_item_code": "ITEM-0207",
        "source_item_code": "JNT-PVC-002",
        "target_item_code": "JNT-PVC-002",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "2aa21c01-d533-43fc-a4d3-f3dc23b35dbc",
        "legacy_item_code": "ITEM-0208",
        "source_item_code": "JNT-PVC-003",
        "target_item_code": "JNT-PVC-003",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "a2ab30ea-e76b-4d6b-96f1-b7afa648396a",
        "legacy_item_code": "ITEM-0209",
        "source_item_code": "JNT-PVC-004",
        "target_item_code": "JNT-PVC-004",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "3bcf85b5-f6ae-4e0c-ac8e-c40b0b4d4e97",
        "legacy_item_code": "ITEM-0210",
        "source_item_code": "JNT-PVC-005",
        "target_item_code": "JNT-PVC-005",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "2c6ab491-9584-46c1-8292-2902aac9ec84",
        "legacy_item_code": "ITEM-0211",
        "source_item_code": "JNT-PVC-006",
        "target_item_code": "JNT-PVC-006",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "179314fa-006e-4745-ad22-502878a17367",
        "legacy_item_code": "ITEM-0212",
        "source_item_code": "JNT-PVC-007",
        "target_item_code": "JNT-PVC-007",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "5ce7763c-562b-4d71-9229-c0f8c31344f3",
        "legacy_item_code": "ITEM-0213",
        "source_item_code": "JNT-PVC-008",
        "target_item_code": "JNT-PVC-008",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "7d0cd60c-b08a-436b-973d-c7e6bcc7ef21",
        "legacy_item_code": "ITEM-0214",
        "source_item_code": "JNT-PVC-009",
        "target_item_code": "JNT-PVC-009",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "a4254445-7cc9-4f53-8d72-f5b16c2f0ab9",
        "legacy_item_code": "ITEM-0215",
        "source_item_code": "JNT-PVC-010",
        "target_item_code": "JNT-PVC-010",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "88a221a1-088b-49ee-92cb-160ca61ef058",
        "legacy_item_code": "ITEM-0216",
        "source_item_code": "JNT-PVC-011",
        "target_item_code": "JNT-PVC-011",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "25a24773-4742-447f-9273-44eaca1d9ed9",
        "legacy_item_code": "ITEM-0217",
        "source_item_code": "JNT-PVC-012",
        "target_item_code": "JNT-PVC-012",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "176c9736-3a75-4baa-824f-14b403efee9f",
        "legacy_item_code": "ITEM-0218",
        "source_item_code": "RSR-PL0-001",
        "target_item_code": "RSR-PL0-001",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "388c5fcf-4468-4b9e-a3a1-bbfc703e74c3",
        "legacy_item_code": "ITEM-0219",
        "source_item_code": "RSR-PL0-002",
        "target_item_code": "RSR-PL0-002",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "25b3ba31-17f6-4cde-99a4-ea3bbf53e926",
        "legacy_item_code": "ITEM-0220",
        "source_item_code": "RSR-PL0-003",
        "target_item_code": "RSR-PL0-003",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "fc1e4839-f343-42b8-8d3d-a5be157439a7",
        "legacy_item_code": "ITEM-0221",
        "source_item_code": "RSR-PL0-004",
        "target_item_code": "RSR-PL0-004",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "e3182876-f800-4134-8932-354c3f6fb292",
        "legacy_item_code": "ITEM-0222",
        "source_item_code": "RSR-PL0-005",
        "target_item_code": "RSR-PL0-005",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "c56f56aa-8e14-4474-b23e-c067b2b502ab",
        "legacy_item_code": "ITEM-0223",
        "source_item_code": "RSR-PL0-006",
        "target_item_code": "RSR-PL0-006",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "fefd36eb-87b8-4345-8815-6b647c3aac92",
        "legacy_item_code": "ITEM-0224",
        "source_item_code": "RSR-PL0-007",
        "target_item_code": "RSR-PL0-007",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "366cd7e8-756a-4ade-9a52-7d64d1e4b7f7",
        "legacy_item_code": "ITEM-0225",
        "source_item_code": "RSR-PL0-008",
        "target_item_code": "RSR-PL0-008",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "384fef4a-db49-4fb0-939c-afcaa9a880d4",
        "legacy_item_code": "ITEM-0226",
        "source_item_code": "RSR-PL0-009",
        "target_item_code": "RSR-PL0-009",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "8910750c-b4ce-42b1-b586-e9d6f224c6d8",
        "legacy_item_code": "ITEM-0227",
        "source_item_code": "RSR-PL0-021",
        "target_item_code": "RSR-PL0-021",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "0ebcf671-2ee8-45dd-b2b0-a2ee2ad5827d",
        "legacy_item_code": "ITEM-0228",
        "source_item_code": "RSR-PL0-022",
        "target_item_code": "RSR-PL0-022",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "650cd5ec-c3d3-4413-8bd4-f71ec05b23f3",
        "legacy_item_code": "ITEM-0229",
        "source_item_code": "RSR-PL0-023",
        "target_item_code": "RSR-PL0-023",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "111eb158-1396-4fa0-8c4e-dfb8dd968975",
        "legacy_item_code": "ITEM-0230",
        "source_item_code": "RSR-PL0-024",
        "target_item_code": "RSR-PL0-024",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "4ede14c5-1542-4ac1-9dab-3504945ab4ba",
        "legacy_item_code": "ITEM-0231",
        "source_item_code": "RSR-PL0-025",
        "target_item_code": "RSR-PL0-025",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "833afd24-1279-4175-8644-06cdcede01ec",
        "legacy_item_code": "ITEM-0232",
        "source_item_code": "RSR-PL0-026",
        "target_item_code": "RSR-PL0-026",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "c4d0356c-712a-44f2-a6cc-529062d0d483",
        "legacy_item_code": "ITEM-0233",
        "source_item_code": "RSR-PL0-027",
        "target_item_code": "RSR-PL0-027",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "27d9d602-b83d-499a-a538-a15f1eaa3ce8",
        "legacy_item_code": "ITEM-0234",
        "source_item_code": "RSR-PL0-028",
        "target_item_code": "RSR-PL0-028",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "808ac4a4-7bc9-4217-809a-05471912f286",
        "legacy_item_code": "ITEM-0235",
        "source_item_code": "RSR-PL0-032",
        "target_item_code": "RSR-PL0-032",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "a62632fe-8c1b-4771-9770-3aab60b56b1f",
        "legacy_item_code": "ITEM-0236",
        "source_item_code": "RSR-PL0-033",
        "target_item_code": "RSR-PL0-033",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "8af352fc-0403-4f9d-9d3d-a45fb4c6055b",
        "legacy_item_code": "ITEM-0237",
        "source_item_code": "RSR-PL0-034",
        "target_item_code": "RSR-PL0-034",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "ce3a3605-e63c-4c67-8a89-be03c0d47ae7",
        "legacy_item_code": "ITEM-0238",
        "source_item_code": "RSR-PL0-035",
        "target_item_code": "RSR-PL0-035",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "95617295-0155-4966-9d47-8915d47f8522",
        "legacy_item_code": "ITEM-0239",
        "source_item_code": "RSR-PL0-036",
        "target_item_code": "RSR-PL0-036",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "018f0498-a8e1-41b1-93fb-f50ffb87f95f",
        "legacy_item_code": "ITEM-0240",
        "source_item_code": "RSR-PL0-037",
        "target_item_code": "RSR-PL0-037",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "3af61df0-3c34-45cd-b757-6ac5fe3b28d0",
        "legacy_item_code": "ITEM-0241",
        "source_item_code": "RSR-PL0-038",
        "target_item_code": "RSR-PL0-038",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "1469324d-358f-4760-9ef7-9b2c6515a7b9",
        "legacy_item_code": "ITEM-0242",
        "source_item_code": "RSR-PL0-039",
        "target_item_code": "RSR-PL0-039",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "e6f67ee5-8779-4045-8d32-5aff66fad3ec",
        "legacy_item_code": "ITEM-0243",
        "source_item_code": "RSR-WL0-001",
        "target_item_code": "RSR-WL0-001",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "95546e5c-9ceb-4ce9-a62b-dc4651952e75",
        "legacy_item_code": "ITEM-0244",
        "source_item_code": "RSR-WL0-002",
        "target_item_code": "RSR-WL0-002",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "cc6d5d4a-ba93-4184-b50a-6485e8bf8d4c",
        "legacy_item_code": "ITEM-0245",
        "source_item_code": "RSR-WL0-003",
        "target_item_code": "RSR-WL0-003",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "8c5db550-aa4a-4352-ab3c-edef9fafff65",
        "legacy_item_code": "ITEM-0246",
        "source_item_code": "RSR-WL0-004",
        "target_item_code": "RSR-WL0-004",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "5c78ceaa-47e5-4c4e-ae99-215e83e74ed9",
        "legacy_item_code": "ITEM-0247",
        "source_item_code": "RSR-WL0-005",
        "target_item_code": "RSR-WL0-005",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "dc859cc7-8abe-43b8-9a2b-13103d8b7207",
        "legacy_item_code": "ITEM-0248",
        "source_item_code": "RSR-WL0-006",
        "target_item_code": "RSR-WL0-006",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "d2e06d1f-fffb-4a34-9d67-5da8487bb815",
        "legacy_item_code": "ITEM-0249",
        "source_item_code": "RSR-WL0-007",
        "target_item_code": "RSR-WL0-007",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "2b297a88-5544-4e99-bac0-9c3795530bce",
        "legacy_item_code": "ITEM-0250",
        "source_item_code": "RSR-WL0-008",
        "target_item_code": "RSR-WL0-008",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "a283c48a-2922-4bde-bb0c-0929ed0d911f",
        "legacy_item_code": "ITEM-0251",
        "source_item_code": "RSR-WL0-009",
        "target_item_code": "RSR-WL0-009",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "5db89eea-9798-416f-8134-2f7989bc1122",
        "legacy_item_code": "ITEM-0252",
        "source_item_code": "RSR-WL0-010",
        "target_item_code": "RSR-WL0-010",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "4c040efd-c1f6-41e1-8c55-1752356ecdd5",
        "legacy_item_code": "ITEM-0253",
        "source_item_code": "RSR-WL0-011",
        "target_item_code": "RSR-WL0-011",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "WL0"
      },
      {
        "identity_id": "d8b0f3d5-8ca4-4530-ab78-9beb1158102d",
        "legacy_item_code": "ITEM-0254",
        "source_item_code": "RSR-CB0-001",
        "target_item_code": "RSR-CB0-001",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "CB0"
      },
      {
        "identity_id": "d6b9a79b-5950-4e91-ab8f-69394665636e",
        "legacy_item_code": "ITEM-0255",
        "source_item_code": "RSR-CB0-002",
        "target_item_code": "RSR-CB0-002",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "CB0"
      },
      {
        "identity_id": "198c3344-8dd4-4119-9b7a-cb9a83439099",
        "legacy_item_code": "ITEM-0256",
        "source_item_code": "RSR-CB0-003",
        "target_item_code": "RSR-CB0-003",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "CB0"
      },
      {
        "identity_id": "726fe6eb-b2bd-4200-b1e7-1bd4efa125f2",
        "legacy_item_code": "ITEM-0257",
        "source_item_code": "RSR-CB0-004",
        "target_item_code": "RSR-CB0-004",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "CB0"
      },
      {
        "identity_id": "890b1396-46ca-45e9-b403-af184b901785",
        "legacy_item_code": "ITEM-0258",
        "source_item_code": "RSR-TB0-001",
        "target_item_code": "RSR-TB0-001",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "TB0"
      },
      {
        "identity_id": "04275bce-c579-4b83-adc3-70410d165c78",
        "legacy_item_code": "ITEM-0259",
        "source_item_code": "RSR-TB0-002",
        "target_item_code": "RSR-TB0-002",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "TB0"
      },
      {
        "identity_id": "07cebb8a-ed50-4162-b787-a70dc1a1dd10",
        "legacy_item_code": "ITEM-0260",
        "source_item_code": "RSR-TB0-003",
        "target_item_code": "RSR-TB0-003",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "TB0"
      },
      {
        "identity_id": "305f1df1-1cb5-4934-a824-89d017169077",
        "legacy_item_code": "ITEM-0261",
        "source_item_code": "RSR-TB0-004",
        "target_item_code": "RSR-TB0-004",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "TB0"
      },
      {
        "identity_id": "185bc4f9-dff0-4677-8b97-825a84d6e0a4",
        "legacy_item_code": "ITEM-0262",
        "source_item_code": "RSR-TB0-005",
        "target_item_code": "RSR-TB0-005",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "TB0"
      },
      {
        "identity_id": "d17fdd40-2fec-45a9-801e-96120ac07740",
        "legacy_item_code": "ITEM-0263",
        "source_item_code": "RSR-TB0-006",
        "target_item_code": "RSR-TB0-006",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "TB0"
      },
      {
        "identity_id": "d77b0731-bbbb-4e0f-8594-1cf07f263f20",
        "legacy_item_code": "ITEM-0264",
        "source_item_code": "RSR-DT3-001",
        "target_item_code": "RSR-DT3-001",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "DT3"
      },
      {
        "identity_id": "bb409432-5f04-4856-a35b-ab883a8108eb",
        "legacy_item_code": "ITEM-0265",
        "source_item_code": "RSR-DT3-002",
        "target_item_code": "RSR-DT3-002",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "DT3"
      },
      {
        "identity_id": "b9123574-c5c5-4174-a4bb-ddef48616707",
        "legacy_item_code": "ITEM-0266",
        "source_item_code": "RSR-DT3-003",
        "target_item_code": "RSR-DT3-003",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "DT3"
      },
      {
        "identity_id": "5ca846db-94ad-4c8e-abf6-8490a4c80a18",
        "legacy_item_code": "ITEM-0267",
        "source_item_code": "RSR-DT3-004",
        "target_item_code": "RSR-DT3-004",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "DT3"
      },
      {
        "identity_id": "67ebcee4-f9fa-40f3-8fae-c6b8e46bf0d2",
        "legacy_item_code": "ITEM-0268",
        "source_item_code": "RSR-DT3-005",
        "target_item_code": "RSR-DT3-005",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "DT3"
      },
      {
        "identity_id": "b0508a2c-500c-48ce-a2a3-e22044b8722e",
        "legacy_item_code": "ITEM-0269",
        "source_item_code": "RSR-DT3-006",
        "target_item_code": "RSR-DT3-006",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "DT3"
      },
      {
        "identity_id": "7eef8e7e-574d-4fef-8ddb-f2debaf1d725",
        "legacy_item_code": "ITEM-0270",
        "source_item_code": "RSR-DT3-007",
        "target_item_code": "RSR-DT3-007",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "DT3"
      },
      {
        "identity_id": "c1b072af-4677-4eb5-b970-44adfd3e057b",
        "legacy_item_code": "ITEM-0271",
        "source_item_code": "RSR-SVC-001",
        "target_item_code": "RSR-SVC-001",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "SVC"
      },
      {
        "identity_id": "893cbd8e-e654-460e-904f-1836d077f857",
        "legacy_item_code": "ITEM-0272",
        "source_item_code": "RSR-SVC-002",
        "target_item_code": "RSR-SVC-002",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "SVC"
      },
      {
        "identity_id": "58092c45-9e10-4735-99ee-5583d890d937",
        "legacy_item_code": "ITEM-0273",
        "source_item_code": "RSR-SVC-003",
        "target_item_code": "RSR-SVC-003",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "SVC"
      },
      {
        "identity_id": "da07c7b5-eafa-4464-9791-f02d1875d5be",
        "legacy_item_code": "ITEM-0274",
        "source_item_code": "CHB-HH0-001",
        "target_item_code": "CHB-HH0-001",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "HH0"
      },
      {
        "identity_id": "9fb24e7b-c85b-4a43-9afc-0c8124c263f7",
        "legacy_item_code": "ITEM-0275",
        "source_item_code": "CHB-HH0-002",
        "target_item_code": "CHB-HH0-002",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "HH0"
      },
      {
        "identity_id": "55e22fb0-a979-4268-9cbe-dcf8fd5d6aca",
        "legacy_item_code": "ITEM-0276",
        "source_item_code": "CHB-PB0-001",
        "target_item_code": "CHB-PB0-001",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "442261fe-d179-4669-8e88-1bc0e0743fd8",
        "legacy_item_code": "ITEM-0277",
        "source_item_code": "CHB-PB0-002",
        "target_item_code": "CHB-PB0-002",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "1455487d-22bb-4bda-bdad-fc724c3f2bab",
        "legacy_item_code": "ITEM-0278",
        "source_item_code": "CHB-PB0-003",
        "target_item_code": "CHB-PB0-003",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "50798e93-c6db-4d25-8253-fa65964c95de",
        "legacy_item_code": "ITEM-0279",
        "source_item_code": "CHB-PB0-004",
        "target_item_code": "CHB-PB0-004",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c51ba750-051e-49b1-a551-9f70a56e5f17",
        "legacy_item_code": "ITEM-0280",
        "source_item_code": "CHB-PB0-005",
        "target_item_code": "CHB-PB0-005",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "cc9d0981-4079-44c0-aea9-8e2625df3788",
        "legacy_item_code": "ITEM-0281",
        "source_item_code": "CHB-PB0-006",
        "target_item_code": "CHB-PB0-006",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e13ec7fe-bea1-4a93-b684-7e0b4fec295c",
        "legacy_item_code": "ITEM-0282",
        "source_item_code": "CHB-PB0-007",
        "target_item_code": "CHB-PB0-007",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "eb839d54-1654-4e19-bcbf-2b81b167ddd6",
        "legacy_item_code": "ITEM-0283",
        "source_item_code": "CHB-PB0-008",
        "target_item_code": "CHB-PB0-008",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "6e0c525e-bf7d-4393-aee2-0eae8f921aef",
        "legacy_item_code": "ITEM-0284",
        "source_item_code": "CHB-PB0-009",
        "target_item_code": "CHB-PB0-009",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "3e9a2d3d-eac4-4768-b31d-4d814676d847",
        "legacy_item_code": "ITEM-0285",
        "source_item_code": "CHB-PB0-010",
        "target_item_code": "CHB-PB0-010",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "7c218133-65ba-4f70-8bfa-d2c5318fb9ed",
        "legacy_item_code": "ITEM-0286",
        "source_item_code": "CHB-PB0-011",
        "target_item_code": "CHB-PB0-011",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "cdf01707-2ec3-4211-b83f-5104139e429d",
        "legacy_item_code": "ITEM-0287",
        "source_item_code": "CHB-PB0-012",
        "target_item_code": "CHB-PB0-012",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "da12b6e2-d40b-4a31-808d-450a7cf96592",
        "legacy_item_code": "ITEM-0288",
        "source_item_code": "CHB-MH0-001",
        "target_item_code": "CHB-MH0-001",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "7d2cd1e4-56b4-46d9-b568-b9fbf7868ae5",
        "legacy_item_code": "ITEM-0289",
        "source_item_code": "CHB-MH0-002",
        "target_item_code": "CHB-MH0-002",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "54002941-0d11-4e50-ab4d-022d7ab8cf81",
        "legacy_item_code": "ITEM-0290",
        "source_item_code": "CHB-MH0-003",
        "target_item_code": "CHB-MH0-003",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "4d4898da-58b4-4b48-bcdd-148263d1aa83",
        "legacy_item_code": "ITEM-0291",
        "source_item_code": "CHB-MH0-004",
        "target_item_code": "CHB-MH0-004",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "370736f3-f4c8-44e5-b6c9-0760535cbab6",
        "legacy_item_code": "ITEM-0292",
        "source_item_code": "CHB-MH0-005",
        "target_item_code": "CHB-MH0-005",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "75aaa3d4-b70c-460f-9cba-05a87457d472",
        "legacy_item_code": "ITEM-0293",
        "source_item_code": "CHB-MH0-006",
        "target_item_code": "CHB-MH0-006",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "428bf42d-289a-426d-86d8-03d3d61a58e0",
        "legacy_item_code": "ITEM-0294",
        "source_item_code": "CHB-MH0-007",
        "target_item_code": "CHB-MH0-007",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "082aff59-7ebd-48a1-8e11-60978f6b6fe9",
        "legacy_item_code": "ITEM-0295",
        "source_item_code": "CHB-MH0-008",
        "target_item_code": "CHB-MH0-008",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "0abee461-9d0d-418a-a41e-3ef3b31bd07b",
        "legacy_item_code": "ITEM-0296",
        "source_item_code": "CHB-MH0-009",
        "target_item_code": "CHB-MH0-009",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "4ee7b0d3-3200-4c98-bc1d-23df7e04d26e",
        "legacy_item_code": "ITEM-0297",
        "source_item_code": "CHB-MH0-010",
        "target_item_code": "CHB-MH0-010",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "f0a51925-25f4-46ee-ad8a-f629a645219b",
        "legacy_item_code": "ITEM-0298",
        "source_item_code": "CHB-MH0-011",
        "target_item_code": "CHB-MH0-011",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "73640840-fe16-4593-8eb1-ba28da50c069",
        "legacy_item_code": "ITEM-0299",
        "source_item_code": "CHB-MH0-012",
        "target_item_code": "CHB-MH0-012",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "96b1b8d3-2f3d-46af-a37d-af1ed8236418",
        "legacy_item_code": "ITEM-0300",
        "source_item_code": "CHB-MH0-013",
        "target_item_code": "CHB-MH0-013",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "56173110-ab15-411b-a145-cc9d8a9238b9",
        "legacy_item_code": "ITEM-0301",
        "source_item_code": "CHB-MH0-014",
        "target_item_code": "CHB-MH0-014",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "a68e0979-124a-4af2-94fb-25fa79c9494d",
        "legacy_item_code": "ITEM-0302",
        "source_item_code": "CHB-MH0-015",
        "target_item_code": "CHB-MH0-015",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "7ab435b3-14f9-4735-82f5-66c6d3d36071",
        "legacy_item_code": "ITEM-0303",
        "source_item_code": "CHB-MH0-016",
        "target_item_code": "CHB-MH0-016",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "d80de403-a528-4c08-b03f-ea7905dbd885",
        "legacy_item_code": "ITEM-0304",
        "source_item_code": "CHB-MH0-017",
        "target_item_code": "CHB-MH0-017",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "98144ca0-67a2-4905-aacc-6895942f62ad",
        "legacy_item_code": "ITEM-0305",
        "source_item_code": "CHB-MH0-018",
        "target_item_code": "CHB-MH0-018",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "4ace7b76-c75b-4d37-bdb2-66617009c5f6",
        "legacy_item_code": "ITEM-0306",
        "source_item_code": "CHB-MH0-019",
        "target_item_code": "CHB-MH0-019",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "46b22986-d4c9-4f6d-95b0-f34a191ec53b",
        "legacy_item_code": "ITEM-0307",
        "source_item_code": "CHB-MH0-020",
        "target_item_code": "CHB-MH0-020",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "cc017186-2dd1-40ed-be83-2b734ac8fe58",
        "legacy_item_code": "ITEM-0308",
        "source_item_code": "CHB-MH0-021",
        "target_item_code": "CHB-MH0-021",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "cc17d0dc-f329-47ff-b219-6120881d0f2c",
        "legacy_item_code": "ITEM-0309",
        "source_item_code": "CHB-MH0-022",
        "target_item_code": "CHB-MH0-022",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "eebacb5b-2f73-4d7b-8a28-98786cafed73",
        "legacy_item_code": "ITEM-0310",
        "source_item_code": "CHB-MH0-023",
        "target_item_code": "CHB-MH0-023",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "218dd6d1-b089-4675-920b-4f4db5fcefcd",
        "legacy_item_code": "ITEM-0311",
        "source_item_code": "CHB-MH0-024",
        "target_item_code": "CHB-MH0-024",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "83b78420-bc51-4093-8507-6d09c6815b74",
        "legacy_item_code": "ITEM-0312",
        "source_item_code": "CHB-MH0-025",
        "target_item_code": "CHB-MH0-025",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "334ebb17-563a-4497-bbab-c2c320e9fac4",
        "legacy_item_code": "ITEM-0313",
        "source_item_code": "CHB-MH0-026",
        "target_item_code": "CHB-MH0-026",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "3a11fef6-14f5-48e4-b283-e6b5f97570b0",
        "legacy_item_code": "ITEM-0314",
        "source_item_code": "CHB-MH0-027",
        "target_item_code": "CHB-MH0-027",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "ce18f049-4bca-4cf3-867b-9be9dec6f219",
        "legacy_item_code": "ITEM-0315",
        "source_item_code": "CHB-MH0-028",
        "target_item_code": "CHB-MH0-028",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "c66a46bc-5b46-43be-96eb-1d8d602121c3",
        "legacy_item_code": "ITEM-0316",
        "source_item_code": "CHB-MH0-029",
        "target_item_code": "CHB-MH0-029",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "3bfd1930-d100-4fd3-aa99-a877364625b9",
        "legacy_item_code": "ITEM-0317",
        "source_item_code": "CHB-MH0-030",
        "target_item_code": "CHB-MH0-030",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "36a81631-2a2d-4f42-bc3a-6373ea29fb49",
        "legacy_item_code": "ITEM-0318",
        "source_item_code": "CHB-MH0-031",
        "target_item_code": "CHB-MH0-031",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "b90bd594-21b8-4e86-a2c5-0a5fe42e6e76",
        "legacy_item_code": "ITEM-0319",
        "source_item_code": "CHB-MH0-032",
        "target_item_code": "CHB-MH0-032",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "65d4b379-7c63-4ed4-8f85-cbef2ff989c7",
        "legacy_item_code": "ITEM-0320",
        "source_item_code": "CHB-MH0-033",
        "target_item_code": "CHB-MH0-033",
        "identity_outcome": "recode",
        "work_context_code": "CHB",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "677fc399-26a8-4d8f-a77c-c868091b1ffb",
        "legacy_item_code": "ITEM-0321",
        "source_item_code": "MOD-PB0-001",
        "target_item_code": "MOD-PB0-001",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "a634abea-d2c9-49e5-b4b7-76be2634829e",
        "legacy_item_code": "ITEM-0322",
        "source_item_code": "MOD-PB0-002",
        "target_item_code": "MOD-PB0-002",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "1c855c54-a1d8-4894-97d4-75c5fb998262",
        "legacy_item_code": "ITEM-0323",
        "source_item_code": "MOD-PB0-003",
        "target_item_code": "MOD-PB0-003",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c9bc7c8e-58bd-48da-a8a8-de3c5705b45a",
        "legacy_item_code": "ITEM-0324",
        "source_item_code": "MOD-PB0-004",
        "target_item_code": "MOD-PB0-004",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "6af4ae7f-3b46-4527-b3d1-9ffba825aca9",
        "legacy_item_code": "ITEM-0325",
        "source_item_code": "MOD-PB0-005",
        "target_item_code": "MOD-PB0-005",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "7a198063-e91c-41ff-a59a-d9e342710c9c",
        "legacy_item_code": "ITEM-0326",
        "source_item_code": "MOD-PB0-006",
        "target_item_code": "MOD-PB0-006",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "30fccbc5-0a7e-4576-906d-ec1915220823",
        "legacy_item_code": "ITEM-0327",
        "source_item_code": "MOD-MH0-001",
        "target_item_code": "MOD-MH0-001",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "6c45a20d-28da-4f8a-9262-872f64c6d99f",
        "legacy_item_code": "ITEM-0328",
        "source_item_code": "MOD-MH0-002",
        "target_item_code": "MOD-MH0-002",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "2f4fa6f4-9316-4c69-887b-cfa88884f406",
        "legacy_item_code": "ITEM-0329",
        "source_item_code": "MOD-MH0-003",
        "target_item_code": "MOD-MH0-003",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "aabfb0e7-7841-4b56-a309-4ac5b44ac4dc",
        "legacy_item_code": "ITEM-0330",
        "source_item_code": "MOD-MH0-004",
        "target_item_code": "MOD-MH0-004",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "6f762b63-4050-403f-b1a0-cb17b951bab3",
        "legacy_item_code": "ITEM-0331",
        "source_item_code": "MOD-MH0-005",
        "target_item_code": "MOD-MH0-005",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "520a4226-4c87-4ec5-b629-f69487c8f67e",
        "legacy_item_code": "ITEM-0332",
        "source_item_code": "MOD-MH0-006",
        "target_item_code": "MOD-MH0-006",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "bfaee5bc-6fad-4b15-8da4-2f1c60d5c0f5",
        "legacy_item_code": "ITEM-0333",
        "source_item_code": "MOD-MH0-007",
        "target_item_code": "MOD-MH0-007",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "956b2d1a-cac2-4ee7-98ed-3f7b8604af06",
        "legacy_item_code": "ITEM-0334",
        "source_item_code": "MOD-MH0-008",
        "target_item_code": "MOD-MH0-008",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "d260a391-59bb-4ced-9b18-cc08b7e57d0e",
        "legacy_item_code": "ITEM-0335",
        "source_item_code": "MOD-MH0-009",
        "target_item_code": "MOD-MH0-009",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "837e8326-ec36-412c-bafd-476db1ac60f1",
        "legacy_item_code": "ITEM-0336",
        "source_item_code": "MOD-FPB-001",
        "target_item_code": "MOD-FPB-001",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FPB"
      },
      {
        "identity_id": "bced674b-1a1c-4ef8-868d-4a06a1396c71",
        "legacy_item_code": "ITEM-0337",
        "source_item_code": "MOD-FPB-002",
        "target_item_code": "MOD-FPB-002",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FPB"
      },
      {
        "identity_id": "772e247e-808f-4236-b9eb-65df5e845e4a",
        "legacy_item_code": "ITEM-0338",
        "source_item_code": "MOD-FPB-003",
        "target_item_code": "MOD-FPB-003",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FPB"
      },
      {
        "identity_id": "be07f971-cc18-4240-933f-e7dee6fd605d",
        "legacy_item_code": "ITEM-0339",
        "source_item_code": "MOD-FPB-004",
        "target_item_code": "MOD-FPB-004",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FPB"
      },
      {
        "identity_id": "af6be34e-96f7-4305-b609-df3de9f270f5",
        "legacy_item_code": "ITEM-0340",
        "source_item_code": "MOD-FPB-005",
        "target_item_code": "MOD-FPB-005",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FPB"
      },
      {
        "identity_id": "56c20137-6f2a-4aa0-8d66-e1d941cf4a24",
        "legacy_item_code": "ITEM-0341",
        "source_item_code": "MOD-FPB-006",
        "target_item_code": "MOD-FPB-006",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FPB"
      },
      {
        "identity_id": "b20fbb6a-5147-42fe-9990-91635eb20afb",
        "legacy_item_code": "ITEM-0342",
        "source_item_code": "MOD-FPB-007",
        "target_item_code": "MOD-FPB-007",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FPB"
      },
      {
        "identity_id": "60ce8da4-1309-45f9-a61a-2a0fb6814329",
        "legacy_item_code": "ITEM-0343",
        "source_item_code": "MOD-FMH-001",
        "target_item_code": "MOD-FMH-001",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FMH"
      },
      {
        "identity_id": "cc699e4e-f1ac-481b-983d-7d94f84d25d5",
        "legacy_item_code": "ITEM-0344",
        "source_item_code": "MOD-FMH-002",
        "target_item_code": "MOD-FMH-002",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FMH"
      },
      {
        "identity_id": "d3a2d1ce-74b2-451e-b30e-2443db591997",
        "legacy_item_code": "ITEM-0345",
        "source_item_code": "MOD-FMH-003",
        "target_item_code": "MOD-FMH-003",
        "identity_outcome": "recode",
        "work_context_code": "MOD",
        "item_type_code": "FMH"
      },
      {
        "identity_id": "bfa4d65d-546c-409f-8d4c-a39bc4e77ead",
        "legacy_item_code": "ITEM-0346",
        "source_item_code": "WLL-PB0-001",
        "target_item_code": "WLL-PB0-001",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "559c7cec-5446-48f9-a712-e263e283bbe9",
        "legacy_item_code": "ITEM-0347",
        "source_item_code": "WLL-PB0-002",
        "target_item_code": "WLL-PB0-002",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "228683a6-ea6a-4f03-bdaa-5a09553341ce",
        "legacy_item_code": "ITEM-0348",
        "source_item_code": "WLL-PB0-003",
        "target_item_code": "WLL-PB0-003",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f5fc2cff-0ea8-4fe0-ab4c-1d515ed96f9b",
        "legacy_item_code": "ITEM-0349",
        "source_item_code": "WLL-PB0-004",
        "target_item_code": "WLL-PB0-004",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "79b79cf8-2807-4e89-ab37-00d44f0fbc1e",
        "legacy_item_code": "ITEM-0350",
        "source_item_code": "WLL-PB0-005",
        "target_item_code": "WLL-PB0-005",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "1b3c417a-0591-418b-a5e9-411b701f3fef",
        "legacy_item_code": "ITEM-0351",
        "source_item_code": "WLL-PB0-006",
        "target_item_code": "WLL-PB0-006",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "d2769080-1009-4a68-9878-b47f7d0d1320",
        "legacy_item_code": "ITEM-0352",
        "source_item_code": "WLL-PB0-007",
        "target_item_code": "WLL-PB0-007",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "3089a93e-7df3-4303-9471-830b81933ed7",
        "legacy_item_code": "ITEM-0353",
        "source_item_code": "WLL-PB0-008",
        "target_item_code": "WLL-PB0-008",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "9a39319c-0617-422a-989a-4505f12db224",
        "legacy_item_code": "ITEM-0354",
        "source_item_code": "WLL-PB0-009",
        "target_item_code": "WLL-PB0-009",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "8d6dafe9-0e89-41c8-a03f-1cc91709a3e3",
        "legacy_item_code": "ITEM-0355",
        "source_item_code": "WLL-PB0-010",
        "target_item_code": "WLL-PB0-010",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "81355e03-0ec5-4dd4-8334-a5b3a9c48958",
        "legacy_item_code": "ITEM-0356",
        "source_item_code": "WLL-PB0-011",
        "target_item_code": "WLL-PB0-011",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "833f7853-1501-4a5c-b16d-0332fe5fb8ba",
        "legacy_item_code": "ITEM-0357",
        "source_item_code": "WLL-PB0-012",
        "target_item_code": "WLL-PB0-012",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "03bca3d7-9cd0-4ac2-a32f-d4adbc725245",
        "legacy_item_code": "ITEM-0358",
        "source_item_code": "WLL-PB0-013",
        "target_item_code": "WLL-PB0-013",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "9618649f-ecba-49ac-9d1a-072cae29e93d",
        "legacy_item_code": "ITEM-0359",
        "source_item_code": "WLL-PB0-014",
        "target_item_code": "WLL-PB0-014",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "ab945193-cd78-4baa-9b08-0a849868f878",
        "legacy_item_code": "ITEM-0360",
        "source_item_code": "WLL-PB0-015",
        "target_item_code": "WLL-PB0-015",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "cb2946f0-5c17-4944-9845-37a9734dc27f",
        "legacy_item_code": "ITEM-0361",
        "source_item_code": "WLL-PB0-016",
        "target_item_code": "WLL-PB0-016",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "d4cedf00-76c1-44f9-a9b0-e8e0db71e454",
        "legacy_item_code": "ITEM-0362",
        "source_item_code": "WLL-PB0-017",
        "target_item_code": "WLL-PB0-017",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "7855f036-f9ed-48a2-84cc-705ba7d53122",
        "legacy_item_code": "ITEM-0363",
        "source_item_code": "WLL-PB0-018",
        "target_item_code": "WLL-PB0-018",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "a4fec202-30f5-450d-8066-e320315df8e2",
        "legacy_item_code": "ITEM-0364",
        "source_item_code": "WLL-PB0-019",
        "target_item_code": "WLL-PB0-019",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "55e1a90b-1500-4279-af69-0924170d24a4",
        "legacy_item_code": "ITEM-0365",
        "source_item_code": "WLL-PB0-020",
        "target_item_code": "WLL-PB0-020",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "7400a344-ea0f-41dc-bc93-5fdd47d1e8f3",
        "legacy_item_code": "ITEM-0366",
        "source_item_code": "WLL-PB0-021",
        "target_item_code": "WLL-PB0-021",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "832b41f3-40f6-4d1a-a784-c17873600ada",
        "legacy_item_code": "ITEM-0367",
        "source_item_code": "WLL-PB0-022",
        "target_item_code": "WLL-PB0-022",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "b0575578-2310-4414-88d4-22e378996e7f",
        "legacy_item_code": "ITEM-0368",
        "source_item_code": "WLL-PB0-023",
        "target_item_code": "WLL-PB0-023",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "7c333cb0-db37-4594-a6ee-32a3bbefa022",
        "legacy_item_code": "ITEM-0369",
        "source_item_code": "WLL-PB0-024",
        "target_item_code": "WLL-PB0-024",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e9908094-5e6a-485b-8bf8-e6b2091eb93c",
        "legacy_item_code": "ITEM-0370",
        "source_item_code": "WLL-PB0-025",
        "target_item_code": "WLL-PB0-025",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "3ba2d128-1ab3-401b-aaca-02b49be542b5",
        "legacy_item_code": "ITEM-0371",
        "source_item_code": "WLL-MH0-001",
        "target_item_code": "WLL-MH0-001",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "2e7eeb03-a056-4673-be13-002276dfedf9",
        "legacy_item_code": "ITEM-0372",
        "source_item_code": "WLL-MH0-002",
        "target_item_code": "WLL-MH0-002",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "51b0c6dd-ee0f-4fd3-aac3-1c41118e02a7",
        "legacy_item_code": "ITEM-0373",
        "source_item_code": "WLL-MH0-003",
        "target_item_code": "WLL-MH0-003",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "5fdb56e1-b85f-4dae-9e17-46df2c6a6bd7",
        "legacy_item_code": "ITEM-0374",
        "source_item_code": "WLL-MH0-004",
        "target_item_code": "WLL-MH0-004",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "a9eefbc4-9211-49f1-8375-b2c31cf4a617",
        "legacy_item_code": "ITEM-0375",
        "source_item_code": "WLL-MH0-005",
        "target_item_code": "WLL-MH0-005",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "702ffaae-f909-4f7d-be7d-05b8993bcd02",
        "legacy_item_code": "ITEM-0376",
        "source_item_code": "WLL-MH0-006",
        "target_item_code": "WLL-MH0-006",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "cf74531d-ea0f-40a2-99ab-04ac5d899604",
        "legacy_item_code": "ITEM-0377",
        "source_item_code": "WLL-MH0-007",
        "target_item_code": "WLL-MH0-007",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "716785bc-bc3a-4941-b028-0fa91516595b",
        "legacy_item_code": "ITEM-0378",
        "source_item_code": "WLL-MH0-008",
        "target_item_code": "WLL-MH0-008",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "9c51cfa7-ffb0-49e8-a43f-cdd268fb82cc",
        "legacy_item_code": "ITEM-0379",
        "source_item_code": "WLL-MH0-009",
        "target_item_code": "WLL-MH0-009",
        "identity_outcome": "recode",
        "work_context_code": "WLL",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "af036ee5-4edb-4774-8d1e-6aa8461e56b2",
        "legacy_item_code": "ITEM-0380",
        "source_item_code": "LVU-PB0-001",
        "target_item_code": "LVU-PB0-001",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "ef32a99c-beeb-4695-a595-8ef325068c42",
        "legacy_item_code": "ITEM-0381",
        "source_item_code": "LVU-PB0-006",
        "target_item_code": "LVU-PB0-006",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "086e15a0-a8cd-46c9-ae45-5b6bc3f49509",
        "legacy_item_code": "ITEM-0382",
        "source_item_code": "LVU-PB0-011",
        "target_item_code": "LVU-PB0-011",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "a3961541-230a-4cc1-87c8-e55596b31c8d",
        "legacy_item_code": "ITEM-0383",
        "source_item_code": "LVU-PB0-016",
        "target_item_code": "LVU-PB0-016",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "246c80d8-4f7b-4d4c-9d0e-6c79c751da6a",
        "legacy_item_code": "ITEM-0384",
        "source_item_code": "LVU-PB0-021",
        "target_item_code": "LVU-PB0-021",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f4072283-bb7f-4af1-b875-9fd02e0aa5be",
        "legacy_item_code": "ITEM-0385",
        "source_item_code": "LVU-PB0-026",
        "target_item_code": "LVU-PB0-026",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e96b82e4-afbd-420f-82c5-e507a53f4664",
        "legacy_item_code": "ITEM-0386",
        "source_item_code": "LVU-PB0-031",
        "target_item_code": "LVU-PB0-031",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "637a6db9-9460-4c86-a192-16f58c0db79f",
        "legacy_item_code": "ITEM-0387",
        "source_item_code": "LVU-PB0-036",
        "target_item_code": "LVU-PB0-036",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "079b5c3c-d419-44c2-8453-3da3c2c6c904",
        "legacy_item_code": "ITEM-0388",
        "source_item_code": "LVU-PB0-041",
        "target_item_code": "LVU-PB0-041",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f2cf28ab-4ebe-480d-872c-60655a3c111a",
        "legacy_item_code": "ITEM-0389",
        "source_item_code": "LVU-PB0-046",
        "target_item_code": "LVU-PB0-046",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "9a65e41a-f0e1-4813-aad2-4ef0714869e6",
        "legacy_item_code": "ITEM-0390",
        "source_item_code": "LVU-PB0-051",
        "target_item_code": "LVU-PB0-051",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "9e063fe6-af18-4a15-81ae-22197f0034e4",
        "legacy_item_code": "ITEM-0391",
        "source_item_code": "LVU-PB0-056",
        "target_item_code": "LVU-PB0-056",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "0565e9dd-c717-42e7-9eff-13789248be47",
        "legacy_item_code": "ITEM-0392",
        "source_item_code": "LVU-PB0-061",
        "target_item_code": "LVU-PB0-061",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "6bd8ffb9-9873-4180-9d2e-13fa163633e1",
        "legacy_item_code": "ITEM-0393",
        "source_item_code": "LVU-PB0-066",
        "target_item_code": "LVU-PB0-066",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "a5b0c3a8-0a5e-452b-922f-b981a41ab75c",
        "legacy_item_code": "ITEM-0394",
        "source_item_code": "LVU-PB0-071",
        "target_item_code": "LVU-PB0-071",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "58f9e2f3-5684-465a-98b4-d3a8ee8d4d59",
        "legacy_item_code": "ITEM-0395",
        "source_item_code": "LVU-PB0-076",
        "target_item_code": "LVU-PB0-076",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "3e52133f-3ad1-4abf-880d-b7bef55fd1ce",
        "legacy_item_code": "ITEM-0396",
        "source_item_code": "LVU-PB0-081",
        "target_item_code": "LVU-PB0-081",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "31654ea7-8855-4eb8-8676-ce9caaec6f30",
        "legacy_item_code": "ITEM-0397",
        "source_item_code": "LVU-PB0-086",
        "target_item_code": "LVU-PB0-086",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "ddf65611-a0cd-49a2-9972-f7744d177fbd",
        "legacy_item_code": "ITEM-0398",
        "source_item_code": "LVU-PB0-091",
        "target_item_code": "LVU-PB0-091",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "7925d2dc-9308-4310-888f-52f6c9bf0ca1",
        "legacy_item_code": "ITEM-0399",
        "source_item_code": "LVU-PB0-096",
        "target_item_code": "LVU-PB0-096",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c484bc1e-0ccd-4095-a930-603671415faf",
        "legacy_item_code": "ITEM-0400",
        "source_item_code": "LVU-PB0-101",
        "target_item_code": "LVU-PB0-101",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "14d53666-07a8-4c8d-80d4-8b34b5a3d3df",
        "legacy_item_code": "ITEM-0401",
        "source_item_code": "LVU-PB0-106",
        "target_item_code": "LVU-PB0-106",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "79ab0d3d-8cee-4e3e-9108-5496dd434379",
        "legacy_item_code": "ITEM-0402",
        "source_item_code": "LVU-PB0-111",
        "target_item_code": "LVU-PB0-111",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "0f4f4be0-06c0-4d74-b02d-324753a06e8e",
        "legacy_item_code": "ITEM-0403",
        "source_item_code": "LVU-PB0-116",
        "target_item_code": "LVU-PB0-116",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f8e7631d-2498-4c10-abc8-ecb673c79f22",
        "legacy_item_code": "ITEM-0404",
        "source_item_code": "LVU-MH0-001",
        "target_item_code": "LVU-MH0-001",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "59ccd09a-e25b-44b7-92f5-3bef24532769",
        "legacy_item_code": "ITEM-0405",
        "source_item_code": "LVU-MH0-008",
        "target_item_code": "LVU-MH0-008",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "2bf7fc44-65f2-4015-8986-54f75fa9a6ae",
        "legacy_item_code": "ITEM-0406",
        "source_item_code": "LVU-MH0-015",
        "target_item_code": "LVU-MH0-015",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "c2b0b4ec-c002-42c5-933a-e3b15269605a",
        "legacy_item_code": "ITEM-0407",
        "source_item_code": "LVU-MH0-022",
        "target_item_code": "LVU-MH0-022",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "29387d89-8859-4e18-8491-5652de990151",
        "legacy_item_code": "ITEM-0408",
        "source_item_code": "LVU-MH0-029",
        "target_item_code": "LVU-MH0-029",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "9f6f0bae-6677-4d1c-a2c8-0833c635f530",
        "legacy_item_code": "ITEM-0409",
        "source_item_code": "LVU-MH0-036",
        "target_item_code": "LVU-MH0-036",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "edc2c18e-364d-4772-b4b8-4da8fa5f9a3f",
        "legacy_item_code": "ITEM-0410",
        "source_item_code": "LVU-MH0-043",
        "target_item_code": "LVU-MH0-043",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "6bc46c37-25fa-4af4-9b0a-5e74ed16e38d",
        "legacy_item_code": "ITEM-0411",
        "source_item_code": "LVU-MH0-050",
        "target_item_code": "LVU-MH0-050",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "be025bdf-3f7b-49b1-a567-10dd3735b639",
        "legacy_item_code": "ITEM-0412",
        "source_item_code": "LVD-MH0-001",
        "target_item_code": "LVD-MH0-001",
        "identity_outcome": "recode",
        "work_context_code": "LVD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "17600bec-8679-4935-9851-1d58b354f376",
        "legacy_item_code": "ITEM-0413",
        "source_item_code": "LVD-MH0-002",
        "target_item_code": "LVD-MH0-002",
        "identity_outcome": "recode",
        "work_context_code": "LVD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "ffbcafbd-371d-4376-9320-9992808ad731",
        "legacy_item_code": "ITEM-0414",
        "source_item_code": "LVD-MH0-003",
        "target_item_code": "LVD-MH0-003",
        "identity_outcome": "recode",
        "work_context_code": "LVD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "0a4f34f3-b788-4f9f-94ce-dbfc18cb7011",
        "legacy_item_code": "ITEM-0415",
        "source_item_code": "LVD-MH0-004",
        "target_item_code": "LVD-MH0-004",
        "identity_outcome": "recode",
        "work_context_code": "LVD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "4b651c0a-4e6a-452e-922e-b4e5add6ee0a",
        "legacy_item_code": "ITEM-0416",
        "source_item_code": "LVD-MH0-005",
        "target_item_code": "LVD-MH0-005",
        "identity_outcome": "recode",
        "work_context_code": "LVD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "e0d6b0ff-4514-4e3c-a565-f9787cd9c885",
        "legacy_item_code": "ITEM-0417",
        "source_item_code": "LVD-MH0-006",
        "target_item_code": "LVD-MH0-006",
        "identity_outcome": "recode",
        "work_context_code": "LVD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "c73f9196-eff7-46b6-9d16-4ae7cd2c543b",
        "legacy_item_code": "ITEM-0418",
        "source_item_code": "LVD-MH0-007",
        "target_item_code": "LVD-MH0-007",
        "identity_outcome": "recode",
        "work_context_code": "LVD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "e4ce7dd1-c739-4419-af69-4ff6dc02c542",
        "legacy_item_code": "ITEM-0419",
        "source_item_code": "LVD-MH0-008",
        "target_item_code": "LVD-MH0-008",
        "identity_outcome": "recode",
        "work_context_code": "LVD",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "e9dcdf3a-2757-4e5f-aff5-bb93ed332d78",
        "legacy_item_code": "ITEM-0420",
        "source_item_code": "RPR-CUT-001",
        "target_item_code": "RPR-CUT-001",
        "identity_outcome": "recode",
        "work_context_code": "RPR",
        "item_type_code": "CUT"
      },
      {
        "identity_id": "2e8edc29-0e48-4825-b58d-cdfc0094a7b6",
        "legacy_item_code": "ITEM-0421",
        "source_item_code": "RPR-CUT-002",
        "target_item_code": "RPR-CUT-002",
        "identity_outcome": "recode",
        "work_context_code": "RPR",
        "item_type_code": "CUT"
      },
      {
        "identity_id": "1c5d6fc7-f963-4393-9698-623e45d0b32b",
        "legacy_item_code": "ITEM-0422",
        "source_item_code": "RPR-CUT-003",
        "target_item_code": "RPR-CUT-003",
        "identity_outcome": "recode",
        "work_context_code": "RPR",
        "item_type_code": "CUT"
      },
      {
        "identity_id": "f8af3bb1-806a-46c8-a61f-d0d0065a6aef",
        "legacy_item_code": "ITEM-0423",
        "source_item_code": "RPR-CUT-004",
        "target_item_code": "RPR-CUT-004",
        "identity_outcome": "recode",
        "work_context_code": "RPR",
        "item_type_code": "CUT"
      },
      {
        "identity_id": "689a4b7a-39b1-4f63-ac7d-0017a8d77648",
        "legacy_item_code": "ITEM-0424",
        "source_item_code": "RPR-CUT-005",
        "target_item_code": "RPR-CUT-005",
        "identity_outcome": "recode",
        "work_context_code": "RPR",
        "item_type_code": "CUT"
      },
      {
        "identity_id": "955782cc-4f8f-4425-a629-ae4dfb7d21d0",
        "legacy_item_code": "ITEM-0425",
        "source_item_code": "RPR-BRK-001",
        "target_item_code": "RPR-BRK-001",
        "identity_outcome": "recode",
        "work_context_code": "RPR",
        "item_type_code": "BRK"
      },
      {
        "identity_id": "ece950a8-f7d5-4a3d-a6ca-51461bef9b91",
        "legacy_item_code": "ITEM-0426",
        "source_item_code": "RPR-BRK-002",
        "target_item_code": "RPR-BRK-002",
        "identity_outcome": "recode",
        "work_context_code": "RPR",
        "item_type_code": "BRK"
      },
      {
        "identity_id": "77dae4c9-b6f0-4ad5-987c-661e344c2871",
        "legacy_item_code": "ITEM-0427",
        "source_item_code": "RPR-REM-001",
        "target_item_code": "RPR-REM-001",
        "identity_outcome": "recode",
        "work_context_code": "RPR",
        "item_type_code": "REM"
      },
      {
        "identity_id": "10610fca-e8da-48b3-bbfc-08a84e0b2204",
        "legacy_item_code": "ITEM-0428",
        "source_item_code": "COR-PB0-001",
        "target_item_code": "COR-PB0-001",
        "identity_outcome": "recode",
        "work_context_code": "COR",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f2662c71-a6e5-407e-8456-8608e304b43b",
        "legacy_item_code": "ITEM-0429",
        "source_item_code": "COR-PB0-002",
        "target_item_code": "COR-PB0-002",
        "identity_outcome": "recode",
        "work_context_code": "COR",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "ceb49dea-167c-481d-a28c-6a8c9ce46633",
        "legacy_item_code": "ITEM-0430",
        "source_item_code": "COR-MH0-001",
        "target_item_code": "COR-MH0-001",
        "identity_outcome": "recode",
        "work_context_code": "COR",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "1e60425d-d3d0-4510-b7f1-9075fb3ff352",
        "legacy_item_code": "ITEM-0431",
        "source_item_code": "COR-MH0-002",
        "target_item_code": "COR-MH0-002",
        "identity_outcome": "recode",
        "work_context_code": "COR",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "5266d626-db21-41bf-940e-07b06c194f25",
        "legacy_item_code": "ITEM-0432",
        "source_item_code": "PAD-PB0-001",
        "target_item_code": "PAD-PB0-001",
        "identity_outcome": "recode",
        "work_context_code": "PAD",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "70321afb-8df4-49f0-b0d3-11605058469d",
        "legacy_item_code": "ITEM-0433",
        "source_item_code": "PAD-PB0-002",
        "target_item_code": "PAD-PB0-002",
        "identity_outcome": "recode",
        "work_context_code": "PAD",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c23548e0-5167-44d3-9478-6bfcb06f4fe6",
        "legacy_item_code": "ITEM-0434",
        "source_item_code": "PAD-PB0-003",
        "target_item_code": "PAD-PB0-003",
        "identity_outcome": "recode",
        "work_context_code": "PAD",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "214f1a8d-64b1-4170-a714-f96b65757433",
        "legacy_item_code": "ITEM-0435",
        "source_item_code": "PAD-CAB-001",
        "target_item_code": "PAD-CAB-001",
        "identity_outcome": "recode",
        "work_context_code": "PAD",
        "item_type_code": "CAB"
      },
      {
        "identity_id": "bc39f9ca-7ce7-4fac-a67b-ca970dd40fc0",
        "legacy_item_code": "ITEM-0436",
        "source_item_code": "PAD-CAB-002",
        "target_item_code": "PAD-CAB-002",
        "identity_outcome": "recode",
        "work_context_code": "PAD",
        "item_type_code": "CAB"
      },
      {
        "identity_id": "d992a00d-f686-4f0c-9f49-d7984cb332eb",
        "legacy_item_code": "ITEM-0437",
        "source_item_code": "PAD-CAB-003",
        "target_item_code": "PAD-CAB-003",
        "identity_outcome": "recode",
        "work_context_code": "PAD",
        "item_type_code": "CAB"
      },
      {
        "identity_id": "c99843f4-da2f-45dc-a00c-5ac11cec3810",
        "legacy_item_code": "ITEM-0438",
        "source_item_code": "PAD-CAB-004",
        "target_item_code": "PAD-CAB-004",
        "identity_outcome": "recode",
        "work_context_code": "PAD",
        "item_type_code": "CAB"
      },
      {
        "identity_id": "ed082e66-f7fa-412b-b96e-6b0d585972f2",
        "legacy_item_code": "ITEM-0439",
        "source_item_code": "PAD-CAB-005",
        "target_item_code": "PAD-CAB-005",
        "identity_outcome": "recode",
        "work_context_code": "PAD",
        "item_type_code": "CAB"
      },
      {
        "identity_id": "42bec5cf-d90c-4aba-bba2-89b2d01fbcd5",
        "legacy_item_code": "ITEM-0440",
        "source_item_code": "PAD-CAB-006",
        "target_item_code": "PAD-CAB-006",
        "identity_outcome": "recode",
        "work_context_code": "PAD",
        "item_type_code": "CAB"
      },
      {
        "identity_id": "a2de1765-f1b9-4efe-a4ca-7093765b64be",
        "legacy_item_code": "ITEM-0441",
        "source_item_code": "POL-RCC-001",
        "target_item_code": "POL-RCC-001",
        "identity_outcome": "recode",
        "work_context_code": "POL",
        "item_type_code": "RCC"
      },
      {
        "identity_id": "d692ba49-df24-416b-8989-8b6aa8c13e60",
        "legacy_item_code": "ITEM-0442",
        "source_item_code": "POL-RCC-002",
        "target_item_code": "POL-RCC-002",
        "identity_outcome": "recode",
        "work_context_code": "POL",
        "item_type_code": "RCC"
      },
      {
        "identity_id": "b9e7e1bf-3a62-4233-b7f4-cb68b628b24d",
        "legacy_item_code": "ITEM-0443",
        "source_item_code": "POL-RCC-003",
        "target_item_code": "POL-RCC-003",
        "identity_outcome": "recode",
        "work_context_code": "POL",
        "item_type_code": "RCC"
      },
      {
        "identity_id": "d589fc7e-74f6-47c7-afd0-c846e1d42325",
        "legacy_item_code": "ITEM-0444",
        "source_item_code": "POL-STL-001",
        "target_item_code": "POL-STL-001",
        "identity_outcome": "recode",
        "work_context_code": "POL",
        "item_type_code": "STL"
      },
      {
        "identity_id": "ef1228a1-19b7-4152-98eb-511936a35e33",
        "legacy_item_code": "ITEM-0445",
        "source_item_code": "POL-STL-002",
        "target_item_code": "POL-STL-002",
        "identity_outcome": "recode",
        "work_context_code": "POL",
        "item_type_code": "STL"
      },
      {
        "identity_id": "1c10a6b3-1b48-404d-b8f3-62081464c550",
        "legacy_item_code": "ITEM-0446",
        "source_item_code": "POL-STL-003",
        "target_item_code": "POL-STL-003",
        "identity_outcome": "recode",
        "work_context_code": "POL",
        "item_type_code": "STL"
      },
      {
        "identity_id": "63e9b96c-31da-421e-91e5-ffb69ef45156",
        "legacy_item_code": "ITEM-0447",
        "source_item_code": "POL-STL-004",
        "target_item_code": "POL-STL-004",
        "identity_outcome": "recode",
        "work_context_code": "POL",
        "item_type_code": "STL"
      },
      {
        "identity_id": "ab82d307-b5b9-4ae7-95dc-17f52861f203",
        "legacy_item_code": "ITEM-0448",
        "source_item_code": "POL-STL-005",
        "target_item_code": "POL-STL-005",
        "identity_outcome": "recode",
        "work_context_code": "POL",
        "item_type_code": "STL"
      },
      {
        "identity_id": "76c7a958-3e4f-4377-b4bf-d4e20a126995",
        "legacy_item_code": "ITEM-0449",
        "source_item_code": "PIL-STD-001",
        "target_item_code": "PIL-STD-001",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "d5bdd67d-3b33-434d-8429-c3d536967ced",
        "legacy_item_code": "ITEM-0450",
        "source_item_code": "PIL-STD-002",
        "target_item_code": "PIL-STD-002",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "dd9a2d09-853e-4580-a472-7e7cea86d9f9",
        "legacy_item_code": "ITEM-0451",
        "source_item_code": "PIL-STD-003",
        "target_item_code": "PIL-STD-003",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "66ac9dd6-2ea3-46ad-8ee6-0c14ec752c90",
        "legacy_item_code": "ITEM-0452",
        "source_item_code": "PIL-STD-004",
        "target_item_code": "PIL-STD-004",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "41a43f65-ab81-48d1-b58f-35866e441bf6",
        "legacy_item_code": "ITEM-0453",
        "source_item_code": "PIL-STD-005",
        "target_item_code": "PIL-STD-005",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "07fdccd5-1384-4825-8031-0fa70991c568",
        "legacy_item_code": "ITEM-0454",
        "source_item_code": "PIL-STD-006",
        "target_item_code": "PIL-STD-006",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "d92f966c-513e-4589-b01b-f73cea98438a",
        "legacy_item_code": "ITEM-0455",
        "source_item_code": "PIL-STD-007",
        "target_item_code": "PIL-STD-007",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "5272c4fe-20d1-43ce-9488-6beaf9873c6c",
        "legacy_item_code": "ITEM-0456",
        "source_item_code": "PIL-STD-008",
        "target_item_code": "PIL-STD-008",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "382cdb09-5def-403d-87ee-215f497e527b",
        "legacy_item_code": "ITEM-0457",
        "source_item_code": "PIL-STD-009",
        "target_item_code": "PIL-STD-009",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "f94e153a-7afb-4e92-b32b-64340e2ab42d",
        "legacy_item_code": "ITEM-0458",
        "source_item_code": "PIL-STD-010",
        "target_item_code": "PIL-STD-010",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "c8986fed-9ff9-451b-8c2b-3b7de462a1e3",
        "legacy_item_code": "ITEM-0459",
        "source_item_code": "PIL-STD-011",
        "target_item_code": "PIL-STD-011",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "c6c4131e-bf7c-4067-bdf9-fea2bf2c875c",
        "legacy_item_code": "ITEM-0460",
        "source_item_code": "PIL-STD-012",
        "target_item_code": "PIL-STD-012",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "2ccb5619-4065-45b2-9bd0-86c17c031b7f",
        "legacy_item_code": "ITEM-0461",
        "source_item_code": "PIL-STD-013",
        "target_item_code": "PIL-STD-013",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "25db6bc2-631b-45e8-880d-dbafd5b62d27",
        "legacy_item_code": "ITEM-0462",
        "source_item_code": "PIL-STD-014",
        "target_item_code": "PIL-STD-014",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "2370bb46-f38f-4cce-938d-4a11f0169329",
        "legacy_item_code": "ITEM-0463",
        "source_item_code": "PIL-STD-015",
        "target_item_code": "PIL-STD-015",
        "identity_outcome": "recode",
        "work_context_code": "PIL",
        "item_type_code": "STD"
      },
      {
        "identity_id": "9296f675-075f-490f-ad44-836fb21b1f2d",
        "legacy_item_code": "ITEM-0464",
        "source_item_code": "PCD-STD-001",
        "target_item_code": "PCD-STD-001",
        "identity_outcome": "recode",
        "work_context_code": "PCD",
        "item_type_code": "STD"
      },
      {
        "identity_id": "287a0f6c-802c-4949-a702-e7571d9e0dc5",
        "legacy_item_code": "ITEM-0465",
        "source_item_code": "PLM-STD-001",
        "target_item_code": "PLM-STD-001",
        "identity_outcome": "recode",
        "work_context_code": "PLM",
        "item_type_code": "STD"
      },
      {
        "identity_id": "e5f0b890-e914-41c9-b6cb-b2af5dc968c7",
        "legacy_item_code": "ITEM-0466",
        "source_item_code": "SUP-142-001",
        "target_item_code": "SUP-142-001",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "142"
      },
      {
        "identity_id": "d92a0233-6625-4b29-af4c-962a7c80b37f",
        "legacy_item_code": "ITEM-0467",
        "source_item_code": "SUP-142-002",
        "target_item_code": "SUP-142-002",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "142"
      },
      {
        "identity_id": "0880a500-1a53-488e-aaf7-8277b246435b",
        "legacy_item_code": "ITEM-0468",
        "source_item_code": "SUP-142-003",
        "target_item_code": "SUP-142-003",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "142"
      },
      {
        "identity_id": "660900de-4a1f-4dad-b754-2f9e5ba34b28",
        "legacy_item_code": "ITEM-0469",
        "source_item_code": "SUP-142-004",
        "target_item_code": "SUP-142-004",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "142"
      },
      {
        "identity_id": "12293f45-a8de-4a08-a60b-396601669a62",
        "legacy_item_code": "ITEM-0470",
        "source_item_code": "SUP-142-005",
        "target_item_code": "SUP-142-005",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "142"
      },
      {
        "identity_id": "ccec09af-1fd8-4b83-aae1-6bb338e9ad68",
        "legacy_item_code": "ITEM-0471",
        "source_item_code": "SUP-142-006",
        "target_item_code": "SUP-142-006",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "142"
      },
      {
        "identity_id": "38ee57dc-0a70-40f5-9b8b-18bee3309434",
        "legacy_item_code": "ITEM-0472",
        "source_item_code": "SUP-154-001",
        "target_item_code": "SUP-154-001",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "154"
      },
      {
        "identity_id": "9aa6570f-2364-43df-89c6-6eae381327e6",
        "legacy_item_code": "ITEM-0473",
        "source_item_code": "SUP-154-002",
        "target_item_code": "SUP-154-002",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "154"
      },
      {
        "identity_id": "61b2cdf7-a31f-4d76-b837-f8fd1121bb18",
        "legacy_item_code": "ITEM-0474",
        "source_item_code": "SUP-154-003",
        "target_item_code": "SUP-154-003",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "154"
      },
      {
        "identity_id": "723b1595-a77a-4ce2-b86e-2ca32ef69f79",
        "legacy_item_code": "ITEM-0475",
        "source_item_code": "SUP-154-004",
        "target_item_code": "SUP-154-004",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "154"
      },
      {
        "identity_id": "603a2b28-573a-45bb-804a-bdc5f7919d4e",
        "legacy_item_code": "ITEM-0476",
        "source_item_code": "SUP-154-005",
        "target_item_code": "SUP-154-005",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "154"
      },
      {
        "identity_id": "fc01eb5e-14ee-4594-bd41-425ecc2ff7a7",
        "legacy_item_code": "ITEM-0477",
        "source_item_code": "SUP-154-006",
        "target_item_code": "SUP-154-006",
        "identity_outcome": "recode",
        "work_context_code": "SUP",
        "item_type_code": "154"
      },
      {
        "identity_id": "a38a5a15-33ed-4ba4-9c83-d9103b05dcb3",
        "legacy_item_code": "ITEM-0478",
        "source_item_code": "DRN-STD-001",
        "target_item_code": "DRN-STD-001",
        "identity_outcome": "recode",
        "work_context_code": "DRN",
        "item_type_code": "STD"
      },
      {
        "identity_id": "ec79f469-ed24-4b3c-89ec-9edc9ccba549",
        "legacy_item_code": "ITEM-0479",
        "source_item_code": "DRN-STD-002",
        "target_item_code": "DRN-STD-002",
        "identity_outcome": "recode",
        "work_context_code": "DRN",
        "item_type_code": "STD"
      },
      {
        "identity_id": "aa6eb882-153f-4d71-a635-cb0c27dfccb7",
        "legacy_item_code": "ITEM-0480",
        "source_item_code": "DRN-STD-003",
        "target_item_code": "DRN-STD-003",
        "identity_outcome": "recode",
        "work_context_code": "DRN",
        "item_type_code": "STD"
      },
      {
        "identity_id": "6a544826-68a4-450a-93a8-ad94aeca5c23",
        "legacy_item_code": "ITEM-0481",
        "source_item_code": "FTW-BLK-001",
        "target_item_code": "FTW-BLK-001",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "BLK"
      },
      {
        "identity_id": "229bbd2f-fe90-420d-a1b5-235d2fb00eca",
        "legacy_item_code": "ITEM-0482",
        "source_item_code": "FTW-BLK-002",
        "target_item_code": "FTW-BLK-002",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "BLK"
      },
      {
        "identity_id": "272fdba1-fe39-4cfd-8afa-fd1ddce57300",
        "legacy_item_code": "ITEM-0483",
        "source_item_code": "FTW-SLB-001",
        "target_item_code": "FTW-SLB-001",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "SLB"
      },
      {
        "identity_id": "de968120-ff2d-4142-aff0-0f7b56d9dc79",
        "legacy_item_code": "ITEM-0484",
        "source_item_code": "FTW-SLB-002",
        "target_item_code": "FTW-SLB-002",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "SLB"
      },
      {
        "identity_id": "d171aecc-ec64-472e-a491-f6f74ec84e60",
        "legacy_item_code": "ITEM-0485",
        "source_item_code": "FTW-SLB-003",
        "target_item_code": "FTW-SLB-003",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "SLB"
      },
      {
        "identity_id": "1988bdcf-31aa-46e6-8ab4-0919accbae23",
        "legacy_item_code": "ITEM-0486",
        "source_item_code": "FTW-SLB-004",
        "target_item_code": "FTW-SLB-004",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "SLB"
      },
      {
        "identity_id": "b024b6c5-a6dd-4f8b-ab59-083fdd196c40",
        "legacy_item_code": "ITEM-0487",
        "source_item_code": "FTW-SLB-005",
        "target_item_code": "FTW-SLB-005",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "SLB"
      },
      {
        "identity_id": "ff5a43ab-8758-45b3-8ca6-82fc832bf82e",
        "legacy_item_code": "ITEM-0488",
        "source_item_code": "FTW-SLB-006",
        "target_item_code": "FTW-SLB-006",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "SLB"
      },
      {
        "identity_id": "2213c1a6-d7d1-4989-b028-3dc12c01ca76",
        "legacy_item_code": "ITEM-0489",
        "source_item_code": "FTW-BLK-003",
        "target_item_code": "FTW-BLK-003",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "BLK"
      },
      {
        "identity_id": "bd2e9885-550b-4b54-9b33-bf8ce95c6680",
        "legacy_item_code": "ITEM-0490",
        "source_item_code": "FTW-CON-001",
        "target_item_code": "FTW-CON-001",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "CON"
      },
      {
        "identity_id": "11eefbcb-16e2-4758-b22d-ee6081a4ca9e",
        "legacy_item_code": "ITEM-0491",
        "source_item_code": "FTW-CON-002",
        "target_item_code": "FTW-CON-002",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "CON"
      },
      {
        "identity_id": "c143c313-bc00-4126-ba8a-2b4ec05f76b0",
        "legacy_item_code": "ITEM-0492",
        "source_item_code": "FTW-SLB-007",
        "target_item_code": "FTW-SLB-007",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "SLB"
      },
      {
        "identity_id": "58aeff45-e6f8-46c7-9464-179d19da8412",
        "legacy_item_code": "ITEM-0493",
        "source_item_code": "FTW-ASP-001",
        "target_item_code": "FTW-ASP-001",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "ASP"
      },
      {
        "identity_id": "41430c97-33e2-47b1-ba19-bf0b852d5dba",
        "legacy_item_code": "ITEM-0494",
        "source_item_code": "FTW-CUR-001",
        "target_item_code": "FTW-CUR-001",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "CUR"
      },
      {
        "identity_id": "b8fcf4ca-065d-49a2-a6e8-a8b2b9bac4db",
        "legacy_item_code": "ITEM-0495",
        "source_item_code": "FTW-CUR-002",
        "target_item_code": "FTW-CUR-002",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "CUR"
      },
      {
        "identity_id": "028f0b43-e533-466b-b416-46f8605a7880",
        "legacy_item_code": "ITEM-0496",
        "source_item_code": "FTW-CUR-003",
        "target_item_code": "FTW-CUR-003",
        "identity_outcome": "recode",
        "work_context_code": "FTW",
        "item_type_code": "CUR"
      },
      {
        "identity_id": "e84d4b09-394f-48b0-917c-b1da36c2d1f5",
        "legacy_item_code": "ITEM-0497",
        "source_item_code": "RDW-RC0-001",
        "target_item_code": "RDW-RC0-001",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "f353f6a6-1cab-4a2d-be32-4c4205efd47b",
        "legacy_item_code": "ITEM-0498",
        "source_item_code": "RDW-RC0-002",
        "target_item_code": "RDW-RC0-002",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "0fadcaf0-edab-4005-b7c1-e6fc88c12ad1",
        "legacy_item_code": "ITEM-0499",
        "source_item_code": "RDW-RC0-003",
        "target_item_code": "RDW-RC0-003",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "7c67dd85-587b-4951-bf36-88978de28255",
        "legacy_item_code": "ITEM-0500",
        "source_item_code": "RDW-RC0-004",
        "target_item_code": "RDW-RC0-004",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "3b25d767-b3af-49ed-9225-c0cc72c1d42f",
        "legacy_item_code": "ITEM-0501",
        "source_item_code": "RDW-RC0-005",
        "target_item_code": "RDW-RC0-005",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "f74cc582-be80-4405-abea-b41faf05e99c",
        "legacy_item_code": "ITEM-0502",
        "source_item_code": "RDW-RC0-006",
        "target_item_code": "RDW-RC0-006",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "9fca0ab6-13d8-473f-8af9-7a0d0c22d65d",
        "legacy_item_code": "ITEM-0503",
        "source_item_code": "RDW-RC0-007",
        "target_item_code": "RDW-RC0-007",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "61e60ee9-5220-4346-9c80-c79b82c52b3d",
        "legacy_item_code": "ITEM-0504",
        "source_item_code": "RDW-RC0-008",
        "target_item_code": "RDW-RC0-008",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "a6da0817-5752-48d2-97a6-464c13017745",
        "legacy_item_code": "ITEM-0505",
        "source_item_code": "RDW-RC0-009",
        "target_item_code": "RDW-RC0-009",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "66ae33b6-2d2a-4d8c-b486-a7e7697856b1",
        "legacy_item_code": "ITEM-0506",
        "source_item_code": "RDW-RC0-010",
        "target_item_code": "RDW-RC0-010",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "97736730-f83d-4443-9d48-abcc41781a9c",
        "legacy_item_code": "ITEM-0507",
        "source_item_code": "RDW-RC0-011",
        "target_item_code": "RDW-RC0-011",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "86b158df-406b-4be0-b256-70f766918205",
        "legacy_item_code": "ITEM-0508",
        "source_item_code": "RDW-RC0-012",
        "target_item_code": "RDW-RC0-012",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "RC0"
      },
      {
        "identity_id": "389a67f7-3943-43d5-a315-a7c9a3f8bfae",
        "legacy_item_code": "ITEM-0509",
        "source_item_code": "RDW-AC0-001",
        "target_item_code": "RDW-AC0-001",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "AC0"
      },
      {
        "identity_id": "6a64e528-26cc-40fd-ae49-d4d8d28bc051",
        "legacy_item_code": "ITEM-0510",
        "source_item_code": "RDW-AC0-002",
        "target_item_code": "RDW-AC0-002",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "AC0"
      },
      {
        "identity_id": "d4f236a9-72ac-4612-ba5f-1bcd3154bed2",
        "legacy_item_code": "ITEM-0511",
        "source_item_code": "RDW-AC0-003",
        "target_item_code": "RDW-AC0-003",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "AC0"
      },
      {
        "identity_id": "40740322-a0ed-4ecc-9a49-aedf7ada41f3",
        "legacy_item_code": "ITEM-0512",
        "source_item_code": "RDW-AC0-004",
        "target_item_code": "RDW-AC0-004",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "AC0"
      },
      {
        "identity_id": "3fa49edc-a287-474c-9a20-bcd021dc9c41",
        "legacy_item_code": "ITEM-0513",
        "source_item_code": "RDW-AC0-005",
        "target_item_code": "RDW-AC0-005",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "AC0"
      },
      {
        "identity_id": "4f559da9-6d51-4687-8a8e-25bc8610755a",
        "legacy_item_code": "ITEM-0514",
        "source_item_code": "RDW-AC0-006",
        "target_item_code": "RDW-AC0-006",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "AC0"
      },
      {
        "identity_id": "e4ac90c7-3d85-4b21-9943-35477a19bd9c",
        "legacy_item_code": "ITEM-0515",
        "source_item_code": "RDW-AC0-007",
        "target_item_code": "RDW-AC0-007",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "AC0"
      },
      {
        "identity_id": "67b65439-7dcd-40db-bc90-14623649e308",
        "legacy_item_code": "ITEM-0516",
        "source_item_code": "RDW-GRV-001",
        "target_item_code": "RDW-GRV-001",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "GRV"
      },
      {
        "identity_id": "5df7ee99-077a-45fc-949c-d0507c62d0e5",
        "legacy_item_code": "ITEM-0517",
        "source_item_code": "RDW-AC0-008",
        "target_item_code": "RDW-AC0-008",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "AC0"
      },
      {
        "identity_id": "149f1fd4-f555-4ada-b166-542d54aa9d1b",
        "legacy_item_code": "ITEM-0518",
        "source_item_code": "RDW-THM-001",
        "target_item_code": "RDW-THM-001",
        "identity_outcome": "recode",
        "work_context_code": "RDW",
        "item_type_code": "THM"
      },
      {
        "identity_id": "222cfe87-a07b-477e-aa32-e94f55f87b79",
        "legacy_item_code": "ITEM-0519",
        "source_item_code": "LVU-PB0-002",
        "target_item_code": "LVU-PB0-002",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "3bbe82df-20dd-4fd4-8934-26cbc02cb2b8",
        "legacy_item_code": "ITEM-0520",
        "source_item_code": "LVU-PB0-003",
        "target_item_code": "LVU-PB0-003",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e067b6c0-80dd-4f1e-a950-04e5991987bf",
        "legacy_item_code": "ITEM-0521",
        "source_item_code": "LVU-PB0-004",
        "target_item_code": "LVU-PB0-004",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "143324ac-cd75-4d88-b8a7-7903b8eb6c26",
        "legacy_item_code": "ITEM-0522",
        "source_item_code": "LVU-PB0-005",
        "target_item_code": "LVU-PB0-005",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "fdb5b760-f5b1-464c-b04b-7d45539a0b70",
        "legacy_item_code": "ITEM-0523",
        "source_item_code": "LVU-PB0-007",
        "target_item_code": "LVU-PB0-007",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e9b5092a-f803-4e2f-b641-d067b78f0afc",
        "legacy_item_code": "ITEM-0524",
        "source_item_code": "LVU-PB0-008",
        "target_item_code": "LVU-PB0-008",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "509bdcfa-f85c-46ab-9800-a08664135932",
        "legacy_item_code": "ITEM-0525",
        "source_item_code": "LVU-PB0-009",
        "target_item_code": "LVU-PB0-009",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "3d40d332-005e-46aa-97fc-6374c69e9ad8",
        "legacy_item_code": "ITEM-0526",
        "source_item_code": "LVU-PB0-010",
        "target_item_code": "LVU-PB0-010",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f88189e8-bfba-40e6-a354-a9a5eed97105",
        "legacy_item_code": "ITEM-0527",
        "source_item_code": "LVU-PB0-012",
        "target_item_code": "LVU-PB0-012",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "0c5abd90-7065-4e0c-96f9-1f1537293bd6",
        "legacy_item_code": "ITEM-0528",
        "source_item_code": "LVU-PB0-013",
        "target_item_code": "LVU-PB0-013",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "d06d7861-6221-48c2-8178-667821b1eb88",
        "legacy_item_code": "ITEM-0529",
        "source_item_code": "LVU-PB0-014",
        "target_item_code": "LVU-PB0-014",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "97668f4e-03fa-4b05-b68e-11132548f3c1",
        "legacy_item_code": "ITEM-0530",
        "source_item_code": "LVU-PB0-015",
        "target_item_code": "LVU-PB0-015",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "ea0c14ea-2538-40d4-87c6-f1d9cf234d58",
        "legacy_item_code": "ITEM-0531",
        "source_item_code": "LVU-PB0-017",
        "target_item_code": "LVU-PB0-017",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f6693256-44df-44fe-8539-1b83d6ec4a20",
        "legacy_item_code": "ITEM-0532",
        "source_item_code": "LVU-PB0-018",
        "target_item_code": "LVU-PB0-018",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "38d7d471-f3f4-4b78-9d61-dc3be3a3b11b",
        "legacy_item_code": "ITEM-0533",
        "source_item_code": "LVU-PB0-019",
        "target_item_code": "LVU-PB0-019",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "a071c149-e39e-4d7d-a895-d664e34f8a4c",
        "legacy_item_code": "ITEM-0534",
        "source_item_code": "LVU-PB0-020",
        "target_item_code": "LVU-PB0-020",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c58b254e-901c-48a3-9a24-775bfec85b42",
        "legacy_item_code": "ITEM-0535",
        "source_item_code": "LVU-PB0-022",
        "target_item_code": "LVU-PB0-022",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "ed848ad9-ecea-439f-8615-efcf81671375",
        "legacy_item_code": "ITEM-0536",
        "source_item_code": "LVU-PB0-023",
        "target_item_code": "LVU-PB0-023",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "5b1b2364-209d-4009-8dd0-2073c641ee28",
        "legacy_item_code": "ITEM-0537",
        "source_item_code": "LVU-PB0-024",
        "target_item_code": "LVU-PB0-024",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "d5b14041-0fb5-4a7e-ad47-ffe88662ba0c",
        "legacy_item_code": "ITEM-0538",
        "source_item_code": "LVU-PB0-025",
        "target_item_code": "LVU-PB0-025",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c577f71a-9ad2-496b-bdff-40600d5e5a37",
        "legacy_item_code": "ITEM-0539",
        "source_item_code": "LVU-PB0-027",
        "target_item_code": "LVU-PB0-027",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "8e8e1186-21b4-4a33-9828-40aa3c0bf2fb",
        "legacy_item_code": "ITEM-0540",
        "source_item_code": "LVU-PB0-028",
        "target_item_code": "LVU-PB0-028",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "5e0b1852-9265-46b5-892d-be1c3ce2c2bb",
        "legacy_item_code": "ITEM-0541",
        "source_item_code": "LVU-PB0-029",
        "target_item_code": "LVU-PB0-029",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c65dcc98-30b1-4ec9-af68-ffd257fa2ad1",
        "legacy_item_code": "ITEM-0542",
        "source_item_code": "LVU-PB0-030",
        "target_item_code": "LVU-PB0-030",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "5245dc09-2bb1-47a0-8e64-358211de6455",
        "legacy_item_code": "ITEM-0543",
        "source_item_code": "LVU-PB0-032",
        "target_item_code": "LVU-PB0-032",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "170d9c8b-3858-42e4-b9b3-70e57d089672",
        "legacy_item_code": "ITEM-0544",
        "source_item_code": "LVU-PB0-033",
        "target_item_code": "LVU-PB0-033",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "cd7873ea-ef40-4e82-a6fc-4fba07421fb3",
        "legacy_item_code": "ITEM-0545",
        "source_item_code": "LVU-PB0-034",
        "target_item_code": "LVU-PB0-034",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "8b78da75-077c-4f90-be92-d333e666ae42",
        "legacy_item_code": "ITEM-0546",
        "source_item_code": "LVU-PB0-035",
        "target_item_code": "LVU-PB0-035",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "622e5ab5-6de2-4509-b47d-f6afd9fb9ea1",
        "legacy_item_code": "ITEM-0547",
        "source_item_code": "LVU-PB0-037",
        "target_item_code": "LVU-PB0-037",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "de1c62fd-1341-42eb-b11a-565374916675",
        "legacy_item_code": "ITEM-0548",
        "source_item_code": "LVU-PB0-038",
        "target_item_code": "LVU-PB0-038",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c9cfc098-7201-4157-963b-b7f3af6dedaf",
        "legacy_item_code": "ITEM-0549",
        "source_item_code": "LVU-PB0-039",
        "target_item_code": "LVU-PB0-039",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "1bcd1e9b-537d-4065-b663-c813fcb3ca44",
        "legacy_item_code": "ITEM-0550",
        "source_item_code": "LVU-PB0-040",
        "target_item_code": "LVU-PB0-040",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "d73b1617-9183-4c80-b83d-e8529d7b0668",
        "legacy_item_code": "ITEM-0551",
        "source_item_code": "LVU-PB0-042",
        "target_item_code": "LVU-PB0-042",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "a6125688-b3ea-4274-b4f2-bfb8e6a59f20",
        "legacy_item_code": "ITEM-0552",
        "source_item_code": "LVU-PB0-043",
        "target_item_code": "LVU-PB0-043",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "5ce8f0ad-196e-412d-9d85-324b9abc7a0a",
        "legacy_item_code": "ITEM-0553",
        "source_item_code": "LVU-PB0-044",
        "target_item_code": "LVU-PB0-044",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e468242b-efef-4caa-a158-a52394e3ecad",
        "legacy_item_code": "ITEM-0554",
        "source_item_code": "LVU-PB0-045",
        "target_item_code": "LVU-PB0-045",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "942cdb49-5a66-459c-8601-a4d171cc6040",
        "legacy_item_code": "ITEM-0555",
        "source_item_code": "LVU-PB0-047",
        "target_item_code": "LVU-PB0-047",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "a3ae02e1-2ff5-4795-aa02-07c06b05e454",
        "legacy_item_code": "ITEM-0556",
        "source_item_code": "LVU-PB0-048",
        "target_item_code": "LVU-PB0-048",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "221f0b0d-a16e-470b-ac7e-984159a0ab1f",
        "legacy_item_code": "ITEM-0557",
        "source_item_code": "LVU-PB0-049",
        "target_item_code": "LVU-PB0-049",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "99ea468c-7abf-4a12-9cce-9a6c53869617",
        "legacy_item_code": "ITEM-0558",
        "source_item_code": "LVU-PB0-050",
        "target_item_code": "LVU-PB0-050",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "67f41bc0-7499-47d9-803a-77bdd85e83b3",
        "legacy_item_code": "ITEM-0559",
        "source_item_code": "LVU-PB0-052",
        "target_item_code": "LVU-PB0-052",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "58e310e0-152a-4788-b7cf-d8d9f749427b",
        "legacy_item_code": "ITEM-0560",
        "source_item_code": "LVU-PB0-053",
        "target_item_code": "LVU-PB0-053",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "9d514aa4-de13-42ae-8020-f17c5bac09b5",
        "legacy_item_code": "ITEM-0561",
        "source_item_code": "LVU-PB0-054",
        "target_item_code": "LVU-PB0-054",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "823ff831-cf52-4d41-8ba0-9d2a4696ebc4",
        "legacy_item_code": "ITEM-0562",
        "source_item_code": "LVU-PB0-055",
        "target_item_code": "LVU-PB0-055",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "9f6f75d2-2929-46fc-b538-8ee030a969f2",
        "legacy_item_code": "ITEM-0563",
        "source_item_code": "LVU-PB0-057",
        "target_item_code": "LVU-PB0-057",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "4e83f634-953d-4acf-8ed6-afe7d3aa2626",
        "legacy_item_code": "ITEM-0564",
        "source_item_code": "LVU-PB0-058",
        "target_item_code": "LVU-PB0-058",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "b4301cd8-f424-4fec-bc00-d14a3d5b4860",
        "legacy_item_code": "ITEM-0565",
        "source_item_code": "LVU-PB0-059",
        "target_item_code": "LVU-PB0-059",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e3ff76d2-3961-4753-b249-61a3af0044ff",
        "legacy_item_code": "ITEM-0566",
        "source_item_code": "LVU-PB0-060",
        "target_item_code": "LVU-PB0-060",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "48ee3528-3419-41cf-bbb7-0e4e6e68f3b1",
        "legacy_item_code": "ITEM-0567",
        "source_item_code": "LVU-PB0-062",
        "target_item_code": "LVU-PB0-062",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "858cdf21-1611-4f7a-b863-f8dd31b866fb",
        "legacy_item_code": "ITEM-0568",
        "source_item_code": "LVU-PB0-063",
        "target_item_code": "LVU-PB0-063",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "7c8530d3-ab91-4d61-89c7-6a6560e88cfb",
        "legacy_item_code": "ITEM-0569",
        "source_item_code": "LVU-PB0-064",
        "target_item_code": "LVU-PB0-064",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "50dc414b-abd5-4156-a1e0-da615841e097",
        "legacy_item_code": "ITEM-0570",
        "source_item_code": "LVU-PB0-065",
        "target_item_code": "LVU-PB0-065",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "cf0cbdf4-f742-4016-b3f4-b70e53203013",
        "legacy_item_code": "ITEM-0571",
        "source_item_code": "LVU-PB0-067",
        "target_item_code": "LVU-PB0-067",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "63f1a05c-e9dc-45e3-8294-8541342ddbf0",
        "legacy_item_code": "ITEM-0572",
        "source_item_code": "LVU-PB0-068",
        "target_item_code": "LVU-PB0-068",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "91e6c1c3-4d0e-403e-b37c-550a4e169c88",
        "legacy_item_code": "ITEM-0573",
        "source_item_code": "LVU-PB0-069",
        "target_item_code": "LVU-PB0-069",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "3707cafe-d52a-4eed-b59d-a249a5044231",
        "legacy_item_code": "ITEM-0574",
        "source_item_code": "LVU-PB0-070",
        "target_item_code": "LVU-PB0-070",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "4452e445-7f55-4c12-b191-3c14dbfa6bca",
        "legacy_item_code": "ITEM-0575",
        "source_item_code": "LVU-PB0-072",
        "target_item_code": "LVU-PB0-072",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "743c0310-69a1-46bb-bb68-04d322b300bd",
        "legacy_item_code": "ITEM-0576",
        "source_item_code": "LVU-PB0-073",
        "target_item_code": "LVU-PB0-073",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f49a758e-6e32-435f-a6be-c4dd035c09b0",
        "legacy_item_code": "ITEM-0577",
        "source_item_code": "LVU-PB0-074",
        "target_item_code": "LVU-PB0-074",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "22dc1163-9d9a-4746-aa37-b13b185c64e9",
        "legacy_item_code": "ITEM-0578",
        "source_item_code": "LVU-PB0-075",
        "target_item_code": "LVU-PB0-075",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "2e2d7bfb-b261-4cfd-b1d1-030470bbee11",
        "legacy_item_code": "ITEM-0579",
        "source_item_code": "LVU-PB0-077",
        "target_item_code": "LVU-PB0-077",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "0e348388-dcd2-488b-bd91-42807bd037d9",
        "legacy_item_code": "ITEM-0580",
        "source_item_code": "LVU-PB0-078",
        "target_item_code": "LVU-PB0-078",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "69d9f5b3-2ab0-4991-a0c2-6f7fe3879352",
        "legacy_item_code": "ITEM-0581",
        "source_item_code": "LVU-PB0-079",
        "target_item_code": "LVU-PB0-079",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "ad622fd5-9195-4f34-bc4a-f85c800d4188",
        "legacy_item_code": "ITEM-0582",
        "source_item_code": "LVU-PB0-080",
        "target_item_code": "LVU-PB0-080",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "077d5b67-b99c-41ac-a64e-861ee225f5ac",
        "legacy_item_code": "ITEM-0583",
        "source_item_code": "LVU-PB0-082",
        "target_item_code": "LVU-PB0-082",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "1be4c877-cb3f-4f7b-9448-0ab0c477d9d3",
        "legacy_item_code": "ITEM-0584",
        "source_item_code": "LVU-PB0-083",
        "target_item_code": "LVU-PB0-083",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "36b03b0f-68e9-48a2-8d11-3ea47d66efdb",
        "legacy_item_code": "ITEM-0585",
        "source_item_code": "LVU-PB0-084",
        "target_item_code": "LVU-PB0-084",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "016e03fa-df4c-40e4-9090-6a48c7d7375f",
        "legacy_item_code": "ITEM-0586",
        "source_item_code": "LVU-PB0-085",
        "target_item_code": "LVU-PB0-085",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e42fe570-4a47-491b-ae30-925d480770d5",
        "legacy_item_code": "ITEM-0587",
        "source_item_code": "LVU-PB0-087",
        "target_item_code": "LVU-PB0-087",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "de9fd7e4-f32f-42d5-b924-9b35c090f3e9",
        "legacy_item_code": "ITEM-0588",
        "source_item_code": "LVU-PB0-088",
        "target_item_code": "LVU-PB0-088",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f626ec3e-bd0e-4f70-88eb-03f844ca7229",
        "legacy_item_code": "ITEM-0589",
        "source_item_code": "LVU-PB0-089",
        "target_item_code": "LVU-PB0-089",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "bfdd031b-a901-4a0c-8bf2-f60b3c93fecb",
        "legacy_item_code": "ITEM-0590",
        "source_item_code": "LVU-PB0-090",
        "target_item_code": "LVU-PB0-090",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "204e464c-4710-4d1a-8532-db986662a538",
        "legacy_item_code": "ITEM-0591",
        "source_item_code": "LVU-PB0-092",
        "target_item_code": "LVU-PB0-092",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c9bda8c5-4bb5-4332-bb77-129ec5bcda3b",
        "legacy_item_code": "ITEM-0592",
        "source_item_code": "LVU-PB0-093",
        "target_item_code": "LVU-PB0-093",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e892ea15-40e2-405e-8043-096237585052",
        "legacy_item_code": "ITEM-0593",
        "source_item_code": "LVU-PB0-094",
        "target_item_code": "LVU-PB0-094",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "036e0d4c-9b35-406b-957e-80f8a726fdb4",
        "legacy_item_code": "ITEM-0594",
        "source_item_code": "LVU-PB0-095",
        "target_item_code": "LVU-PB0-095",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "97011453-4a49-4929-9a8d-31b2a4b99a88",
        "legacy_item_code": "ITEM-0595",
        "source_item_code": "LVU-PB0-097",
        "target_item_code": "LVU-PB0-097",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "aad48a1e-1e8b-4c39-8cbf-7849cdfbc9e9",
        "legacy_item_code": "ITEM-0596",
        "source_item_code": "LVU-PB0-098",
        "target_item_code": "LVU-PB0-098",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "6727f9b3-0abb-4152-bb09-25bbf88dee68",
        "legacy_item_code": "ITEM-0597",
        "source_item_code": "LVU-PB0-099",
        "target_item_code": "LVU-PB0-099",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "4b2707a1-12c5-4082-82a2-e5de48ed88dc",
        "legacy_item_code": "ITEM-0598",
        "source_item_code": "LVU-PB0-100",
        "target_item_code": "LVU-PB0-100",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "9f5d26bd-b23d-4838-9050-9276a1492615",
        "legacy_item_code": "ITEM-0599",
        "source_item_code": "LVU-PB0-102",
        "target_item_code": "LVU-PB0-102",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c371f70e-fb72-49ac-bf8d-44b7a8a19127",
        "legacy_item_code": "ITEM-0600",
        "source_item_code": "LVU-PB0-103",
        "target_item_code": "LVU-PB0-103",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "690e2d23-bfb6-47b4-b098-b0eb9dfdb86c",
        "legacy_item_code": "ITEM-0601",
        "source_item_code": "LVU-PB0-104",
        "target_item_code": "LVU-PB0-104",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f6092177-a448-444a-9530-1dbc5b2b70b9",
        "legacy_item_code": "ITEM-0602",
        "source_item_code": "LVU-PB0-105",
        "target_item_code": "LVU-PB0-105",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "40c1a2f3-dc5a-42d6-bd50-84e8d413d930",
        "legacy_item_code": "ITEM-0603",
        "source_item_code": "LVU-PB0-107",
        "target_item_code": "LVU-PB0-107",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "0c070f51-dd00-4422-88e5-3c2cfdbab370",
        "legacy_item_code": "ITEM-0604",
        "source_item_code": "LVU-PB0-108",
        "target_item_code": "LVU-PB0-108",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "2b436518-08f7-4912-9c2e-1ccce41ca61d",
        "legacy_item_code": "ITEM-0605",
        "source_item_code": "LVU-PB0-109",
        "target_item_code": "LVU-PB0-109",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "e6fb1849-9cf1-41a5-90bf-f6727dc757ec",
        "legacy_item_code": "ITEM-0606",
        "source_item_code": "LVU-PB0-110",
        "target_item_code": "LVU-PB0-110",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "645f9861-08d9-47af-b8d9-b26d023a3da1",
        "legacy_item_code": "ITEM-0607",
        "source_item_code": "LVU-PB0-112",
        "target_item_code": "LVU-PB0-112",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "da9df268-ed21-45b4-bf18-d9ff11946f8c",
        "legacy_item_code": "ITEM-0608",
        "source_item_code": "LVU-PB0-113",
        "target_item_code": "LVU-PB0-113",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "8a1e86db-7f34-4ca9-9a49-770566c2965e",
        "legacy_item_code": "ITEM-0609",
        "source_item_code": "LVU-PB0-114",
        "target_item_code": "LVU-PB0-114",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "1f9c4bcc-465f-420b-97a5-da8d22e47fe5",
        "legacy_item_code": "ITEM-0610",
        "source_item_code": "LVU-PB0-115",
        "target_item_code": "LVU-PB0-115",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "a2c1e268-b135-48dc-9754-ee245d0de605",
        "legacy_item_code": "ITEM-0611",
        "source_item_code": "LVU-PB0-117",
        "target_item_code": "LVU-PB0-117",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "f5b991ac-8a19-4d3a-b50b-41d83b573e7b",
        "legacy_item_code": "ITEM-0612",
        "source_item_code": "LVU-PB0-118",
        "target_item_code": "LVU-PB0-118",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "c0d02195-6ca1-4495-86ca-f346d5b008e9",
        "legacy_item_code": "ITEM-0613",
        "source_item_code": "LVU-PB0-119",
        "target_item_code": "LVU-PB0-119",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "d4e3296c-a2ef-4b95-a7d0-b87b43b31226",
        "legacy_item_code": "ITEM-0614",
        "source_item_code": "LVU-PB0-120",
        "target_item_code": "LVU-PB0-120",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "PB0"
      },
      {
        "identity_id": "40779d45-c955-458e-8744-35f698d1a872",
        "legacy_item_code": "ITEM-0615",
        "source_item_code": "LVU-MH0-002",
        "target_item_code": "LVU-MH0-002",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "2205221d-b1c6-4c25-a17b-be19a01fb6e8",
        "legacy_item_code": "ITEM-0616",
        "source_item_code": "LVU-MH0-003",
        "target_item_code": "LVU-MH0-003",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "59dd5bbc-9f14-4948-9922-04637a26535c",
        "legacy_item_code": "ITEM-0617",
        "source_item_code": "LVU-MH0-004",
        "target_item_code": "LVU-MH0-004",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "dfff30ec-a715-4cb1-aa2f-3b5c4e86d386",
        "legacy_item_code": "ITEM-0618",
        "source_item_code": "LVU-MH0-005",
        "target_item_code": "LVU-MH0-005",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "f0aff709-2054-4b59-8650-8a4ebfdc7429",
        "legacy_item_code": "ITEM-0619",
        "source_item_code": "LVU-MH0-006",
        "target_item_code": "LVU-MH0-006",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "c102adf3-5bbf-4d16-a8fe-54d44bb32c8b",
        "legacy_item_code": "ITEM-0620",
        "source_item_code": "LVU-MH0-007",
        "target_item_code": "LVU-MH0-007",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "62843343-f9ff-453c-8d7f-92677f416921",
        "legacy_item_code": "ITEM-0621",
        "source_item_code": "LVU-MH0-009",
        "target_item_code": "LVU-MH0-009",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "5cf43d1e-e593-4d77-b3e9-3292f16ea178",
        "legacy_item_code": "ITEM-0622",
        "source_item_code": "LVU-MH0-010",
        "target_item_code": "LVU-MH0-010",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "57801cb6-2b72-4bf9-a05f-cf06e5594e55",
        "legacy_item_code": "ITEM-0623",
        "source_item_code": "LVU-MH0-011",
        "target_item_code": "LVU-MH0-011",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "ced3def1-9a2f-43a4-a4c4-5d62b8711ed2",
        "legacy_item_code": "ITEM-0624",
        "source_item_code": "LVU-MH0-012",
        "target_item_code": "LVU-MH0-012",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "e8d7456b-e39b-417b-8faa-e5463836c177",
        "legacy_item_code": "ITEM-0625",
        "source_item_code": "LVU-MH0-013",
        "target_item_code": "LVU-MH0-013",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "51bb9762-1089-4c66-aca9-4e774531f081",
        "legacy_item_code": "ITEM-0626",
        "source_item_code": "LVU-MH0-014",
        "target_item_code": "LVU-MH0-014",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "57162766-1e8f-4768-8c2e-19f76c940927",
        "legacy_item_code": "ITEM-0627",
        "source_item_code": "LVU-MH0-016",
        "target_item_code": "LVU-MH0-016",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "d404cdec-792a-4394-89fd-b5c2c51837f8",
        "legacy_item_code": "ITEM-0628",
        "source_item_code": "LVU-MH0-017",
        "target_item_code": "LVU-MH0-017",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "25328e10-8b31-4197-a180-cd99b2969267",
        "legacy_item_code": "ITEM-0629",
        "source_item_code": "LVU-MH0-018",
        "target_item_code": "LVU-MH0-018",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "4df41b83-e81b-433d-aefd-28f6616896a9",
        "legacy_item_code": "ITEM-0630",
        "source_item_code": "LVU-MH0-019",
        "target_item_code": "LVU-MH0-019",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "14327b99-850d-43c2-b973-e47a7fa68267",
        "legacy_item_code": "ITEM-0631",
        "source_item_code": "LVU-MH0-020",
        "target_item_code": "LVU-MH0-020",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "31b4051d-cecd-4ea3-a2dd-5fcb2c1b7527",
        "legacy_item_code": "ITEM-0632",
        "source_item_code": "LVU-MH0-021",
        "target_item_code": "LVU-MH0-021",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "bea66bd4-4092-425a-9de3-d6452cb16f61",
        "legacy_item_code": "ITEM-0633",
        "source_item_code": "LVU-MH0-023",
        "target_item_code": "LVU-MH0-023",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "d75d9306-c167-493e-b879-7c897640c203",
        "legacy_item_code": "ITEM-0634",
        "source_item_code": "LVU-MH0-024",
        "target_item_code": "LVU-MH0-024",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "01dac95c-620c-4e39-b4ad-0228e33b6ed9",
        "legacy_item_code": "ITEM-0635",
        "source_item_code": "LVU-MH0-025",
        "target_item_code": "LVU-MH0-025",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "a89a5cc9-8432-4816-8600-a0d5a145d19c",
        "legacy_item_code": "ITEM-0636",
        "source_item_code": "LVU-MH0-026",
        "target_item_code": "LVU-MH0-026",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "4bd498d4-75ee-45e8-a2fb-d47931be5a75",
        "legacy_item_code": "ITEM-0637",
        "source_item_code": "LVU-MH0-027",
        "target_item_code": "LVU-MH0-027",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "95d045a0-0e56-47df-897c-7bdddc0353a2",
        "legacy_item_code": "ITEM-0638",
        "source_item_code": "LVU-MH0-028",
        "target_item_code": "LVU-MH0-028",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "29f60c35-d452-4785-9ee2-d0e6124c2ff3",
        "legacy_item_code": "ITEM-0639",
        "source_item_code": "LVU-MH0-030",
        "target_item_code": "LVU-MH0-030",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "c6c66f73-03ae-4468-994f-a836a7578b24",
        "legacy_item_code": "ITEM-0640",
        "source_item_code": "LVU-MH0-031",
        "target_item_code": "LVU-MH0-031",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "a3e4622b-b244-49be-8704-2cd0fbb4229b",
        "legacy_item_code": "ITEM-0641",
        "source_item_code": "LVU-MH0-032",
        "target_item_code": "LVU-MH0-032",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "bd3d9172-8149-4229-944a-2de440bf8491",
        "legacy_item_code": "ITEM-0642",
        "source_item_code": "LVU-MH0-033",
        "target_item_code": "LVU-MH0-033",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "dada21c9-bfe2-4a1c-8352-c3ed8508d8f5",
        "legacy_item_code": "ITEM-0643",
        "source_item_code": "LVU-MH0-034",
        "target_item_code": "LVU-MH0-034",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "0a7306bc-dfde-400f-b084-f7bf7530932d",
        "legacy_item_code": "ITEM-0644",
        "source_item_code": "LVU-MH0-035",
        "target_item_code": "LVU-MH0-035",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "dd345983-4e89-4d28-85e0-e59e6ba15ef4",
        "legacy_item_code": "ITEM-0645",
        "source_item_code": "LVU-MH0-037",
        "target_item_code": "LVU-MH0-037",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "e1394781-1906-41a5-a11c-6be21fff2628",
        "legacy_item_code": "ITEM-0646",
        "source_item_code": "LVU-MH0-038",
        "target_item_code": "LVU-MH0-038",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "b874dfa6-9fa8-48e6-b14a-edb622766898",
        "legacy_item_code": "ITEM-0647",
        "source_item_code": "LVU-MH0-039",
        "target_item_code": "LVU-MH0-039",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "8faf7f0b-8c9d-44ec-beaa-1c1cda5f6ba0",
        "legacy_item_code": "ITEM-0648",
        "source_item_code": "LVU-MH0-040",
        "target_item_code": "LVU-MH0-040",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "74d13535-0e02-46fd-888e-335381a464d3",
        "legacy_item_code": "ITEM-0649",
        "source_item_code": "LVU-MH0-041",
        "target_item_code": "LVU-MH0-041",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "1813ebea-7ec8-4ffe-a21d-5bb0dfb618b8",
        "legacy_item_code": "ITEM-0650",
        "source_item_code": "LVU-MH0-042",
        "target_item_code": "LVU-MH0-042",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "c7f5e666-e584-4741-8fae-623f363f81f7",
        "legacy_item_code": "ITEM-0651",
        "source_item_code": "LVU-MH0-044",
        "target_item_code": "LVU-MH0-044",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "2194ce99-2fca-4f76-b4e8-dbe38e91269d",
        "legacy_item_code": "ITEM-0652",
        "source_item_code": "LVU-MH0-045",
        "target_item_code": "LVU-MH0-045",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "5fb072cc-e9ff-413b-b42d-657c1dd5dbc5",
        "legacy_item_code": "ITEM-0653",
        "source_item_code": "LVU-MH0-046",
        "target_item_code": "LVU-MH0-046",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "23ffebcf-50ac-47da-a8c7-4994219d537a",
        "legacy_item_code": "ITEM-0654",
        "source_item_code": "LVU-MH0-047",
        "target_item_code": "LVU-MH0-047",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "f30fc0f8-b593-44ff-a20f-d1ad97396636",
        "legacy_item_code": "ITEM-0655",
        "source_item_code": "LVU-MH0-048",
        "target_item_code": "LVU-MH0-048",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "c7557b04-8aca-4ca3-b2a0-21934385246a",
        "legacy_item_code": "ITEM-0656",
        "source_item_code": "LVU-MH0-049",
        "target_item_code": "LVU-MH0-049",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "ca2142c5-0c9e-473b-93b6-89b389fcc558",
        "legacy_item_code": "ITEM-0657",
        "source_item_code": "LVU-MH0-051",
        "target_item_code": "LVU-MH0-051",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "14c9560b-2a6e-4bc4-9446-3211b7962cc5",
        "legacy_item_code": "ITEM-0658",
        "source_item_code": "LVU-MH0-052",
        "target_item_code": "LVU-MH0-052",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "54b048b8-caf4-4fa3-880b-d06971205b6b",
        "legacy_item_code": "ITEM-0659",
        "source_item_code": "LVU-MH0-053",
        "target_item_code": "LVU-MH0-053",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "baf8b579-87f2-45a0-a1fa-f21e199af9b9",
        "legacy_item_code": "ITEM-0660",
        "source_item_code": "LVU-MH0-054",
        "target_item_code": "LVU-MH0-054",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "a701efdb-f1cc-4f7d-aff9-8282cbb88614",
        "legacy_item_code": "ITEM-0661",
        "source_item_code": "LVU-MH0-055",
        "target_item_code": "LVU-MH0-055",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "3556955a-16dd-4a02-a3d3-44a07fa00f9f",
        "legacy_item_code": "ITEM-0662",
        "source_item_code": "LVU-MH0-056",
        "target_item_code": "LVU-MH0-056",
        "identity_outcome": "recode",
        "work_context_code": "LVU",
        "item_type_code": "MH0"
      },
      {
        "identity_id": "00699698-f707-4f10-a300-3166178a147a",
        "legacy_item_code": "ITEM-0663",
        "source_item_code": "CIS-H08-001",
        "target_item_code": "CIS-H08-001",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "d74fda19-2084-4aaa-83be-a0806dec1108",
        "legacy_item_code": "ITEM-0664",
        "source_item_code": "CIS-H08-002",
        "target_item_code": "CIS-H08-002",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "1a1efc3d-3c60-4e00-8831-fca0a010bc22",
        "legacy_item_code": "ITEM-0665",
        "source_item_code": "CIS-H08-003",
        "target_item_code": "CIS-H08-003",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "647aaa48-114a-421a-af12-4e57d31c5c4d",
        "legacy_item_code": "ITEM-0666",
        "source_item_code": "CIS-H08-004",
        "target_item_code": "CIS-H08-004",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "7c62facd-31b9-4a00-8ff5-87a296bcf387",
        "legacy_item_code": "ITEM-0667",
        "source_item_code": "CIS-H08-005",
        "target_item_code": "CIS-H08-005",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "8e737e89-fba3-4968-80cb-c7bb83c9f3c0",
        "legacy_item_code": "ITEM-0668",
        "source_item_code": "CIS-H08-006",
        "target_item_code": "CIS-H08-006",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "510a8b70-29ec-4eb2-935f-8e04fa6fb4be",
        "legacy_item_code": "ITEM-0669",
        "source_item_code": "CIS-H08-007",
        "target_item_code": "CIS-H08-007",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "00ac9320-30b2-4ef7-80b2-672c681eb592",
        "legacy_item_code": "ITEM-0670",
        "source_item_code": "CIS-H08-008",
        "target_item_code": "CIS-H08-008",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "9beb3f08-3ddd-40f9-aa7a-fbd9e367e140",
        "legacy_item_code": "ITEM-0671",
        "source_item_code": "CIS-H08-009",
        "target_item_code": "CIS-H08-009",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "f228140c-2a74-4468-8fe8-d59b230834d8",
        "legacy_item_code": "ITEM-0672",
        "source_item_code": "CIS-H08-010",
        "target_item_code": "CIS-H08-010",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "bf771873-3e08-41a0-8c14-a12fcc34e2b8",
        "legacy_item_code": "ITEM-0673",
        "source_item_code": "CIS-H08-011",
        "target_item_code": "CIS-H08-011",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "38bdaece-6e5b-47d6-8bf0-a52574456c16",
        "legacy_item_code": "ITEM-0674",
        "source_item_code": "CIS-H08-012",
        "target_item_code": "CIS-H08-012",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "45efb19a-5cd5-4393-9694-aa1b7a3cfed3",
        "legacy_item_code": "ITEM-0675",
        "source_item_code": "CIS-H08-013",
        "target_item_code": "CIS-H08-013",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "98d4749b-a5b4-4733-8762-f1b2dfd842c1",
        "legacy_item_code": "ITEM-0676",
        "source_item_code": "CIS-H08-014",
        "target_item_code": "CIS-H08-014",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "f8b91c82-7819-4979-beee-2fcd34a4a3ec",
        "legacy_item_code": "ITEM-0677",
        "source_item_code": "CIS-H08-015",
        "target_item_code": "CIS-H08-015",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "376bd8e8-9a48-47fc-abcd-da36348fce9c",
        "legacy_item_code": "ITEM-0678",
        "source_item_code": "CIS-H08-016",
        "target_item_code": "CIS-H08-016",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "c0f5e1be-8531-4f6a-9ad8-59a36bd12ef6",
        "legacy_item_code": "ITEM-0679",
        "source_item_code": "CIS-H08-017",
        "target_item_code": "CIS-H08-017",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "51e4f091-d9c8-4b07-bf59-d112f8e7ee8e",
        "legacy_item_code": "ITEM-0680",
        "source_item_code": "CIS-H08-018",
        "target_item_code": "CIS-H08-018",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "5f671233-8467-4b67-b309-9f68f213c51f",
        "legacy_item_code": "ITEM-0681",
        "source_item_code": "CIS-H08-019",
        "target_item_code": "CIS-H08-019",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "7d223aa8-0774-4f4b-9f8a-f01192d9fa6e",
        "legacy_item_code": "ITEM-0682",
        "source_item_code": "CIS-H08-020",
        "target_item_code": "CIS-H08-020",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H08"
      },
      {
        "identity_id": "4a403b76-1bf4-4de0-94c3-7936941ec574",
        "legacy_item_code": "ITEM-0683",
        "source_item_code": null,
        "target_item_code": "CIC-H06-001",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "6374c1e9-228a-47d0-9369-480b41424fd3",
        "legacy_item_code": "ITEM-0684",
        "source_item_code": null,
        "target_item_code": "CIC-H06-002",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "5fec1165-7678-422d-ae3f-10c95f70d528",
        "legacy_item_code": "ITEM-0685",
        "source_item_code": null,
        "target_item_code": "CIC-H06-003",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "81de3107-a3e3-4357-9c4e-eba5aced5549",
        "legacy_item_code": "ITEM-0686",
        "source_item_code": null,
        "target_item_code": "CIC-H06-004",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "c40fa670-1258-4078-90fb-d12ced1bc347",
        "legacy_item_code": "ITEM-0687",
        "source_item_code": null,
        "target_item_code": "CIC-H06-005",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "1bb7f2f4-15ed-40ae-b6a1-3fe0fc2f0a29",
        "legacy_item_code": "ITEM-0688",
        "source_item_code": null,
        "target_item_code": "CIC-H06-006",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "7a7a1ea1-63d7-4aff-91ef-6b937e39e183",
        "legacy_item_code": "ITEM-0689",
        "source_item_code": null,
        "target_item_code": "CIC-H06-007",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "1e0df31e-9d07-48de-9fae-1e3c65ccf69e",
        "legacy_item_code": "ITEM-0690",
        "source_item_code": null,
        "target_item_code": "CIC-H06-008",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "63536296-50d6-4b2b-86c6-a1f434f5ebe9",
        "legacy_item_code": "ITEM-0691",
        "source_item_code": null,
        "target_item_code": "CIC-H06-009",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "713c6ee7-1f5f-493e-a726-7987bb468664",
        "legacy_item_code": "ITEM-0692",
        "source_item_code": null,
        "target_item_code": "CIC-H06-010",
        "identity_outcome": "recode",
        "work_context_code": "CIC",
        "item_type_code": "H06"
      },
      {
        "identity_id": "98b98893-59b8-42c4-b030-c6c9f3cb2854",
        "legacy_item_code": "ITEM-0693",
        "source_item_code": "CIS-H06-007",
        "target_item_code": "CIS-H06-007",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "007f668e-c727-41b7-a1a4-a99a2f7e17c4",
        "legacy_item_code": "ITEM-0694",
        "source_item_code": "CIS-H06-008",
        "target_item_code": "CIS-H06-008",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "26ad397d-46d0-4a1c-b5a9-ddb77159e3af",
        "legacy_item_code": "ITEM-0695",
        "source_item_code": "CIS-H06-009",
        "target_item_code": "CIS-H06-009",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "88ce6cd7-b2a1-431a-881a-3fd186b39425",
        "legacy_item_code": "ITEM-0696",
        "source_item_code": "CIS-H06-010",
        "target_item_code": "CIS-H06-010",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "b30844bc-7d46-44d0-87fb-e2a1ea69e73a",
        "legacy_item_code": "ITEM-0697",
        "source_item_code": "CIS-H06-011",
        "target_item_code": "CIS-H06-011",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "b5cf66a8-39b6-4c61-bdf7-6dc15b6dad8d",
        "legacy_item_code": "ITEM-0698",
        "source_item_code": "CIS-H06-012",
        "target_item_code": "CIS-H06-012",
        "identity_outcome": "recode",
        "work_context_code": "CIS",
        "item_type_code": "H06"
      },
      {
        "identity_id": "33fefd12-7a85-4a79-bb1e-b639b8209f0f",
        "legacy_item_code": "ITEM-0699",
        "source_item_code": null,
        "target_item_code": "JNT-PVC-013",
        "identity_outcome": "recode",
        "work_context_code": "JNT",
        "item_type_code": "PVC"
      },
      {
        "identity_id": "116b568b-dc8b-428a-961d-6b15c19bf570",
        "legacy_item_code": "ITEM-0700",
        "source_item_code": null,
        "target_item_code": "RSR-PL0-040",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "3cf2ff5d-4e3e-48b2-a1a5-fc0529e23b6d",
        "legacy_item_code": "ITEM-0701",
        "source_item_code": null,
        "target_item_code": "RSR-PL0-041",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "f8c48291-a58b-4437-9108-f8c7a38d3c98",
        "legacy_item_code": "ITEM-0702",
        "source_item_code": null,
        "target_item_code": "RSR-PL0-042",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "69264c50-0aa3-41e4-8efa-57f514fbc0f8",
        "legacy_item_code": "ITEM-0703",
        "source_item_code": "RSR-PL0-014",
        "target_item_code": "RSR-PL0-014",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "92d0bd54-3ecc-4d6e-8ad1-ba3eac30da52",
        "legacy_item_code": "ITEM-0704",
        "source_item_code": "RSR-PL0-015",
        "target_item_code": "RSR-PL0-015",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "283d1a1f-2bc4-4600-bb85-c109ac02448b",
        "legacy_item_code": "ITEM-0705",
        "source_item_code": "RSR-PL0-016",
        "target_item_code": "RSR-PL0-016",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "c6e19e31-073f-482a-8189-f56e262fdc5e",
        "legacy_item_code": "ITEM-0706",
        "source_item_code": "RSR-PL0-017",
        "target_item_code": "RSR-PL0-017",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "348b177f-cc3d-409b-a948-a60b1c2a5f87",
        "legacy_item_code": "ITEM-0707",
        "source_item_code": null,
        "target_item_code": "RSR-PL0-043",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "44a3bf83-6558-4fc1-ad97-d6bd1f04cc3f",
        "legacy_item_code": "ITEM-0708",
        "source_item_code": null,
        "target_item_code": "RSR-PL0-044",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "d7117e52-5910-457a-b726-d12efbbb8ea1",
        "legacy_item_code": "ITEM-0709",
        "source_item_code": null,
        "target_item_code": "RSR-PL0-045",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      },
      {
        "identity_id": "e0f7236b-c21f-4c29-8933-3010ad7b8445",
        "legacy_item_code": "ITEM-0710",
        "source_item_code": null,
        "target_item_code": "RSR-PL0-046",
        "identity_outcome": "recode",
        "work_context_code": "RSR",
        "item_type_code": "PL0"
      }
    ],
    "source_exclusions": [
      {
        "source_item_code": "CIS-H06-001",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "CIS-H06-002",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "CIS-H06-003",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "CIS-H06-004",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "CIS-H06-005",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "CIS-H06-006",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "CRS-GIP-025",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-010",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-011",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-012",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-013",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-018",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-019",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-020",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-029",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-030",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      },
      {
        "source_item_code": "RSR-PL0-031",
        "disposition": "deferred_not_publishable",
        "reason": "P-05 deferred workbook-only source row from the first structured-code rollout"
      }
    ],
    "code_groups": [
      {
        "work_context_code": "CIC",
        "item_type_code": "GIP",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก",
        "work_context_name_en": "Conduit in Concrete",
        "item_type_name_th": "GIP",
        "item_type_name_en": "Galvanized Iron / Steel Pipe",
        "display_order": 0
      },
      {
        "work_context_code": "CIC",
        "item_type_code": "H06",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก",
        "work_context_name_en": "Conduit in Concrete",
        "item_type_name_th": "HDPE PN6",
        "item_type_name_en": "HDPE PN6",
        "display_order": 1
      },
      {
        "work_context_code": "CIC",
        "item_type_code": "H08",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก",
        "work_context_name_en": "Conduit in Concrete",
        "item_type_name_th": "HDPE PN8",
        "item_type_name_en": "HDPE PN8",
        "display_order": 2
      },
      {
        "work_context_code": "CIC",
        "item_type_code": "H10",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก",
        "work_context_name_en": "Conduit in Concrete",
        "item_type_name_th": "HDPE PN10",
        "item_type_name_en": "HDPE PN10",
        "display_order": 3
      },
      {
        "work_context_code": "CIC",
        "item_type_code": "PV2",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก",
        "work_context_name_en": "Conduit in Concrete",
        "item_type_name_th": "PVC + PVC",
        "item_type_name_en": "PVC + PVC",
        "display_order": 4
      },
      {
        "work_context_code": "CIC",
        "item_type_code": "PVC",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก",
        "work_context_name_en": "Conduit in Concrete",
        "item_type_name_th": "PVC",
        "item_type_name_en": "PVC",
        "display_order": 5
      },
      {
        "work_context_code": "CIS",
        "item_type_code": "D02",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย",
        "work_context_name_en": "Conduit in Sand",
        "item_type_name_th": "HDPE 2 ขนาด / Double",
        "item_type_name_en": "HDPE Double / Two-Size",
        "display_order": 6
      },
      {
        "work_context_code": "CIS",
        "item_type_code": "GIP",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย",
        "work_context_name_en": "Conduit in Sand",
        "item_type_name_th": "GIP",
        "item_type_name_en": "Galvanized Iron / Steel Pipe",
        "display_order": 7
      },
      {
        "work_context_code": "CIS",
        "item_type_code": "H06",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย",
        "work_context_name_en": "Conduit in Sand",
        "item_type_name_th": "HDPE PN6",
        "item_type_name_en": "HDPE PN6",
        "display_order": 8
      },
      {
        "work_context_code": "CIS",
        "item_type_code": "H08",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย",
        "work_context_name_en": "Conduit in Sand",
        "item_type_name_th": "HDPE PN8",
        "item_type_name_en": "HDPE PN8",
        "display_order": 9
      },
      {
        "work_context_code": "CIS",
        "item_type_code": "H10",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย",
        "work_context_name_en": "Conduit in Sand",
        "item_type_name_th": "HDPE PN10",
        "item_type_name_en": "HDPE PN10",
        "display_order": 10
      },
      {
        "work_context_code": "CIS",
        "item_type_code": "PV2",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย",
        "work_context_name_en": "Conduit in Sand",
        "item_type_name_th": "PVC + PVC",
        "item_type_name_en": "PVC + PVC",
        "display_order": 11
      },
      {
        "work_context_code": "CIS",
        "item_type_code": "PVC",
        "work_context_name_th": "งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย",
        "work_context_name_en": "Conduit in Sand",
        "item_type_name_th": "PVC",
        "item_type_name_en": "PVC",
        "display_order": 12
      },
      {
        "work_context_code": "CRS",
        "item_type_code": "GIP",
        "work_context_name_th": "งานวางท่อข้ามคลอง / Crossing",
        "work_context_name_en": "Crossing",
        "item_type_name_th": "GIP",
        "item_type_name_en": "Galvanized Iron / Steel Pipe",
        "display_order": 13
      },
      {
        "work_context_code": "CRS",
        "item_type_code": "H06",
        "work_context_name_th": "งานวางท่อข้ามคลอง / Crossing",
        "work_context_name_en": "Crossing",
        "item_type_name_th": "HDPE PN6",
        "item_type_name_en": "HDPE PN6",
        "display_order": 14
      },
      {
        "work_context_code": "CRS",
        "item_type_code": "H08",
        "work_context_name_th": "งานวางท่อข้ามคลอง / Crossing",
        "work_context_name_en": "Crossing",
        "item_type_name_th": "HDPE PN8",
        "item_type_name_en": "HDPE PN8",
        "display_order": 15
      },
      {
        "work_context_code": "HDD",
        "item_type_code": "D02",
        "work_context_name_th": "งานดันท่อลอด / HDD / Jacking",
        "work_context_name_en": "Horizontal Directional Drilling / Jacking",
        "item_type_name_th": "HDPE 2 ขนาด / Double",
        "item_type_name_en": "HDPE Double / Two-Size",
        "display_order": 16
      },
      {
        "work_context_code": "HDD",
        "item_type_code": "GJK",
        "work_context_name_th": "งานดันท่อลอด / HDD / Jacking",
        "work_context_name_en": "Horizontal Directional Drilling / Jacking",
        "item_type_name_th": "Pipe Jacking (GIP)",
        "item_type_name_en": "GIP Pipe Jacking",
        "display_order": 17
      },
      {
        "work_context_code": "HDD",
        "item_type_code": "H06",
        "work_context_name_th": "งานดันท่อลอด / HDD / Jacking",
        "work_context_name_en": "Horizontal Directional Drilling / Jacking",
        "item_type_name_th": "HDPE PN6",
        "item_type_name_en": "HDPE PN6",
        "display_order": 18
      },
      {
        "work_context_code": "HDD",
        "item_type_code": "H08",
        "work_context_name_th": "งานดันท่อลอด / HDD / Jacking",
        "work_context_name_en": "Horizontal Directional Drilling / Jacking",
        "item_type_name_th": "HDPE PN8",
        "item_type_name_en": "HDPE PN8",
        "display_order": 19
      },
      {
        "work_context_code": "HDD",
        "item_type_code": "H10",
        "work_context_name_th": "งานดันท่อลอด / HDD / Jacking",
        "work_context_name_en": "Horizontal Directional Drilling / Jacking",
        "item_type_name_th": "HDPE PN10",
        "item_type_name_en": "HDPE PN10",
        "display_order": 20
      },
      {
        "work_context_code": "HDD",
        "item_type_code": "PJK",
        "work_context_name_th": "งานดันท่อลอด / HDD / Jacking",
        "work_context_name_en": "Horizontal Directional Drilling / Jacking",
        "item_type_name_th": "Pipe Jacking (Steel Casing)",
        "item_type_name_en": "Steel Casing Pipe Jacking",
        "display_order": 21
      },
      {
        "work_context_code": "JNT",
        "item_type_code": "PVC",
        "work_context_name_th": "งานสร้างจุดเชื่อมท่อ",
        "work_context_name_en": "Joint",
        "item_type_name_th": "PVC",
        "item_type_name_en": "PVC",
        "display_order": 22
      },
      {
        "work_context_code": "RSR",
        "item_type_code": "CB0",
        "work_context_name_th": "งานสร้างท่อโค้ง / Riser",
        "work_context_name_en": "Riser",
        "item_type_name_th": "Riser ขึ้นตู้ผ่าน",
        "item_type_name_en": "Cabinet Riser",
        "display_order": 23
      },
      {
        "work_context_code": "RSR",
        "item_type_code": "DT3",
        "work_context_name_th": "งานสร้างท่อโค้ง / Riser",
        "work_context_name_en": "Riser",
        "item_type_name_th": "Riser แยก Distribution",
        "item_type_name_en": "Distribution Branch",
        "display_order": 24
      },
      {
        "work_context_code": "RSR",
        "item_type_code": "PL0",
        "work_context_name_th": "งานสร้างท่อโค้ง / Riser",
        "work_context_name_en": "Riser",
        "item_type_name_th": "Riser ขึ้นเสา",
        "item_type_name_en": "Pole Riser",
        "display_order": 25
      },
      {
        "work_context_code": "RSR",
        "item_type_code": "SVC",
        "work_context_name_th": "งานสร้างท่อโค้ง / Riser",
        "work_context_name_en": "Riser",
        "item_type_name_th": "Riser Service",
        "item_type_name_en": "Service Riser",
        "display_order": 26
      },
      {
        "work_context_code": "RSR",
        "item_type_code": "TB0",
        "work_context_name_th": "งานสร้างท่อโค้ง / Riser",
        "work_context_name_en": "Riser",
        "item_type_name_th": "Riser ขึ้นตู้สาธารณะ/Terminal Box",
        "item_type_name_en": "Terminal Box Riser",
        "display_order": 27
      },
      {
        "work_context_code": "RSR",
        "item_type_code": "WL0",
        "work_context_name_th": "งานสร้างท่อโค้ง / Riser",
        "work_context_name_en": "Riser",
        "item_type_name_th": "Riser ขึ้นผนัง",
        "item_type_name_en": "Wall Riser",
        "display_order": 28
      },
      {
        "work_context_code": "CHB",
        "item_type_code": "HH0",
        "work_context_name_th": "งานสร้างบ่อพัก",
        "work_context_name_en": "Chamber",
        "item_type_name_th": "Handhole",
        "item_type_name_en": "Handhole",
        "display_order": 29
      },
      {
        "work_context_code": "CHB",
        "item_type_code": "MH0",
        "work_context_name_th": "งานสร้างบ่อพัก",
        "work_context_name_en": "Chamber",
        "item_type_name_th": "Manhole",
        "item_type_name_en": "Manhole",
        "display_order": 30
      },
      {
        "work_context_code": "CHB",
        "item_type_code": "PB0",
        "work_context_name_th": "งานสร้างบ่อพัก",
        "work_context_name_en": "Chamber",
        "item_type_name_th": "Pull Box",
        "item_type_name_en": "Pull Box",
        "display_order": 31
      },
      {
        "work_context_code": "MOD",
        "item_type_code": "FMH",
        "work_context_name_th": "งานดัดแปลงบ่อพัก",
        "work_context_name_en": "Modification",
        "item_type_name_th": "เปลี่ยนฝา/เฟรม MH",
        "item_type_name_en": "MH Cover/Frame Replacement",
        "display_order": 32
      },
      {
        "work_context_code": "MOD",
        "item_type_code": "FPB",
        "work_context_name_th": "งานดัดแปลงบ่อพัก",
        "work_context_name_en": "Modification",
        "item_type_name_th": "เปลี่ยนฝา/เฟรม PB",
        "item_type_name_en": "PB Cover/Frame Replacement",
        "display_order": 33
      },
      {
        "work_context_code": "MOD",
        "item_type_code": "MH0",
        "work_context_name_th": "งานดัดแปลงบ่อพัก",
        "work_context_name_en": "Modification",
        "item_type_name_th": "Manhole",
        "item_type_name_en": "Manhole",
        "display_order": 34
      },
      {
        "work_context_code": "MOD",
        "item_type_code": "PB0",
        "work_context_name_th": "งานดัดแปลงบ่อพัก",
        "work_context_name_en": "Modification",
        "item_type_name_th": "Pull Box",
        "item_type_name_en": "Pull Box",
        "display_order": 35
      },
      {
        "work_context_code": "WLL",
        "item_type_code": "MH0",
        "work_context_name_th": "งานเสริมผนังบ่อพัก",
        "work_context_name_en": "Wall Extension",
        "item_type_name_th": "Manhole",
        "item_type_name_en": "Manhole",
        "display_order": 36
      },
      {
        "work_context_code": "WLL",
        "item_type_code": "PB0",
        "work_context_name_th": "งานเสริมผนังบ่อพัก",
        "work_context_name_en": "Wall Extension",
        "item_type_name_th": "Pull Box",
        "item_type_name_en": "Pull Box",
        "display_order": 37
      },
      {
        "work_context_code": "LVU",
        "item_type_code": "MH0",
        "work_context_name_th": "งานยกระดับคอบ่อพัก",
        "work_context_name_en": "Level Up",
        "item_type_name_th": "Manhole",
        "item_type_name_en": "Manhole",
        "display_order": 38
      },
      {
        "work_context_code": "LVU",
        "item_type_code": "PB0",
        "work_context_name_th": "งานยกระดับคอบ่อพัก",
        "work_context_name_en": "Level Up",
        "item_type_name_th": "Pull Box",
        "item_type_name_en": "Pull Box",
        "display_order": 39
      },
      {
        "work_context_code": "LVD",
        "item_type_code": "MH0",
        "work_context_name_th": "งานลดระดับคอบ่อพัก",
        "work_context_name_en": "Level Down",
        "item_type_name_th": "Manhole",
        "item_type_name_en": "Manhole",
        "display_order": 40
      },
      {
        "work_context_code": "RPR",
        "item_type_code": "BRK",
        "work_context_name_th": "งานปรับปรุงท่อร้อยสาย",
        "work_context_name_en": "Repair",
        "item_type_name_th": "ทุบค.ส.ล.หุ้มท่อ",
        "item_type_name_en": "Break Concrete Encasement",
        "display_order": 41
      },
      {
        "work_context_code": "RPR",
        "item_type_code": "CUT",
        "work_context_name_th": "งานปรับปรุงท่อร้อยสาย",
        "work_context_name_en": "Repair",
        "item_type_name_th": "ตัดท่อเดิม",
        "item_type_name_en": "Cut Existing Conduit",
        "display_order": 42
      },
      {
        "work_context_code": "RPR",
        "item_type_code": "REM",
        "work_context_name_th": "งานปรับปรุงท่อร้อยสาย",
        "work_context_name_en": "Repair",
        "item_type_name_th": "รื้อท่อเดิม",
        "item_type_name_en": "Remove Existing Conduit",
        "display_order": 43
      },
      {
        "work_context_code": "COR",
        "item_type_code": "MH0",
        "work_context_name_th": "งานเจาะบ่อพัก",
        "work_context_name_en": "Coring / Chamber Drilling",
        "item_type_name_th": "Manhole",
        "item_type_name_en": "Manhole",
        "display_order": 44
      },
      {
        "work_context_code": "COR",
        "item_type_code": "PB0",
        "work_context_name_th": "งานเจาะบ่อพัก",
        "work_context_name_en": "Coring / Chamber Drilling",
        "item_type_name_th": "Pull Box",
        "item_type_name_en": "Pull Box",
        "display_order": 45
      },
      {
        "work_context_code": "PAD",
        "item_type_code": "CAB",
        "work_context_name_th": "งานสร้างฐานรับบ่อพัก/ตู้",
        "work_context_name_en": "Pad Foundation / Base",
        "item_type_name_th": "ฐานรับ Cabinet",
        "item_type_name_en": "Cabinet Base",
        "display_order": 46
      },
      {
        "work_context_code": "PAD",
        "item_type_code": "PB0",
        "work_context_name_th": "งานสร้างฐานรับบ่อพัก/ตู้",
        "work_context_name_en": "Pad Foundation / Base",
        "item_type_name_th": "Pull Box",
        "item_type_name_en": "Pull Box",
        "display_order": 47
      },
      {
        "work_context_code": "POL",
        "item_type_code": "RCC",
        "work_context_name_th": "งานปักเสาสื่อสาร",
        "work_context_name_en": "Pole",
        "item_type_name_th": "คอนกรีตเสริมเหล็ก",
        "item_type_name_en": "Reinforced Concrete",
        "display_order": 48
      },
      {
        "work_context_code": "POL",
        "item_type_code": "STL",
        "work_context_name_th": "งานปักเสาสื่อสาร",
        "work_context_name_en": "Pole",
        "item_type_name_th": "Steel",
        "item_type_name_en": "Steel",
        "display_order": 49
      },
      {
        "work_context_code": "PIL",
        "item_type_code": "STD",
        "work_context_name_th": "งานตอกเสาตอม่อยึดเสา",
        "work_context_name_en": "Pile for Pole",
        "item_type_name_th": "มาตรฐาน",
        "item_type_name_en": "Standard",
        "display_order": 50
      },
      {
        "work_context_code": "PCD",
        "item_type_code": "STD",
        "work_context_name_th": "งานตอกเสาเข็มรับท่อ",
        "work_context_name_en": "Pile for Conduit",
        "item_type_name_th": "มาตรฐาน",
        "item_type_name_en": "Standard",
        "display_order": 51
      },
      {
        "work_context_code": "PLM",
        "item_type_code": "STD",
        "work_context_name_th": "งานตอกเสาเข็มรับบ่อพัก",
        "work_context_name_en": "Pile for Manhole",
        "item_type_name_th": "มาตรฐาน",
        "item_type_name_en": "Standard",
        "display_order": 52
      },
      {
        "work_context_code": "SUP",
        "item_type_code": "142",
        "work_context_name_th": "งานสร้างเสา Support",
        "work_context_name_en": "Support",
        "item_type_name_th": "แบบมาตรฐาน 142",
        "item_type_name_en": "Std. Drawing 142",
        "display_order": 53
      },
      {
        "work_context_code": "SUP",
        "item_type_code": "154",
        "work_context_name_th": "งานสร้างเสา Support",
        "work_context_name_en": "Support",
        "item_type_name_th": "แบบมาตรฐาน 154",
        "item_type_name_en": "Std. Drawing 154",
        "display_order": 54
      },
      {
        "work_context_code": "DRN",
        "item_type_code": "STD",
        "work_context_name_th": "งานรื้อย้ายท่อระบายน้ำ",
        "work_context_name_en": "Drain",
        "item_type_name_th": "มาตรฐาน",
        "item_type_name_en": "Standard",
        "display_order": 55
      },
      {
        "work_context_code": "FTW",
        "item_type_code": "ASP",
        "work_context_name_th": "งานซ่อมทางเท้า",
        "work_context_name_en": "Footway",
        "item_type_name_th": "แอสฟัลต์",
        "item_type_name_en": "Asphalt",
        "display_order": 56
      },
      {
        "work_context_code": "FTW",
        "item_type_code": "BLK",
        "work_context_name_th": "งานซ่อมทางเท้า",
        "work_context_name_en": "Footway",
        "item_type_name_th": "บล็อก/อินเตอร์ล็อค",
        "item_type_name_en": "Block / Interlock",
        "display_order": 57
      },
      {
        "work_context_code": "FTW",
        "item_type_code": "CON",
        "work_context_name_th": "งานซ่อมทางเท้า",
        "work_context_name_en": "Footway",
        "item_type_name_th": "คอนกรีต",
        "item_type_name_en": "Concrete",
        "display_order": 58
      },
      {
        "work_context_code": "FTW",
        "item_type_code": "CUR",
        "work_context_name_th": "งานซ่อมทางเท้า",
        "work_context_name_en": "Footway",
        "item_type_name_th": "คันหิน/ราง",
        "item_type_name_en": "Curb / Gutter",
        "display_order": 59
      },
      {
        "work_context_code": "FTW",
        "item_type_code": "SLB",
        "work_context_name_th": "งานซ่อมทางเท้า",
        "work_context_name_en": "Footway",
        "item_type_name_th": "แผ่น/กระเบื้อง/หิน",
        "item_type_name_en": "Slab / Tile / Granite",
        "display_order": 60
      },
      {
        "work_context_code": "RDW",
        "item_type_code": "AC0",
        "work_context_name_th": "งานซ่อมถนน",
        "work_context_name_en": "Roadway",
        "item_type_name_th": "ถนนแอสฟัลต์",
        "item_type_name_en": "Asphalt Pavement",
        "display_order": 61
      },
      {
        "work_context_code": "RDW",
        "item_type_code": "GRV",
        "work_context_name_th": "งานซ่อมถนน",
        "work_context_name_en": "Roadway",
        "item_type_name_th": "หินคลุก",
        "item_type_name_en": "Gravel / Crushed Rock",
        "display_order": 62
      },
      {
        "work_context_code": "RDW",
        "item_type_code": "RC0",
        "work_context_name_th": "งานซ่อมถนน",
        "work_context_name_en": "Roadway",
        "item_type_name_th": "ถนนคอนกรีตเสริมเหล็ก",
        "item_type_name_en": "Reinforced Concrete Pavement",
        "display_order": 63
      },
      {
        "work_context_code": "RDW",
        "item_type_code": "THM",
        "work_context_name_th": "งานซ่อมถนน",
        "work_context_name_en": "Roadway",
        "item_type_name_th": "Thermoplastic",
        "item_type_name_en": "Thermoplastic Marking",
        "display_order": 64
      }
    ],
    "authority_sha256": "28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a"
  }
    $phase4_wp66_authority$::jsonb
  );
  -- END GENERATED WP-6.6 AUTHORITY JSON

  DO $phase4_wp66_authority_preflight$
  DECLARE
    v_payload jsonb;
    v_mapping_count integer;
    v_group_count integer;
    v_exclusion_count integer;
    v_identity_mismatch_count integer;
  BEGIN
    SELECT payload INTO STRICT v_payload FROM phase4_wp66_authority;

    IF v_payload->>'schema_version' <> 'phase4-first-rollout-authority/1'
       OR v_payload->>'source_evidence_sha256'
          <> '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a'
       OR v_payload->>'authority_sha256'
          <> '28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a' THEN
      RAISE EXCEPTION 'WP-6.6 authority payload fingerprint is not approved';
    END IF;

    v_mapping_count := jsonb_array_length(v_payload->'mappings');
    v_group_count := jsonb_array_length(v_payload->'code_groups');
    v_exclusion_count := jsonb_array_length(v_payload->'source_exclusions');

    IF v_mapping_count <> 710 OR v_group_count <> 65 OR v_exclusion_count <> 17 THEN
      RAISE EXCEPTION
        'WP-6.6 authority payload count mismatch: mappings %, groups %, exclusions %',
        v_mapping_count,
        v_group_count,
        v_exclusion_count;
    END IF;

    WITH mappings AS (
      SELECT *
      FROM jsonb_to_recordset(v_payload->'mappings') AS row(
        identity_id uuid,
        legacy_item_code text,
        source_item_code text,
        target_item_code text,
        identity_outcome text,
        work_context_code text,
        item_type_code text
      )
    )
    SELECT count(*)::integer
    INTO v_identity_mismatch_count
    FROM mappings m
    LEFT JOIN public.price_list baseline
      ON baseline.id = m.identity_id
     AND baseline.identity_id = m.identity_id
     AND baseline.item_code = m.legacy_item_code
    LEFT JOIN public.price_list_versions version
      ON version.id = baseline.version_id
     AND version.version_string = '2568.0.0'
    WHERE baseline.id IS NULL OR version.id IS NULL;

    IF v_identity_mismatch_count <> 0 THEN
      RAISE EXCEPTION
        'WP-6.6 authority blocked: % mappings do not match the immutable Production-derived 2568.0.0 identity/code baseline',
        v_identity_mismatch_count;
    END IF;
  END;
  $phase4_wp66_authority_preflight$;

  INSERT INTO public.catalog_code_group_dictionary (
    work_context_code,
    item_type_code,
    work_context_name_th,
    work_context_name_en,
    item_type_name_th,
    item_type_name_en,
    display_order,
    authority_version,
    authority_sha256
  )
  SELECT
    row.work_context_code,
    row.item_type_code,
    row.work_context_name_th,
    row.work_context_name_en,
    row.item_type_name_th,
    row.item_type_name_en,
    row.display_order,
    'phase4-first-rollout-authority/1',
    '28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a'
  FROM phase4_wp66_authority authority
  CROSS JOIN LATERAL jsonb_to_recordset(authority.payload->'code_groups') AS row(
    work_context_code text,
    item_type_code text,
    work_context_name_th text,
    work_context_name_en text,
    item_type_name_th text,
    item_type_name_en text,
    display_order integer
  )
  ON CONFLICT (work_context_code, item_type_code) DO NOTHING;

  INSERT INTO public.catalog_first_rollout_mappings (
    identity_id,
    legacy_item_code,
    source_item_code,
    target_item_code,
    identity_outcome,
    work_context_code,
    item_type_code,
    authority_version,
    authority_sha256
  )
  SELECT
    row.identity_id,
    row.legacy_item_code,
    row.source_item_code,
    row.target_item_code,
    row.identity_outcome,
    row.work_context_code,
    row.item_type_code,
    'phase4-first-rollout-authority/1',
    '28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a'
  FROM phase4_wp66_authority authority
  CROSS JOIN LATERAL jsonb_to_recordset(authority.payload->'mappings') AS row(
    identity_id uuid,
    legacy_item_code text,
    source_item_code text,
    target_item_code text,
    identity_outcome text,
    work_context_code text,
    item_type_code text
  )
  ON CONFLICT (identity_id) DO NOTHING;

  INSERT INTO public.catalog_first_rollout_source_exclusions (
    source_item_code,
    disposition,
    reason,
    authority_version,
    authority_sha256
  )
  SELECT
    row.source_item_code,
    row.disposition,
    row.reason,
    'phase4-first-rollout-authority/1',
    '28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a'
  FROM phase4_wp66_authority authority
  CROSS JOIN LATERAL jsonb_to_recordset(authority.payload->'source_exclusions') AS row(
    source_item_code text,
    disposition text,
    reason text
  )
  ON CONFLICT (source_item_code) DO NOTHING;

  DO $phase4_wp66_existing_authority_preflight$
  DECLARE
    v_unknown_group_count integer;
    v_unknown_draft_category_count integer;
  BEGIN
    SELECT count(*)::integer
    INTO v_unknown_group_count
    FROM public.catalog_code_groups version_group
    LEFT JOIN public.catalog_code_group_dictionary dictionary
      ON dictionary.work_context_code = version_group.work_context_code
     AND dictionary.item_type_code = version_group.item_type_code
    WHERE dictionary.work_context_code IS NULL;

    IF v_unknown_group_count <> 0 THEN
      RAISE EXCEPTION
        'WP-6.6 authority blocked: % existing code groups are outside P-06; use an approved clean rebuild or reviewed cleanup',
        v_unknown_group_count;
    END IF;

    SELECT count(*)::integer
    INTO v_unknown_draft_category_count
    FROM public.price_list_categories draft_category
    JOIN public.price_list_versions draft
      ON draft.id = draft_category.version_id
     AND draft.status = 'draft'
    LEFT JOIN public.price_list_categories base_category
      ON base_category.version_id = draft.based_on_version_id
     AND base_category.code = draft_category.code
    WHERE base_category.id IS NULL;

    IF v_unknown_draft_category_count <> 0 THEN
      RAISE EXCEPTION
        'WP-6.6 authority blocked: % draft categories are not inherited from their Production-derived base',
        v_unknown_draft_category_count;
    END IF;
  END;
  $phase4_wp66_existing_authority_preflight$;

  INSERT INTO public.catalog_code_groups (
    version_id,
    work_context_code,
    item_type_code,
    work_context_name_th,
    work_context_name_en,
    item_type_name_th,
    item_type_name_en,
    display_order
  )
  SELECT
    version.id,
    dictionary.work_context_code,
    dictionary.item_type_code,
    dictionary.work_context_name_th,
    dictionary.work_context_name_en,
    dictionary.item_type_name_th,
    dictionary.item_type_name_en,
    dictionary.display_order
  FROM public.price_list_versions version
  CROSS JOIN public.catalog_code_group_dictionary dictionary
  ON CONFLICT (version_id, work_context_code, item_type_code) DO UPDATE
  SET
    work_context_name_th = EXCLUDED.work_context_name_th,
    work_context_name_en = EXCLUDED.work_context_name_en,
    item_type_name_th = EXCLUDED.item_type_name_th,
    item_type_name_en = EXCLUDED.item_type_name_en,
    display_order = EXCLUDED.display_order;

  INSERT INTO private.catalog_code_sequences (
    work_context_code,
    item_type_code,
    last_issued_sequence
  )
  SELECT
    mapping.work_context_code,
    mapping.item_type_code,
    max(substring(mapping.target_item_code from '-([0-9]{3})$')::integer)
  FROM public.catalog_first_rollout_mappings mapping
  WHERE mapping.identity_outcome = 'recode'
  GROUP BY mapping.work_context_code, mapping.item_type_code
  ON CONFLICT (work_context_code, item_type_code) DO UPDATE
  SET
    last_issued_sequence = greatest(
      private.catalog_code_sequences.last_issued_sequence,
      EXCLUDED.last_issued_sequence
    ),
    updated_at = now();

  -- ---------------------------------------------------------------------------
  -- 3. Explicit read posture for frozen authority
  -- ---------------------------------------------------------------------------
  ALTER TABLE public.catalog_code_group_dictionary ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.catalog_first_rollout_mappings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.catalog_first_rollout_source_exclusions ENABLE ROW LEVEL SECURITY;

  REVOKE ALL
    ON TABLE
      public.catalog_code_group_dictionary,
      public.catalog_first_rollout_mappings,
      public.catalog_first_rollout_source_exclusions
    FROM PUBLIC, anon, authenticated;

  GRANT SELECT
    ON TABLE
      public.catalog_code_group_dictionary,
      public.catalog_first_rollout_mappings,
      public.catalog_first_rollout_source_exclusions
    TO authenticated;

  GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE
      public.catalog_code_group_dictionary,
      public.catalog_first_rollout_mappings,
      public.catalog_first_rollout_source_exclusions
    TO service_role;

  DROP POLICY IF EXISTS "catalog_code_group_dictionary_admin_select"
    ON public.catalog_code_group_dictionary;
  CREATE POLICY "catalog_code_group_dictionary_admin_select"
    ON public.catalog_code_group_dictionary
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles profile
        WHERE profile.id = (SELECT auth.uid())
          AND profile.role = 'admin'
          AND profile.status = 'active'
      )
    );

  DROP POLICY IF EXISTS "catalog_first_rollout_mappings_admin_select"
    ON public.catalog_first_rollout_mappings;
  CREATE POLICY "catalog_first_rollout_mappings_admin_select"
    ON public.catalog_first_rollout_mappings
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles profile
        WHERE profile.id = (SELECT auth.uid())
          AND profile.role = 'admin'
          AND profile.status = 'active'
      )
    );

  DROP POLICY IF EXISTS "catalog_first_rollout_exclusions_admin_select"
    ON public.catalog_first_rollout_source_exclusions;
  CREATE POLICY "catalog_first_rollout_exclusions_admin_select"
    ON public.catalog_first_rollout_source_exclusions
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.user_profiles profile
        WHERE profile.id = (SELECT auth.uid())
          AND profile.role = 'admin'
          AND profile.status = 'active'
      )
    );

  -- ---------------------------------------------------------------------------
  -- 4. Compatibility proof and required row/order constraints
  -- ---------------------------------------------------------------------------
  DO $phase4_wp66_required_field_preflight$
  DECLARE
    v_null_required_count integer;
    v_duplicate_order_count integer;
    v_duplicate_change_item_count integer;
    v_duplicate_draft_base_count integer;
    v_missing_archive_count integer;
  BEGIN
    SELECT count(*)::integer
    INTO v_null_required_count
    FROM public.price_list
    WHERE item_code IS NULL
       OR btrim(item_code) = ''
       OR item_name IS NULL
       OR btrim(item_name) = ''
       OR unit IS NULL
       OR btrim(unit) = ''
       OR material_cost IS NULL
       OR labor_cost IS NULL
       OR unit_cost IS NULL
       OR is_active IS NULL
       OR version_id IS NULL
       OR identity_id IS NULL
       OR category_id IS NULL
       OR display_order IS NULL;

    IF v_null_required_count <> 0 THEN
      RAISE EXCEPTION
        'WP-6.6 schema hardening blocked: % price_list rows have null/blank required values',
        v_null_required_count;
    END IF;

    SELECT count(*)::integer
    INTO v_duplicate_order_count
    FROM (
      SELECT version_id, display_order
      FROM public.price_list
      GROUP BY version_id, display_order
      HAVING count(*) > 1
    ) duplicate_order;

    IF v_duplicate_order_count <> 0 THEN
      RAISE EXCEPTION
        'WP-6.6 schema hardening blocked: % duplicate version/display_order positions exist',
        v_duplicate_order_count;
    END IF;

    SELECT count(*)::integer
    INTO v_duplicate_change_item_count
    FROM (
      SELECT change_set_id, identity_id
      FROM public.catalog_change_items
      GROUP BY change_set_id, identity_id
      HAVING count(*) > 1
    ) duplicate_change_item;

    IF v_duplicate_change_item_count <> 0 THEN
      RAISE EXCEPTION
        'WP-6.6 schema hardening blocked: % duplicate change-set/identity audit entries exist',
        v_duplicate_change_item_count;
    END IF;

    SELECT count(*)::integer
    INTO v_duplicate_draft_base_count
    FROM (
      SELECT based_on_version_id
      FROM public.price_list_versions
      WHERE status = 'draft'
        AND based_on_version_id IS NOT NULL
      GROUP BY based_on_version_id
      HAVING count(*) > 1
    ) duplicate_draft_base;

    IF v_duplicate_draft_base_count <> 0 THEN
      RAISE EXCEPTION
        'WP-6.6 P-22 draft hardening blocked: % base versions have multiple mutable drafts',
        v_duplicate_draft_base_count;
    END IF;

    SELECT count(*)::integer
    INTO v_missing_archive_count
    FROM public.price_list_versions
    WHERE based_on_version_id IS NOT NULL
      AND status NOT IN ('draft', 'abandoned')
      AND NULLIF(btrim(physical_archive_reference), '') IS NULL;

    IF v_missing_archive_count <> 0 THEN
      RAISE EXCEPTION
        'WP-6.6 provenance hardening blocked: % published derived versions need an audited physical archive reference or a clean Local rebuild',
        v_missing_archive_count;
    END IF;
  END;
  $phase4_wp66_required_field_preflight$;

  ALTER TABLE public.price_list
    ALTER COLUMN material_cost SET NOT NULL,
    ALTER COLUMN labor_cost SET NOT NULL,
    ALTER COLUMN unit_cost SET NOT NULL,
    ALTER COLUMN is_active SET NOT NULL,
    ALTER COLUMN identity_id SET NOT NULL,
    ALTER COLUMN category_id SET NOT NULL,
    ALTER COLUMN display_order SET NOT NULL;

  ALTER TABLE public.price_list_versions
    DROP CONSTRAINT IF EXISTS price_list_versions_status_check;
  ALTER TABLE public.price_list_versions
    ADD CONSTRAINT price_list_versions_status_check
    CHECK (status IN ('draft', 'active', 'archived', 'abandoned'));

  ALTER TABLE public.catalog_change_sets
    DROP CONSTRAINT IF EXISTS catalog_change_sets_change_type_check;
  ALTER TABLE public.catalog_change_sets
    ADD CONSTRAINT catalog_change_sets_change_type_check
    CHECK (change_type IN ('clone', 'import', 'manual', 'abandon', 'publish', 'restore'));

  CREATE UNIQUE INDEX IF NOT EXISTS uq_price_list_versions_one_draft_per_base
    ON public.price_list_versions (based_on_version_id)
    WHERE status = 'draft';

  DO $phase4_wp66_constraints$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'uq_price_list_version_display_order'
        AND conrelid = 'public.price_list'::regclass
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT uq_price_list_version_display_order
        UNIQUE (version_id, display_order);
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'uq_catalog_change_items_set_identity'
        AND conrelid = 'public.catalog_change_items'::regclass
    ) THEN
      ALTER TABLE public.catalog_change_items
        ADD CONSTRAINT uq_catalog_change_items_set_identity
        UNIQUE (change_set_id, identity_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'check_price_list_canonical_group_required'
        AND conrelid = 'public.price_list'::regclass
    ) THEN
      ALTER TABLE public.price_list
        ADD CONSTRAINT check_price_list_canonical_group_required
        CHECK (
          item_code !~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'
          OR code_group_id IS NOT NULL
        ) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'check_price_list_versions_physical_archive_reference'
        AND conrelid = 'public.price_list_versions'::regclass
    ) THEN
      ALTER TABLE public.price_list_versions
        ADD CONSTRAINT check_price_list_versions_physical_archive_reference
        CHECK (
          physical_archive_reference IS NULL
          OR (
            btrim(physical_archive_reference) <> ''
            AND length(physical_archive_reference) <= 500
          )
        ) NOT VALID;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'check_phase4_published_archive_reference'
        AND conrelid = 'public.price_list_versions'::regclass
    ) THEN
      ALTER TABLE public.price_list_versions
        ADD CONSTRAINT check_phase4_published_archive_reference
        CHECK (
          based_on_version_id IS NULL
          OR status IN ('draft', 'abandoned')
          OR physical_archive_reference IS NOT NULL
        ) NOT VALID;
    END IF;
  END;
  $phase4_wp66_constraints$;

  ALTER TABLE public.price_list
    VALIDATE CONSTRAINT check_price_list_canonical_group_required;
  ALTER TABLE public.price_list_versions
    VALIDATE CONSTRAINT check_price_list_versions_physical_archive_reference;
  ALTER TABLE public.price_list_versions
    VALIDATE CONSTRAINT check_phase4_published_archive_reference;

  ALTER TABLE public.catalog_change_items
    DROP CONSTRAINT IF EXISTS catalog_change_items_action_check;
  ALTER TABLE public.catalog_change_items
    DROP CONSTRAINT IF EXISTS check_catalog_change_items_snapshots;

  ALTER TABLE public.catalog_change_items
    ADD CONSTRAINT catalog_change_items_action_check
    CHECK (action IN ('add', 'update', 'retire', 'recode', 'reactivate', 'withdraw'));
  ALTER TABLE public.catalog_change_items
    DROP CONSTRAINT IF EXISTS check_catalog_change_items_price_authority_reference;
  ALTER TABLE public.catalog_change_items
    ADD CONSTRAINT check_catalog_change_items_price_authority_reference CHECK (
      price_authority_reference IS NULL
      OR (
        btrim(price_authority_reference) <> ''
        AND length(price_authority_reference) <= 500
      )
    );
  ALTER TABLE public.catalog_change_items
    ADD CONSTRAINT check_catalog_change_items_snapshots CHECK (
      (action = 'add' AND old_values IS NULL AND new_values IS NOT NULL)
      OR
      (action = 'withdraw' AND old_values IS NOT NULL AND new_values IS NULL)
      OR
      (
        action = 'retire'
        AND old_values IS NOT NULL
        AND (
          new_values IS NULL
          OR new_values->>'isActive' = 'false'
        )
      )
      OR
      (action IN ('update', 'recode', 'reactivate')
        AND old_values IS NOT NULL
        AND new_values IS NOT NULL)
    );

  CREATE INDEX IF NOT EXISTS idx_price_list_versions_created_id
    ON public.price_list_versions (created_at DESC, id DESC);
  CREATE INDEX IF NOT EXISTS idx_catalog_imports_created_id
    ON public.catalog_imports (created_at DESC, id DESC);
  CREATE INDEX IF NOT EXISTS idx_catalog_change_sets_created_id
    ON public.catalog_change_sets (created_at DESC, id DESC);

  -- ---------------------------------------------------------------------------
  -- 5. Resolve-only dictionary helpers and server-owned code allocator
  -- ---------------------------------------------------------------------------
  CREATE OR REPLACE FUNCTION private.catalog_ensure_category(
    p_version_id uuid,
    p_category_code text
  )
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT category.id
    FROM public.price_list_categories category
    WHERE category.version_id = p_version_id
      AND category.code = NULLIF(btrim(p_category_code), '')
    LIMIT 1;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_ensure_code_group(
    p_version_id uuid,
    p_work_context_code text,
    p_item_type_code text,
    p_work_context_name_th text,
    p_item_type_name_th text
  )
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT version_group.id
    FROM public.catalog_code_groups version_group
    JOIN public.catalog_code_group_dictionary dictionary
      ON dictionary.work_context_code = version_group.work_context_code
     AND dictionary.item_type_code = version_group.item_type_code
    WHERE version_group.version_id = p_version_id
      AND version_group.work_context_code = NULLIF(btrim(p_work_context_code), '')
      AND version_group.item_type_code = NULLIF(btrim(p_item_type_code), '')
      AND (
        NULLIF(btrim(p_work_context_name_th), '') IS NULL
        OR dictionary.work_context_name_th = NULLIF(btrim(p_work_context_name_th), '')
      )
      AND (
        NULLIF(btrim(p_item_type_name_th), '') IS NULL
        OR dictionary.item_type_name_th = NULLIF(btrim(p_item_type_name_th), '')
      )
    LIMIT 1;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_resolve_category(
    p_version_id uuid,
    p_category_id uuid,
    p_category_code text DEFAULT NULL
  )
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT category.id
    FROM public.price_list_categories category
    WHERE category.version_id = p_version_id
      AND category.id = p_category_id
      AND (
        NULLIF(btrim(p_category_code), '') IS NULL
        OR category.code = NULLIF(btrim(p_category_code), '')
      )
    LIMIT 1;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_resolve_code_group(
    p_version_id uuid,
    p_code_group_id uuid,
    p_work_context_code text DEFAULT NULL,
    p_item_type_code text DEFAULT NULL
  )
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT version_group.id
    FROM public.catalog_code_groups version_group
    JOIN public.catalog_code_group_dictionary dictionary
      ON dictionary.work_context_code = version_group.work_context_code
     AND dictionary.item_type_code = version_group.item_type_code
    WHERE version_group.version_id = p_version_id
      AND version_group.id = p_code_group_id
      AND (
        NULLIF(btrim(p_work_context_code), '') IS NULL
        OR version_group.work_context_code = NULLIF(btrim(p_work_context_code), '')
      )
      AND (
        NULLIF(btrim(p_item_type_code), '') IS NULL
        OR version_group.item_type_code = NULLIF(btrim(p_item_type_code), '')
      )
    LIMIT 1;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_allocate_code(
    p_version_id uuid,
    p_code_group_id uuid
  )
  RETURNS text
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_work_context_code text;
    v_item_type_code text;
    v_next_sequence integer;
    v_item_code text;
  BEGIN
    SELECT version_group.work_context_code, version_group.item_type_code
    INTO v_work_context_code, v_item_type_code
    FROM public.catalog_code_groups version_group
    JOIN public.catalog_code_group_dictionary dictionary
      ON dictionary.work_context_code = version_group.work_context_code
     AND dictionary.item_type_code = version_group.item_type_code
    WHERE version_group.version_id = p_version_id
      AND version_group.id = p_code_group_id;

    IF NOT FOUND THEN
      RETURN NULL;
    END IF;

    SELECT code_sequence.last_issued_sequence + 1
    INTO v_next_sequence
    FROM private.catalog_code_sequences code_sequence
    WHERE code_sequence.work_context_code = v_work_context_code
      AND code_sequence.item_type_code = v_item_type_code
    FOR UPDATE;

    IF NOT FOUND OR v_next_sequence >= 900 THEN
      RETURN NULL;
    END IF;

    v_item_code := format(
      '%s-%s-%s',
      v_work_context_code,
      v_item_type_code,
      lpad(v_next_sequence::text, 3, '0')
    );

    IF EXISTS (
      SELECT 1 FROM public.catalog_item_codes code WHERE code.item_code = v_item_code
    ) OR EXISTS (
      SELECT 1
      FROM public.catalog_first_rollout_mappings mapping
      WHERE mapping.target_item_code = v_item_code
    ) THEN
      RAISE EXCEPTION
        'CATALOG_CODE_SEQUENCE_DRIFT: allocator sequence conflicts with reserved code %',
        v_item_code;
    END IF;

    UPDATE private.catalog_code_sequences
    SET
      last_issued_sequence = v_next_sequence,
      updated_at = now()
    WHERE work_context_code = v_work_context_code
      AND item_type_code = v_item_type_code;

    RETURN v_item_code;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_first_rollout_target_valid(
    p_identity_id uuid,
    p_target_item_code text
  )
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT EXISTS (
      SELECT 1
      FROM public.catalog_first_rollout_mappings mapping
      WHERE mapping.identity_id = p_identity_id
        AND mapping.target_item_code = p_target_item_code
    );
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_parse_iso_date(p_value text)
  RETURNS date
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_date date;
  BEGIN
    IF p_value IS NULL OR p_value !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
      RETURN NULL;
    END IF;

    BEGIN
      v_date := p_value::date;
    EXCEPTION
      WHEN datetime_field_overflow OR invalid_datetime_format THEN
        RETURN NULL;
    END;

    IF to_char(v_date, 'YYYY-MM-DD') IS DISTINCT FROM p_value THEN
      RETURN NULL;
    END IF;

    RETURN v_date;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.catalog_capability_enabled(p_key text)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT COALESCE((
      SELECT setting.value = 'true'::jsonb
      FROM public.app_settings setting
      WHERE setting.key = p_key
    ), false);
  $function$;

  CREATE OR REPLACE FUNCTION private.create_catalog_draft_guarded_impl(
    p_base_version_id uuid,
    p_version_major integer,
    p_version_minor integer,
    p_version_patch integer,
    p_name text,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  SET lock_timeout = '5s'
  SET statement_timeout = '30s'
  AS $function$
  DECLARE
    v_constraint_name text;
  BEGIN
    BEGIN
      RETURN private.create_catalog_draft_impl(
        p_base_version_id,
        p_version_major,
        p_version_minor,
        p_version_patch,
        p_name,
        p_reason,
        p_request_id
      );
    EXCEPTION
      WHEN unique_violation THEN
        GET STACKED DIAGNOSTICS v_constraint_name = CONSTRAINT_NAME;

        IF v_constraint_name = 'uq_price_list_versions_one_draft_per_base' THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'DRAFT_ALREADY_EXISTS',
            'A mutable draft already exists for this base catalog version',
            false
          );
        END IF;

        RAISE;
    END;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.abandon_catalog_draft_impl(
    p_version_id uuid,
    p_expected_lock_version integer,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  SET lock_timeout = '5s'
  SET statement_timeout = '30s'
  AS $function$
  DECLARE
    v_actor_id uuid;
    v_actor_display_name text;
    v_reason text;
    v_request_fingerprint text;
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_draft public.price_list_versions%ROWTYPE;
    v_current_version_id uuid;
    v_change_set_id uuid;
    v_after_lock integer;
  BEGIN
    SELECT actor_id, actor_display_name
    INTO v_actor_id, v_actor_display_name
    FROM private.catalog_admin_context();

    IF v_actor_id IS NULL THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'FORBIDDEN',
        'Active admin profile is required',
        false
      );
    END IF;

    IF NOT private.catalog_admin_enabled() THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'FORBIDDEN',
        'Master Catalog admin gate is disabled',
        false
      );
    END IF;

    v_reason := NULLIF(btrim(p_reason), '');

    IF p_version_id IS NULL
       OR p_request_id IS NULL
       OR p_expected_lock_version IS NULL
       OR p_expected_lock_version < 0
       OR v_reason IS NULL
       OR length(v_reason) > 500 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'VALIDATION_FAILED',
        'Draft, expected lock version, reason, and request ID are required',
        false
      );
    END IF;

    v_request_fingerprint := private.catalog_request_fingerprint(
      'abandon_draft',
      jsonb_build_object(
        'versionId', p_version_id,
        'expectedLockVersion', p_expected_lock_version,
        'reason', v_reason
      )
    );

    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('master_catalog_request:' || p_request_id::text, 0)
    );

    SELECT *
    INTO v_existing_change
    FROM public.catalog_change_sets
    WHERE request_id = p_request_id;

    IF FOUND THEN
      IF v_existing_change.change_type IS DISTINCT FROM 'abandon'
         OR v_existing_change.actor_id IS DISTINCT FROM v_actor_id
         OR v_existing_change.request_fingerprint IS DISTINCT FROM v_request_fingerprint THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'REQUEST_ID_PAYLOAD_MISMATCH',
          'Request ID was already used with a different catalog operation or payload',
          false
        );
      END IF;

      SELECT *
      INTO v_draft
      FROM public.price_list_versions
      WHERE id = v_existing_change.version_id;

      RETURN private.catalog_action_success(
        p_request_id,
        jsonb_build_object(
          'versionId', v_existing_change.version_id::text,
          'versionString', v_draft.version_string,
          'status', v_draft.status,
          'lockVersion', v_existing_change.after_lock_version,
          'changeSetId', v_existing_change.id::text,
          'duplicateRequest', true
        )
      );
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.catalog_imports
      WHERE request_id = p_request_id
    ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'REQUEST_ID_PAYLOAD_MISMATCH',
        'Request ID was already used with a different catalog operation or payload',
        false
      );
    END IF;

    SELECT version_id
    INTO v_current_version_id
    FROM public.price_list_default_version
    WHERE id = true
    FOR UPDATE;

    SELECT *
    INTO v_draft
    FROM public.price_list_versions
    WHERE id = p_version_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'DRAFT_NOT_FOUND',
        'Draft catalog version was not found',
        false
      );
    END IF;

    IF v_draft.status <> 'draft' THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'DRAFT_NOT_EDITABLE',
        'Only a mutable draft can be abandoned',
        false
      );
    END IF;

    IF v_draft.based_on_version_id IS DISTINCT FROM v_current_version_id THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'DRAFT_BASE_STALE',
        'A stale draft remains read-only and does not need abandonment before a new current-base draft',
        false
      );
    END IF;

    IF v_draft.lock_version IS DISTINCT FROM p_expected_lock_version THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'DRAFT_LOCK_CONFLICT',
        'Draft lock version is stale',
        true
      );
    END IF;

    v_after_lock := v_draft.lock_version + 1;

    INSERT INTO public.catalog_change_sets (
      version_id,
      change_type,
      reason,
      request_id,
      request_fingerprint,
      actor_id,
      actor_display_name,
      before_lock_version,
      after_lock_version
    )
    VALUES (
      v_draft.id,
      'abandon',
      v_reason,
      p_request_id,
      v_request_fingerprint,
      v_actor_id,
      v_actor_display_name,
      v_draft.lock_version,
      v_after_lock
    )
    RETURNING id INTO v_change_set_id;

    UPDATE public.price_list_versions
    SET
      status = 'abandoned',
      lock_version = v_after_lock,
      updated_at = now()
    WHERE id = v_draft.id;

    RETURN private.catalog_action_success(
      p_request_id,
      jsonb_build_object(
        'versionId', v_draft.id::text,
        'versionString', v_draft.version_string,
        'status', 'abandoned',
        'lockVersion', v_after_lock,
        'changeSetId', v_change_set_id::text,
        'duplicateRequest', false
      )
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION public.create_catalog_draft(
    p_base_version_id uuid,
    p_version_major integer,
    p_version_minor integer,
    p_version_patch integer,
    p_name text,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
    SELECT private.create_catalog_draft_guarded_impl(
      p_base_version_id,
      p_version_major,
      p_version_minor,
      p_version_patch,
      p_name,
      p_reason,
      p_request_id
    );
  $function$;

  CREATE OR REPLACE FUNCTION public.abandon_catalog_draft(
    p_version_id uuid,
    p_expected_lock_version integer,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
    SELECT private.abandon_catalog_draft_impl(
      p_version_id,
      p_expected_lock_version,
      p_reason,
      p_request_id
    );
  $function$;

  CREATE OR REPLACE FUNCTION private.apply_catalog_changes_impl(
    p_version_id uuid,
    p_change_payload jsonb,
    p_expected_lock_version integer,
    p_reason text,
    p_request_id uuid,
    p_import_id uuid DEFAULT NULL
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  SET lock_timeout = '5s'
  SET statement_timeout = '30s'
  AS $function$
  DECLARE
    v_actor_id uuid;
    v_actor_display_name text;
    v_reason text;
    v_operation text;
    v_payload jsonb;
    v_rows jsonb;
    v_source jsonb;
    v_mode text;
    v_payload_schema text;
    v_normalized_hash text;
    v_request_fingerprint text;
    v_import public.catalog_imports%ROWTYPE;
    v_draft public.price_list_versions%ROWTYPE;
    v_current_version_id uuid;
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_change_set_id uuid;
    v_before_lock integer;
    v_after_lock integer;
    v_changed_count integer := 0;
    v_seen_identity_ids uuid[] := ARRAY[]::uuid[];
    v_validation_seen_identity_ids uuid[] := ARRAY[]::uuid[];
    v_validation_seen_item_codes text[] := ARRAY[]::text[];
    v_active_count integer;
    v_retire_count integer := 0;
    v_retire_threshold integer;
    v_retirement_reference text;
    v_retirement_confirmed integer;
    v_row jsonb;
    v_action text;
    v_identity_outcome text;
    v_legacy_code text;
    v_new_code text;
    v_target_identity_id uuid;
    v_existing public.price_list%ROWTYPE;
    v_after public.price_list%ROWTYPE;
    v_existing_code_identity_id uuid;
    v_identity_id uuid;
    v_category_id uuid;
    v_category_input_id uuid;
    v_code_group_id uuid;
    v_code_group_input_id uuid;
    v_item_name text;
    v_unit text;
    v_material_text text;
    v_labor_text text;
    v_unit_text text;
    v_material numeric(12,2);
    v_labor numeric(12,2);
    v_unit_cost numeric(12,2);
    v_category_code text;
    v_work_context_code text;
    v_item_type_code text;
    v_price_authority text;
    v_batch_price_authority text;
    v_base_has_identity boolean;
    v_code_suffix integer;
    v_old_snapshot jsonb;
    v_abort_code text;
    v_abort_message text;
  BEGIN
    SELECT actor_id, actor_display_name
    INTO v_actor_id, v_actor_display_name
    FROM private.catalog_admin_context();

    IF v_actor_id IS NULL THEN
      RETURN private.catalog_action_error(p_request_id, 'FORBIDDEN', 'Active admin profile is required', false);
    END IF;

    IF NOT private.catalog_admin_enabled() THEN
      RETURN private.catalog_action_error(p_request_id, 'FORBIDDEN', 'Master Catalog admin gate is disabled', false);
    END IF;

    v_reason := NULLIF(btrim(p_reason), '');

    IF p_request_id IS NULL OR v_reason IS NULL OR length(v_reason) > 500 THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Reason and request ID are required', false);
    END IF;

    IF p_expected_lock_version IS NULL OR p_expected_lock_version < 0 THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Expected lock version is required', false);
    END IF;

    IF p_change_payload IS NULL OR jsonb_typeof(p_change_payload) <> 'object' THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Change payload must be a JSON object', false);
    END IF;

    v_operation := p_change_payload->>'operation';

    IF v_operation NOT IN ('manual', 'import_validate', 'import_apply') THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Change operation is not recognized', false);
    END IF;

    v_request_fingerprint := private.catalog_request_fingerprint(
      v_operation,
      jsonb_build_object(
        'versionId', p_version_id,
        'expectedLockVersion', p_expected_lock_version,
        'reason', v_reason,
        'importId', p_import_id,
        'changePayload', p_change_payload
      )
    );

    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('master_catalog_request:' || p_request_id::text, 0)
    );

    IF v_operation = 'import_validate' THEN
      SELECT *
      INTO v_import
      FROM public.catalog_imports
      WHERE request_id = p_request_id;

      IF FOUND THEN
        IF v_import.created_by IS DISTINCT FROM v_actor_id
           OR v_import.request_fingerprint IS DISTINCT FROM v_request_fingerprint THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'REQUEST_ID_PAYLOAD_MISMATCH',
            'Request ID was already used with a different catalog operation or payload',
            false
          );
        END IF;

        RETURN private.catalog_action_success(
          p_request_id,
          jsonb_build_object(
            'importId', v_import.id::text,
            'versionId', v_import.version_id::text,
            'status', v_import.status,
            'normalizedPayloadHash', v_import.normalized_payload_hash,
            'duplicateRequest', true
          )
        );
      END IF;

      IF EXISTS (SELECT 1 FROM public.catalog_change_sets WHERE request_id = p_request_id) THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'REQUEST_ID_PAYLOAD_MISMATCH',
          'Request ID was already used with a different catalog operation or payload',
          false
        );
      END IF;
    ELSE
      SELECT *
      INTO v_existing_change
      FROM public.catalog_change_sets
      WHERE request_id = p_request_id;

      IF FOUND THEN
        IF v_existing_change.actor_id IS DISTINCT FROM v_actor_id
           OR v_existing_change.request_fingerprint IS DISTINCT FROM v_request_fingerprint
           OR v_existing_change.change_type IS DISTINCT FROM (
             CASE
               WHEN v_operation = 'import_apply' THEN 'import'
               ELSE 'manual'
             END
           ) THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'REQUEST_ID_PAYLOAD_MISMATCH',
            'Request ID was already used with a different catalog operation or payload',
            false
          );
        END IF;

        RETURN private.catalog_action_success(
          p_request_id,
          jsonb_build_object(
            'changeSetId', v_existing_change.id::text,
            'versionId', v_existing_change.version_id::text,
            'lockVersion', v_existing_change.after_lock_version,
            'duplicateRequest', true
          )
        );
      END IF;

      IF EXISTS (SELECT 1 FROM public.catalog_imports WHERE request_id = p_request_id) THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'REQUEST_ID_PAYLOAD_MISMATCH',
          'Request ID was already used with a different catalog operation or payload',
          false
        );
      END IF;
    END IF;

    SELECT *
    INTO v_draft
    FROM public.price_list_versions
    WHERE id = p_version_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_NOT_FOUND', 'Draft catalog version was not found', false);
    END IF;

    IF v_draft.status <> 'draft' THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_NOT_EDITABLE', 'Only draft catalog versions can be changed', false);
    END IF;

    SELECT version_id
    INTO v_current_version_id
    FROM public.price_list_default_version
    WHERE id = true;

    IF v_draft.based_on_version_id IS DISTINCT FROM v_current_version_id THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_BASE_STALE', 'Draft base is no longer the current catalog default', false);
    END IF;

    IF v_draft.lock_version <> p_expected_lock_version THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_LOCK_CONFLICT', 'Draft lock version is stale', true);
    END IF;

    IF v_operation IN ('import_validate', 'import_apply') THEN
      v_payload := p_change_payload->'payload';

      IF v_payload IS NULL OR jsonb_typeof(v_payload) <> 'object' THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import payload is required', false);
      END IF;

      v_payload_schema := v_payload->>'schemaVersion';

      IF v_payload_schema NOT IN ('catalog-import-payload/1', 'catalog-import-payload/2') THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import payload schema is not supported', false);
      END IF;

      IF v_payload->>'versionId' IS DISTINCT FROM p_version_id::text THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import payload version does not match the draft', false);
      END IF;

      IF COALESCE(v_payload->>'expectedLockVersion', '') !~ '^(0|[1-9][0-9]*)$'
         OR length(v_payload->>'expectedLockVersion') > 9
         OR (v_payload->>'expectedLockVersion')::integer IS DISTINCT FROM p_expected_lock_version THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import payload lock version does not match the request', false);
      END IF;

      v_mode := v_payload->>'mode';

      IF v_mode NOT IN ('full', 'supplement') THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import mode is not recognized', false);
      END IF;

      v_normalized_hash := p_change_payload->>'normalizedPayloadHash';

      IF v_normalized_hash IS NULL OR v_normalized_hash !~ '^[0-9a-f]{64}$' THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Normalized payload hash must be 64 lowercase hex characters', false);
      END IF;

      v_source := v_payload->'source';

      IF v_source IS NULL OR jsonb_typeof(v_source) <> 'object' THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import source metadata is required', false);
      END IF;

      IF NULLIF(btrim(v_payload->>'parserProfileId'), '') IS NULL
         OR NULLIF(btrim(v_payload->>'parserProfileVersion'), '') IS NULL
         OR NULLIF(btrim(v_source->>'filename'), '') IS NULL
         OR position('/' in COALESCE(v_source->>'filename', '')) <> 0
         OR position(chr(92) in COALESCE(v_source->>'filename', '')) <> 0
         OR COALESCE(v_source->>'sizeBytes', '') !~ '^[1-9][0-9]{0,7}$'
         OR COALESCE(v_source->>'sha256', '') !~ '^[0-9a-f]{64}$'
         OR NULLIF(btrim(v_source->>'physicalArchiveReference'), '') IS NULL
         OR length(v_source->>'physicalArchiveReference') > 500 THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'VALIDATION_FAILED',
          'Import parser and source metadata are incomplete or invalid',
          false
        );
      END IF;

      IF (v_source->>'sizeBytes')::bigint > 20971520 THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import source file exceeds the supported size', false);
      END IF;

      v_batch_price_authority := NULLIF(btrim(v_payload->>'priceAuthorityReference'), '');

      IF v_batch_price_authority IS NOT NULL
         AND length(v_batch_price_authority) > 500 THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Price authority reference is too long', false);
      END IF;
    END IF;

    IF v_operation = 'import_validate' THEN
      IF v_payload->>'requestId' IS DISTINCT FROM p_request_id::text THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import validation request ID mismatch', false);
      END IF;

    END IF;

    IF v_operation = 'manual' THEN
      v_rows := p_change_payload->'changes';
      v_mode := 'supplement';
    ELSIF v_operation = 'import_validate' THEN
      v_rows := v_payload->'rows';
    ELSE
      IF p_import_id IS NULL THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Validated import ID is required for import apply', false);
      END IF;

      SELECT *
      INTO v_import
      FROM public.catalog_imports
      WHERE id = p_import_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Validated import was not found', false);
      END IF;

      IF v_import.status <> 'validated' THEN
        RETURN private.catalog_action_error(p_request_id, 'REQUEST_ALREADY_PROCESSED', 'Import has already been applied or rejected', false);
      END IF;

      IF v_import.version_id IS DISTINCT FROM p_version_id
         OR v_import.normalized_payload_hash IS DISTINCT FROM v_normalized_hash THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Import apply payload does not match the validated import record', false);
      END IF;

      v_rows := v_payload->'rows';
    END IF;

    IF v_rows IS NULL OR jsonb_typeof(v_rows) <> 'array' OR jsonb_array_length(v_rows) = 0 THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'At least one draft change row is required', false);
    END IF;

    IF v_mode = 'full' THEN
      FOR v_row IN SELECT value FROM jsonb_array_elements(v_rows) AS t(value) LOOP
        v_identity_outcome := v_row->>'identityOutcome';

        IF v_identity_outcome IS DISTINCT FROM 'candidate_add' THEN
          v_legacy_code := NULLIF(btrim(v_row->>'legacyItemCode'), '');
          v_new_code := NULLIF(btrim(COALESCE(v_row->>'canonicalCode', v_row->>'itemCode')), '');
          v_target_identity_id := NULL;

          IF NULLIF(btrim(v_row->>'targetIdentityId'), '') IS NOT NULL THEN
            IF NOT private.catalog_is_uuid(v_row->>'targetIdentityId') THEN
              RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Target identity ID is not a valid UUID', false);
            END IF;
            v_target_identity_id := (v_row->>'targetIdentityId')::uuid;
          END IF;

          SELECT *
          INTO v_existing
          FROM public.price_list
          WHERE version_id = p_version_id
            AND (
              (v_target_identity_id IS NOT NULL AND identity_id = v_target_identity_id)
              OR
              (v_legacy_code IS NOT NULL AND item_code = v_legacy_code)
              OR (v_new_code IS NOT NULL AND item_code = v_new_code)
            )
          ORDER BY
            CASE WHEN identity_id = v_target_identity_id THEN 0 ELSE 1 END,
            CASE WHEN item_code = v_legacy_code THEN 0 ELSE 1 END
          LIMIT 1;

          IF FOUND THEN
            IF NOT (v_existing.identity_id = ANY(v_seen_identity_ids)) THEN
              v_seen_identity_ids := array_append(v_seen_identity_ids, v_existing.identity_id);
            ELSE
              RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Import payload references the same catalog identity more than once', false);
            END IF;
          END IF;
        END IF;
      END LOOP;

      SELECT count(*)
      INTO v_active_count
      FROM public.price_list
      WHERE version_id = p_version_id
        AND is_active = true;

      SELECT count(*)
      INTO v_retire_count
      FROM public.price_list
      WHERE version_id = p_version_id
        AND is_active = true
        AND NOT (identity_id = ANY(v_seen_identity_ids));

      v_retire_threshold := greatest(10, ceil(v_active_count * 0.02)::integer);
      v_retirement_reference := NULLIF(btrim(v_payload->>'retirementApprovalReference'), '');
      v_retirement_confirmed := NULL;

      IF NULLIF(btrim(v_payload->>'retirementConfirmedCount'), '') IS NOT NULL THEN
        IF (v_payload->>'retirementConfirmedCount') !~ '^(0|[1-9][0-9]*)$'
           OR length(v_payload->>'retirementConfirmedCount') > 9 THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Confirmed retirement count must be a nonnegative integer', false);
        END IF;
        v_retirement_confirmed := (v_payload->>'retirementConfirmedCount')::integer;
      END IF;

      IF v_retire_count >= v_retire_threshold
         AND (
           v_retirement_reference IS NULL
           OR v_retirement_confirmed IS DISTINCT FROM v_retire_count
         ) THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
          'Full import retirement count requires exact owner approval evidence',
          false,
          jsonb_build_array(jsonb_build_object(
            'field', 'retirementConfirmedCount',
            'code', 'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
            'message', 'Confirmed retirement count must match the server-computed count'
          ))
        );
      END IF;

      IF v_retire_count > 0
         AND NOT private.catalog_capability_enabled('catalog_retirement_enabled') THEN
        RETURN private.catalog_action_error(
          p_request_id,
          'CATALOG_RETIREMENT_DISABLED',
          'Retirement effects are not enabled for this release gate',
          false
        );
      END IF;
    END IF;

    v_validation_seen_identity_ids := ARRAY[]::uuid[];

    FOR v_row IN SELECT value FROM jsonb_array_elements(v_rows) AS t(value) LOOP
      v_identity_outcome := v_row->>'identityOutcome';
      v_action := COALESCE(NULLIF(btrim(v_row->>'action'), ''), CASE
        WHEN v_identity_outcome = 'candidate_add' THEN 'add'
        WHEN v_identity_outcome = 'retire' THEN 'retire'
        WHEN v_identity_outcome = 'recode' THEN 'recode'
        WHEN v_identity_outcome = 'retain' THEN 'retain'
        ELSE 'update'
      END);
      v_legacy_code := NULLIF(btrim(v_row->>'legacyItemCode'), '');
      v_new_code := NULLIF(btrim(COALESCE(
        v_row->>'targetItemCode',
        v_row->>'canonicalCode',
        v_row->>'itemCode'
      )), '');
      v_price_authority := COALESCE(
        NULLIF(btrim(v_row->>'priceAuthorityReference'), ''),
        v_batch_price_authority
      );

      IF v_price_authority IS NOT NULL AND length(v_price_authority) > 500 THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Price authority reference is too long', false);
      END IF;
      v_target_identity_id := NULL;
      v_category_input_id := NULL;
      v_code_group_input_id := NULL;

      IF NULLIF(btrim(v_row->>'targetIdentityId'), '') IS NOT NULL THEN
        IF NOT private.catalog_is_uuid(v_row->>'targetIdentityId') THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Target identity ID is not a valid UUID', false);
        END IF;
        v_target_identity_id := (v_row->>'targetIdentityId')::uuid;
      END IF;

      IF NULLIF(btrim(v_row->>'categoryId'), '') IS NOT NULL THEN
        IF NOT private.catalog_is_uuid(v_row->>'categoryId') THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Category ID is not a valid UUID', false);
        END IF;
        v_category_input_id := (v_row->>'categoryId')::uuid;
      END IF;

      IF NULLIF(btrim(v_row->>'codeGroupId'), '') IS NOT NULL THEN
        IF NOT private.catalog_is_uuid(v_row->>'codeGroupId') THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Code group ID is not a valid UUID', false);
        END IF;
        v_code_group_input_id := (v_row->>'codeGroupId')::uuid;
      END IF;

      IF v_action NOT IN (
        'add',
        'update',
        'retire',
        'recode',
        'reactivate',
        'withdraw',
        'retain'
      ) THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Draft change action is not recognized', false);
      END IF;

      IF v_action = 'retain' AND v_operation = 'manual' THEN
        RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Retain is an import reconciliation outcome, not a manual action', false);
      END IF;

      IF v_new_code IS NOT NULL
         AND v_new_code !~ '^ITEM-[0-9]{4}$' THEN
        IF v_new_code !~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$' THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Canonical item code is not in the approved format', false);
        END IF;

        v_code_suffix := substring(v_new_code from '-([0-9]{3})$')::integer;

        IF v_code_suffix >= 900 THEN
          RETURN private.catalog_action_error(p_request_id, 'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED', 'Catalog code sequence capacity review is required', false);
        END IF;

        IF v_new_code = ANY(v_validation_seen_item_codes) THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'IMPORT_RECONCILIATION_REQUIRED',
            'Change payload assigns the same canonical code more than once',
            false
          );
        END IF;

        v_validation_seen_item_codes := array_append(v_validation_seen_item_codes, v_new_code);
      END IF;

      IF v_action = 'add' THEN
        IF NOT private.catalog_capability_enabled('catalog_new_identity_enabled') THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'CATALOG_NEW_IDENTITY_DISABLED',
            'Adding new catalog identities is not enabled for this release gate',
            false
          );
        END IF;

        IF v_target_identity_id IS NOT NULL OR v_legacy_code IS NOT NULL THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'New catalog rows must not claim an existing identity', false);
        END IF;

        IF v_new_code IS NOT NULL THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'CATALOG_CODE_SERVER_ALLOCATION_REQUIRED',
            'New catalog rows must select an approved code group and let the server allocate the code',
            false
          );
        END IF;

        IF v_price_authority IS NULL THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_PRICE_AUTHORITY_REQUIRED', 'New catalog rows require price authority evidence', false);
        END IF;

        v_item_name := NULLIF(btrim(v_row->>'itemName'), '');
        v_unit := NULLIF(btrim(v_row->>'unit'), '');
        v_material_text := NULLIF(btrim(v_row->>'materialCost'), '');
        v_labor_text := NULLIF(btrim(v_row->>'laborCost'), '');
        v_unit_text := NULLIF(btrim(v_row->>'unitCost'), '');

        IF v_item_name IS NULL OR v_unit IS NULL
           OR NOT private.catalog_is_money(v_material_text)
           OR NOT private.catalog_is_money(v_labor_text)
           OR NOT private.catalog_is_money(v_unit_text) THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'New catalog rows require complete item, unit, and money fields', false);
        END IF;

        v_material := v_material_text::numeric;
        v_labor := v_labor_text::numeric;
        v_unit_cost := v_unit_text::numeric;

        IF v_material + v_labor <> v_unit_cost THEN
          RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Material and labor costs must equal unit cost', false);
        END IF;

        v_category_code := NULLIF(btrim(v_row->>'categoryCode'), '');
        v_work_context_code := NULLIF(btrim(v_row->>'workContextCode'), '');
        v_item_type_code := NULLIF(btrim(v_row->>'itemTypeCode'), '');

        IF v_category_input_id IS NOT NULL THEN
          v_category_id := private.catalog_resolve_category(
            p_version_id,
            v_category_input_id,
            v_category_code
          );
        ELSE
          v_category_id := private.catalog_ensure_category(p_version_id, v_category_code);
        END IF;

        IF v_code_group_input_id IS NOT NULL THEN
          v_code_group_id := private.catalog_resolve_code_group(
            p_version_id,
            v_code_group_input_id,
            v_work_context_code,
            v_item_type_code
          );
        ELSE
          v_code_group_id := private.catalog_ensure_code_group(
            p_version_id,
            v_work_context_code,
            v_item_type_code,
            NULLIF(btrim(v_row->>'workContextNameTh'), ''),
            NULLIF(btrim(v_row->>'itemTypeNameTh'), '')
          );
        END IF;

        IF v_category_id IS NULL OR v_code_group_id IS NULL THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'CATALOG_AUTHORITY_NOT_FOUND',
            'Category and code group must resolve to the approved versioned dictionaries',
            false
          );
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM private.catalog_code_sequences code_sequence
          JOIN public.catalog_code_groups version_group
            ON version_group.version_id = p_version_id
           AND version_group.id = v_code_group_id
           AND version_group.work_context_code = code_sequence.work_context_code
           AND version_group.item_type_code = code_sequence.item_type_code
          WHERE code_sequence.last_issued_sequence + 1 < 900
        ) THEN
          RETURN private.catalog_action_error(
            p_request_id,
            'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED',
            'Catalog code sequence capacity review is required',
            false
          );
        END IF;
      ELSE
        SELECT *
        INTO v_existing
        FROM public.price_list
        WHERE version_id = p_version_id
          AND (
            (v_target_identity_id IS NOT NULL AND identity_id = v_target_identity_id)
            OR
            (v_legacy_code IS NOT NULL AND item_code = v_legacy_code)
            OR (v_new_code IS NOT NULL AND item_code = v_new_code)
          )
        ORDER BY
          CASE WHEN identity_id = v_target_identity_id THEN 0 ELSE 1 END,
          CASE WHEN item_code = v_legacy_code THEN 0 ELSE 1 END
        LIMIT 1;

        IF NOT FOUND THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Existing draft row could not be resolved from the supplied code', false);
        END IF;

        IF v_existing.identity_id = ANY(v_validation_seen_identity_ids) THEN
          RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Change payload references the same catalog identity more than once', false);
        END IF;

        v_validation_seen_identity_ids := array_append(
          v_validation_seen_identity_ids,
          v_existing.identity_id
        );

        IF v_new_code IS NULL AND v_action <> 'recode' THEN
          v_new_code := v_existing.item_code;
        END IF;

        SELECT EXISTS (
          SELECT 1
          FROM public.price_list base
          WHERE base.version_id = v_draft.based_on_version_id
            AND base.identity_id = v_existing.identity_id
        ) INTO v_base_has_identity;

        IF v_action = 'retire' THEN
          IF NOT private.catalog_capability_enabled('catalog_retirement_enabled') THEN
            RETURN private.catalog_action_error(
              p_request_id,
              'CATALOG_RETIREMENT_DISABLED',
              'Retiring catalog identities is not enabled for this release gate',
              false
            );
          END IF;

          IF NOT v_existing.is_active THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Only an active catalog row can be retired', false);
          END IF;
          IF NOT v_base_has_identity THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'A draft-only new identity must be withdrawn instead of retired', false);
          END IF;
        ELSIF v_action = 'reactivate' THEN
          IF v_existing.is_active OR NOT v_base_has_identity THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Reactivate requires an inactive identity inherited from the base version', false);
          END IF;
        ELSIF v_action = 'withdraw' THEN
          IF v_base_has_identity OR EXISTS (
            SELECT 1
            FROM public.price_list published_row
            JOIN public.price_list_versions published_version
              ON published_version.id = published_row.version_id
             AND published_version.status IN ('active', 'archived')
            WHERE published_row.identity_id = v_existing.identity_id
          ) THEN
            RETURN private.catalog_action_error(
              p_request_id,
              'CATALOG_WITHDRAW_NOT_ALLOWED',
              'Only a never-published identity created in this draft can be withdrawn',
              false
            );
          END IF;
        ELSE
          v_item_name := COALESCE(NULLIF(btrim(v_row->>'itemName'), ''), v_existing.item_name);
          v_unit := COALESCE(NULLIF(btrim(v_row->>'unit'), ''), v_existing.unit);
          v_material_text := NULLIF(btrim(v_row->>'materialCost'), '');
          v_labor_text := NULLIF(btrim(v_row->>'laborCost'), '');
          v_unit_text := NULLIF(btrim(v_row->>'unitCost'), '');

          IF (v_material_text IS NOT NULL AND NOT private.catalog_is_money(v_material_text))
             OR (v_labor_text IS NOT NULL AND NOT private.catalog_is_money(v_labor_text))
             OR (v_unit_text IS NOT NULL AND NOT private.catalog_is_money(v_unit_text)) THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Money fields must be two-decimal strings', false);
          END IF;

          v_material := COALESCE(v_material_text::numeric, v_existing.material_cost);
          v_labor := COALESCE(v_labor_text::numeric, v_existing.labor_cost);
          v_unit_cost := COALESCE(v_unit_text::numeric, v_existing.unit_cost);

          IF v_material + v_labor <> v_unit_cost THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Material and labor costs must equal unit cost', false);
          END IF;

          IF (
            v_item_name IS DISTINCT FROM v_existing.item_name
            OR v_unit IS DISTINCT FROM v_existing.unit
            OR v_material IS DISTINCT FROM v_existing.material_cost
            OR v_labor IS DISTINCT FROM v_existing.labor_cost
            OR v_unit_cost IS DISTINCT FROM v_existing.unit_cost
          ) AND v_price_authority IS NULL THEN
            RETURN private.catalog_action_error(p_request_id, 'IMPORT_PRICE_AUTHORITY_REQUIRED', 'Name, unit, or price changes require explicit authority evidence', false);
          END IF;

          v_category_code := NULLIF(btrim(v_row->>'categoryCode'), '');
          v_work_context_code := NULLIF(btrim(v_row->>'workContextCode'), '');
          v_item_type_code := NULLIF(btrim(v_row->>'itemTypeCode'), '');

          IF v_category_input_id IS NOT NULL THEN
            v_category_id := private.catalog_resolve_category(
              p_version_id,
              v_category_input_id,
              v_category_code
            );
          ELSIF v_category_code IS NOT NULL THEN
            v_category_id := private.catalog_ensure_category(p_version_id, v_category_code);
          ELSE
            v_category_id := v_existing.category_id;
          END IF;

          IF v_category_id IS NULL THEN
            RETURN private.catalog_action_error(
              p_request_id,
              'CATALOG_AUTHORITY_NOT_FOUND',
              'Category must resolve to the approved versioned dictionary',
              false
            );
          END IF;

          IF v_code_group_input_id IS NOT NULL THEN
            v_code_group_id := private.catalog_resolve_code_group(
              p_version_id,
              v_code_group_input_id,
              v_work_context_code,
              v_item_type_code
            );
          ELSIF v_work_context_code IS NOT NULL OR v_item_type_code IS NOT NULL THEN
            v_code_group_id := private.catalog_ensure_code_group(
              p_version_id,
              v_work_context_code,
              v_item_type_code,
              NULLIF(btrim(v_row->>'workContextNameTh'), ''),
              NULLIF(btrim(v_row->>'itemTypeNameTh'), '')
            );
          ELSE
            v_code_group_id := v_existing.code_group_id;
          END IF;

          IF v_action = 'recode' THEN
            IF v_code_group_id IS NULL THEN
              RETURN private.catalog_action_error(
                p_request_id,
                'CATALOG_AUTHORITY_NOT_FOUND',
                'Recode requires an approved code group',
                false
              );
            END IF;

            IF (v_new_code IS NULL OR v_new_code IS NOT DISTINCT FROM v_existing.item_code)
               AND v_code_group_id IS NOT DISTINCT FROM v_existing.code_group_id THEN
              RETURN private.catalog_action_error(
                p_request_id,
                'VALIDATION_FAILED',
                'Ordinary recode requires a different approved code group',
                false
              );
            END IF;

            IF v_new_code IS NOT NULL AND v_new_code IS DISTINCT FROM v_existing.item_code THEN
              IF NOT private.catalog_first_rollout_target_valid(
                v_existing.identity_id,
                v_new_code
              ) THEN
                RETURN private.catalog_action_error(
                  p_request_id,
                  'CATALOG_CODE_SERVER_ALLOCATION_REQUIRED',
                  'Explicit recode is allowed only for the frozen first-rollout mapping; otherwise the server allocates the code',
                  false
                );
              END IF;

              IF NOT EXISTS (
                SELECT 1
                FROM public.catalog_code_groups version_group
                WHERE version_group.id = v_code_group_id
                  AND version_group.version_id = p_version_id
                  AND version_group.work_context_code = substring(v_new_code from '^([A-Z0-9]{3})-')
                  AND version_group.item_type_code = substring(v_new_code from '^[A-Z0-9]{3}-([A-Z0-9]{3})-')
              ) THEN
                RETURN private.catalog_action_error(p_request_id, 'CATALOG_AUTHORITY_NOT_FOUND', 'Target code does not match the selected approved code group', false);
              END IF;
            ELSIF NOT EXISTS (
              SELECT 1
              FROM private.catalog_code_sequences code_sequence
              JOIN public.catalog_code_groups version_group
                ON version_group.version_id = p_version_id
               AND version_group.id = v_code_group_id
               AND version_group.work_context_code = code_sequence.work_context_code
               AND version_group.item_type_code = code_sequence.item_type_code
              WHERE code_sequence.last_issued_sequence + 1 < 900
            ) THEN
              RETURN private.catalog_action_error(
                p_request_id,
                'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED',
                'Catalog code sequence capacity review is required',
                false
              );
            END IF;
          ELSIF v_new_code IS NOT NULL AND v_new_code IS DISTINCT FROM v_existing.item_code THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Only recode may change an item code', false);
          ELSIF v_code_group_id IS DISTINCT FROM v_existing.code_group_id THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Code group can change only as part of recode', false);
          END IF;

          IF v_new_code IS NOT NULL AND v_new_code IS DISTINCT FROM v_existing.item_code THEN
            SELECT identity_id
            INTO v_existing_code_identity_id
            FROM public.catalog_item_codes
            WHERE item_code = v_new_code;

            IF FOUND AND v_existing_code_identity_id IS DISTINCT FROM v_existing.identity_id THEN
              RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Catalog code is already allocated to a different identity', false);
            END IF;
          END IF;

          IF v_action = 'retain' AND (
            v_new_code IS DISTINCT FROM v_existing.item_code
            OR v_item_name IS DISTINCT FROM v_existing.item_name
            OR v_unit IS DISTINCT FROM v_existing.unit
            OR v_material IS DISTINCT FROM v_existing.material_cost
            OR v_labor IS DISTINCT FROM v_existing.labor_cost
            OR v_unit_cost IS DISTINCT FROM v_existing.unit_cost
            OR v_category_id IS DISTINCT FROM v_existing.category_id
            OR v_code_group_id IS DISTINCT FROM v_existing.code_group_id
          ) THEN
            RETURN private.catalog_action_error(p_request_id, 'IMPORT_RECONCILIATION_REQUIRED', 'Retained import rows must match the exact draft identity state', false);
          END IF;

          IF v_action = 'update' AND (
            v_item_name IS NOT DISTINCT FROM v_existing.item_name
            AND v_unit IS NOT DISTINCT FROM v_existing.unit
            AND v_material IS NOT DISTINCT FROM v_existing.material_cost
            AND v_labor IS NOT DISTINCT FROM v_existing.labor_cost
            AND v_unit_cost IS NOT DISTINCT FROM v_existing.unit_cost
            AND v_category_id IS NOT DISTINCT FROM v_existing.category_id
          ) THEN
            RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Update does not change any catalog field', false);
          END IF;
        END IF;
      END IF;
    END LOOP;

    IF v_operation = 'import_validate' THEN
      INSERT INTO public.catalog_imports (
        version_id,
        mode,
        parser_profile_id,
        parser_profile_version,
        source_filename,
        source_file_size,
        source_file_sha256,
        physical_archive_reference,
        retirement_approval_reference,
        normalized_payload_hash,
        status,
        request_id,
        request_fingerprint,
        created_by
      )
      VALUES (
        p_version_id,
        v_mode,
        v_payload->>'parserProfileId',
        v_payload->>'parserProfileVersion',
        v_source->>'filename',
        (v_source->>'sizeBytes')::bigint,
        v_source->>'sha256',
        v_source->>'physicalArchiveReference',
        NULLIF(btrim(v_payload->>'retirementApprovalReference'), ''),
        v_normalized_hash,
        'validated',
        p_request_id,
        v_request_fingerprint,
        v_actor_id
      )
      RETURNING * INTO v_import;

      RETURN private.catalog_action_success(
        p_request_id,
        jsonb_build_object(
          'importId', v_import.id::text,
          'versionId', v_import.version_id::text,
          'status', v_import.status,
          'normalizedPayloadHash', v_import.normalized_payload_hash,
          'duplicateRequest', false
        )
      );
    END IF;

    v_before_lock := v_draft.lock_version;
    v_after_lock := v_before_lock + 1;

    BEGIN
      INSERT INTO public.catalog_change_sets (
        version_id,
        import_id,
        change_type,
        reason,
        request_id,
        request_fingerprint,
        actor_id,
        actor_display_name,
        before_lock_version,
        after_lock_version
      )
      VALUES (
        p_version_id,
        CASE WHEN v_operation = 'import_apply' THEN p_import_id ELSE NULL END,
        CASE WHEN v_operation = 'import_apply' THEN 'import' ELSE 'manual' END,
        v_reason,
        p_request_id,
        v_request_fingerprint,
        v_actor_id,
        v_actor_display_name,
        v_before_lock,
        v_after_lock
      )
      RETURNING id INTO v_change_set_id;

      -- Any structured rejection after this point must raise CATALOG_MUTATION_ABORT
      -- so this subtransaction removes the change set and every partial row write.
      FOR v_row IN SELECT value FROM jsonb_array_elements(v_rows) AS t(value) LOOP
        v_identity_outcome := v_row->>'identityOutcome';
        v_action := COALESCE(NULLIF(btrim(v_row->>'action'), ''), CASE
          WHEN v_identity_outcome = 'candidate_add' THEN 'add'
          WHEN v_identity_outcome = 'retire' THEN 'retire'
          WHEN v_identity_outcome = 'recode' THEN 'recode'
          WHEN v_identity_outcome = 'retain' THEN 'retain'
          ELSE 'update'
        END);
        v_legacy_code := NULLIF(btrim(v_row->>'legacyItemCode'), '');
        v_new_code := NULLIF(btrim(COALESCE(
          v_row->>'targetItemCode',
          v_row->>'canonicalCode',
          v_row->>'itemCode'
        )), '');
        v_price_authority := COALESCE(
          NULLIF(btrim(v_row->>'priceAuthorityReference'), ''),
          v_batch_price_authority
        );
        v_target_identity_id := NULL;
        v_category_input_id := NULL;
        v_code_group_input_id := NULL;

        IF NULLIF(btrim(v_row->>'targetIdentityId'), '') IS NOT NULL THEN
          v_target_identity_id := (v_row->>'targetIdentityId')::uuid;
        END IF;

        IF NULLIF(btrim(v_row->>'categoryId'), '') IS NOT NULL THEN
          v_category_input_id := (v_row->>'categoryId')::uuid;
        END IF;

        IF NULLIF(btrim(v_row->>'codeGroupId'), '') IS NOT NULL THEN
          v_code_group_input_id := (v_row->>'codeGroupId')::uuid;
        END IF;

        IF v_action = 'add' THEN
          v_item_name := NULLIF(btrim(v_row->>'itemName'), '');
          v_unit := NULLIF(btrim(v_row->>'unit'), '');
          v_material := (v_row->>'materialCost')::numeric;
          v_labor := (v_row->>'laborCost')::numeric;
          v_unit_cost := (v_row->>'unitCost')::numeric;
          v_category_code := NULLIF(btrim(v_row->>'categoryCode'), '');
          v_work_context_code := NULLIF(btrim(v_row->>'workContextCode'), '');
          v_item_type_code := NULLIF(btrim(v_row->>'itemTypeCode'), '');

          IF v_category_input_id IS NOT NULL THEN
            v_category_id := private.catalog_resolve_category(
              p_version_id,
              v_category_input_id,
              v_category_code
            );
          ELSE
            v_category_id := private.catalog_ensure_category(
              p_version_id,
              v_category_code
            );
          END IF;

          IF v_code_group_input_id IS NOT NULL THEN
            v_code_group_id := private.catalog_resolve_code_group(
              p_version_id,
              v_code_group_input_id,
              v_work_context_code,
              v_item_type_code
            );
          ELSE
            v_code_group_id := private.catalog_ensure_code_group(
              p_version_id,
              v_work_context_code,
              v_item_type_code,
              NULLIF(btrim(v_row->>'workContextNameTh'), ''),
              NULLIF(btrim(v_row->>'itemTypeNameTh'), '')
            );
          END IF;

          SELECT category.code
          INTO v_category_code
          FROM public.price_list_categories category
          WHERE category.version_id = p_version_id
            AND category.id = v_category_id;

          v_new_code := private.catalog_allocate_code(
            p_version_id,
            v_code_group_id
          );

          IF v_new_code IS NULL THEN
            v_abort_code := 'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED';
            v_abort_message := 'Catalog code sequence capacity review is required';
            RAISE EXCEPTION 'CATALOG_MUTATION_ABORT';
          END IF;

          PERFORM pg_catalog.pg_advisory_xact_lock(
            pg_catalog.hashtextextended('master_catalog_code:' || v_new_code, 0)
          );

          SELECT identity_id
          INTO v_existing_code_identity_id
          FROM public.catalog_item_codes
          WHERE item_code = v_new_code;

          IF FOUND THEN
            v_abort_code := 'IMPORT_RECONCILIATION_REQUIRED';
            v_abort_message := 'Catalog code was allocated while applying the draft mutation';
            RAISE EXCEPTION 'CATALOG_MUTATION_ABORT';
          END IF;

          INSERT INTO public.catalog_item_identities (created_by)
          VALUES (v_actor_id)
          RETURNING id INTO v_identity_id;

          INSERT INTO public.catalog_item_codes (
            item_code,
            identity_id,
            code_kind,
            first_seen_version_id,
            created_by
          )
          VALUES (
            v_new_code,
            v_identity_id,
            'canonical',
            p_version_id,
            v_actor_id
          );

          INSERT INTO public.price_list (
            item_code,
            item_name,
            unit,
            material_cost,
            labor_cost,
            unit_cost,
            category,
            is_active,
            version_id,
            identity_id,
            category_id,
            code_group_id,
            display_order
          )
          VALUES (
            v_new_code,
            v_item_name,
            v_unit,
            v_material,
            v_labor,
            v_unit_cost,
            v_category_code,
            true,
            p_version_id,
            v_identity_id,
            v_category_id,
            v_code_group_id,
            COALESCE((
              SELECT max(display_order) + 1
              FROM public.price_list
              WHERE version_id = p_version_id
            ), 0)
          )
          RETURNING * INTO v_after;

          INSERT INTO public.catalog_change_items (
            change_set_id,
            identity_id,
            action,
            old_values,
            new_values,
            price_authority_reference
          )
          VALUES (
            v_change_set_id,
            v_identity_id,
            'add',
            NULL,
            private.catalog_price_row_snapshot(v_after),
            v_price_authority
          );

          v_changed_count := v_changed_count + 1;
          v_seen_identity_ids := array_append(v_seen_identity_ids, v_identity_id);
        ELSE
          SELECT *
          INTO v_existing
          FROM public.price_list
          WHERE version_id = p_version_id
            AND (
              (v_target_identity_id IS NOT NULL AND identity_id = v_target_identity_id)
              OR
              (v_legacy_code IS NOT NULL AND item_code = v_legacy_code)
              OR (v_new_code IS NOT NULL AND item_code = v_new_code)
            )
          ORDER BY
            CASE WHEN identity_id = v_target_identity_id THEN 0 ELSE 1 END,
            CASE WHEN item_code = v_legacy_code THEN 0 ELSE 1 END
          LIMIT 1
          FOR UPDATE;

          IF NOT FOUND THEN
            v_abort_code := 'IMPORT_RECONCILIATION_REQUIRED';
            v_abort_message := 'Existing draft row changed while applying the mutation';
            RAISE EXCEPTION 'CATALOG_MUTATION_ABORT';
          END IF;

          IF NOT (v_existing.identity_id = ANY(v_seen_identity_ids)) THEN
            v_seen_identity_ids := array_append(
              v_seen_identity_ids,
              v_existing.identity_id
            );
          END IF;

          IF v_action = 'retire' THEN
            v_old_snapshot := private.catalog_price_row_snapshot(v_existing);

            UPDATE public.price_list
            SET
              is_active = false,
              updated_at = now()
            WHERE id = v_existing.id
            RETURNING * INTO v_after;

            INSERT INTO public.catalog_change_items (
              change_set_id,
              identity_id,
              action,
              old_values,
              new_values
            )
            VALUES (
              v_change_set_id,
              v_existing.identity_id,
              'retire',
              v_old_snapshot,
              private.catalog_price_row_snapshot(v_after)
            );

            v_changed_count := v_changed_count + 1;
          ELSIF v_action = 'reactivate' THEN
            v_old_snapshot := private.catalog_price_row_snapshot(v_existing);

            UPDATE public.price_list
            SET
              is_active = true,
              updated_at = now()
            WHERE id = v_existing.id
            RETURNING * INTO v_after;

            INSERT INTO public.catalog_change_items (
              change_set_id,
              identity_id,
              action,
              old_values,
              new_values
            )
            VALUES (
              v_change_set_id,
              v_existing.identity_id,
              'reactivate',
              v_old_snapshot,
              private.catalog_price_row_snapshot(v_after)
            );

            v_changed_count := v_changed_count + 1;
          ELSIF v_action = 'withdraw' THEN
            v_old_snapshot := private.catalog_price_row_snapshot(v_existing);

            DELETE FROM public.price_list
            WHERE id = v_existing.id;

            INSERT INTO public.catalog_change_items (
              change_set_id,
              identity_id,
              action,
              old_values,
              new_values
            )
            VALUES (
              v_change_set_id,
              v_existing.identity_id,
              'withdraw',
              v_old_snapshot,
              NULL
            );

            v_changed_count := v_changed_count + 1;
          ELSIF v_action = 'retain' THEN
            CONTINUE;
          ELSE
            v_item_name := COALESCE(NULLIF(btrim(v_row->>'itemName'), ''), v_existing.item_name);
            v_unit := COALESCE(NULLIF(btrim(v_row->>'unit'), ''), v_existing.unit);
            v_material_text := NULLIF(btrim(v_row->>'materialCost'), '');
            v_labor_text := NULLIF(btrim(v_row->>'laborCost'), '');
            v_unit_text := NULLIF(btrim(v_row->>'unitCost'), '');

            v_material := COALESCE(v_material_text::numeric, v_existing.material_cost);
            v_labor := COALESCE(v_labor_text::numeric, v_existing.labor_cost);
            v_unit_cost := COALESCE(v_unit_text::numeric, v_existing.unit_cost);
            v_category_code := NULLIF(btrim(v_row->>'categoryCode'), '');
            v_work_context_code := NULLIF(btrim(v_row->>'workContextCode'), '');
            v_item_type_code := NULLIF(btrim(v_row->>'itemTypeCode'), '');

            IF v_category_input_id IS NOT NULL THEN
              v_category_id := private.catalog_resolve_category(
                p_version_id,
                v_category_input_id,
                v_category_code
              );
            ELSIF v_category_code IS NOT NULL THEN
              v_category_id := private.catalog_ensure_category(
                p_version_id,
                v_category_code
              );
            ELSE
              v_category_id := v_existing.category_id;
            END IF;

            SELECT category.code
            INTO v_category_code
            FROM public.price_list_categories category
            WHERE category.version_id = p_version_id
              AND category.id = v_category_id;

            IF v_code_group_input_id IS NOT NULL THEN
              v_code_group_id := private.catalog_resolve_code_group(
                p_version_id,
                v_code_group_input_id,
                v_work_context_code,
                v_item_type_code
              );
            ELSIF v_work_context_code IS NOT NULL OR v_item_type_code IS NOT NULL THEN
              v_code_group_id := private.catalog_ensure_code_group(
                p_version_id,
                v_work_context_code,
                v_item_type_code,
                NULLIF(btrim(v_row->>'workContextNameTh'), ''),
                NULLIF(btrim(v_row->>'itemTypeNameTh'), '')
              );
            ELSE
              v_code_group_id := v_existing.code_group_id;
            END IF;

            IF v_action = 'recode' THEN
              IF v_new_code IS NULL OR v_new_code IS NOT DISTINCT FROM v_existing.item_code THEN
                v_new_code := private.catalog_allocate_code(
                  p_version_id,
                  v_code_group_id
                );
              END IF;

              IF v_new_code IS NULL THEN
                v_abort_code := 'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED';
                v_abort_message := 'Catalog code sequence capacity review is required';
                RAISE EXCEPTION 'CATALOG_MUTATION_ABORT';
              END IF;

              PERFORM pg_catalog.pg_advisory_xact_lock(
                pg_catalog.hashtextextended('master_catalog_code:' || v_new_code, 0)
              );

              SELECT identity_id
              INTO v_existing_code_identity_id
              FROM public.catalog_item_codes
              WHERE item_code = v_new_code;

              IF FOUND AND v_existing_code_identity_id IS DISTINCT FROM v_existing.identity_id THEN
                v_abort_code := 'IMPORT_RECONCILIATION_REQUIRED';
                v_abort_message := 'Catalog code was allocated while applying the draft mutation';
                RAISE EXCEPTION 'CATALOG_MUTATION_ABORT';
              END IF;

              INSERT INTO public.catalog_item_codes (
                item_code,
                identity_id,
                code_kind,
                first_seen_version_id,
                created_by
              )
              VALUES (
                v_new_code,
                v_existing.identity_id,
                'canonical',
                p_version_id,
                v_actor_id
              )
              ON CONFLICT (item_code) DO NOTHING;
            ELSE
              v_new_code := v_existing.item_code;
            END IF;

            v_old_snapshot := private.catalog_price_row_snapshot(v_existing);

            UPDATE public.price_list
            SET
              item_code = v_new_code,
              item_name = v_item_name,
              unit = v_unit,
              material_cost = v_material,
              labor_cost = v_labor,
              unit_cost = v_unit_cost,
              category = v_category_code,
              category_id = v_category_id,
              code_group_id = v_code_group_id,
              updated_at = now()
            WHERE id = v_existing.id
            RETURNING * INTO v_after;

            INSERT INTO public.catalog_change_items (
              change_set_id,
              identity_id,
              action,
              old_values,
              new_values,
              price_authority_reference
            )
            VALUES (
              v_change_set_id,
              v_existing.identity_id,
              v_action,
              v_old_snapshot,
              private.catalog_price_row_snapshot(v_after),
              v_price_authority
            );

            v_changed_count := v_changed_count + 1;
          END IF;
        END IF;
      END LOOP;

    IF v_mode = 'full' AND v_retire_count > 0 THEN
      FOR v_existing IN
        SELECT *
        FROM public.price_list
        WHERE version_id = p_version_id
          AND is_active = true
          AND NOT (identity_id = ANY(v_seen_identity_ids))
        ORDER BY display_order, item_code
        FOR UPDATE
      LOOP
        v_old_snapshot := private.catalog_price_row_snapshot(v_existing);

        UPDATE public.price_list
        SET
          is_active = false,
          updated_at = now()
        WHERE id = v_existing.id
        RETURNING * INTO v_after;

        INSERT INTO public.catalog_change_items (
          change_set_id,
          identity_id,
          action,
          old_values,
          new_values
        )
        VALUES (
          v_change_set_id,
          v_existing.identity_id,
          'retire',
          v_old_snapshot,
          private.catalog_price_row_snapshot(v_after)
        );

        v_changed_count := v_changed_count + 1;
      END LOOP;
    END IF;

    IF v_changed_count = 0 THEN
      v_abort_code := 'VALIDATION_FAILED';
      v_abort_message := 'Draft mutation did not produce any audited item changes';
      RAISE EXCEPTION 'CATALOG_MUTATION_ABORT';
    END IF;

    UPDATE public.price_list_versions
    SET
      lock_version = v_after_lock,
      item_count = (
        SELECT count(*)::integer
        FROM public.price_list
        WHERE version_id = p_version_id
      ),
      updated_at = now()
    WHERE id = p_version_id;

    IF v_operation = 'import_apply' THEN
      UPDATE public.catalog_imports
      SET
        status = 'applied',
        applied_at = now()
      WHERE id = p_import_id;
    END IF;

    RETURN private.catalog_action_success(
      p_request_id,
      jsonb_build_object(
        'versionId', p_version_id::text,
        'changeSetId', v_change_set_id::text,
        'lockVersion', v_after_lock,
        'changedItems', v_changed_count,
        'retiredByFullImportOmission', CASE WHEN v_mode = 'full' THEN v_retire_count ELSE 0 END,
        'duplicateRequest', false
      )
    );
    EXCEPTION
      WHEN raise_exception THEN
        IF SQLERRM = 'CATALOG_MUTATION_ABORT' THEN
          RETURN private.catalog_action_error(
            p_request_id,
            v_abort_code,
            v_abort_message,
            false
          );
        END IF;

        RAISE;
    END;
  END;
  $function$;


  -- ---------------------------------------------------------------------------
  -- 6. Shared publication readiness and authenticated provenance
  -- ---------------------------------------------------------------------------
  CREATE OR REPLACE FUNCTION private.catalog_publish_readiness(p_version_id uuid)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_version public.price_list_versions%ROWTYPE;
    v_current_version_id uuid;
    v_new_identity_count integer;
    v_active_canonical_code_count integer;
    v_unapproved_legacy_active_count integer;
    v_inactive_row_count integer;
    v_dataset jsonb;
    v_quality jsonb;
    v_quality_passed boolean;
    v_base_is_current boolean;
  BEGIN
    SELECT version_id
    INTO v_current_version_id
    FROM public.price_list_default_version
    WHERE id = true;

    SELECT *
    INTO v_version
    FROM public.price_list_versions
    WHERE id = p_version_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'versionFound', false,
        'versionStatus', null,
        'basedOnVersionId', null,
        'currentVersionId', v_current_version_id,
        'baseIsCurrent', false,
        'newIdentityCount', 0,
        'activeCanonicalCodeCount', 0,
        'structuredCodeGuardApplies', false,
        'unapprovedLegacyActiveCount', 0,
        'inactiveRowCount', 0,
        'retiredPdfPolicyRequired', false,
        'qualityPassed', false,
        'dataset', null,
        'canPublish', false
      );
    END IF;

    SELECT
      count(*) FILTER (
        WHERE NOT EXISTS (
          SELECT 1
          FROM public.price_list base
          WHERE base.version_id = v_version.based_on_version_id
            AND base.identity_id = candidate.identity_id
        )
      )::integer,
      count(*) FILTER (
        WHERE candidate.is_active = true
          AND candidate.item_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$'
      )::integer,
      count(*) FILTER (
        WHERE candidate.is_active = true
          AND candidate.item_code ~ '^ITEM-[0-9]{4}$'
          AND candidate.item_code <> 'ITEM-0139'
      )::integer,
      count(*) FILTER (WHERE candidate.is_active = false)::integer
    INTO
      v_new_identity_count,
      v_active_canonical_code_count,
      v_unapproved_legacy_active_count,
      v_inactive_row_count
    FROM public.price_list candidate
    WHERE candidate.version_id = p_version_id;

    v_dataset := private.catalog_compute_version_dataset(p_version_id);
    v_quality := v_dataset->'quality';
    v_quality_passed :=
      COALESCE((v_dataset->>'itemCount')::integer, 0) > 0
      AND COALESCE((v_dataset->>'activeItemCount')::integer, 0) > 0
      AND COALESCE((v_quality->>'rowCount')::integer, 0)
        = COALESCE((v_quality->>'distinctItemCodes')::integer, -1)
      AND COALESCE((v_quality->>'missingIdentityId')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingCategoryId')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingDisplayOrder')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingRequiredText')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingMoney')::integer, -1) = 0
      AND COALESCE((v_quality->>'costMismatches')::integer, -1) = 0
      AND COALESCE((v_quality->>'invalidItemCodes')::integer, -1) = 0
      AND COALESCE((v_quality->>'missingCanonicalCodeGroup')::integer, -1) = 0
      AND COALESCE((v_quality->>'canonicalCodeGroupMismatch')::integer, -1) = 0;
    v_base_is_current :=
      v_version.based_on_version_id IS NOT NULL
      AND v_version.based_on_version_id IS NOT DISTINCT FROM v_current_version_id;

    RETURN jsonb_build_object(
      'versionFound', true,
      'versionStatus', v_version.status,
      'basedOnVersionId', v_version.based_on_version_id,
      'currentVersionId', v_current_version_id,
      'baseIsCurrent', v_base_is_current,
      'newIdentityCount', COALESCE(v_new_identity_count, 0),
      'activeCanonicalCodeCount', COALESCE(v_active_canonical_code_count, 0),
      'structuredCodeGuardApplies', COALESCE(v_active_canonical_code_count, 0) > 0,
      'unapprovedLegacyActiveCount', CASE
        WHEN COALESCE(v_active_canonical_code_count, 0) > 0
          THEN COALESCE(v_unapproved_legacy_active_count, 0)
        ELSE 0
      END,
      'inactiveRowCount', COALESCE(v_inactive_row_count, 0),
      'retiredPdfPolicyRequired', COALESCE(v_inactive_row_count, 0) > 0,
      'qualityPassed', v_quality_passed,
      'dataset', v_dataset,
      'canPublish',
        v_version.status = 'draft'
        AND v_base_is_current
        AND COALESCE(v_new_identity_count, 0) = 0
        AND (
          COALESCE(v_active_canonical_code_count, 0) = 0
          OR COALESCE(v_unapproved_legacy_active_count, 0) = 0
        )
        AND v_quality_passed
    );
  END;
  $function$;


  CREATE OR REPLACE FUNCTION private.publish_catalog_version_impl(
    p_version_id uuid,
    p_expected_lock_version integer,
    p_approval_metadata jsonb,
    p_reason text,
    p_request_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  SET lock_timeout = '5s'
  SET statement_timeout = '30s'
  AS $function$
  DECLARE
    v_actor_id uuid;
    v_actor_display_name text;
    v_reason text;
    v_effective_date date;
    v_approval_reference text;
    v_approval_document_date date;
    v_physical_archive_reference text;
    v_normalized_approval_metadata jsonb;
    v_current_version_id uuid;
    v_draft public.price_list_versions%ROWTYPE;
    v_base public.price_list_versions%ROWTYPE;
    v_existing_change public.catalog_change_sets%ROWTYPE;
    v_request_fingerprint text;
    v_change_set_id uuid;
    v_dataset jsonb;
    v_quality jsonb;
    v_readiness jsonb;
    v_new_identity_count integer;
    v_unapproved_legacy_active_count integer;
    v_before_lock integer;
    v_after_lock integer;
  BEGIN
    SELECT actor_id, actor_display_name
    INTO v_actor_id, v_actor_display_name
    FROM private.catalog_admin_context();

    IF v_actor_id IS NULL THEN
      RETURN private.catalog_action_error(p_request_id, 'FORBIDDEN', 'Active admin profile is required', false);
    END IF;

    IF NOT private.catalog_admin_enabled() THEN
      RETURN private.catalog_action_error(p_request_id, 'FORBIDDEN', 'Master Catalog admin gate is disabled', false);
    END IF;

    v_reason := NULLIF(btrim(p_reason), '');

    IF p_request_id IS NULL OR v_reason IS NULL OR length(v_reason) > 500 THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Reason and request ID are required', false);
    END IF;

    IF p_expected_lock_version IS NULL OR p_expected_lock_version < 0 THEN
      RETURN private.catalog_action_error(p_request_id, 'VALIDATION_FAILED', 'Expected lock version is required', false);
    END IF;

    IF p_approval_metadata IS NULL OR jsonb_typeof(p_approval_metadata) <> 'object' THEN
      RETURN private.catalog_action_error(p_request_id, 'PUBLICATION_METADATA_REQUIRED', 'Publication approval metadata is required', false);
    END IF;

    v_effective_date := private.catalog_parse_iso_date(
      p_approval_metadata->>'effectiveDate'
    );
    v_approval_reference := NULLIF(
      btrim(p_approval_metadata->>'approvalReference'),
      ''
    );
    v_approval_document_date := private.catalog_parse_iso_date(
      p_approval_metadata->>'approvalDocumentDate'
    );
    v_physical_archive_reference := NULLIF(
      btrim(p_approval_metadata->>'physicalArchiveReference'),
      ''
    );

    IF v_effective_date IS NULL
       OR v_approval_reference IS NULL
       OR length(v_approval_reference) > 500
       OR v_approval_document_date IS NULL
       OR v_physical_archive_reference IS NULL
       OR length(v_physical_archive_reference) > 500 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PUBLICATION_METADATA_REQUIRED',
        'Effective date, approval reference/date, and version archive reference are required',
        false
      );
    END IF;

    v_normalized_approval_metadata := jsonb_build_object(
      'effectiveDate', to_char(v_effective_date, 'YYYY-MM-DD'),
      'approvalReference', v_approval_reference,
      'approvalDocumentDate', to_char(v_approval_document_date, 'YYYY-MM-DD'),
      'physicalArchiveReference', v_physical_archive_reference
    );

    v_request_fingerprint := private.catalog_request_fingerprint(
      'publish',
      jsonb_build_object(
        'versionId', p_version_id,
        'expectedLockVersion', p_expected_lock_version,
        'approvalMetadata', v_normalized_approval_metadata,
        'reason', v_reason
      )
    );

    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('master_catalog_request:' || p_request_id::text, 0)
    );

    SELECT *
    INTO v_existing_change
    FROM public.catalog_change_sets
    WHERE request_id = p_request_id;

    IF FOUND THEN
      IF v_existing_change.change_type = 'publish'
         AND v_existing_change.actor_id IS NOT DISTINCT FROM v_actor_id
         AND v_existing_change.request_fingerprint IS NOT DISTINCT FROM v_request_fingerprint THEN
        SELECT *
        INTO v_draft
        FROM public.price_list_versions
        WHERE id = v_existing_change.version_id;

        RETURN private.catalog_action_success(
          p_request_id,
          jsonb_build_object(
            'versionId', v_existing_change.version_id::text,
            'versionString', v_draft.version_string,
            'lockVersion', v_existing_change.after_lock_version,
            'changeSetId', v_existing_change.id::text,
            'itemCount', v_draft.item_count,
            'datasetHash', v_draft.dataset_hash,
            'publisherDisplayName', v_draft.published_by_display_name,
            'duplicateRequest', true
          )
        );
      END IF;

      RETURN private.catalog_action_error(
        p_request_id,
        'REQUEST_ID_PAYLOAD_MISMATCH',
        'Request ID was already used with a different catalog operation or payload',
        false
      );
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.catalog_imports WHERE request_id = p_request_id
    ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'REQUEST_ID_PAYLOAD_MISMATCH',
        'Request ID was already used with a different catalog operation or payload',
        false
      );
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('master_catalog_publish_pointer', 0)
    );

    SELECT version_id
    INTO v_current_version_id
    FROM public.price_list_default_version
    WHERE id = true
    FOR UPDATE;

    SELECT *
    INTO v_draft
    FROM public.price_list_versions
    WHERE id = p_version_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN private.catalog_action_error(p_request_id, 'VERSION_NOT_FOUND', 'Catalog version was not found', false);
    END IF;

    IF v_draft.status <> 'draft' THEN
      RETURN private.catalog_action_error(p_request_id, 'VERSION_NOT_PUBLISHABLE', 'Only draft catalog versions can be published', false);
    END IF;

    IF v_draft.based_on_version_id IS DISTINCT FROM v_current_version_id THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_BASE_STALE', 'Draft base is no longer the current catalog default', false);
    END IF;

    IF v_draft.lock_version <> p_expected_lock_version THEN
      RETURN private.catalog_action_error(p_request_id, 'DRAFT_LOCK_CONFLICT', 'Draft lock version is stale', true);
    END IF;

    SELECT *
    INTO v_base
    FROM public.price_list_versions
    WHERE id = v_draft.based_on_version_id;

    IF NOT FOUND OR NOT private.catalog_version_transition_valid(
      v_base.major,
      v_base.minor,
      v_base.patch,
      v_draft.major,
      v_draft.minor,
      v_draft.patch
    ) THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'VERSION_TRANSITION_INVALID',
        'Catalog version must be a later ADR-003 annual, revision, or patch transition from its base',
        false
      );
    END IF;

    v_readiness := private.catalog_publish_readiness(p_version_id);
    v_new_identity_count := COALESCE(
      (v_readiness->>'newIdentityCount')::integer,
      0
    );

    IF v_new_identity_count <> 0 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'P18_PLACEMENT_REVIEW_REQUIRED',
        'New or supplement catalog identities require approved placement review before publish',
        false,
        jsonb_build_array(jsonb_build_object(
          'field', 'displayOrder',
          'code', 'P18_PLACEMENT_REVIEW_REQUIRED',
          'message', 'Keep the draft for placement review; no pointer or publication metadata was changed',
          'newIdentityCount', v_new_identity_count
        ))
      );
    END IF;

    v_unapproved_legacy_active_count := COALESCE(
      (v_readiness->>'unapprovedLegacyActiveCount')::integer,
      0
    );

    IF v_unapproved_legacy_active_count <> 0 THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'STRUCTURED_CODE_EXCEPTION_REVIEW_REQUIRED',
        'Active structured catalog rows may retain only the approved ITEM-0139 legacy exception',
        false,
        jsonb_build_array(jsonb_build_object(
          'field', 'itemCode',
          'code', 'STRUCTURED_CODE_EXCEPTION_REVIEW_REQUIRED',
          'message', 'Resolve every other active ITEM-#### code before publish',
          'unapprovedLegacyActiveCount', v_unapproved_legacy_active_count
        ))
      );
    END IF;

    v_dataset := v_readiness->'dataset';
    v_quality := v_dataset->'quality';

    IF COALESCE((v_readiness->>'baseIsCurrent')::boolean, false) IS NOT TRUE
       OR COALESCE((v_readiness->>'qualityPassed')::boolean, false) IS NOT TRUE THEN
      RETURN private.catalog_action_error(
        p_request_id,
        'PUBLICATION_VALIDATION_FAILED',
        'Catalog version is not complete enough to publish',
        false,
        jsonb_build_array(jsonb_build_object(
          'field', 'catalogDataset',
          'code', 'PUBLICATION_VALIDATION_FAILED',
          'message', 'Current base, count, identity, category, code, money, and canonical group checks must pass',
          'baseIsCurrent', v_readiness->'baseIsCurrent',
          'quality', v_quality
        ))
      );
    END IF;

    v_before_lock := v_draft.lock_version;
    v_after_lock := v_before_lock + 1;

    UPDATE public.price_list_versions
    SET
      status = 'active',
      effective_date = v_effective_date,
      approval_reference = v_approval_reference,
      approval_document_date = v_approval_document_date,
      physical_archive_reference = v_physical_archive_reference,
      published_at = now(),
      published_by = v_actor_id,
      published_by_display_name = v_actor_display_name,
      dataset_hash = v_dataset->>'datasetHash',
      item_count = (v_dataset->>'itemCount')::integer,
      lock_version = v_after_lock,
      updated_at = now()
    WHERE id = p_version_id;

    UPDATE public.price_list_default_version
    SET
      version_id = p_version_id,
      updated_at = now()
    WHERE id = true;

    UPDATE public.price_list_versions
    SET
      is_default = false,
      updated_at = now()
    WHERE is_default = true
      AND id <> p_version_id;

    UPDATE public.price_list_versions
    SET
      is_default = true,
      updated_at = now()
    WHERE id = p_version_id;

    INSERT INTO public.catalog_change_sets (
      version_id,
      change_type,
      reason,
      request_id,
      request_fingerprint,
      actor_id,
      actor_display_name,
      before_lock_version,
      after_lock_version
    )
    VALUES (
      p_version_id,
      'publish',
      v_reason,
      p_request_id,
      v_request_fingerprint,
      v_actor_id,
      v_actor_display_name,
      v_before_lock,
      v_after_lock
    )
    RETURNING id INTO v_change_set_id;

    RETURN private.catalog_action_success(
      p_request_id,
      jsonb_build_object(
        'versionId', p_version_id::text,
        'versionString', v_draft.version_string,
        'previousVersionId', v_current_version_id::text,
        'lockVersion', v_after_lock,
        'changeSetId', v_change_set_id::text,
        'itemCount', (v_dataset->>'itemCount')::integer,
        'activeItemCount', (v_dataset->>'activeItemCount')::integer,
        'datasetHash', v_dataset->>'datasetHash',
        'canonicalJsonBytes', (v_dataset->>'canonicalJsonBytes')::integer,
        'publisherDisplayName', v_actor_display_name,
        'duplicateRequest', false
      )
    );
  END;
  $function$;


  CREATE OR REPLACE FUNCTION private.prevent_published_catalog_row_mutation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    v_old_status text;
    v_new_status text;
  BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
      SELECT status
      INTO v_old_status
      FROM public.price_list_versions
      WHERE id = OLD.version_id;

      IF v_old_status IN ('active', 'archived', 'abandoned') THEN
        RAISE EXCEPTION 'CATALOG_IMMUTABLE_ROW: published or abandoned catalog rows cannot be changed';
      END IF;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
      SELECT status
      INTO v_new_status
      FROM public.price_list_versions
      WHERE id = NEW.version_id;

      IF v_new_status IN ('active', 'archived', 'abandoned') THEN
        RAISE EXCEPTION 'CATALOG_IMMUTABLE_ROW: published or abandoned catalog rows cannot be changed';
      END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;

    RETURN NEW;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION private.prevent_published_catalog_version_metadata_mutation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  BEGIN
    IF OLD.status = 'abandoned' AND NEW IS DISTINCT FROM OLD THEN
      RAISE EXCEPTION 'CATALOG_ABANDONED_VERSION_IMMUTABLE: abandoned catalog metadata cannot be changed';
    END IF;

    IF OLD.status IN ('active', 'archived') THEN
      IF NEW.major IS DISTINCT FROM OLD.major
         OR NEW.minor IS DISTINCT FROM OLD.minor
         OR NEW.patch IS DISTINCT FROM OLD.patch
         OR NEW.name IS DISTINCT FROM OLD.name
         OR NEW.status IS DISTINCT FROM OLD.status
         OR NEW.created_by IS DISTINCT FROM OLD.created_by
         OR NEW.created_at IS DISTINCT FROM OLD.created_at
         OR NEW.based_on_version_id IS DISTINCT FROM OLD.based_on_version_id
         OR NEW.effective_date IS DISTINCT FROM OLD.effective_date
         OR NEW.approval_reference IS DISTINCT FROM OLD.approval_reference
         OR NEW.approval_document_date IS DISTINCT FROM OLD.approval_document_date
         OR NEW.physical_archive_reference IS DISTINCT FROM OLD.physical_archive_reference
         OR NEW.published_at IS DISTINCT FROM OLD.published_at
         OR NEW.published_by IS DISTINCT FROM OLD.published_by
         OR NEW.published_by_display_name IS DISTINCT FROM OLD.published_by_display_name
         OR NEW.dataset_hash IS DISTINCT FROM OLD.dataset_hash
         OR NEW.item_count IS DISTINCT FROM OLD.item_count
         OR NEW.lock_version IS DISTINCT FROM OLD.lock_version THEN
        RAISE EXCEPTION 'CATALOG_PUBLISHED_VERSION_IMMUTABLE: published catalog metadata cannot be changed';
      END IF;
    END IF;

    RETURN NEW;
  END;
  $function$;


  -- ---------------------------------------------------------------------------
  -- 7. Deterministic keyset register and identity-history reads
  -- ---------------------------------------------------------------------------
  CREATE OR REPLACE FUNCTION private.catalog_admin_register_page(
    p_register text,
    p_limit integer,
    p_before_created_at timestamptz,
    p_before_id uuid,
    p_version_id uuid,
    p_identity_id uuid
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  SET statement_timeout = '10s'
  AS $function$
  DECLARE
    v_actor_id uuid;
    v_page jsonb;
    v_rows jsonb;
    v_has_more boolean;
    v_next_cursor jsonb;
  BEGIN
    SELECT actor_id
    INTO v_actor_id
    FROM private.catalog_admin_context();

    IF v_actor_id IS NULL OR NOT private.catalog_admin_enabled() THEN
      RAISE EXCEPTION 'CATALOG_FORBIDDEN: active enabled admin profile is required';
    END IF;

    IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
      RAISE EXCEPTION 'CATALOG_VALIDATION_FAILED: page limit must be between 1 and 100';
    END IF;

    IF (p_before_created_at IS NULL) <> (p_before_id IS NULL) THEN
      RAISE EXCEPTION 'CATALOG_VALIDATION_FAILED: both cursor values are required together';
    END IF;

    IF p_register = 'versions' THEN
      SELECT COALESCE(jsonb_agg(to_jsonb(page) ORDER BY page.created_at DESC, page.id DESC), '[]'::jsonb)
      INTO v_page
      FROM (
        SELECT
          version.id,
          version.version_string,
          version.name,
          version.status,
          version.is_default,
          version.based_on_version_id,
          version.effective_date,
          version.approval_reference,
          version.approval_document_date,
          version.physical_archive_reference,
          version.published_at,
          version.published_by_display_name,
          version.dataset_hash,
          version.item_count,
          version.lock_version,
          version.created_at,
          version.updated_at
        FROM public.price_list_versions version
        WHERE p_before_created_at IS NULL
           OR version.created_at < p_before_created_at
           OR (
             version.created_at = p_before_created_at
             AND version.id < p_before_id
           )
        ORDER BY version.created_at DESC, version.id DESC
        LIMIT p_limit + 1
      ) page;
    ELSIF p_register = 'imports' THEN
      SELECT COALESCE(jsonb_agg(to_jsonb(page) ORDER BY page.created_at DESC, page.id DESC), '[]'::jsonb)
      INTO v_page
      FROM (
        SELECT
          catalog_import.id,
          catalog_import.version_id,
          catalog_import.mode,
          catalog_import.parser_profile_id,
          catalog_import.parser_profile_version,
          catalog_import.source_filename,
          catalog_import.source_file_size,
          catalog_import.source_file_sha256,
          catalog_import.physical_archive_reference,
          catalog_import.retirement_approval_reference,
          catalog_import.normalized_payload_hash,
          catalog_import.status,
          catalog_import.error_summary,
          catalog_import.created_at,
          catalog_import.applied_at
        FROM public.catalog_imports catalog_import
        WHERE (p_version_id IS NULL OR catalog_import.version_id = p_version_id)
          AND (
            p_before_created_at IS NULL
            OR catalog_import.created_at < p_before_created_at
            OR (
              catalog_import.created_at = p_before_created_at
              AND catalog_import.id < p_before_id
            )
          )
        ORDER BY catalog_import.created_at DESC, catalog_import.id DESC
        LIMIT p_limit + 1
      ) page;
    ELSIF p_register = 'change_sets' THEN
      SELECT COALESCE(jsonb_agg(to_jsonb(page) ORDER BY page.created_at DESC, page.id DESC), '[]'::jsonb)
      INTO v_page
      FROM (
        SELECT
          change_set.id,
          change_set.version_id,
          change_set.import_id,
          change_set.change_type,
          change_set.reason,
          change_set.actor_id,
          change_set.actor_display_name,
          change_set.before_lock_version,
          change_set.after_lock_version,
          change_set.created_at
        FROM public.catalog_change_sets change_set
        WHERE (p_version_id IS NULL OR change_set.version_id = p_version_id)
          AND (
            p_before_created_at IS NULL
            OR change_set.created_at < p_before_created_at
            OR (
              change_set.created_at = p_before_created_at
              AND change_set.id < p_before_id
            )
          )
        ORDER BY change_set.created_at DESC, change_set.id DESC
        LIMIT p_limit + 1
      ) page;
    ELSIF p_register = 'identity_history' THEN
      IF p_identity_id IS NULL THEN
        RAISE EXCEPTION 'CATALOG_VALIDATION_FAILED: identity history requires an identity ID';
      END IF;

      SELECT COALESCE(jsonb_agg(to_jsonb(page) ORDER BY page.created_at DESC, page.id DESC), '[]'::jsonb)
      INTO v_page
      FROM (
        SELECT
          change_set.id,
          change_set.version_id,
          change_set.import_id,
          change_set.change_type,
          change_set.reason,
          change_set.actor_id,
          change_set.actor_display_name,
          change_set.before_lock_version,
          change_set.after_lock_version,
          change_set.created_at,
          change_item.id AS change_item_id,
          change_item.identity_id,
          change_item.action,
          change_item.old_values,
          change_item.new_values,
          change_item.price_authority_reference
        FROM public.catalog_change_items change_item
        JOIN public.catalog_change_sets change_set
          ON change_set.id = change_item.change_set_id
        WHERE change_item.identity_id = p_identity_id
          AND (
            p_before_created_at IS NULL
            OR change_set.created_at < p_before_created_at
            OR (
              change_set.created_at = p_before_created_at
              AND change_set.id < p_before_id
            )
          )
        ORDER BY change_set.created_at DESC, change_set.id DESC
        LIMIT p_limit + 1
      ) page;
    ELSE
      RAISE EXCEPTION 'CATALOG_VALIDATION_FAILED: register is not recognized';
    END IF;

    v_has_more := jsonb_array_length(v_page) > p_limit;

    SELECT COALESCE(jsonb_agg(entry.value ORDER BY entry.ordinality), '[]'::jsonb)
    INTO v_rows
    FROM jsonb_array_elements(v_page) WITH ORDINALITY AS entry(value, ordinality)
    WHERE entry.ordinality <= p_limit;

    IF v_has_more THEN
      v_next_cursor := jsonb_build_object(
        'createdAt', v_rows->(p_limit - 1)->>'created_at',
        'id', v_rows->(p_limit - 1)->>'id'
      );
    ELSE
      v_next_cursor := NULL;
    END IF;

    RETURN jsonb_build_object(
      'rows', v_rows,
      'nextCursor', v_next_cursor
    );
  END;
  $function$;

  CREATE OR REPLACE FUNCTION public.get_catalog_versions_page(
    p_limit integer DEFAULT 50,
    p_before_created_at timestamptz DEFAULT NULL,
    p_before_id uuid DEFAULT NULL
  )
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
    SELECT private.catalog_admin_register_page(
      'versions',
      p_limit,
      p_before_created_at,
      p_before_id,
      NULL,
      NULL
    );
  $function$;

  CREATE OR REPLACE FUNCTION public.get_catalog_imports_page(
    p_version_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_before_created_at timestamptz DEFAULT NULL,
    p_before_id uuid DEFAULT NULL
  )
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
    SELECT private.catalog_admin_register_page(
      'imports',
      p_limit,
      p_before_created_at,
      p_before_id,
      p_version_id,
      NULL
    );
  $function$;

  CREATE OR REPLACE FUNCTION public.get_catalog_change_sets_page(
    p_version_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_before_created_at timestamptz DEFAULT NULL,
    p_before_id uuid DEFAULT NULL
  )
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
    SELECT private.catalog_admin_register_page(
      'change_sets',
      p_limit,
      p_before_created_at,
      p_before_id,
      p_version_id,
      NULL
    );
  $function$;

  CREATE OR REPLACE FUNCTION public.get_catalog_identity_history_page(
    p_identity_id uuid,
    p_limit integer DEFAULT 50,
    p_before_created_at timestamptz DEFAULT NULL,
    p_before_id uuid DEFAULT NULL
  )
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SECURITY INVOKER
  SET search_path = ''
  AS $function$
    SELECT private.catalog_admin_register_page(
      'identity_history',
      p_limit,
      p_before_created_at,
      p_before_id,
      NULL,
      p_identity_id
    );
  $function$;

  -- ---------------------------------------------------------------------------
  -- 8. Explicit function privileges and migration postconditions
  -- ---------------------------------------------------------------------------
  REVOKE EXECUTE ON FUNCTION private.create_catalog_draft_impl(
    uuid, integer, integer, integer, text, text, uuid
  ) FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.create_catalog_draft_guarded_impl(
    uuid, integer, integer, integer, text, text, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION private.abandon_catalog_draft_impl(
    uuid, integer, text, uuid
  ) FROM PUBLIC, anon;
  GRANT EXECUTE ON FUNCTION private.create_catalog_draft_guarded_impl(
    uuid, integer, integer, integer, text, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION private.abandon_catalog_draft_impl(
    uuid, integer, text, uuid
  ) TO authenticated;

  REVOKE EXECUTE ON FUNCTION public.create_catalog_draft(
    uuid, integer, integer, integer, text, text, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION public.abandon_catalog_draft(
    uuid, integer, text, uuid
  ) FROM PUBLIC, anon;
  GRANT EXECUTE ON FUNCTION public.create_catalog_draft(
    uuid, integer, integer, integer, text, text, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.abandon_catalog_draft(
    uuid, integer, text, uuid
  ) TO authenticated;

  REVOKE EXECUTE ON FUNCTION private.catalog_ensure_category(uuid, text)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_ensure_code_group(uuid, text, text, text, text)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_resolve_category(uuid, uuid, text)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_resolve_code_group(uuid, uuid, text, text)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_allocate_code(uuid, uuid)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_first_rollout_target_valid(uuid, text)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_parse_iso_date(text)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_capability_enabled(text)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_publish_readiness(uuid)
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.prevent_published_catalog_row_mutation()
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.prevent_published_catalog_version_metadata_mutation()
    FROM PUBLIC, anon, authenticated;
  REVOKE EXECUTE ON FUNCTION private.catalog_admin_register_page(
    text, integer, timestamptz, uuid, uuid, uuid
  ) FROM PUBLIC, anon;

  GRANT EXECUTE ON FUNCTION private.catalog_admin_register_page(
    text, integer, timestamptz, uuid, uuid, uuid
  ) TO authenticated;

  REVOKE EXECUTE ON FUNCTION public.get_catalog_versions_page(
    integer, timestamptz, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION public.get_catalog_imports_page(
    uuid, integer, timestamptz, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION public.get_catalog_change_sets_page(
    uuid, integer, timestamptz, uuid
  ) FROM PUBLIC, anon;
  REVOKE EXECUTE ON FUNCTION public.get_catalog_identity_history_page(
    uuid, integer, timestamptz, uuid
  ) FROM PUBLIC, anon;

  GRANT EXECUTE ON FUNCTION public.get_catalog_versions_page(
    integer, timestamptz, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.get_catalog_imports_page(
    uuid, integer, timestamptz, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.get_catalog_change_sets_page(
    uuid, integer, timestamptz, uuid
  ) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.get_catalog_identity_history_page(
    uuid, integer, timestamptz, uuid
  ) TO authenticated;

  ANALYZE public.catalog_code_group_dictionary;
  ANALYZE public.catalog_first_rollout_mappings;
  ANALYZE public.catalog_first_rollout_source_exclusions;

  DO $phase4_wp66_postconditions$
  DECLARE
    v_mapping_count integer;
    v_group_count integer;
    v_exclusion_count integer;
    v_factor_default_count integer;
  BEGIN
    SELECT count(*)::integer
    INTO v_mapping_count
    FROM public.catalog_first_rollout_mappings;

    SELECT count(*)::integer
    INTO v_group_count
    FROM public.catalog_code_group_dictionary;

    SELECT count(*)::integer
    INTO v_exclusion_count
    FROM public.catalog_first_rollout_source_exclusions;

    IF v_mapping_count <> 710 OR v_group_count <> 65 OR v_exclusion_count <> 17 THEN
      RAISE EXCEPTION
        'WP-6.6 postcondition failed: expected authority counts 710/65/17, got %/%/%',
        v_mapping_count,
        v_group_count,
        v_exclusion_count;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.catalog_first_rollout_mappings mapping
      LEFT JOIN public.catalog_item_identities identity_row
        ON identity_row.id = mapping.identity_id
      WHERE identity_row.id IS NULL
    ) THEN
      RAISE EXCEPTION 'WP-6.6 postcondition failed: frozen mapping has an unknown identity';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint constraint_row
      WHERE constraint_row.conrelid = 'public.price_list'::regclass
        AND constraint_row.conname = 'uq_price_list_version_display_order'
        AND constraint_row.convalidated
    ) OR NOT EXISTS (
      SELECT 1
      FROM pg_constraint constraint_row
      WHERE constraint_row.conrelid = 'public.price_list'::regclass
        AND constraint_row.conname = 'check_price_list_canonical_group_required'
        AND constraint_row.convalidated
    ) OR NOT EXISTS (
      SELECT 1
      FROM pg_constraint constraint_row
      WHERE constraint_row.conrelid = 'public.catalog_change_items'::regclass
        AND constraint_row.conname = 'uq_catalog_change_items_set_identity'
        AND constraint_row.convalidated
    ) THEN
      RAISE EXCEPTION 'WP-6.6 postcondition failed: required catalog constraints are not valid';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_class index_relation
      JOIN pg_namespace index_namespace
        ON index_namespace.oid = index_relation.relnamespace
      JOIN pg_index index_definition
        ON index_definition.indexrelid = index_relation.oid
      WHERE index_namespace.nspname = 'public'
        AND index_relation.relname = 'uq_price_list_versions_one_draft_per_base'
        AND index_definition.indisunique
        AND index_definition.indisvalid
        AND index_definition.indpred IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'WP-6.6 P-22 postcondition failed: one-draft-per-base index is missing';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint constraint_row
      WHERE constraint_row.conrelid = 'public.price_list_versions'::regclass
        AND constraint_row.conname = 'price_list_versions_status_check'
        AND constraint_row.convalidated
    ) OR NOT EXISTS (
      SELECT 1
      FROM pg_constraint constraint_row
      WHERE constraint_row.conrelid = 'public.catalog_change_sets'::regclass
        AND constraint_row.conname = 'catalog_change_sets_change_type_check'
        AND constraint_row.convalidated
    ) THEN
      RAISE EXCEPTION 'WP-6.6 P-22 postcondition failed: lifecycle constraints are not valid';
    END IF;

    IF to_regprocedure(
      'public.abandon_catalog_draft(uuid,integer,text,uuid)'
    ) IS NULL OR to_regprocedure(
      'private.abandon_catalog_draft_impl(uuid,integer,text,uuid)'
    ) IS NULL THEN
      RAISE EXCEPTION 'WP-6.6 P-22 postcondition failed: abandon functions are missing';
    END IF;

    IF NOT has_function_privilege(
      'authenticated',
      'public.abandon_catalog_draft(uuid,integer,text,uuid)',
      'EXECUTE'
    ) OR has_function_privilege(
      'anon',
      'public.abandon_catalog_draft(uuid,integer,text,uuid)',
      'EXECUTE'
    ) THEN
      RAISE EXCEPTION 'WP-6.6 P-22 postcondition failed: abandon grants are not least privilege';
    END IF;

    IF has_function_privilege(
      'authenticated',
      'private.create_catalog_draft_impl(uuid,integer,integer,integer,text,text,uuid)',
      'EXECUTE'
    ) THEN
      RAISE EXCEPTION 'WP-6.6 P-22 postcondition failed: guarded draft creation can be bypassed';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns column_row
      WHERE column_row.table_schema = 'public'
        AND column_row.table_name = 'price_list'
        AND column_row.column_name IN (
          'material_cost',
          'labor_cost',
          'unit_cost',
          'is_active',
          'identity_id',
          'category_id',
          'display_order'
        )
        AND column_row.is_nullable <> 'NO'
    ) THEN
      RAISE EXCEPTION 'WP-6.6 postcondition failed: required price-list columns remain nullable';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_class table_row
      JOIN pg_namespace schema_row ON schema_row.oid = table_row.relnamespace
      WHERE schema_row.nspname = 'public'
        AND table_row.relname IN (
          'catalog_code_group_dictionary',
          'catalog_first_rollout_mappings',
          'catalog_first_rollout_source_exclusions'
        )
        AND NOT table_row.relrowsecurity
    ) THEN
      RAISE EXCEPTION 'WP-6.6 postcondition failed: frozen authority RLS is not enabled';
    END IF;

    IF (
      SELECT count(*)
      FROM pg_policies policy
      WHERE policy.schemaname = 'public'
        AND (policy.tablename, policy.policyname) IN (
          ('catalog_code_group_dictionary', 'catalog_code_group_dictionary_admin_select'),
          ('catalog_first_rollout_mappings', 'catalog_first_rollout_mappings_admin_select'),
          ('catalog_first_rollout_source_exclusions', 'catalog_first_rollout_exclusions_admin_select')
        )
    ) <> 3 THEN
      RAISE EXCEPTION 'WP-6.6 postcondition failed: frozen authority admin-select policies are incomplete';
    END IF;

    IF (
      SELECT count(*)
      FROM public.app_settings
      WHERE key IN (
          'catalog_admin_enabled',
          'catalog_new_identity_enabled',
          'catalog_retirement_enabled'
        )
        AND value = 'false'::jsonb
    ) <> 3 THEN
      RAISE EXCEPTION 'WP-6.6 postcondition failed: catalog capability flags are missing or not disabled';
    END IF;

    SELECT count(*)::integer
    INTO v_factor_default_count
    FROM public.factor_reference_default_version
    WHERE id = true;

    IF v_factor_default_count <> 1 THEN
      RAISE EXCEPTION 'WP-6.6 postcondition failed: Factor F default pointer is not singular';
    END IF;
  END;
  $phase4_wp66_postconditions$;

COMMIT;
