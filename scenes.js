// Scene pager + directional glyph wave. See docs/superpowers/specs/2026-07-24-scene-pager-glyph-wave-design.md
const scenes = [...document.querySelectorAll(".scene")];

window.__scenes = { active: () => 0 };
