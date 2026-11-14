// Own drawing of the nerve → calcium → contraction path (chapter 2 of «Від нерва до росту»).
// No <text>: every label is the HTML list next to it. Each part carries data-chain-part="N", the index of the
// step in `signalChain` (guide.mjs) that lights it. The light itself is CSS, driven by the data-chain-step
// attribute that guide-ui.mjs already sets on .mg-chain, so this module needs no script of its own.
// The drawing is schematic: proportions, distances and the order of events are simplified; it shows no times.

export const SIGNAL_PARTS = 8;
export const SIGNAL_ACTIN_SHIFT = 14;

const part = (n, tag, attrs) => `<${tag} class="sg-p sg-p${n}" data-chain-part="${n}" ${attrs}/>`;

export function signalArt() {
  return `<svg class="mg-signal" viewBox="0 0 360 176" aria-hidden="true" focusable="false">
<rect class="sg-fiber" x="150" y="14" width="202" height="154" rx="16"/>
<g class="sg-sr">
<rect x="226" y="40" width="12" height="48" rx="5"/><rect x="254" y="40" width="12" height="48" rx="5"/>
<circle class="sg-ca-in" cx="232" cy="52" r="2.4"/><circle class="sg-ca-in" cx="232" cy="64" r="2.4"/><circle class="sg-ca-in" cx="232" cy="76" r="2.4"/>
<circle class="sg-ca-in" cx="260" cy="52" r="2.4"/><circle class="sg-ca-in" cx="260" cy="64" r="2.4"/><circle class="sg-ca-in" cx="260" cy="76" r="2.4"/>
</g>
${part(0, 'path', 'd="M10 40H88" fill="none"')}
${part(0, 'ellipse', 'cx="102" cy="40" rx="16" ry="14" fill="none"')}
<circle class="sg-spike" cx="10" cy="40" r="4.5"/>
${part(1, 'circle', 'cx="97" cy="36" r="3"')}${part(1, 'circle', 'cx="106" cy="43" r="3"')}${part(1, 'circle', 'cx="98" cy="46" r="3"')}
<g class="sg-ach">${part(1, 'circle', 'cx="128" cy="32" r="2.6"')}${part(1, 'circle', 'cx="134" cy="40" r="2.6"')}${part(1, 'circle', 'cx="128" cy="48" r="2.6"')}</g>
${part(2, 'rect', 'x="144" y="27" width="9" height="9" rx="3"')}${part(2, 'rect', 'x="144" y="36" width="9" height="9" rx="3"')}${part(2, 'rect', 'x="144" y="45" width="9" height="9" rx="3"')}
${part(3, 'rect', 'x="150" y="14" width="202" height="154" rx="16" fill="none"')}
${part(3, 'path', 'd="M246 14V76" fill="none"')}
${part(4, 'rect', 'x="238" y="50" width="4" height="8" rx="1.5"')}${part(4, 'rect', 'x="238" y="68" width="4" height="8" rx="1.5"')}
${part(4, 'rect', 'x="250" y="50" width="4" height="8" rx="1.5"')}${part(4, 'rect', 'x="250" y="68" width="4" height="8" rx="1.5"')}
<g class="sg-ca-out">${[214, 228, 240, 252, 264, 278].map((x, i) => part(4, 'circle', `cx="${x}" cy="${i % 2 ? 100 : 96}" r="2.8"`)).join('')}</g>
<g class="sg-strip">
<line class="sg-myosin" x1="196" y1="136" x2="306" y2="136"/>
<g class="sg-l">
${part(7, 'line', 'x1="170" y1="112" x2="170" y2="160"')}
<line class="sg-actin" x1="170" y1="124" x2="246" y2="124"/><line class="sg-actin" x1="170" y1="148" x2="246" y2="148"/>
${part(5, 'circle', 'cx="206" cy="124" r="3.6"')}${part(5, 'circle', 'cx="226" cy="148" r="3.6"')}
${part(6, 'path', 'd="M212 136L219 125M232 136L225 147" fill="none"')}
</g>
<g class="sg-r">
${part(7, 'line', 'x1="332" y1="112" x2="332" y2="160"')}
<line class="sg-actin" x1="332" y1="124" x2="256" y2="124"/><line class="sg-actin" x1="332" y1="148" x2="256" y2="148"/>
${part(5, 'circle', 'cx="296" cy="124" r="3.6"')}${part(5, 'circle', 'cx="276" cy="148" r="3.6"')}
${part(6, 'path', 'd="M290 136L283 125M270 136L277 147" fill="none"')}
</g>
</g>
</svg>`;
}

// Light for step ≥ N: one rule per part. Written out here so the test can check the stylesheet against the drawing.
export function signalLightSelectors(n, parts = SIGNAL_PARTS) {
  const steps = Array.from({length: parts - n}, (_, i) => `[data-chain-step="${n + i}"]`);
  return `.mg-chain:is(${steps.join(',')}) .sg-p${n}`;
}
