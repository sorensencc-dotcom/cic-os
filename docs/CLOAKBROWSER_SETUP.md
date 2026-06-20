# CloakBrowser Setup Guide

## ENV-001 Installation & Validation

### 1. Install CloakBrowser

```bash
npm install cloakbrowser
```

Verify installation:

```bash
npm list cloakbrowser
```

### 2. Install TypeScript Dependencies

If not already present:

```bash
npm install --save-dev ts-node typescript
```

### 3. Run Validation Harness

```bash
npx ts-node scripts/validate-cloakbrowser.ts
```

Expected Output:

```
🔍 CloakBrowser API Compatibility Validation

Testing 3 JS-heavy sites for:

✓ goto(url) functionality
✓ content() retrieval
✓ screenshot() capture
✓ DOM hydration detection
✓ Timeout behavior (5s/10s envelope)

📍 Testing: Dental (Next.js + Cloudflare)
   URL: https://example-dental.com
   ✓ goto() passed
   ✓ content() retrieved XXXX bytes (pass)
   ✓ DOM hydration detected
   ✓ screenshot() passed
   ✓ timeout (5s/10s) respected
   ✅ PASS

📍 Testing: MedSpa (React SPA)
   URL: https://example-medspa.com
   ✓ goto() passed
   ✓ content() retrieved XXXX bytes (pass)
   ✓ DOM hydration detected
   ✓ screenshot() passed
   ✓ timeout (5s/10s) respected
   ✅ PASS

📍 Testing: Agency (Framer/Webflow)
   URL: https://example-agency.com
   ✓ goto() passed
   ✓ content() retrieved XXXX bytes (pass)
   ✓ DOM hydration detected
   ✓ screenshot() passed
   ✓ timeout (5s/10s) respected
   ✅ PASS


📊 Summary

Passed: 3/3 (100%)

✅ Findings written to: docs/CLOAKBROWSER_VALIDATION_FINDINGS.md

📋 Next: Review findings and proceed to DEV-002 (Adapter Implementation)
```

### 4. Acceptance Criteria Checklist

After running the harness, verify:

- [ ] CloakBrowser can execute: `goto`, `content`, `screenshot` — All tests show ✓
- [ ] DOM hydration verified on 3 sample JS-heavy sites — All "DOM hydration detected" show ✓
- [ ] Timeout behavior validated (5s/10s envelope) — All "timeout (5s/10s) respected" show ✓
- [ ] Notes captured in `CLOAKBROWSER_VALIDATION_FINDINGS.md` — File exists with full results

### 5. Troubleshooting

#### CloakBrowser not found

```bash
npm install cloakbrowser --save
```

Check `package.json` to ensure it's listed in `dependencies`.

#### TypeScript compilation errors

Ensure `tsconfig.json` includes `scripts/validate-cloakbrowser.ts`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"]
  },
  "include": ["scripts/**/*.ts", "src/**/*.ts"]
}
```

#### Timeout errors during validation

Increase timeout in `validate-cloakbrowser.ts`:

Change this line:

```typescript
return elapsed <= 10000; // 10s timeout
```

To:

```typescript
return elapsed <= 15000; // 15s timeout
```

---

## Next Steps

After ENV-001 passes:

1. ✅ Findings captured
2. → Proceed to **DEV-002**: Implement `CloakBrowserAdapter`
3. → Create `src/extractors/browser/CloakBrowserAdapter.ts`
4. → Implement `IBrowserEngine` interface
5. → Add unit tests (4–6)

---

**Last Updated:** 2026-06-19
