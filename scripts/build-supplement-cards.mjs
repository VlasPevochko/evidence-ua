// Омега-3, вітамін D, кофеїн, магній, колаген, бета-аланін, цитрулін, електроліти: one renderer for approved supplement modules. Ratio rows (risk, hazard, odds or rate
// ratios) share one log axis around 1; difference rows (scale: 'linear' — SMD, g, mm Hg) get their own symmetric axis
// around 0 because units differ. Same layout family as the berberine card.
// Idempotent: replaces only content between CARD markers inside each section, plus one style and one script tag.
import fs from 'node:fs';
import path from 'node:path';
import {omegaBase, omegaModule} from '../src/evidence/supplements/omega/module.mjs';
import {vitdBase, vitdModule} from '../src/evidence/supplements/vitd/module.mjs';
import {caffeineBase, caffeineModule} from '../src/evidence/supplements/caffeine/module.mjs';
import {magnesiumBase, magnesiumModule} from '../src/evidence/supplements/magnesium/module.mjs';
import {collagenBase, collagenModule} from '../src/evidence/supplements/collagen/module.mjs';
import {betaAlanineBase, betaAlanineModule} from '../src/evidence/supplements/beta-alanine/module.mjs';
import {citrullineBase, citrullineModule} from '../src/evidence/supplements/citrulline/module.mjs';
import {electrolytesBase, electrolytesModule} from '../src/evidence/supplements/electrolytes/module.mjs';
import {ConfidenceBadge, SourceCard, claimButton, escapeHTML as e} from '../src/evidence/core/components.mjs';

const root = process.cwd();
const indexPath = path.join(root, 'dist/index.html');
const out = path.join(root, 'dist/evidence');
const num = x => new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 2, minimumFractionDigits: 2}).format(x);
const types = {efficacy: 'Ефект', safety: 'Безпека'};
const layers = {human_outcome: 'люди', mechanistic: 'лабораторія'};

export const cards = [
  {key: 'omega', base: omegaBase, module: omegaModule, art: '--base-x:75%;--base-y:0%', file: 'src/evidence/supplements/omega/module.mjs', exportName: 'omegaBase',
    headline: 'Знижує тригліцериди. Серце майже не захищає',
    definition: 'Омега-3 — група жирних кислот. EPA і DHA містяться в жирній рибі й риб’ячому жирі, рослинна ALA — у льоні, волоських горіхах, ріпаковій олії.',
    lead: 'У великих дослідженнях капсули EPA і DHA майже не змінили ризик інфарктів, інсультів і смертність, але знизили тригліцериди. У дозах понад 1 г на добу зростав ризик фібриляції передсердь.',
    rowsTitle: 'Що змінюється', rowsNote: 'Відношення ризиків з плацебо або звичайним харчуванням. 1 — без різниці; ліворуч — рідше, праворуч — частіше.',
    rows: [['EVR-000018', 'Серцево-судинні події'], ['EVR-000125', 'Загальна смертність'], ['EVR-000126', 'Події ішемічної хвороби серця'], ['EVR-000130', 'Фібриляція передсердь'], ['EVR-000131', 'Фібриляція, понад 1 г/добу']],
    rowsSource: 'Cochrane 2020 (Abdelhamid); фібриляція передсердь — Gencer 2021.',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Є фібриляція передсердь чи ризик її?</b> У великих дослідженнях омега-3 підвищувала цей ризик, сильніше — у дозах понад 1 г на добу. Порадься з лікарем.', '<b>Хочеш знизити тригліцериди?</b> Це питання до лікаря: зниження тригліцеридів саме по собі не довело менше серцевих подій.', '<b>Рослинна ALA (льон, горіхи)</b> — інша речовина. Висновки про EPA і DHA на неї не переносимо.'],
    facts: [['Тригліцериди', '≈ −15%', 'що більша доза, то сильніше'], ['Події ІХС', '1 з ~167', 'стільки людей мають приймати, щоб уникнути однієї події; низька певність'], ['Рівень впевненості', 'попередній', 'біля кожного твердження; формального наукового перегляду ще не було']]},
  {key: 'vitd', base: vitdBase, module: vitdModule, art: '--base-x:100%;--base-y:0%', file: 'src/evidence/supplements/vitd/module.mjs', exportName: 'vitdBase',
    headline: 'Без дефіциту від переломів не захищає',
    definition: 'Вітамін D допомагає засвоювати кальцій. Він утворюється в шкірі під сонцем і надходить із деяких продуктів.',
    lead: 'У дорослих, яких не відбирали за дефіцитом, сам вітамін D не зменшив переломів і не змінив загальної смертності. Інфекцій дихальних шляхів було трохи менше. Дуже великі разові дози шкодили.',
    rowsTitle: 'Що змінюється', rowsNote: 'Відношення ризиків, шансів або частот з плацебо. 1 — без різниці; ліворуч — рідше, праворуч — частіше.',
    rows: [['EVR-000136', 'Переломи, лише вітамін D'], ['EVR-000137', 'Переломи, вітамін D з кальцієм'], ['EVR-000019', 'Переломи, VITAL (2000 МО/добу)'], ['EVR-000141', 'Падіння, 500 000 МО раз на рік'], ['EVR-000142', 'Переломи, 500 000 МО раз на рік'], ['EVR-000143', 'Інфекції дихальних шляхів'], ['EVR-000145', 'Загальна смертність']],
    rowsSource: 'Переломи — Massé 2026 і VITAL 2022; великі дози — Sanders 2010; інфекції — Jolliffe 2021; смертність — Zhang 2019.',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Не бери великих разових доз.</b> 500 000 МО раз на рік у жінок від 70 років підвищили частоту падінь і переломів.', '<b>Підозрюєш дефіцит?</b> Це перевіряють аналізом крові й лікують з лікарем. Висновки цієї картки — про прийом без відбору за дефіцитом.', '<b>Більше — не краще.</b> Надлишок вітаміну D може шкодити.'],
    facts: [['Переломи', '1,00', 'відношення ризиків для самого вітаміну D (69 РКД, 2026)'], ['Інфекції', '61,3% проти 62,3%', 'мали хоча б одну інфекцію за час досліджень'], ['Рівень впевненості', 'попередній', 'біля кожного твердження; формального наукового перегляду ще не було']]},
  {key: 'caffeine', base: caffeineBase, module: caffeineModule, art: '--base-x:50%;--base-y:0%', file: 'src/evidence/supplements/caffeine/module.mjs', exportName: 'caffeineBase', scale: 'linear',
    headline: 'Допомагає на витривалість. Ціна — сон',
    definition: 'Кофеїн — стимулятор, який міститься в каві, чаї, енергетиках і деяких добавках. Він впливає на відчуття бадьорості й навантаження.',
    lead: 'Кофеїн приблизно за годину до навантаження допомагає швидше пройти дистанцію й трохи додає сили. Увечері він скорочує сон, а енергетики тимчасово підвищують тиск.',
    rowsTitle: 'Що змінюється', rowsNote: 'Різниця з плацебо. SMD і g — стандартизований ефект: 0,2 — малий, 0,5 — помірний. Для часу на дистанції менше — краще.',
    rows: [['EVR-000165', 'Час на дистанції, до 3 мг/кг', {word: 'швидше'}], ['EVR-000166', 'Час на дистанції, 4–6 мг/кг', {word: 'швидше'}], ['EVR-000168', 'Максимальна сила (1ПМ)'], ['EVR-000169', 'Стрибок'], ['EVR-000171', 'Швидкість штанги'], ['EVR-000173', 'Жінки, фізичні результати'], ['EVR-000182', 'Жуйка з кофеїном'], ['EVR-000177', 'Тиск у спокої (енергетики)', {word: 'вищий', harm: true}], ['EVR-000178', 'Тиск під час навантаження (енергетики)', {word: 'вищий', harm: true}]],
    rowsSource: 'Дистанція — Martins 2026; сила й стрибок — Grgic 2018; штанга — Xiao 2025; жінки — Zhu 2026; жуйка — Miraftabi 2026; тиск — Gualberto 2024 і Grinberg 2022.',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Тренуєшся ввечері?</b> Кофеїн скорочує сон у середньому на 35–45 хв. За розрахунком авторів огляду каву варто пити щонайменше за 8,8 год до сну, порцію передтренувальної добавки — за 13,2 год.', '<b>Вагітність або годування груддю</b> — не більше 200 мг на добу з усіх джерел.', '<b>Підвищений тиск чи хвороба серця?</b> Енергетики підвищують тиск, особливо під час навантаження. Спершу порадься з лікарем.', '<b>Підлітки</b> — не більше 3 мг на кілограм маси тіла на добу.'],
    facts: [['Доза', '3–6 мг/кг', 'приблизно за 60 хв до навантаження (ISSN 2021)'], ['Безпечно за добу', 'до 400 мг', 'дорослим; за раз — до 200 мг (EFSA 2015)'], ['Рівень впевненості', 'попередній', 'біля кожного твердження; формального наукового перегляду ще не було']]},
  {key: 'magnesium', base: magnesiumBase, module: magnesiumModule, art: '--base-x:0%;--base-y:100%', file: 'src/evidence/supplements/magnesium/module.mjs', exportName: 'magnesiumBase', scale: 'linear', approvedOn: '22 жовтня 2026 року',
    headline: 'Тиск — трохи нижчий. Від судом не рятує',
    definition: 'Магній — мінерал, потрібний для роботи нервів, м’язів та багатьох ферментів. Його можна отримувати з горіхів, насіння, бобових і цільнозернових.',
    lead: 'Добавки магнію трохи знижують тиск і, можливо, допомагають швидше засинати літнім людям з безсонням. Нічних судом у літніх вони не зменшують. Найчастіший побічний ефект — діарея.',
    rowsTitle: 'Що змінюється', rowsNote: 'Різниця з плацебо в одиницях дослідження. Для тиску й часу засинання менше — краще.',
    rows: [['EVR-000184', 'Нічні судоми, на тиждень'], ['EVR-000185', 'Нічні судоми, зміна у %'], ['EVR-000186', 'Систолічний тиск', {word: 'нижчий'}], ['EVR-000187', 'Діастолічний тиск', {word: 'нижчий'}], ['EVR-000188', 'Засинання (літні з безсонням)', {word: 'швидше'}]],
    rowsSource: 'Судоми — Garrison 2020 (Cochrane; 5 РКД, 307 учасників і 3 РКД, 177 учасників); тиск — Zhang 2016; сон — Mah 2021 (3 невеликі дослідження).',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Діарея й скарги на кишківник</b> — найчастіші побічні ефекти: у дослідженнях їх мали 11–37% тих, хто приймав магній.', '<b>Не більше 350 мг на добу з добавок</b> — це офіційна верхня межа (магній з їжі сюди не входить).', '<b>Лікуєш тиск або маєш хворобу нирок?</b> Добавка не замінює лікування — порадься з лікарем.'],
    facts: [['Тиск', '−2,0 / −1,8', 'мм рт. ст., медіана 368 мг/добу протягом 3 місяців'], ['Межа з добавок', '350 мг', 'на добу для дорослих'], ['Рівень впевненості', 'попередній', 'біля кожного твердження; формального наукового перегляду ще не було']]},
  {key: 'collagen', base: collagenBase, module: collagenModule, art: '--base-x:25%;--base-y:100%', file: 'src/evidence/supplements/collagen/module.mjs', exportName: 'collagenBase', scale: 'linear', approvedOn: '22 жовтня 2026 року', scaleNote: 'Крапка — середня оцінка, смуга — 95% довірчий інтервал; кожен рядок має власну шкалу. Порожня крапка — інтервалу в джерелі немає, є лише значущість.',
    headline: 'Малий плюс до тренувань. Докази слабкі',
    definition: 'Колаген — білок сполучної тканини. Добавки часто містять його фрагменти — колагенові пептиди.',
    lead: 'Разом із тренуваннями колаген дає трохи більше безжирової маси й сили. При остеоартриті колін біль зменшується, а шкіра стає зволоженішою, але дослідження дуже різні й частина з них упереджена.',
    rowsTitle: 'Що змінюється', rowsNote: 'Різниця з плацебо. SMD — стандартизований ефект: 0,2 — малий, 0,5 — помірний. Для болю й функції колін менше — краще.',
    rows: [['EVR-000191', 'Безжирова маса (з тренуваннями)'], ['EVR-000192', 'Максимальна сила (з тренуваннями)'], ['EVR-000193', 'Будова сухожиль'], ['EVR-000194', 'Біль у колінах (остеоартрит)', {word: 'менше болю'}], ['EVR-000195', 'Функція колін (остеоартрит)', {word: 'краще'}]],
    rowsSource: 'Маса, сила, сухожилля — Bischof 2024; коліна — Simental-Mendía 2024 (шкала в анотації не названа).',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Болять суглоби?</b> Дані про біль — у людей з остеоартритом колін, і результати досліджень дуже різняться. Причину болю з’ясуй з лікарем.', '<b>Травма сухожилля чи зв’язки?</b> Колаген не замінює реабілітацію: дані про сухожилля мають дуже низьку певність.', '<b>Ефект на шкіру</b> показано в дослідженнях з упередженнями — очікування варто тримати скромними.'],
    facts: [['Безжирова маса', 'SMD 0,48', 'разом із тренуваннями; помірна певність'], ['Сила', 'SMD 0,19', 'разом із тренуваннями; низька певність'], ['Рівень впевненості', 'попередній', 'біля кожного твердження; формального наукового перегляду ще не було']]},
  {key: 'beta-alanine', base: betaAlanineBase, module: betaAlanineModule, art: '--base-x:50%;--base-y:100%', file: 'src/evidence/supplements/beta-alanine/module.mjs', exportName: 'betaAlanineBase', scale: 'linear', approvedOn: '22 жовтня 2026 року',
    headline: 'Для зусиль на 1–10 хвилин. Склад тіла не змінює',
    definition: 'Бета-аланін — амінокислота, з якої організм утворює карнозин у м’язах. Карнозин допомагає протидіяти зміні кислотності під час інтенсивної роботи.',
    lead: 'Після кількох тижнів щоденного прийому бета-аланін трохи подовжує виснажливі зусилля на 0,5–10 хвилин. На склад тіла не впливає. Єдиний підтверджений побічний ефект — поколювання шкіри.',
    rowsTitle: 'Що змінюється', rowsNote: 'Різниця з плацебо. ES — стандартизований ефект: 0,2 — малий, 0,5 — помірний; для складу тіла — кілограми.',
    rows: [['EVR-000197', 'Загальний ефект'], ['EVR-000198', 'Зусилля 0,5–10 хв до виснаження'], ['EVR-000199', 'Тести на час'], ['EVR-000200', 'Треновані чоловіки, максимальні зусилля'], ['EVR-000202', 'Безжирова маса'], ['EVR-000203', 'Жирова маса']],
    rowsSource: 'Saunders 2017; треновані чоловіки — Georgiou 2024; склад тіла — Ashtary-Larky 2022.',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Поколювання шкіри</b> після прийому — очікуваний ефект; воно менше, якщо ділити дозу на прийоми по 1,6 г.', '<b>Ефект не з першої дози:</b> карнозин у м’язах накопичується тижнями щоденного прийому.', '<b>Тренуєшся на силу чи масу?</b> Склад тіла бета-аланін не змінює.'],
    facts: [['Доза', '4–6 г/добу', 'щонайменше 2–4 тижні (ISSN 2015)'], ['Поколювання', '× 8,9', 'шанси порівняно з плацебо'], ['Рівень впевненості', 'попередній', 'біля кожного твердження; формального наукового перегляду ще не було']]},
  {key: 'citrulline', base: citrullineBase, module: citrullineModule, art: '--base-x:75%;--base-y:100%', file: 'src/evidence/supplements/citrulline/module.mjs', exportName: 'citrullineBase', scale: 'linear', approvedOn: '22 жовтня 2026 року', scaleNote: 'Крапка — середня оцінка, смуга — 95% довірчий інтервал; кожен рядок має власну шкалу. Порожня крапка — інтервалу в джерелі немає, є лише значущість.',
    headline: 'Ефект малий або відсутній',
    definition: 'Цитрулін — амінокислота, яку організм може перетворювати на аргінін. Аргінін бере участь в утворенні оксиду азоту — сигнальної молекули для судин.',
    lead: 'У найбільшому метааналізі цитрулін-малат дав лише малий загальний ефект зі слабкими доказами. На витривалість і силу різниці не виявлено. Біль через добу після тренування трохи менший, але далі — ні.',
    rowsTitle: 'Що змінюється', rowsNote: 'Різниця з плацебо. g і SMD — стандартизований ефект: 0,2 — малий, 0,5 — помірний.',
    rows: [['EVR-000206', 'Загальний ефект (цитрулін-малат)'], ['EVR-000207', 'Час до виснаження'], ['EVR-000208', 'Час на дистанції'], ['EVR-000209', 'Сила в тренованих']],
    rowsSource: 'Wang 2026; витривалість — Harnden 2023; сила — Aguiar 2021.',
    safetyTitle: 'Перш ніж приймати',
    safety: ['<b>Не чекай великого ефекту:</b> у найбільшому огляді певність низька або дуже низька, надійної дози й часу прийому не встановлено.', '<b>Тиск:</b> метааналіз про зниження тиску відкликано — на цитрулін як на засіб від тиску не розраховуй.', '<b>Склад добавок</b> цитрулін-малату в дослідженнях не завжди перевіряли.'],
    facts: [['Загальний ефект', 'g 0,16', 'низька або дуже низька певність'], ['Витривалість і сила', 'без різниці', 'інтервали перетинають нуль'], ['Рівень впевненості', 'попередній', 'біля кожного твердження; формального наукового перегляду ще не було']]},
  {key: 'electrolytes', base: electrolytesBase, module: electrolytesModule, art: '--base-x:100%;--base-y:100%', file: 'src/evidence/supplements/electrolytes/module.mjs', exportName: 'electrolytesBase', scale: 'linear', approvedOn: '22 жовтня 2026 року', scaleNote: 'Крапка — середня оцінка, смуга — 90% інтервал (так подано в джерелі); кожен рядок має власну шкалу.',
    headline: 'Для довгих навантажень і відновлення',
    definition: 'Електроліти — мінеральні іони, зокрема натрій і калій. Вони беруть участь у водному балансі та роботі нервів і м’язів.',
    lead: 'Після зневоднення спортивний напій з вуглеводами й електролітами відновлює рідину краще за воду. Під час довгого навантаження гіпотонічний напій трохи краще зберігає рідину. Пити забагато — теж ризик.',
    rowsTitle: 'Що змінюється', rowsNote: 'Різниця у зміні об’єму плазми під час безперервного навантаження, відсоткові пункти. Більше — краще збережена рідина.',
    rows: [['EVR-000213', 'Гіпотонічний напій проти води', {word: 'краще'}], ['EVR-000214', 'Гіпотонічний проти ізотонічного', {word: 'краще'}]],
    rowsSource: 'Rowlands 2021 (28 досліджень).',
    safetyTitle: 'Перш ніж пити',
    safety: ['<b>Не перепивай:</b> надлишок рідини загрожує гіпонатріємією — низьким натрієм у крові. Мета — покрити втрати, а не пити якомога більше.', '<b>Коротке тренування?</b> Досліджені переваги електролітів стосуються тривалих навантажень, спеки й відновлення після зневоднення.', '<b>Після зневоднення</b> підійде спортивний напій з 4–9% вуглеводів або знежирене молоко.'],
    facts: [['Після зневоднення', '4–9%', 'вуглеводно-електролітний напій краще за воду'], ['Під час навантаження', '≈ 1%', 'перевага гіпотонічного напою над водою за об’ємом плазми'], ['Рівень впевненості', 'попередній', 'біля кожного твердження; формального наукового перегляду ще не було']]},
];

function check(card) {
  for (const id of card.module.claimIds) {
    const c = card.base.claims.find(x => x.id === id);
    if (!c) throw Error('Unknown Claim ' + id);
    // Since 2026-10-22 a level is allowed only with the owner's confidence approval (provisional, with a stated reason).
    if (c.evidenceConfidence !== null && (c.confidenceAcceptance?.kind !== 'user_confidence_approval' || !c.provisional || !c.confidenceRationale?.summary)) throw Error('Confidence level without owner approval: ' + id);
    if (!c.publicationApproved || c.publicationAcceptance?.kind !== 'user_wording_approval') throw Error('Wording not approved: ' + id);
  }
}

const sig = x => (x < 0 ? '−' : x > 0 ? '+' : '') + new Intl.NumberFormat('uk-UA', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(Math.abs(x));
const short = {'Стандартизована різниця середніх': 'SMD', 'Hedges g': 'g', 'Розмір ефекту': 'ES'};
const units = {mmHg: 'мм рт. ст.', min: 'хв', kg: 'кг', '%': '%', points: 'бала', 'cramps/week': 'судом/тиж', pp: 'в. п.'};
// Linear rows: options.better ('lower' when a smaller value is the better result, e.g. time), options.harm (gold when clear).
function LinearRows(card) {
  return card.rows.map(([id, label, o = {}]) => {
    const r = card.base.records.find(x => x.id === id)?.result;
    const hasCI = typeof r?.lowerCI === 'number' && typeof r?.upperCI === 'number';
    // A row without a reported interval needs an explicit reported significance (e.g. «p < 0,01»); it is drawn as a hollow point only.
    if (!hasCI && !(typeof r?.significant === 'boolean' && r.pValueText)) throw Error('Row needs an interval or a reported p-value: ' + id);
    const R = (hasCI ? Math.max(Math.abs(r.lowerCI), Math.abs(r.upperCI)) : Math.abs(r.estimate) * 1.4) * 1.25, pos = v => ((v + R) / (2 * R) * 100).toFixed(1);
    const clear = !hasCI ? r.significant : typeof r.pValue === 'number' ? r.pValue < 0.05 : r.upperCI < 0 || r.lowerCI > 0;
    const value = (short[r.effectMeasure] ? short[r.effectMeasure] + ' ' : '') + sig(r.estimate) + (units[r.unit] ? ' ' + units[r.unit] : '');
    const word = !clear ? 'різниці не виявлено' : o.word || (r.estimate > 0 ? 'більше' : 'менше');
    const up = clear && o.harm;
    // Non-95% intervals (e.g. Rowlands 2021: 90% compatibility limits) are named as such, not as a 95% CI.
    const other = r.confidenceLevel && r.confidenceLevel !== 95;
    const level = other ? r.confidenceLevel + '% інтервал ' : 'ДІ ';
    const label95 = other ? r.confidenceLevel + '% інтервал' : '95% ДІ';
    const aria = hasCI ? `${label95} від ${sig(r.lowerCI)} до ${sig(r.upperCI)}` : `довірчий інтервал у джерелі не наведено, ${r.pValueText}`;
    const bar = hasCI ? `<i class="bc-ci" style="left:${pos(r.lowerCI)}%;width:${(pos(r.upperCI) - pos(r.lowerCI)).toFixed(1)}%"></i>` : '';
    const ciText = hasCI ? `${level}${sig(r.lowerCI)}…${sig(r.upperCI)}` : `ДІ не наведено · ${r.pValueText}`;
    return `<li class="bc-row${clear ? '' : ' bc-null'}${up ? ' bc-up' : ''}${hasCI ? '' : ' bc-noci'}"><div class="bc-label"><b>${e(label)}</b><span>${e(value)} · ${e(word)}</span></div><div class="bc-axis" role="img" aria-label="${e(label)}: ${e(value)}, ${e(aria)}"><i class="bc-zero" style="left:50%"></i>${bar}<i class="bc-dot" style="left:${pos(r.estimate)}%"></i></div><small class="bc-ci-text">${e(ciText)}</small></li>`;
  }).join('');
}

function Rows(card) {
  if (card.scale === 'linear') return LinearRows(card);
  const rs = card.rows.map(([id, label]) => {const r = card.base.records.find(x => x.id === id); if (!r?.result?.lowerCI) throw Error('Row needs a ratio record: ' + id); return {label, ...r.result};});
  const R = Math.max(...rs.flatMap(r => [Math.abs(Math.log(r.lowerCI)), Math.abs(Math.log(r.upperCI))])) * 1.15;
  const pos = v => ((Math.log(v) + R) / (2 * R) * 100).toFixed(1);
  return rs.map(r => {
    // A reported p-value decides when the rounded interval touches 1 (Sanders 2010: 1,00…1,59, p = 0,047).
    const clear = typeof r.pValue === 'number' ? r.pValue < 0.05 : r.upperCI < 1 || r.lowerCI > 1;
    const word = !clear ? 'різниці не виявлено' : r.estimate < 1 ? 'рідше' : 'частіше';
    return `<li class="bc-row${clear ? '' : ' bc-null'}${clear && r.estimate > 1 ? ' bc-up' : ''}"><div class="bc-label"><b>${e(r.label)}</b><span>${num(r.estimate)} · ${word}</span></div><div class="bc-axis" role="img" aria-label="${e(r.label)}: ${e(r.effectMeasure)} ${num(r.estimate)}, 95% ДІ від ${num(r.lowerCI)} до ${num(r.upperCI)}"><i class="bc-zero" style="left:50%"></i><i class="bc-ci" style="left:${pos(r.lowerCI)}%;width:${(pos(r.upperCI) - pos(r.lowerCI)).toFixed(1)}%"></i><i class="bc-dot" style="left:${pos(r.estimate)}%"></i></div><small class="bc-ci-text">ДІ ${num(r.lowerCI)}…${num(r.upperCI)}</small></li>`;
  }).join('');
}

function CompactClaim(card, id) {
  const c = card.base.claims.find(x => x.id === id);
  return `<article class="eua-claim bc-claim" data-claim-id="${e(c.id)}"><div class="eua-kicker">${e(types[c.claimType] || c.claimType)} · ${e(layers[c.evidenceLayer])}</div><h3>${e(card.base.presentation.labels[id])}</h3><p class="eua-statement">${e(c.shortStatement)}</p>${ConfidenceBadge(c)}${claimButton(id, 'Докази й межі')}</article>`;
}

export function SupplementCard(card) {
  check(card);
  const k = card.key, b = card.base, m = card.module;
  const sources = b.sources.map(s => SourceCard(s, b.records.filter(r => r.sourceId === s.id), true, k + '-source', 3)).join('');
  return `<div class="eua-module pc bc" data-supplement-card="${k}">
<div class="base-intro"><div class="base-copy"><h2 class="pc-headline">${e(card.headline)}</h2><p class="base-definition">${e(card.definition)}</p><p class="pc-lead">${e(card.lead)}</p></div><div class="base-art" style="${card.art}" aria-hidden="true"></div></div>
<section class="pc-scale" aria-labelledby="${k}-effects-title"><h2 id="${k}-effects-title">${e(card.rowsTitle)}</h2><p class="pc-sub">${e(card.rowsNote)}</p><ul class="bc-forest">${Rows(card)}</ul><p class="pc-foot">${e(card.rowsSource)} ${e(card.scaleNote || ('Крапка — середня оцінка, смуга — 95% довірчий інтервал; ' + (card.scale === 'linear' ? 'кожен рядок має власну шкалу.' : 'шкала логарифмічна.')))}</p></section>
<section class="bc-safety" aria-labelledby="${k}-safety-title"><h2 id="${k}-safety-title">${e(card.safetyTitle)}</h2><ul>${card.safety.map(s => `<li>${s}</li>`).join('')}</ul></section>
<div class="pc-facts">${card.facts.map(([a, v, n]) => `<div><span>${e(a)}</span><strong>${e(v)}</strong><small>${e(n)}</small></div>`).join('')}</div>
<h2 class="pc-h2">Твердження й докази</h2><div class="eua-claim-grid bc-claims bc-claims-4">${m.claimIds.map(id => CompactClaim(card, id)).join('')}</div>
<section class="pc-not" aria-labelledby="${k}-not-title"><h2 id="${k}-not-title">Чого ми не стверджуємо</h2>${m.notClaimed.map(n => `<article><h3>${e(n.topic)}</h3><p>${e(n.reason)}</p></article>`).join('')}</section>
<details class="pc-more"><summary>Межі всіх досліджень</summary><ul>${m.commonLimits.map(l => `<li>${e(l)}</li>`).join('')}</ul></details>
<details class="pc-more"><summary>Джерела (${b.sources.length})</summary><div class="eua-source-grid">${sources}</div></details>
<p class="pc-status">Науковий перегляд: не завершено · Формулювання погоджено ${e(card.approvedOn || '21 жовтня 2026 року')} · Матеріал освітній і не є персональною медичною рекомендацією.</p>
<dialog class="eua-dialog" data-supplement-dialog="${k}" aria-label="Докази до твердження: ${e(m.title)}"><div data-evidence-content></div></dialog>
</div>`;
}

const S = ':is(#supplement-omega,#supplement-vitd,#supplement-caffeine,#supplement-magnesium,#supplement-collagen,#supplement-beta-alanine,#supplement-citrulline,#supplement-electrolytes)';
const css = `${S} .bc-up .bc-ci{background:#e7bd46}${S} .bc-up .bc-dot{background:#f3d98a}${S} .bc-up .bc-label span{color:#f3d98a}
${S} .bc-claims-4{grid-template-columns:repeat(4,minmax(0,1fr))}
@media(max-width:1100px){${S} .bc-claims-4{grid-template-columns:repeat(2,minmax(0,1fr))}}
${S} .bc-noci .bc-dot{background:transparent;border:2px solid #b9f5ff}`;

const camel = key => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const ui = () => `// Generated by scripts/build-supplement-cards.mjs. Opens the evidence drawer for the approved supplement cards.
${cards.map(c => `import {${c.exportName} as ${camel(c.key)}Base} from './${c.key}-data.js?v=1';`).join('\n')}
import {mountEvidenceDrawer} from './components.js?v=2.0';
if (typeof document !== 'undefined') for (const [id, key, base] of [${cards.map(c => `['${c.module.route}', '${c.key}', ${camel(c.key)}Base]`).join(', ')}]) {
  const root = document.getElementById(id);
  if (root) mountEvidenceDrawer(root, base, {dialogSelector: '[data-supplement-dialog="' + key + '"]'});
}
`;

export function buildSupplementCards() {
  let html = fs.readFileSync(indexPath, 'utf8');
  for (const card of cards) {
    const src = fs.readFileSync(path.join(root, card.file), 'utf8');
    if (!src.includes("from '../../core/registry.mjs'")) throw Error('Registry import changed: ' + card.file);
    fs.writeFileSync(path.join(out, card.key + '-data.js'), '// Generated from ' + card.file + '.\n' + src.replace("from '../../core/registry.mjs'", "from './registry.js'"));
    const markers = new RegExp('(<!-- CARD:' + card.key + ':START -->)[\\s\\S]*?(<!-- CARD:' + card.key + ':END -->)');
    if (!markers.test(html)) throw Error('CARD markers missing for ' + card.key);
    html = html.replace(markers, (_, a, z) => a + SupplementCard(card) + z);
  }
  fs.writeFileSync(path.join(out, 'supplement-cards-ui.js'), ui());
  html = html.replace(/<style data-supplement-cards-style>[\s\S]*?<\/style>/g, '').replace(/<script[^>]*data-supplement-cards-script[^>]*><\/script>/g, '');
  html = html.replace('</head>', '<style data-supplement-cards-style>' + css + '</style></head>');
  html = html.replace('</body>', '<script type="module" src="./evidence/supplement-cards-ui.js?v=3" data-supplement-cards-script></script></body>');
  fs.writeFileSync(indexPath, html);
}
