# Operator Console Keyboard Shortcuts

**Version:** 1.0.0  
**Scope:** Operator Console v3 keyboard-only workflows  
**Status:** Phase 3.6 Stream B Complete

---

## Single-Key Workflows

| Key | Action | Workflow | Notes |
|---|---|---|---|
| **A** | Acknowledge Alert | Focus alert, press A to acknowledge | Works on any focused alert |
| **/** | Focus Search | Press / to jump to search input | Auto-clears on focus |
| **[** | Previous Panel | Navigate to previous panel | Wraps at start |
| **]** | Next Panel | Navigate to next panel | Wraps at end |

---

## Ctrl+Key Workflows

| Ctrl+Key | Action | Workflow | Notes |
|---|---|---|---|
| **Ctrl+R** | Refresh Health | Update health panel only | 10s polling interval |
| **Ctrl+Shift+R** | Refresh All | Update all panels simultaneously | Health + Pipelines + Alerts |

---

## Multi-Key Workflows (Sequence)

Multi-key shortcuts use a **2-second window**. Press first key, then press the number within 2 seconds.

| Sequence | Action | Example | Notes |
|---|---|---|---|
| **P + 1..9** | Pause Pipeline N | P+1 pauses Pipeline 1 | Any digit 1–9 |
| **Shift+P + 1..9** | Restart Pipeline N | Shift+P+2 restarts Pipeline 2 | Any digit 1–9 |

### Multi-Key Example

To pause Pipeline 3:
1. Press **P** (buffer activates)
2. Press **3** within 2 seconds
3. Pipeline 3 pauses

If 2 seconds elapse without a number, the buffer clears and you must start over.

---

## Tips & Tricks

### Power User Patterns

- **Rapid status refresh:** Ctrl+R repeatedly to monitor health without UI reload
- **Pipeline juggling:** P+1, P+2, P+3 to pause multiple pipelines in sequence
- **Alert triage:** A to acknowledge current alert, ] to next panel with more alerts
- **One-handed navigation:** [ / ] for hands-free panel browsing while monitoring

### Keyboard-Only Workflow Example

Monitor system health without touching the mouse:

1. **Focus Health Panel:** Tab or [ / ]
2. **Refresh Health:** Ctrl+R (check status)
3. **Check Pipelines:** ] (next panel)
4. **Pause Pipeline:** P+1 (pause if running)
5. **Check Alerts:** ] (next panel)
6. **Acknowledge Alert:** Focus alert with Tab, press A
7. **Refresh All:** Ctrl+Shift+R (verify state)

**Total:** ~8 keypresses, no mouse needed

---

## Accessibility Benefits

All workflows designed for:

- ✅ **Zero Mouse Required:** Full dashboard control via keyboard
- ✅ **Screen Reader Friendly:** Announcements via live regions (aria-live)
- ✅ **Focus Preservation:** Updates don't steal focus during polling
- ✅ **WCAG AA Compliant:** Full keyboard access + semantic HTML

---

## Browser Compatibility

| Browser | Status | Notes |
|---|---|---|
| Chrome/Chromium | ✅ Full support | All shortcuts work |
| Firefox | ✅ Full support | All shortcuts work |
| Safari | ✅ Full support | All shortcuts work |
| Edge | ✅ Full support | All shortcuts work |

**Note:** Multi-key shortcuts (P+N) work on all browsers. The 2-second buffer is client-side, not browser-dependent.

---

## Troubleshooting

### Shortcut Not Working?

1. **Check focus:** Some shortcuts only work in main console area (not in modal/input)
2. **Browser shortcut conflict:** Some browsers have built-in shortcuts (Ctrl+R = refresh page)
   - Try **Ctrl+Shift+R** instead for full refresh
3. **Input field active:** Shortcuts disabled when typing in search/input (except `/` which focuses search)

### Pipeline Number Not Registering?

1. **2-second window:** You have 2 seconds after P/Shift+P to press the number
2. **Buffer clear:** If timeout occurs, you'll see no response—start over with P or Shift+P
3. **Grid focus:** Pipeline action must be within Agents Panel—navigate there first with Tab or ] key

---

## Operator Reference (Quick)

```
REFRESH:      Ctrl+R (health only) | Ctrl+Shift+R (all)
PIPELINE:     P + 1..9 (pause) | Shift+P + 1..9 (restart)
ALERT:        A (acknowledge focused)
SEARCH:       / (focus search input)
NAVIGATE:     [ (prev panel) | ] (next panel)
```

---

## Feedback

Issues or suggestions? Contact:
- **CIC Team:** cic-accessibility@example.com
- **Issue Tracker:** [Link to GitHub Issues]

**Last Updated:** 2026-06-23
