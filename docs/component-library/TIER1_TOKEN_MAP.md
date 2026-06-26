# Tier 1 Component Token Map

## Button

| Token | CSS Variable | Light | Dark |
|-------|---|---|---|
| Primary BG | --cic-color-accent | #4a9eff | #4a9eff |
| Secondary BG | --cic-surface-layer-1 | #e8e8e8 | #1a1a1a |
| Danger BG | --cic-color-danger | #ff6464 | #ff6464 |
| Border | --cic-color-border | #e0e0e0 | #333 |
| Text | --cic-color-text | #000 | #e8e8e8 |
| Motion | --cic-motion-fade | 120ms | 120ms |

## Input

| Token | CSS Variable | Light | Dark |
|-------|---|---|---|
| Border | --cic-color-border | #e0e0e0 | #333 |
| Focus Border | --cic-color-accent | #4a9eff | #4a9eff |
| BG | --cic-surface-layer-0 | #fff | #0a0a0a |
| Text | --cic-color-text | #000 | #e8e8e8 |
| Label | --cic-color-text | #000 | #e8e8e8 |
| Error | --cic-color-danger | #ff6464 | #ff6464 |

## Checkbox

| Token | CSS Variable | Light | Dark |
|-------|---|---|---|
| Box Border | --cic-color-border | #e0e0e0 | #333 |
| Checked BG | --cic-color-accent | #4a9eff | #4a9eff |
| Focus | --cic-color-accent | #4a9eff | #4a9eff |
| Text | --cic-color-text | #000 | #e8e8e8 |
| Muted Text | --cic-color-text-muted | #666 | #9e9e9e |

## Density Scaling

All components support density adjustments via `--cic-density-factor`:

- Compact: 0.8x (32px button, 32px input, 20px checkbox)
- Cozy: 1.0x (40px button, 40px input, 20px checkbox)
- Comfortable: 1.4x (48px button, 48px input, 24px checkbox)

## Accessibility

- Focus rings: 2px solid accent color, 2px offset
- WCAG AA contrast: 4.5:1 minimum
- Disabled opacity: 0.5–0.6
- Label-input associations via htmlFor
