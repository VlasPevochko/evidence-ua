// Схеми карт болю плеча й коліна (власні, без чужих зображень). Рішення власника 2026-11-10 («1-7 так», п. 5): перемальовано в стилі Атласу.
// У розмітці лише форми й імена класів; усі кольори живуть у dist/atlas-diagrams.css (палітра Атласу), підписи структур — HTML у скриптах карт (atlas-points.js).
// Це умовні схеми: вони показують, де що розташоване, а не точну анатомію конкретної людини. Координати точок і підписів: src/atlas/points.mjs (відсотки сцени).

const defs = prefix => `<defs>
<linearGradient id="${prefix}Bone" x1="0" y1="0" x2="1" y2="1"><stop class="s-bone-a" offset="0"/><stop class="s-bone-b" offset="1"/></linearGradient>
<linearGradient id="${prefix}Shaft" x1="0" y1="0" x2="1" y2="0"><stop class="s-bone-b" offset="0"/><stop class="s-bone-a" offset=".42"/><stop class="s-bone-b" offset="1"/></linearGradient>
<radialGradient id="${prefix}Head" cx=".38" cy=".3" r=".85"><stop class="s-bone-a" offset="0"/><stop class="s-bone-b" offset="1"/></radialGradient>
<linearGradient id="${prefix}Muscle" x1="0" y1="0" x2="0" y2="1"><stop class="s-muscle-a" offset="0"/><stop class="s-muscle-b" offset="1"/></linearGradient>
<linearGradient id="${prefix}Tendon" x1="0" y1="0" x2="1" y2="0"><stop class="s-tendon-a" offset="0"/><stop class="s-tendon-b" offset="1"/></linearGradient>
</defs>`;

const svg = (cls, box, label, body) => `<svg class="map-diagram ${cls}" viewBox="${box}" role="img" aria-label="${label}">${body}</svg>`;

// ───────────────────────────── плече (360 × 420) ─────────────────────────────
const SH = 'sh';
const shoulder = {
  front: () => svg('shoulder-diagram', '0 0 360 420', 'Схема плечового комплексу спереду', `${defs(SH)}
<path class="soft" d="M14 420V176Q14 118 68 98L132 74Q182 54 228 76L298 104Q350 128 350 188V420Z"/>
<path class="bone" fill="url(#${SH}Bone)" d="M216 120c-6 18 0 34 16 42l-8 14c-24-10-34-34-28-58z"/>
<path class="bone" fill="url(#${SH}Bone)" d="M258 100c26-8 52 2 64 24l-14 12c-10-16-26-24-46-18z"/>
<path class="bone" fill="url(#${SH}Shaft)" d="M248 204c-1 46 2 124 5 190h30c3-66 5-144 4-190z"/>
<ellipse class="bone" fill="url(#${SH}Bone)" cx="300" cy="168" rx="14" ry="24" transform="rotate(8 300 168)"/>
<ellipse class="bone" fill="url(#${SH}Bone)" cx="240" cy="166" rx="11" ry="17" transform="rotate(-8 240 166)"/>
<circle class="bone" fill="url(#${SH}Head)" cx="268" cy="178" r="36"/>
<path class="groove" d="M271 198c-1 44-2 104-2 172"/>
<path class="cuff" d="M238 150c14-18 46-22 68-4"/>
<path class="cuff" d="M236 170c-4 14 2 28 16 36"/>
<path class="muscle overlay" fill="url(#${SH}Muscle)" d="M226 108c34-14 82-8 106 26 18 26 14 82-4 130-8 20-30 24-44 12 8-42 6-82-22-116-18-20-32-30-36-52z"/>
<path class="fibers" d="M240 124c24 14 38 40 44 76M262 116c24 12 42 34 52 74M286 120c18 14 30 36 38 64"/>
<path class="muscle" fill="url(#${SH}Muscle)" d="M262 244c-22 12-30 46-26 92 6 14 24 14 32-4 8-30 6-62-6-88z"/>
<path class="tendon" fill="none" d="M246 134c2 20 12 46 20 68l4 44"/>
<path class="clavicle" d="M80 138c30-22 62-30 100-20 28 8 56-4 88-18"/>
<path class="clavicle-hi" d="M80 138c30-22 62-30 100-20 28 8 56-4 88-18"/>
<ellipse class="bone-end" cx="80" cy="138" rx="13" ry="11"/>
<ellipse class="bone-end" cx="268" cy="100" rx="11" ry="9"/>
<path class="joint-line" d="M276 92c6 8 8 18 4 28"/>`),

  lateral: () => svg('shoulder-diagram', '0 0 360 420', 'Схема плечового комплексу збоку', `${defs(SH)}
<path class="soft" d="M54 420V122Q54 74 118 56L196 36Q262 32 304 68Q340 100 344 162V420Z"/>
<path class="bone" fill="url(#${SH}Bone)" d="M146 94c40-14 100-12 140 16l-10 26c-34-20-88-24-128-8z"/>
<path class="bone" fill="url(#${SH}Shaft)" d="M200 214c-2 50 2 124 8 182h40c6-58 8-132 6-182z"/>
<circle class="bone" fill="url(#${SH}Head)" cx="226" cy="178" r="42"/>
<ellipse class="bursa" cx="226" cy="130" rx="38" ry="9"/>
<path class="cuff" d="M178 152c20-26 66-26 90 0"/>
<path class="cuff" d="M176 180c-2 14 6 28 20 36"/>
<path class="muscle overlay" fill="url(#${SH}Muscle)" d="M142 110c58-20 150-12 188 40 22 32 18 90-6 150-10 24-36 26-50 8l-26-96c-6-24-30-42-60-52-26-10-40-26-46-50z"/>
<path class="fibers" d="M176 118c40 12 70 46 84 100M214 112c44 10 80 46 98 100M254 116c34 14 58 46 66 92"/>
<path class="tendon" fill="none" d="M232 140c-4 26-2 56 2 84"/>`),

  posterior: () => svg('shoulder-diagram', '0 0 360 420', 'Схема плечового комплексу ззаду', `${defs(SH)}
<path class="soft" d="M22 420V150Q22 100 80 80L134 52Q180 36 226 60L290 90Q340 114 344 176V420Z"/>
<g class="vertebrae"><rect x="118" y="26" width="26" height="15" rx="6"/><rect x="118" y="46" width="26" height="15" rx="6"/><rect x="118" y="66" width="26" height="15" rx="6"/><rect x="118" y="86" width="26" height="15" rx="6"/><rect x="118" y="106" width="26" height="15" rx="6"/></g>
<path class="nerve" d="M144 98c32 12 70 44 112 78"/>
<path class="bone" fill="url(#${SH}Bone)" d="M152 140c28 4 62 8 84 12 14 12 16 40 6 64l-26 24c-8 24-14 48-22 72h-44c-10-44-12-110 2-172z"/>
<path class="scapular-spine" d="M152 180c44-14 90-34 134-52"/>
<path class="scapular-spine-hi" d="M152 180c44-14 90-34 134-52"/>
<ellipse class="bone-end" cx="288" cy="128" rx="14" ry="10" transform="rotate(-18 288 128)"/>
<path class="bone" fill="url(#${SH}Shaft)" d="M268 232c-1 48 0 118 3 168h30c2-50 3-120 2-168z"/>
<circle class="bone" fill="url(#${SH}Head)" cx="284" cy="204" r="32"/>
<path class="muscle" fill="url(#${SH}Muscle)" d="M158 190c34-12 70-24 102-32 8 34-4 64-30 84-18 14-30 36-38 62h-40c-8-40-6-80 6-114z"/>
<path class="muscle" fill="url(#${SH}Muscle)" d="M198 262c22-14 48-30 68-46l8 18c-22 20-46 34-68 48z"/>
<path class="muscle" fill="url(#${SH}Muscle)" d="M154 144c34 2 70 8 102 8l-10 16c-30-2-62-6-92-6z"/>
<path class="fibers" d="M170 200c26-8 52-18 76-28M176 236c22-12 44-26 62-44M180 270c14-14 30-30 42-48"/>
<path class="cuff" d="M250 188c10-4 22-4 34 2"/>
<path class="muscle overlay" fill="url(#${SH}Muscle)" d="M270 134c40 4 68 40 60 92-4 30-18 48-32 56-4-36-12-62-28-84z"/>`)
};

// ───────────────────────────── коліно (320 × 420) ─────────────────────────────
const KN = 'kn';
const knee = {
  front: () => svg('knee-diagram', '0 0 320 420', 'Схема коліна спереду', `${defs(KN)}
<path class="bone" fill="url(#${KN}Shaft)" d="M130 12h60l4 106c22 18 26 48 12 76-8 14-28 22-46 22s-38-8-46-22c-14-28-10-58 12-76z"/>
<path class="bone" fill="url(#${KN}Shaft)" d="M112 244c0-12 20-18 48-18s48 6 48 18c0 10-6 26-8 44-2 24-4 82-4 122h-72c0-40-2-98-4-122-2-18-8-34-8-44z"/>
<path class="bone" fill="url(#${KN}Shaft)" d="M208 246c8-4 20 0 20 12 0 40 6 108 8 152h-24c0-40-4-100-6-134-1-16-2-22 2-30z"/>
<path class="cartilage" d="M108 232c10-12 30-16 50-12v14c-20-2-38 0-50 8z"/>
<path class="cartilage" d="M212 232c-10-12-30-16-50-12v14c20-2 38 0 50 8z"/>
<path class="tendon" fill="url(#${KN}Tendon)" d="M138 164c8-10 36-10 44 0l-4-76h-36z"/>
<path class="tendon" fill="url(#${KN}Tendon)" d="M146 238h28l-4 62h-20z"/>
<path class="bone" fill="url(#${KN}Bone)" d="M160 158c28 0 38 14 36 36-2 24-16 46-36 48-20-2-34-24-36-48-2-22 8-36 36-36z"/>
<path class="ligament" d="M108 178c0 30 4 56 8 76M214 178c-1 30-2 54-2 70"/>
<path class="joint-line" d="M110 226c30 10 70 10 100 0"/>`),

  medial: () => svg('knee-diagram', '0 0 320 420', 'Схема медіальної поверхні коліна', `${defs(KN)}
<path class="bone" fill="url(#${KN}Shaft)" d="M138 12h58l4 106c26 14 32 50 14 76-10 14-32 26-52 24-24-2-40-14-48-28-14-28-8-60 16-72z"/>
<path class="bone" fill="url(#${KN}Shaft)" d="M120 236c0-12 24-16 54-16s52 6 52 18c0 12-8 26-10 46-2 24-4 80-4 126h-74c0-46-2-102-6-126-2-22-12-34-12-48z"/>
<path class="bone" fill="url(#${KN}Bone)" d="M104 168c20-6 34 4 36 24 2 22-8 40-26 44-20 2-32-14-32-32 0-18 8-32 22-36z"/>
<path class="cartilage" d="M124 230c20-10 50-12 80-4v14c-30-6-56-4-80 6z"/>
<path class="ligament thick" d="M188 178c2 26 4 48 8 74"/>
<path class="tendon" fill="none" d="M150 284c-18 12-32 30-38 52M164 292c-18 12-34 34-40 56M176 298c-18 14-34 34-40 58"/>
<ellipse class="bursa" cx="124" cy="340" rx="20" ry="9" transform="rotate(-32 124 340)"/>
<path class="joint-line" d="M126 226c26 6 56 6 90-2"/>`),

  lateral: () => svg('knee-diagram', '0 0 320 420', 'Схема латеральної поверхні коліна', `${defs(KN)}
<g transform="translate(-12 0)">
<path class="bone" fill="url(#${KN}Shaft)" d="M132 12h60l4 106c26 14 30 50 12 76-10 14-30 24-50 22-24-2-42-14-50-28-12-28-6-60 20-72z"/>
<path class="bone" fill="url(#${KN}Shaft)" d="M120 236c0-12 24-16 54-16s52 6 52 18c0 12-8 26-10 46-2 24-4 80-4 126h-74c0-46-2-102-6-126-2-22-12-34-12-48z"/>
<path class="bone" fill="url(#${KN}Shaft)" d="M200 258c10-6 24 0 24 14 0 34 4 90 8 138h-24c-2-40-6-96-10-124-1-14-2-22 2-28z"/>
<path class="bone" fill="url(#${KN}Bone)" d="M100 168c18-6 32 4 34 24 2 22-8 40-26 42-20 0-30-14-30-32 0-16 8-30 22-34z"/>
<path class="cartilage" d="M122 232c22-12 52-14 82-6v14c-30-6-58-4-82 6z"/>
<path class="ligament thick" d="M186 182c12 26 24 52 34 80"/>
<path class="tendon" fill="none" d="M234 90c-6 56-12 114-14 172"/>
<path class="joint-line" d="M126 228c28 8 60 8 90-2"/>
</g>`),

  posterior: () => svg('knee-diagram', '0 0 320 420', 'Схема коліна ззаду', `${defs(KN)}
<path class="bone" fill="url(#${KN}Shaft)" d="M128 12h64l4 112c22 18 26 46 12 72-8 14-26 22-48 22s-40-8-48-22c-14-26-10-54 12-72z"/>
<path class="bone" fill="url(#${KN}Shaft)" d="M114 246c0-12 20-18 46-18s46 6 46 18c0 12-6 28-8 46-2 24-4 78-4 118h-68c0-40-2-94-4-118-2-18-8-34-8-46z"/>
<path class="bone" fill="url(#${KN}Shaft)" d="M206 256c10-4 22 2 22 14 0 40 6 100 8 140h-24c-2-38-6-94-8-126-1-14-2-22 2-28z"/>
<path class="muscle" fill="url(#${KN}Muscle)" d="M96 150c28-30 52-18 56 18l-4 84c-30 20-56 10-60-26z"/>
<path class="muscle" fill="url(#${KN}Muscle)" d="M224 150c-28-30-52-18-56 18l4 84c30 20 56 10 60-26z"/>
<path class="tendon" fill="none" d="M120 40c4 40 6 70 16 110M200 40c-4 40-6 70-16 110"/>
<path class="fibers" d="M112 178c10 12 20 30 26 50M208 178c-10 12-20 30-26 50"/>
<ellipse class="bursa" cx="160" cy="226" rx="26" ry="38"/>
<path class="joint-line" d="M116 240c28 8 60 8 88 0"/>`)
};

export const shoulderDiagram = view => (shoulder[view] || shoulder.front)();
export const kneeDiagram = view => (knee[view] || knee.front)();
export const diagramViews = {shoulder: Object.keys(shoulder), knee: Object.keys(knee)};
