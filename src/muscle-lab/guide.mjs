// «Від нерва до росту» — the owner's material (PDF «Від м’яза до молекул…», 26.10.2026) rewritten in plain words.
// Every number below was checked against the PubMed abstract of its source (see guideSources).
// These are sourced explanations, not Claims: no confidence level is assigned (owner decision pending).
// Markup rules: no <header> (the shell injects navigation after every header), labels are HTML (not SVG text),
// external links only (no request before a click), one control per action.

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const guideSources=[
 {id:'mukund',short:'Mukund 2019',title:'Skeletal muscle: A review of molecular structure and function, in health and disease',journal:'WIREs Syst Biol Med',year:2019,pmid:'31407867',doi:'10.1002/wsbm.1462',type:'Огляд'},
 {id:'dasbarman',short:'Das Barman 2026',title:'A who’s who of cell types in skeletal muscle',journal:'Communications Biology',year:2026,pmid:'42693270',doi:'10.1038/s42003-026-10803-x',type:'Огляд'},
 {id:'gordon',short:'Gordon 2000',title:'Regulation of contraction in striated muscle',journal:'Physiological Reviews',year:2000,pmid:'10747208',doi:'10.1152/physrev.2000.80.2.853',type:'Огляд'},
 {id:'endo',short:'Endo 2026',title:'Molecular genetics of skeletal muscle diseases associated with abnormal excitation–contraction coupling',journal:'Journal of Human Genetics',year:2026,pmid:'42572084',doi:'10.1038/s10038-026-01499-2',type:'Огляд'},
 {id:'delvecchio',short:'Del Vecchio 2019',title:'The increase in muscle force after 4 weeks of strength training is mediated by adaptations in motor unit recruitment and rate coding',journal:'Journal of Physiology',year:2019,pmid:'30727028',doi:'10.1113/JP277250',type:'Контрольоване дослідження, 14 + 14 людей'},
 {id:'wackerhage',short:'Wackerhage 2019',title:'Stimuli and sensors that initiate skeletal muscle hypertrophy following resistance exercise',journal:'Journal of Applied Physiology',year:2019,pmid:'30335577',doi:'10.1152/japplphysiol.00685.2018',type:'Огляд'},
 {id:'schiaffino',short:'Schiaffino 2021',title:'Molecular Mechanisms of Skeletal Muscle Hypertrophy',journal:'Journal of Neuromuscular Diseases',year:2021,pmid:'33216041',doi:'10.3233/JND-200568',type:'Огляд'},
 {id:'moesgaard',short:'Moesgaard 2026',title:'Sex- and fiber type-specific remodeling of the muscle proteome implicates CSRP3 in resistance training-induced hypertrophy',journal:'Nature Communications',year:2026,pmid:'42823422',doi:'10.1038/s41467-026-77275-9',type:'Дослідження людей (8 тижнів) + досліди на мишах'},
 {id:'sartori',short:'Sartori 2021',title:'Mechanisms of muscle atrophy and hypertrophy: implications in health and disease',journal:'Nature Communications',year:2021,pmid:'33436614',doi:'10.1038/s41467-020-20123-1',type:'Огляд'},
 {id:'egan',short:'Egan 2013',title:'Exercise metabolism and the molecular regulation of skeletal muscle adaptation',journal:'Cell Metabolism',year:2013,pmid:'23395166',doi:'10.1016/j.cmet.2012.12.012',type:'Огляд'},
 {id:'granata',short:'Granata 2021',title:'High-intensity training induces non-stoichiometric changes in the mitochondrial proteome of human skeletal muscle',journal:'Nature Communications',year:2021,pmid:'34862379',doi:'10.1038/s41467-021-27153-3',type:'Дослідження людей'},
 {id:'acsm',short:'ACSM 2026',title:'American College of Sports Medicine Position Stand. Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews',journal:'Medicine & Science in Sports & Exercise',year:2026,pmid:'41843416',doi:'10.1249/MSS.0000000000003897',type:'Позиція ACSM: огляд 137 систематичних оглядів'},
 {id:'schoenfeld',short:'Schoenfeld 2017',title:'Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training',journal:'Journal of Strength and Conditioning Research',year:2017,pmid:'28834797',doi:'10.1519/JSC.0000000000002200',type:'Метааналіз, 21 дослідження'},
 {id:'refalo',short:'Refalo 2022',title:'Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy',journal:'Sports Medicine',year:2022,pmid:'36334240',doi:'10.1007/s40279-022-01784-y',type:'Метааналіз, 15 досліджень'},
 {id:'schumann',short:'Schumann 2021',title:'Compatibility of Concurrent Aerobic and Strength Training for Skeletal Muscle Size and Function',journal:'Sports Medicine',year:2021,pmid:'34757594',doi:'10.1007/s40279-021-01587-7',type:'Метааналіз, 43 дослідження'},
 {id:'morton',short:'Morton 2018',title:'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults',journal:'British Journal of Sports Medicine',year:2018,pmid:'28698222',doi:'10.1136/bjsports-2017-097608',type:'Метааналіз, 49 РКД, 1863 учасники'},
 {id:'monteyne',short:'Monteyne 2023',title:'Vegan and Omnivorous High Protein Diets Support Comparable Daily Myofibrillar Protein Synthesis Rates and Skeletal Muscle Hypertrophy in Young Adults',journal:'Journal of Nutrition',year:2023,pmid:'36822394',doi:'10.1016/j.tjnut.2023.02.023',type:'Рандомізоване дослідження, 22 людини (10 тижнів)'},
 {id:'henselmans',short:'Henselmans 2026',title:'The Effect of Carbohydrate Intake on Muscle Hypertrophy',journal:'Sports Medicine',year:2026,pmid:'41712097',doi:'10.1007/s40279-025-02341-z',type:'Метааналіз, 11 досліджень, низька впевненість (GRADE)'},
 {id:'lamon',short:'Lamon 2021',title:'The effect of acute sleep deprivation on skeletal muscle protein synthesis and the hormonal environment',journal:'Physiological Reports',year:2021,pmid:'33400856',doi:'10.14814/phy2.14660',type:'Рандомізоване перехресне дослідження, 13 людей'},
 {id:'radaelli',short:'Radaelli 2024',title:'Effects of Resistance Training Volume on Physical Function, Lean Body Mass and Lower-Body Muscle Hypertrophy and Strength in Older Adults',journal:'Sports Medicine',year:2024,pmid:'39405023',doi:'10.1007/s40279-024-02123-z',type:'Мережевий метааналіз, 151 РКД, 6306 людей'},
 {id:'cma',short:'Santiago-Fernández 2025',title:'Age-related decline of chaperone-mediated autophagy in skeletal muscle leads to progressive myopathy',journal:'Nature Metabolism',year:2025,pmid:'41339969',doi:'10.1038/s42255-025-01412-9',type:'Досліди на мишах + зразки м’язів людей'},
 {id:'cui',short:'Cui 2025',title:'Exploring motor unit and neuromuscular junction dysfunction in aging and sarcopenia: insights from electromyography in systematic review',journal:'GeroScience',year:2025,pmid:'40627125',doi:'10.1007/s11357-025-01760-0',type:'Систематичний огляд, 53 статті'},
 {id:'hulmi',short:'Hulmi 2025',title:'Human skeletal muscle possesses both reversible proteomic signatures and a retained proteomic memory after repeated resistance training',journal:'Journal of Physiology',year:2025,pmid:'40183698',doi:'10.1113/JP288104',type:'Дослідження людей, 30 учасників'},
 {id:'gilhus',short:'Gilhus 2019',title:'Myasthenia gravis',journal:'Nature Reviews Disease Primers',year:2019,pmid:'31048702',doi:'10.1038/s41572-019-0079-y',type:'Огляд'},
 {id:'brown',short:'Brown 2017',title:'Amyotrophic Lateral Sclerosis',journal:'New England Journal of Medicine',year:2017,pmid:'28700839',doi:'10.1056/NEJMra1603471',type:'Огляд'},
 {id:'mercuri',short:'Mercuri 2019',title:'Muscular dystrophies',journal:'Lancet',year:2019,pmid:'31789220',doi:'10.1016/S0140-6736(19)32910-1',type:'Огляд'},
 {id:'kubota',short:'Kubota 2025',title:'Molecular genetics of skeletal muscle channelopathies',journal:'Journal of Human Genetics',year:2025,pmid:'40770230',doi:'10.1038/s10038-025-01370-w',type:'Огляд'},
 {id:'cruz',short:'Cruz-Jentoft 2019',title:'Sarcopenia',journal:'Lancet',year:2019,pmid:'31171417',doi:'10.1016/S0140-6736(19)31138-9',type:'Огляд'}
];

const src=id=>{const s=guideSources.find(s=>s.id===id);if(!s)throw Error('Unknown guide source '+id);return s;};
const doiUrl=s=>'https://doi.org/'+s.doi;
const cite=(...ids)=>`<p class="mg-src">Джерела: ${ids.map(id=>{const s=src(id);return `<a href="${esc(doiUrl(s))}" rel="noopener noreferrer">${esc(s.short)}</a>`;}).join(' · ')}</p>`;
const fold=(title,body,id='')=>`<details class="mg-fold"${id?` id="${id}"`:''}><summary>${esc(title)}</summary><div class="mg-fold-body">${body}</div></details>`;
const table=(head,rows,caption)=>`<div class="mg-table-wrap"><table class="mg-table">${caption?`<caption>${esc(caption)}</caption>`:''}<thead><tr>${head.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>i===0?`<th scope="row">${esc(c)}</th>`:`<td data-label="${esc(head[i])}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

// ── «М’яз за 30 секунд» (visible) ───────────────────────────────────────────
export const molecules=[
 {name:'Ca²⁺',text:'«Дозвіл» на скорочення: зв’язується з тропоніном C і відкриває актин для міозину.'},
 {name:'АТФ',text:'Енергія для кожного кроку головки міозину і для повернення кальцію назад, тобто для розслаблення.'},
 {name:'mTORC1',text:'Один із центральних регуляторів синтезу білка й росту клітини.'},
 {name:'Міостатин',text:'Одне з природних «гальм» м’язової маси.'}
];
export function renderQuick(){
 return `<section id="quick" class="mg-quick" aria-labelledby="quick-title">
<h2 id="quick-title">М’яз за 30 секунд</h2>
<p>М’яз складається з пучків, пучки — з волокон, волокна — з міофібрил, а міофібрили — з тисяч саркомерів. Усередині саркомера актин і міозин ковзають один уздовж одного. Нерв дає електричну команду, кальцій «відмикає» актин, а АТФ живить і скорочення, і розслаблення.</p>
<ul class="mg-molecules" aria-label="Чотири молекули, які варто запам’ятати">${molecules.map(m=>`<li><strong>${esc(m.name)}</strong><span>${esc(m.text)}</span></li>`).join('')}</ul>
</section>`;
}

// ── Chapter 1: structure in depth ───────────────────────────────────────────
const bands=[
 ['Z-диск','Межа саркомера; тут кріпляться тонкі нитки','Z-диски зближуються'],
 ['I-смуга','Лише тонкі нитки (актин)','Коротшає'],
 ['A-смуга','Уся довжина товстих ниток (міозин)','Довжина майже не змінюється'],
 ['H-зона','Середина без перекриття з актином','Зменшується'],
 ['M-лінія','Центр, що тримає товсті нитки','Лишається центром']
];
const fibers=[
 {name:'Тип I',tone:'slow',text:'Повільні, окисні: багато мітохондрій, витривалі.'},
 {name:'Тип IIa',tone:'mid',text:'Швидкі окисно-гліколітичні: проміжні властивості.'},
 {name:'Тип IIx',tone:'fast',text:'Найшвидші, більше покладаються на гліколіз, швидше втомлюються.'}
];
function chapterStructure(){
 return `<p class="mg-lead">Що стоїть за шістьма масштабами моделі вгорі: оболонки, смуги саркомера, кальцієве сховище, мітохондрії й типи волокон.</p>
${fold('Оболонки: ендомізій, перимізій, епімізій — і фасція',`<div class="mg-sheath-fig"><svg class="mg-rings" viewBox="0 0 190 150" role="img" aria-label="Переріз м’яза: дрібні волокна в ендомізії зібрані в пучки (перимізій), усі разом — в епімізії"><ellipse cx="95" cy="76" rx="88" ry="70" fill="#e3bd6b0d" stroke="#e3bd6b" stroke-width="3"/><circle cx="70" cy="60" r="23" fill="#83e9b912" stroke="#83e9b9" stroke-width="2"/><circle cx="60" cy="52" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="79" cy="51" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="70" cy="69" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="58" cy="68" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="82" cy="67" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="118" cy="52" r="23" fill="#83e9b912" stroke="#83e9b9" stroke-width="2"/><circle cx="108" cy="44" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="127" cy="43" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="118" cy="61" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="106" cy="60" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="130" cy="59" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="96" cy="98" r="23" fill="#83e9b912" stroke="#83e9b9" stroke-width="2"/><circle cx="86" cy="90" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="105" cy="89" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="96" cy="107" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="84" cy="106" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/><circle cx="108" cy="105" r="5.5" fill="#c2414155" stroke="#8bdefb" stroke-width="1.2"/></svg><ul class="mg-sheaths" aria-label="Оболонки м’яза">
<li><span class="mg-sheath mg-sheath-1" aria-hidden="true"></span><strong>Волокно → ендомізій</strong></li>
<li><span class="mg-sheath mg-sheath-2" aria-hidden="true"></span><strong>Пучок → перимізій</strong></li>
<li><span class="mg-sheath mg-sheath-3" aria-hidden="true"></span><strong>Увесь м’яз → епімізій</strong></li></ul></div>
<p>Ця сполучнотканинна сітка не лише «пакує» м’яз: вона передає силу вбік між волокнами, стабілізує їх і з’єднує м’яз із сухожилком. У м’язі є не тільки волокна, а й нерви, судини, фібробласти, імунні клітини та клітини-сателіти.</p>
<p><strong>Фасція ≠ епімізій.</strong> Епімізій — власна оболонка конкретного м’яза. Глибока фасція утворює ширші шари й відсіки та переходить в інші сполучні тканини. Вони пов’язані, але це не одне й те саме.</p>
${cite('dasbarman','mukund')}`)}
${fold('Волокно: одна гігантська клітина з багатьма ядрами',`<p>М’язове волокно — велика багатоядерна клітина, яка може тягнутися на значну частину довжини м’яза. Її мембрана — <strong>сарколема</strong>. Під оболонкою волокна чекають <strong>клітини-сателіти</strong> — стовбурові клітини м’яза: вони відновлюють волокно після пошкодження й можуть додавати йому нові ядра.</p>
<p>Усередині — тисячі <strong>міофібрил</strong>, зібраних із саркомерів. Саме правильне повторення саркомерів дає м’язу «посмугований» вигляд під мікроскопом. Білок <strong>тітин</strong> тягнеться через пів саркомера: центрує товсту нитку, дає пасивну пружність і, можливо, відчуває натяг (це ще досліджують).</p>
${cite('mukund','dasbarman')}`)}
${fold('Смуги саркомера: що коротшає, а що ні',`${table(['Ділянка','Що там','Під час скорочення'],bands,'Нитки не вкорочуються: змінюється лише їхнє перекриття')}
<p class="small">Це і є «ковзна модель»: актин і міозин зберігають довжину, змінюється лише те, наскільки вони заходять одне за одного. Подивитися наживо можна в анімації саркомера вище.</p>
${cite('gordon','mukund')}`)}
${fold('Кальцієве сховище: ретикулум, T-трубочки, тріада',`<div class="mg-triad" aria-hidden="true"><span class="mg-tr-sr">SR</span><span class="mg-tr-t">T</span><span class="mg-tr-sr">SR</span></div>
<p class="small mg-center">Тріада: T-трубочка між двома «цистернами» ретикулума.</p>
<p><strong>Саркоплазматичний ретикулум (SR)</strong> — мембранна сітка навколо міофібрил, головне швидке сховище кальцію. <strong>T-трубочки</strong> — заглибини сарколеми, які несуть електричний сигнал углиб товстого волокна. Одна T-трубочка між двома цистернами SR утворює <strong>тріаду</strong>.</p>
<p>У стінці T-трубочки <strong>CaV1.1</strong> «відчуває» електричний сигнал і механічно відчиняє <strong>RyR1</strong> у ретикулумі — кальцій виходить лавиною. Усередині SR кальцій тримає білок <strong>кальсеквестрин (CASQ1)</strong>, тому запас великий, а вільного кальцію там небагато.</p>
${cite('endo')}`)}
${fold('Мітохондрії: не лише «батарейки»',`<p>Мітохондрії в м’язі тісно вбудовані між міофібрилами. Вони виробляють АТФ киснем, але також беруть участь у кальцієвих сигналах і в контролі окисного стану клітини. Тренування на витривалість та інтервальні тренування можуть помітно збільшити кількість мітохондрій; в одному дослідженні людей інтервальні тренування змінили сотні транскриптів, білків і ліпідів мітохондрій, і не пропорційно, а вибірково.</p>
${cite('granata','egan')}`)}
${fold('Типи волокон: спектр, а не три коробки',`<div class="mg-fiber-scale" role="img" aria-label="Спектр типів волокон: від повільних окисних (тип I) до найшвидших (тип IIx); бувають гібридні волокна">${fibers.map(f=>`<span class="mg-fib mg-fib-${f.tone}">${esc(f.name)}</span>`).join('<i aria-hidden="true"></i>')}</div>
<ul class="mg-list">${fibers.map(f=>`<li><strong>${esc(f.name)}.</strong> ${esc(f.text)}</li>`).join('')}<li>Бувають <strong>гібридні</strong> волокна з ознаками двох типів.</li></ul>
<p>Тренування перебудовує волокна нерівномірно. У дослідженні 2026 року після 8 тижнів силових тренувань білковий склад волокон <strong>типу II</strong> змінився значно сильніше, ніж типу I.</p>
${cite('moesgaard','egan')}`)}`;
}

// ── Chapter 2: nerve → calcium → contraction (animated chain) ────────────────
export const signalChain=[
 {id:'mn',title:'Мотонейрон',text:'Потенціал дії біжить аксоном α-мотонейрона.'},
 {id:'ach',title:'Ацетилхолін',text:'У закінченні нерва входить Ca²⁺, і бульбашки викидають ацетилхолін у синаптичну щілину.'},
 {id:'nachr',title:'Рецептори на м’язі',text:'Ацетилхолін відкриває нікотинові рецептори — виникає потенціал кінцевої пластинки, а за ним потенціал дії волокна. Ацетилхолінестераза швидко прибирає медіатор.'},
 {id:'ttub',title:'Сарколема → T-трубочки',text:'Електричний сигнал біжить мембраною і заходить углиб волокна.'},
 {id:'ryr',title:'CaV1.1 → RyR1',text:'CaV1.1 відчуває напругу й механічно відчиняє RyR1. Кальцій виходить із ретикулума.'},
 {id:'tn',title:'Тропонін C',text:'Ca²⁺ сідає на тропонін C, тропоміозин зсувається — актин відкритий для міозину.'},
 {id:'xb',title:'Крос-містки',text:'Головки міозину чіпляються, тягнуть, відпускають — і так по колу, поки є кальцій і АТФ.'},
 {id:'force',title:'Сила',text:'Саркомери коротшають, м’яз тягне сухожилок.'}
];
const crossBridge=[
 ['Підготовка','Міозин розщеплює АТФ на АДФ і фосфат; головка «зведена»'],
 ['Зв’язування','Коли актин відкритий, головка чіпляється — утворюється крос-місток'],
 ['Силовий хід','Вихід фосфату повертає головку, і вона тягне актин; потім виходить АДФ'],
 ['Від’єднання','Нова молекула АТФ відриває головку від актину; після її розщеплення цикл повторюється']
];
function chapterSignal(){
 return `<p class="mg-lead">Скорочення починається не в м’язі, а в нервовій системі. Натисніть кнопку — сигнал пройде всім ланцюгом.</p>
<div class="mg-chain" data-chain data-chain-step="-1">
<button type="button" class="play-btn mg-chain-play" data-chain-play aria-pressed="false">▶ Пустити сигнал</button>
<ol class="mg-chain-list">${signalChain.map((s,i)=>`<li data-chain-index="${i}"><span class="mg-chain-dot" aria-hidden="true"></span><strong>${esc(s.title)}</strong><span>${esc(s.text)}</span></li>`).join('')}</ol>
<p class="small" data-chain-status aria-live="polite">Схема умовна: швидкість анімації не відповідає реальному часу (у тілі це мілісекунди).</p>
</div>
${fold('Цикл головки міозину: чотири кроки',`${table(['Крок','Що відбувається'],crossBridge)}
<p class="small">Спрощено: один повний цикл однієї головки пов’язаний приблизно з однією молекулою АТФ; швидкість залежить від типу міозину й навантаження.</p>
${cite('gordon')}`)}
${fold('Чому без АТФ м’яз не розслабляється',`<p>АТФ потрібна не тільки для «тяги». Вона:</p>
<ul class="mg-list"><li>відриває головку міозину від актину;</li><li>живить насос <strong>SERCA</strong>, який повертає Ca²⁺ у ретикулум;</li><li>підтримує іонні градієнти, без яких немає електричного сигналу.</li></ul>
<p>Коли SERCA прибирає кальцій, він сходить із тропоніну C, і тропоміозин знову закриває актин. Отже, <strong>розслаблення — теж робота, яка коштує енергії</strong>.</p>
<p class="small">У скелетному м’язі CaV1.1 — передусім датчик напруги, а не головний «вхід» кальцію ззовні. Цим скелетний м’яз відрізняється від серцевого.</p>
${cite('endo','gordon')}`)}`;
}

// ── Chapter 3: strength is not mass ─────────────────────────────────────────
function chapterStrength(){
 const factors=['Нервова активація','Архітектура м’яза','Скоротливий апарат','Сухожилки','Техніка руху'];
 return `<p class="mg-lead">Перші тижні тренувань сила росте швидше, ніж м’язи. Причина — нервова система.</p>
<div class="mg-formula" role="img" aria-label="Сила — це добуток нервової активації, архітектури м’яза, скоротливого апарату, сухожилків і техніки руху">${factors.map(f=>`<span>${esc(f)}</span>`).join('<b aria-hidden="true">×</b>')}<b aria-hidden="true">=</b><span class="mg-formula-out">Сила</span></div>
<p><strong>Моторна одиниця</strong> — один мотонейрон і всі волокна, які він керує. Щоб дати більше сили, мозок (1) вмикає більше одиниць — від «легких» до «важких» — і (2) змушує їх стріляти частіше, щоб окремі поштовхи зливалися.</p>
<p>У контрольованому дослідженні (14 людей тренувалися, 14 — ні) вже після <strong>4 тижнів</strong> силових тренувань мотонейрони розряджалися в середньому на <strong>3,3 імпульсу за секунду</strong> частіше, а вмикалися раніше. Тому «+20% сили» не означає «+20% м’язів».</p>
${cite('delvecchio')}`;
}

// ── Chapter 4: why muscle grows ─────────────────────────────────────────────
const growthFlow=[
 {t:'Механічне навантаження',s:'напруга у волокні'},
 {t:'Датчики натягу',s:'інтегрини, костамери, Z-диск, тітин…'},
 {t:'mTORC1',s:'+ амінокислоти, фактори росту'},
 {t:'S6K1 · 4E-BP1',s:'більше трансляції білка'},
 {t:'Рибосоми',s:'більше «фабрик» білка'},
 {t:'Гіпертрофія',s:'тижні й місяці повторів'}
];
function chapterGrowth(){
 return `<p class="mg-lead">Не «пошкодження → біль → ріст», а «навантаження → датчики → синтез білка → повтор тижнями».</p>
<ol class="mg-flow" aria-label="Від навантаження до росту">${growthFlow.map((f,i)=>`<li style="--i:${i}"><strong>${esc(f.t)}</strong><span>${esc(f.s)}</span></li>`).join('')}</ol>
${fold('Хто «відчуває» навантаження',`<p>Кандидати — інтегрини та FAK, костамери, білки Z-диска, тітин, фосфатидна кислота, білок CSRP3. Але <strong>одного головного датчика гіпертрофії у людини не знайдено</strong>. Огляд 2019 року називає механічні сигнали головними кандидатами, а пошкодження м’яза — ймовірно, не обов’язковим.</p>
<p>У 2026 році після 8 тижнів силових тренувань у людей змінилися сотні білків волокон; CSRP3 особливо зріс у волокнах типу II, а в мишей його надлишок збільшував м’язову масу. Це не доводить, що CSRP3 — «вимикач росту», але показує: ріст — мережа, а не один шлях.</p>
${cite('wackerhage','moesgaard')}`)}
${fold('mTORC1 та IGF-1: важливі, але не все',`<p><strong>mTORC1</strong> збирає сигнали від навантаження, амінокислот і факторів росту та посилює синтез білка (через S6K1 і 4E-BP1) і побудову рибосом.</p>
<p><strong>IGF-1</strong> може запускати шлях PI3K → Akt → mTOR. Але фраза «тренування дає IGF-1, а IGF-1 дає весь ріст» — спрощення: у мишей перевантажений м’яз ріс навіть без робочого рецептора IGF-1.</p>
${cite('schiaffino','wackerhage')}`)}
${fold('Клітини-сателіти й пошкодження',`<p>Клітини-сателіти особливо важливі для відновлення після серйозної травми й можуть додавати ядра при тривалому рості. Але вони беруть участь <strong>у деяких, не в усіх</strong> моделях гіпертрофії.</p>
<p>Пошкодження м’яза (особливо від незвичної ексцентричної роботи) може супроводжувати тренування, але його не треба «максимізувати» заради росту.</p>
${cite('schiaffino','wackerhage')}`)}`;
}

// ── Chapter 5: why muscle shrinks ───────────────────────────────────────────
const atrophySystems=[
 {t:'Протеасома (UPS)',s:'Білки мітять убіквітином і розбирають. Відомі «мітники» — MuRF1 і Atrogin-1; жоден не пояснює всю атрофію сам.'},
 {t:'FoxO',s:'За катаболічних умов вмикає гени розпаду й аутофагії. Akt його гальмує — тут перетинаються ріст і втрата.'},
 {t:'Аутофагія',s:'Прибирає пошкоджені органели й агрегати. Шкодить і надлишок, і нестача: здоровому м’язу потрібен нормальний потік.'},
 {t:'Міостатин',s:'Через ActRII і Smad2/3 обмежує масу. У тварин його блокування дає великий ріст; у людей результати складніші.'},
 {t:'Запалення (NF-κB)',s:'Важливе при кахексії, сепсисі, хронічних хворобах. Це не те саме, що коротка запальна відповідь після тренування.'}
];
const compare=[
 ['Напрям','Накопичення білків і структур','Втрата білків і структур'],
 ['Стимули','Прогресивне навантаження, амінокислоти, фактори росту','Іммобілізація, денервація, голод, тяжка хвороба, старіння'],
 ['mTORC1','Зазвичай активний','Часто знижений (але хронічно надмірний теж може шкодити)'],
 ['IGF-1/Akt','Підтримує анаболізм','Менше Akt — легше вмикається FoxO'],
 ['Протеасома','Звичайне оновлення білків','MuRF1, Atrogin-1 та інші можуть зростати'],
 ['Аутофагія','Потрібна для якості органел','Надлишок або нестача — патологія'],
 ['Міостатин','Гальмування сприяє масі','Підвищена активність підтримує втрату'],
 ['Клітини-сателіти','Можуть додавати ядра','Потенціал знижується з віком і хворобою'],
 ['Один «перемикач»?','Не встановлено','Не встановлено: залежить від причини']
];
function chapterAtrophy(){
 return `<p class="mg-lead">Атрофія — не «висихання», а активна перебудова. Механізм залежить від причини: гіпс, пошкоджений нерв, голод, старіння і тяжка хвороба діють по-різному.</p>
<ul class="mg-systems">${atrophySystems.map(a=>`<li><strong>${esc(a.t)}</strong><span>${esc(a.s)}</span></li>`).join('')}</ul>
${cite('sartori')}
${fold('Ріст і атрофія поруч: таблиця',`${table(['Що','Ріст','Атрофія'],compare)}${cite('sartori','schiaffino')}`)}`;
}

// ── Chapter 6: training, food, sleep ────────────────────────────────────────
// SMD rows: estimate with 95% CI exactly as in the abstracts; a row without a CI has no bar.
export const evidenceRows=[
 {label:'Кардіо + силові проти лише силових: розмір м’язів',est:-0.01,lo:-0.16,hi:0.18,src:'schumann'},
 {label:'Кардіо + силові: максимальна сила',est:-0.06,lo:-0.20,hi:0.09,src:'schumann'},
 {label:'Кардіо + силові: вибухова сила',est:-0.28,lo:-0.48,hi:-0.08,src:'schumann'},
 {label:'До повної відмови проти «не до відмови»: ріст',est:0.12,lo:-0.13,hi:0.37,src:'refalo'},
 {label:'Будь-яке визначення «відмови»: ріст',est:0.19,lo:0.00,hi:0.37,src:'refalo',note:'межа ДІ = 0, p = 0,045; автори називають перевагу тривіальною'},
 {label:'Старші люди, малий обсяг: безжирова маса',est:0.25,lo:0.10,hi:0.40,src:'radaelli'},
 {label:'Старші люди, малий обсяг: розмір м’язів ніг',est:0.40,lo:0.25,hi:0.54,src:'radaelli'},
 {label:'Більше вуглеводів (за однакового білка): ріст',est:0.15,lo:null,hi:null,src:'henselmans',note:'ДІ не наведено · p = 0,23 · низька впевненість'}
];
const SCALE={min:-0.6,max:0.8};
const pos=v=>((v-SCALE.min)/(SCALE.max-SCALE.min)*100).toFixed(1);
const fmt=v=>(v<0?'−':'')+Math.abs(v).toFixed(2).replace('.',',');
export function evidenceRowClass(r){
 if(r.lo===null)return 'mg-ev-noci';
 if(r.lo<0&&r.hi>0)return 'mg-ev-null';
 return r.est<0?'mg-ev-down':'mg-ev-up';
}
function evidenceChart(){
 const rows=evidenceRows.map(r=>{
  const cls=evidenceRowClass(r),s=src(r.src);
  const bar=r.lo===null?'':`<span class="mg-ev-ci" style="left:${pos(r.lo)}%;width:${(pos(r.hi)-pos(r.lo)).toFixed(1)}%"></span>`;
  const value=r.lo===null?`SMD ${fmt(r.est)} · ${esc(r.note)}`:`SMD ${fmt(r.est)} (95% ДІ ${fmt(r.lo)}…${fmt(r.hi)})${cls==='mg-ev-null'?' · різниці не виявлено':''}${r.note?' · '+esc(r.note):''}`;
  return `<li class="mg-ev-row ${cls}"><span class="mg-ev-label">${esc(r.label)} <a href="${esc(doiUrl(s))}" rel="noopener noreferrer">${esc(s.short)}</a></span><span class="mg-ev-track" aria-hidden="true"><span class="mg-ev-zero" style="left:${pos(0)}%"></span>${bar}<span class="mg-ev-dot" style="left:${pos(r.est)}%"></span></span><span class="mg-ev-value">${value}</span></li>`;
 }).join('');
 return `<figure class="mg-ev"><figcaption><strong>Що показали метааналізи</strong> <span class="small">Стандартизована різниця (SMD): 0 — різниці немає; праворуч — на користь першого варіанта. Кожен рядок — окреме порівняння.</span></figcaption><ul class="mg-ev-list">${rows}</ul><p class="mg-ev-axis small" aria-hidden="true"><span>−0,6</span><span>0</span><span>+0,8</span></p></figure>`;
}
const adaptBars=[
 ['Максимальна сила',5,2],
 ['Гіпертрофія',5,1.5],
 ['Нервова адаптація до великої сили',5,2],
 ['Мітохондрії',2.5,5],
 ['Окисна витривалість',2,5],
 ['Скоротливий апарат',5,2.5]
];
const practical=[
 ['Прогресивне силове тренування','↑ сила, ↑ м’язова маса','Основа програми; поступово збільшувати стимул'],
 ['Тижневий обсяг','До певної межі ↑ ріст','≈10 робочих підходів на м’язову групу на тиждень — стартова точка, не «магічне число»'],
 ['Важкі ваги','Особливо ↑ максимальна сила (1ПМ)','Для сили — важче; для росту діапазон ширший'],
 ['Повна відмова','Не обов’язково більший ріст','Не треба доводити кожен підхід до відмови'],
 ['Витривалість / інтервали','↑ мітохондрії, витривалість','Додавати для серця, обміну речовин і мітохондрій'],
 ['Кардіо + силові','Переважно сумісні','Кардіо не «скасовує» ріст; стежити за загальною втомою'],
 ['Білок','Підтримує перебудову','≈1,6 г/кг на добу — надійний орієнтир для тих, хто тренується'],
 ['Енергія','Великий тривалий дефіцит заважає','Не чекати максимального росту на жорсткій дієті'],
 ['Вуглеводи','Підтримують обсяг роботи','Не окремий «анаболік»'],
 ['Сон','Нестача може ↓ синтез білка','Сон — частина програми, а не бонус'],
 ['Іммобілізація','Атрофія','У реабілітації зберігати безпечне навантаження, наскільки дозволяє лікар']
];
function chapterTraining(){
 return `<p class="mg-lead">Найнадійніша формула для здорових дорослих: <strong>прогресивне силове навантаження + достатньо білка й енергії + сон + контроль втоми</strong>.</p>
<p class="mg-note">Це огляд джерел, а не окремі перевірені твердження (Claims): рівень впевненості для цих висновків не оцінено. Цифри взято з анотацій досліджень.</p>
<ul class="mg-keys">
<li><strong>≈10 підходів на тиждень</strong><span>на м’язову групу — з цього обсягу гіпертрофія була більшою (ACSM 2026, 137 систематичних оглядів, понад 30 000 людей). Також допомагало ексцентричне перевантаження.</span></li>
<li><strong>Відмова не обов’язкова</strong><span>У позиції ACSM тренування до відмови, періодизація, тип тренажерів і час під навантаженням не давали стабільної різниці.</span></li>
<li><strong>Легка вага теж ростить</strong><span>21 дослідження: м’язи росли однаково з легкими й важкими вагами (якщо підходи до відмови), а 1ПМ — більше з важкими.</span></li>
<li><strong>Кардіо не «вбиває» м’язи</strong><span>43 дослідження: розмір і максимальна сила — без різниці; вибухова сила трохи менша, особливо коли кардіо в тому самому тренуванні.</span></li>
</ul>
${cite('acsm','schoenfeld','schumann')}
${evidenceChart()}
${fold('Силові й витривалісні: різні акценти',`<div class="mg-adapt" role="img" aria-label="Концептуальна схема: силові тренування сильніше розвивають силу, гіпертрофію, нервову адаптацію і скоротливий апарат; витривалісні — мітохондрії та окисну витривалість">
<p class="mg-adapt-legend small"><span class="mg-k mg-k-s"></span>Силові <span class="mg-k mg-k-e"></span>Витривалісні</p>
${adaptBars.map(([t,s,e])=>`<div class="mg-adapt-row"><span>${esc(t)}</span><i class="mg-k-s" style="width:${s*20}%"></i><i class="mg-k-e" style="width:${e*20}%"></i></div>`).join('')}</div>
<p class="small">Концептуальна шкала, не розмір ефекту з дослідження. Адаптації перекриваються, а реальна відповідь залежить від режиму, обсягу, стажу й харчування.</p>
${cite('egan','granata')}`)}
${fold('Білок, вуглеводи, рослинне харчування',`<p><strong>Білок.</strong> Метааналіз 49 рандомізованих досліджень (1863 людини): додатковий білок під час тривалих силових тренувань трохи збільшував приріст безжирової маси — у середньому на 0,30 кг (95% ДІ 0,09…0,52). Понад ≈1,62 г/кг на добу додаткового приросту безжирової маси в середньому не було. Це орієнтир для групи, а не «стеля» для кожного. За хвороб нирок кількість білка треба узгоджувати з лікарем. Детальніше — у розділі <a href="./index.html#supplement-protein">Протеїн</a>.</p>
<p><strong>Рослинне харчування.</strong> У 10-тижневому дослідженні (22 молоді дорослі, ≈2 г білка/кг) веганська й змішана високобілкові дієти дали однаковий приріст: безжирова маса +2,6 і +3,1 кг, об’єм стегна +8,3% в обох групах.</p>
<p><strong>Вуглеводи</strong> потрібні для глікогену й працездатності, але метааналіз 11 досліджень не виявив, що самі по собі більше вуглеводів (за однакового білка) додають росту: SMD 0,15, p = 0,23, впевненість низька.</p>
${cite('morton','monteyne','henselmans')}`)}
${fold('Сон',`<p>У рандомізованому перехресному дослідженні 13 молодих дорослих одна ніч без сну знизила синтез м’язового білка після їжі на 18%; кортизол зріс на 21%, тестостерон знизився на 24%.</p>
<p>Це короткий експеримент: одна погана ніч не «знищує м’язи». Але він показує механізм, через який постійний недосип може гальмувати адаптацію. Більше — у розділі <a href="./sleep.html">Сон</a>.</p>
${cite('lamon')}`)}
${fold('Практична таблиця',`${table(['Фактор','Очікуваний вплив','Практичний висновок'],practical)}${cite('acsm','schoenfeld','refalo','schumann','morton','henselmans','lamon')}`)}`;
}

// ── Chapter 7: ageing ───────────────────────────────────────────────────────
function chapterAgeing(){
 return `<p class="mg-lead">Старіючий м’яз втрачає резерв, але не здатність тренуватися.</p>
<p>Вікова слабкість — не лише «менше тестостерону» чи «повільніший обмін». Тут і втрата моторних одиниць, і зміни нервово-м’язового синапсу, і вразливість швидких волокон, і слабша відповідь на білок, і робота мітохондрій, і запалення, і гірше «прибирання» в клітині.</p>
${fold('Нерв слабне раніше за м’яз',`<p>Систематичний огляд 53 статей: з віком нестабільною стає передача в синапсі, моторні одиниці гинуть і частково «перепідключаються», а нервова активація погіршується ще до явної атрофії. Тому в літньої людини сила може падати швидше, ніж маса.</p>${cite('cui')}`)}
${fold('Контроль якості білків',`<p>Один із видів «прибирання» в клітині — шаперон-опосередкована аутофагія (CMA) — з віком знижується і в м’язах людини. У мишей її втрата вела до слабкості, змін мітохондрій і порушеного обміну кальцію (білок SERCA виявився її «клієнтом»), а відновлення CMA у старих мишей частково покращувало м’язи. Це дослід на тваринах: для людей це поки механізм, а не лікування.</p>${cite('cma')}`)}
${fold('Чи можна наростити м’язи після 60–70?',`<p>Так. Мережевий метааналіз 151 рандомізованого дослідження (6306 людей від 60 років): навіть <strong>малий</strong> обсяг силових тренувань покращував безжирову масу (SMD 0,25; 95% ДІ 0,10…0,40) і розмір м’язів ніг (SMD 0,40; 0,25…0,54); для більшої сили потрібен більший обсяг. Дані — переважно для фізично здорових людей.</p>${cite('radaelli')}`)}`;
}

// ── Chapter 8: when the chain breaks (interactive map) ──────────────────────
export const chainLevels=[
 {id:'neuron',title:'Мотонейрон'},
 {id:'nmj',title:'Нервово-м’язовий синапс'},
 {id:'membrane',title:'Мембрана волокна'},
 {id:'triad',title:'Тріада: CaV1.1 → RyR1 → Ca²⁺'},
 {id:'sarcomere',title:'Актин — міозин'},
 {id:'scaffold',title:'Каркас і сарколема'},
 {id:'balance',title:'Баланс білків (mTOR ↔ розпад ↔ мітохондрії)'}
];
export const conditions=[
 {id:'als',name:'БАС',level:'neuron',text:'Бічний аміотрофічний склероз: гинуть верхні й нижні мотонейрони, м’яз втрачає нервове живлення — звідси слабкість і атрофія, хоча самі білки волокна спочатку не «винні».',src:'brown'},
 {id:'mg',name:'Міастенія',level:'nmj',text:'Аутоімунна хвороба: антитіла проти рецепторів ацетилхоліну, MuSK чи пов’язаних білків. Сигнал проходить менш надійно — слабкість, що посилюється при навантаженні.',src:'gilhus'},
 {id:'chan',name:'Каналопатії',level:'membrane',text:'Генетичні варіанти іонних каналів мембрани (CLCN1, SCN4A, CACNA1S, KCNJ2) порушують збудливість: міотонія (м’яз пізно розслабляється) або періодичні паралічі.',src:'kubota'},
 {id:'ecc',name:'Хвороби RYR1/CACNA1S',level:'triad',text:'Варіанти білків тріади порушують вихід або повернення кальцію: деякі вроджені міопатії, схильність до злоякісної гіпертермії, рабдоміоліз при навантаженні, теплові ураження.',src:'endo'},
 {id:'dys',name:'М’язові дистрофії',level:'scaffold',text:'Мутації понад 40 генів. Наприклад, дистрофіновий комплекс з’єднує саркомери з мембраною; без нього волокна постійно пошкоджуються й руйнуються.',src:'mercuri'},
 {id:'sarc',name:'Саркопенія',level:'balance',text:'Прогресивна втрата м’язової маси й функції, пов’язана з падіннями та немічністю. Важить не лише маса, а й сила та функція.',src:'cruz'},
 {id:'cach',name:'Кахексія',level:'balance',text:'Системний стан при тяжких хворобах: запалення, порушений обмін, втрата тканин. «Більше їсти й тренуватися» не замінює лікування.',src:'sartori'}
];
function chapterPathology(){
 const first=conditions[0];
 return `<p class="mg-lead">Слабкість може виникнути на будь-якому етапі ланцюга «нерв → кальцій → саркомер → білки». Оберіть стан — схема покаже, де саме.</p>
<p class="mg-note">Навчальна схема, не діагностика. Якщо слабкість наростає, з’являється без причини або поєднується з утрудненим ковтанням чи диханням — зверніться до лікаря.</p>
<div class="mg-path" data-path>
<div class="mg-path-picks" role="group" aria-label="Оберіть стан">${conditions.map((c,i)=>`<button type="button" data-condition="${c.id}" data-hit-level="${c.level}" aria-pressed="${i===0}" aria-controls="path-copy">${esc(c.name)}</button>`).join('')}</div>
<div class="mg-path-body">
<ol class="mg-path-levels" aria-label="Рівні системи">${chainLevels.map(l=>`<li data-hit-level="${l.id}"${l.id===first.level?' class="is-hit"':''}>${esc(l.title)}</li>`).join('')}</ol>
<div id="path-copy" class="mg-path-copy" aria-live="polite">${conditions.map((c,i)=>{const s=src(c.src);return `<div data-condition-panel="${c.id}"${i===0?'':' hidden'}><h4>${esc(c.name)}</h4><p>${esc(c.text)}</p><p class="mg-src">Джерело: <a href="${esc(doiUrl(s))}" rel="noopener noreferrer">${esc(s.short)}</a></p></div>`;}).join('')}</div>
</div></div>`;
}

// ── Chapter 9: takeaways + FAQ ──────────────────────────────────────────────
export const takeaways=[
 ['М’яз — система, а не «м’ясо»','Нерви, сполучна тканина, кальцій, мітохондрії й саркомери однаково важливі.'],
 ['Сила ≠ маса','Нервова адаптація може збільшити силу без такого ж росту м’язів.'],
 ['Кальцій запускає скорочення','Він відкриває актин для міозину.'],
 ['АТФ потрібна і для розслаблення','Насос SERCA працює на АТФ.'],
 ['mTOR важливий, але не єдиний','Ріст — мережа сигналів.'],
 ['IGF-1 не пояснює весь ріст','Механічні сигнали мають шляхи без IGF-1.'],
 ['Аутофагія — не просто «розпад»','Шкодить і надлишок, і нестача.'],
 ['Біль не потрібен','Ріст програмують навантаженням, а не пошкодженням.'],
 ['Кардіо не «вбиває» м’язи','Правильно поєднані тренування сумісні.'],
 ['Старий м’яз тренується','Вік зменшує резерв, але не скасовує пластичність.']
];
export const faq=[
 {q:'Чи потрібен сильний біль після тренування, щоб м’яз ріс?',a:'Ні. Крепатура й мікропошкодження можуть супроводжувати нове навантаження, але не є умовою росту. Мета — достатня напруга й поступове збільшення навантаження.',src:['wackerhage']},
 {q:'Чи треба тренуватися до відмови?',a:'Не в кожному підході. Метааналіз 15 досліджень не показав переваги повної відмови (SMD 0,12; 95% ДІ −0,13…0,37), а позиція ACSM 2026 не знайшла стабільного впливу. Зусилля важливе, особливо з легкою вагою, але відмова додає втоми.',src:['refalo','acsm']},
 {q:'Чи важча вага завжди дає більші м’язи?',a:'Ні. Важкі ваги краще розвивають максимальну силу, а ріст подібний у ширшому діапазоні ваг, якщо підходи достатньо важкі для м’яза.',src:['schoenfeld']},
 {q:'Що важливіше для росту — IGF-1 чи mTOR?',a:'Питання поставлене некоректно. IGF-1 може вмикати mTOR, але навантаження має й інші шляхи. Єдиного «головного вимикача» росту не встановлено.',src:['schiaffino','wackerhage']},
 {q:'Чому м’яз не скорочується без кальцію?',a:'Без кальцію тропоміозин закриває місця на актині, і міозин не може продуктивно чіплятися. Ca²⁺ на тропоніні C зсуває тропоміозин.',src:['gordon']},
 {q:'Чому без АТФ м’яз не розслабляється?',a:'АТФ відриває міозин від актину і живить SERCA, яка прибирає кальцій. Розслаблення — активна робота клітини.',src:['endo','gordon']},
 {q:'Чи можна одночасно розвивати м’язи й витривалість?',a:'Так. У середньому поєднання не зменшує ріст і максимальну силу; вибухова сила може трохи страждати, особливо коли кардіо в тому самому тренуванні.',src:['schumann']},
 {q:'Чи можна наростити м’язи після 60–70 років?',a:'Так. Силові тренування збільшують силу, функцію й м’язову масу і в старшому віці; навіть малий обсяг дає користь.',src:['radaelli']},
 {q:'Чи існує «м’язова пам’ять»?',a:'Так, на кількох рівнях: нервова пам’ять навички і, за новими даними, зміни в самому м’язі. У дослідженні 2025 року частина білкових змін трималася 2,5 місяця після припинення тренувань. Наскільки це прискорює повторний ріст — ще досліджують.',src:['hulmi']}
];
function chapterTakeaways(){
 return `<ol class="mg-take">${takeaways.map(([t,s])=>`<li><strong>${esc(t)}</strong><span>${esc(s)}</span></li>`).join('')}</ol>`;
}
function chapterFaq(){
 return `<div class="mg-faq">${faq.map(f=>`<details class="mg-fold"><summary>${esc(f.q)}</summary><div class="mg-fold-body"><p>${esc(f.a)}</p>${cite(...f.src)}</div></details>`).join('')}</div>`;
}

export const chapters=[
 {id:'structure-deep',title:'Будова глибше',hint:'Оболонки, смуги саркомера, кальцієве сховище, типи волокон',render:chapterStructure},
 {id:'signal',title:'Нерв → кальцій → скорочення',hint:'Анімований ланцюг сигналу, цикл міозину, роль АТФ',render:chapterSignal},
 {id:'strength',title:'Сила ≠ маса',hint:'Моторні одиниці й нервова адаптація',render:chapterStrength},
 {id:'why-grow',title:'Чому м’яз росте',hint:'Датчики натягу, mTORC1, IGF-1, клітини-сателіти',render:chapterGrowth},
 {id:'why-shrink',title:'Чому м’яз зникає',hint:'Протеасома, FoxO, аутофагія, міостатин',render:chapterAtrophy},
 {id:'training',title:'Тренування, їжа, сон',hint:'Обсяг, відмова, вага, кардіо, білок, сон — з цифрами',render:chapterTraining},
 {id:'ageing',title:'Старіння',hint:'Чому сила падає швидше за масу і що допомагає',render:chapterAgeing},
 {id:'disorders',title:'Коли ланцюг ламається',hint:'Де саме вражають БАС, міастенія, дистрофії та інші',render:chapterPathology},
 {id:'takeaways',title:'Головне в 10 тезах',hint:'Що варто запам’ятати',render:chapterTakeaways},
 {id:'faq',title:'Часті питання',hint:'Біль, відмова, вага, м’язова пам’ять',render:chapterFaq}
];

export function renderGuide(){
 return `<section id="guide" class="mg-guide" aria-labelledby="guide-title">
<h2 id="guide-title">Від нерва до росту</h2>
<p class="mg-guide-lead">Глибше по шарах. Відкривайте лише те, що цікаво.</p>
${chapters.map((c,i)=>`<details class="mg-chapter" id="${c.id}"><summary><span class="mg-num" aria-hidden="true">${i+1}</span><span class="mg-ch-text"><h3 class="mg-ch-title">${esc(c.title)}</h3><small>${esc(c.hint)}</small></span></summary><div class="mg-chapter-body">${c.render()}</div></details>`).join('\n')}
</section>`;
}

export function renderGuideSources(){
 return `<details class="source-details" id="guide-sources"><summary>Джерела розділу «Від нерва до росту» (${guideSources.length})</summary><ol class="mg-source-list">${guideSources.map(s=>`<li><a href="${esc(doiUrl(s))}" rel="noopener noreferrer">${esc(s.title)}</a><span class="small">${esc(s.journal)}, ${s.year} · ${esc(s.type)} · PMID ${esc(s.pmid)}</span></li>`).join('')}</ol><p class="small">Усі цифри перевірено за анотаціями в PubMed 26.10.2026. Рівень впевненості для цих висновків не оцінено. Зображення на сторінці — власні схеми, без чужих ілюстрацій.</p></details>`;
}

export const guideParts=()=>({QUICK:renderQuick(),GUIDE:renderGuide(),SOURCES:renderGuideSources()});
