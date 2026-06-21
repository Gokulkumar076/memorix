import { describe, it, expect } from 'vitest'
// Vite's ?raw suffix imports the file's contents as a plain string at
// build time — no Node `fs`/`path` APIs needed, so this works under the
// browser-only tsconfig.app.json without requiring @types/node anywhere
// in the app's compile scope.
import html from '../index.html?raw'

/**
 * Regression guard for the "stale index.html" bug: the Tailwind color
 * tokens were renamed (ink-* -> void-*, ease-* -> mint-*) across every
 * .tsx file via an automated sweep, but index.html is plain HTML — not
 * scanned by that sweep — and kept a hardcoded `bg-ink-950 text-ink-50`
 * body class that no longer existed in the Tailwind config. Since an
 * unrecognized utility class is simply not generated (no error, no
 * warning), the body silently had zero background color and fell
 * through to the browser default white, undermining every other fix.
 *
 * This test reads the actual source index.html and fails if any class
 * name uses a token family that no longer exists in tailwind.config.js.
 */
describe('index.html static markup', () => {
  const staleTokenPatterns = [
    /\bink-\d{2,3}\b/,
    /\bink-50\b/,
    /\bease-\d{3}\b/,
    /\bbg-mesh-synapse\b/,
  ]

  it('contains no stale pre-redesign color token class names', () => {
    for (const pattern of staleTokenPatterns) {
      expect(html).not.toMatch(pattern)
    }
  })

  it('body uses a currently-defined background token', () => {
    expect(html).toMatch(/<body[^>]*class="[^"]*bg-void-950[^"]*"/)
  })
})
