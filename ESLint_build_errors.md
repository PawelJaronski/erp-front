# ESLint build-time errors on Vercel (and how to avoid them)

Vercel runs **`next lint`** automatically during every deployment.  
If ESLint reports **any rule with the severity set to `error`**, the whole
`npm run build` step fails and the deploy is aborted.

Two issues that come up most often are:

1. **`react-hooks/exhaustive-deps` – missing dependency**
   * Example: `Warning: React Hook useMemo has a missing dependency: 'fields'.`
   * Why?  React hooks must list **every** variable referenced inside their
     callback in the dependency array – otherwise the linter (and React) assume
     you might work with stale data.
   * Fix:
     - Add the variable to the dependency array, **or**
     - Derive the value _inside_ the hook without `useMemo`/`useCallback` if the
       calculation is cheap.
   * Avoid: "Quick-hiding" the error with
     `// eslint-disable-next-line react-hooks/exhaustive-deps` unless you are
     absolutely certain the dependency is irrelevant (rare).

2. **`@typescript-eslint/no-explicit-any` – unexpected `any`**
   * The `next/typescript` preset treats explicit `any` as an error.
   * Common hidden source: `catch (e) { ... }` – when
     `"useUnknownInCatchVariables": true` is **not** enabled, `e` is implicitly
     typed as `any`.
   * Fix:
     - Write `catch (e: unknown)` instead of `catch (e)` (preferred).
     - Or enable the compiler option `"useUnknownInCatchVariables": true` in
       `tsconfig.json` (now added).
   * Avoid: Casting to `as any` or declaring variables as `any`.  Prefer
     `unknown`, proper generics, or specific types.

## General tips

• Treat ESLint errors locally the same way Vercel will: run `npm run lint`
  (or `next lint`) before pushing.  
• Keep an eye on new rules pulled in by the `next/core-web-vitals` and
  `next/typescript` presets.  
• When a rule is too strict for a legitimate reason, disable it **once**, not
  project-wide, and always leave a comment explaining the rationale. 