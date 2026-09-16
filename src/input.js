export function pointerRole(pointerType) { return pointerType === 'touch' ? 'navigate' : 'draw'; }
export function normalizePressure(pressure, pointerType) { if (pointerType === 'mouse') return 0.62; const p = Number.isFinite(pressure) && pressure > 0 ? pressure : 0.5; return Math.min(1, Math.max(0.08, 0.12 + p * 0.88)); }
