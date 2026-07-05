import { describe, expect, it } from 'vitest';
import { parseEnvFile } from '../scripts/local-env.mjs';

describe('local env parser', () => {
  it('matches Node env-file behavior for inline comments in unquoted local credentials', () => {
    expect(parseEnvFile(`
      LOCAL_TEST_PASSWORD=secret-value#local-note
      LOCAL_SUPABASE_SECRET_KEY=sb_secret_local # comment
      QUOTED_HASH="keeps#hash"
    `)).toMatchObject({
      LOCAL_TEST_PASSWORD: 'secret-value',
      LOCAL_SUPABASE_SECRET_KEY: 'sb_secret_local',
      QUOTED_HASH: 'keeps#hash',
    });
  });
});
