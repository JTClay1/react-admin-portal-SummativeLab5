// smoke.test.jsx
// "Does the test runner even run?" sanity check.
// I like having one trivial spec so CI failures are obviously setup-related.

import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('true is true', () => {
    expect(true).toBe(true);
  });
});
