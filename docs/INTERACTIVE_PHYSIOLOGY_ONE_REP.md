# Evidence UA — Interactive Physiology: One Rep

_Last updated: 2026-10-17_

This document defines the first interactive physiology experience for Evidence UA:

**«Що відбувається в м’язі під час одного повторення?»**

The goal is not to make a decorative animation. The goal is to connect visible movement to anatomy, cellular physiology, force production, fatigue, recovery, adaptation and evidence in one reusable learning flow.

Core learning spine:

`MOVEMENT → NERVOUS SYSTEM → NEUROMUSCULAR JUNCTION → Ca²⁺ → CROSS-BRIDGE CYCLING → ATP → FORCE → FATIGUE → RECOVERY → ADAPTATION → EVIDENCE`

This experience should become a reusable bridge between Exercise Library, Anatomy, Physiology, Atlas and Evidence Base.

---

## 1. Product goal

Create a mobile-first interactive module that answers a simple user question:

> **Що саме відбувається всередині м’яза, коли я роблю одне повторення?**

The experience should let the user move from a visible exercise to progressively deeper levels of explanation without forcing textbook-level detail from the start.

Primary use cases:

- from an Exercise Library entry: `Тяга гантелі → Що відбувається всередині м’яза?`;
- from Anatomy: `М’яз → Як він створює силу?`;
- from Physiology: `Motor unit / calcium / ATP → see it in motion`;
- from a future Evi answer: explain force, fatigue, soreness or adaptation with the same knowledge objects.

The first version should explain **one repetition**, not an entire training session.

---

## 2. User experience principle

The module should feel like **zooming into reality**.

Suggested visual progression:

```text
1. Людина виконує повторення
   ↓
2. Виділяється працююча ділянка / м’яз
   ↓
3. Камера «заходить» у м’яз
   ↓
4. М’язове волокно
   ↓
5. Нервово-м’язовий синапс
   ↓
6. Саркоплазматичний ретикулум / Ca²⁺
   ↓
7. Актин + міозин
   ↓
8. ATP / cross-bridge cycle
   ↓
9. Повернення до цілого м’яза: сила
   ↓
10. Втома
   ↓
11. Після підходу: відновлення
   ↓
12. Повторюване навантаження: адаптація
```

Every step should answer one clear question rather than showing all molecular detail at once.

---

## 3. Three-level explanation model

Every stage should support three layers.

### Layer A — Просто

One short sentence understandable without prior biology knowledge.

Example:

> Нервовий сигнал запускає процес, який дозволяє м’язовому волокну створити силу.

### Layer B — Детальніше

A short explanation using correct anatomical / physiological language.

Example:

> Потенціал дії доходить до нервово-м’язового синапсу, запускає вивільнення ацетилхоліну та деполяризацію мембрани м’язового волокна.

### Layer C — Чому ми так стверджуємо?

Evidence drawer connected to Claims / Sources / Evidence Records.

This drawer must distinguish:

- established foundational physiology;
- mechanistic observations;
- human training-outcome evidence;
- uncertainty or active debate.

Do not make every foundational anatomy fact look as if it requires a clinical RCT. Match evidence type to the type of claim.

---

## 4. Stage-by-stage content model

### Stage 1 — Intent + motor command

**User question:** «Звідки взагалі починається повторення?»

Simple:

> Рух починається з нервової системи: вона формує команду і активує потрібні моторні одиниці.

Detailed:

- descending motor command;
- alpha motor neuron output;
- motor unit concept;
- recruitment and firing rate should be mentioned carefully as mechanisms of force control, not as a simplistic one-variable explanation.

Interactive idea:

- tap the brain/spinal cord icon;
- highlight a path toward the working muscle;
- slider: **легке зусилля → високе зусилля**, changing the number/intensity of active motor-unit visual signals without implying a literal exact count.

Evidence boundary:

- foundational neurophysiology is high-confidence background;
- do not turn simplified recruitment graphics into claims about exact real-time recruitment for a specific user.

---

### Stage 2 — Neuromuscular junction

**Question:** «Як нерв “говорить” з м’язом?»

Simple:

> Нерв передає хімічний сигнал м’язовому волокну, і воно отримує команду скорочуватися.

Detailed:

- action potential reaches motor terminal;
- acetylcholine release;
- receptor activation;
- muscle-fiber membrane depolarization;
- propagation along sarcolemma and T-tubules.

Interactive idea:

- signal pulse arrives;
- vesicles release neurotransmitter;
- tap to reveal labels.

Avoid:

- unnecessary receptor-level pharmacology in MVP;
- claiming that stronger training changes this step in a direct one-to-one way unless backed by a specific Claim.

---

### Stage 3 — Calcium release

**Question:** «Навіщо м’язу кальцій?»

Simple:

> Кальцій відкриває доступ до системи, яка дозволяє актину й міозину взаємодіяти.

Detailed:

- excitation–contraction coupling;
- sarcoplasmic reticulum;
- calcium release;
- troponin / tropomyosin regulation;
- calcium enables cross-bridge interaction.

Interactive idea:

- before Ca²⁺: binding sites visually blocked;
- after Ca²⁺: sites become available.

Evidence boundary:

- present as core muscle physiology;
- do not imply that “more calcium = better hypertrophy” or another outcome claim.

---

### Stage 4 — Actin + myosin / cross-bridge cycle

**Question:** «Звідки береться механічна сила?»

Simple:

> Міозинові головки циклічно взаємодіють з актином і створюють силу всередині саркомера.

Detailed:

- cross-bridge attachment;
- power stroke;
- detachment;
- re-cocking;
- repeated cycling while activation and substrate conditions permit.

Interactive idea:

- draggable slow-motion sarcomere;
- “1 cycle” button;
- do not portray one cartoon cross-bridge as if it represents the whole muscle.

Important wording:

Use **force production / tension at the contractile level**, not simplistic “filaments pull the whole muscle shorter” language in every context, because whole-muscle behavior can include isometric and eccentric actions.

---

### Stage 5 — ATP

**Question:** «Навіщо потрібен ATP?»

Simple:

> ATP потрібен не лише для “енергії” — він необхідний для нормального циклу взаємодії міозину з актином та для відновлення іонних градієнтів.

Detailed:

Use a small split view:

- myosin cross-bridge cycling;
- Ca²⁺ handling;
- membrane ion-gradient restoration;
- ATP resynthesis from phosphocreatine, glycolytic and oxidative pathways as overlapping systems.

Important correction:

Do not teach energy systems as isolated switches such as “first ATP-PC, then glycolysis, then aerobic”. They overlap from the start, with changing relative contributions.

Interactive idea:

- three source meters that can all be active simultaneously;
- the module should show overlap, not sequential on/off blocks.

Potential future link:

`ATP / phosphocreatine → Creatine module`.

---

### Stage 6 — From sarcomeres to visible force

**Question:** «Як мікроскопічні події стають реальною силою?»

Simple:

> Сила окремих волокон сумується та передається через м’язово-сухожильний комплекс до кісток і зовнішнього навантаження.

Detailed:

- many sarcomeres and fibers contribute;
- neural drive and muscle properties influence force;
- muscle length / velocity / action type affect force production;
- connective tissue and tendon transmit load.

Interactive idea:

Zoom back out from sarcomere → fiber → fascicle → whole muscle → tendon → bone / external load.

Avoid:

- presenting one “optimal angle” as universal without defining task and outcome;
- confusing internal muscle force with external joint torque or lifted weight.

---

### Stage 7 — Fatigue within the rep / set context

**Question:** «Чому наступні повторення стають важчими?»

Simple:

> Втома — це не одна речовина і не одна причина. Вона виникає через зміни на кількох рівнях нервово-м’язової системи.

Detailed:

Separate:

- central / neural contributors;
- excitation–contraction processes;
- metabolite / ionic changes;
- substrate availability depending on duration/intensity;
- task-specific nature of fatigue.

Important anti-myth rule:

Do **not** explain fatigue as “lactic acid buildup”. Lactate should not be framed as the toxic cause of fatigue.

Interactive idea:

A “fatigue map” where several contributors increase, rather than one red meter called lactic acid.

Evidence drawer should emphasize that mechanisms depend strongly on task, contraction type, duration and training status.

---

### Stage 8 — After the repetition / after the set

**Question:** «Що відбувається, коли я кладу вагу?»

Simple:

> Системи повертаються до робочого стану: відновлюються іонні градієнти, ресинтезуються енергетичні субстрати, а навантажені тканини переходять у фазу відновлення.

Detailed:

Possible cards:

- phosphocreatine resynthesis;
- ion homeostasis;
- cardiovascular / respiratory recovery;
- local tissue recovery;
- signaling processes triggered by loading.

Avoid:

- saying one repetition directly “tears muscle fibers and causes growth”;
- equating soreness with successful adaptation.

---

### Stage 9 — Repeated exposure → adaptation

**Question:** «А де тут ріст сили або м’язів?»

Simple:

> Адаптація виникає не від одного скорочення, а від повторюваного достатнього стимулу, відновлення і часу.

Detailed:

Separate outcomes:

- neural adaptation;
- hypertrophy;
- tendon / connective-tissue adaptation;
- metabolic adaptation;
- skill / coordination adaptation.

This is the point where the module must visibly switch from **mechanism** to **human outcomes**.

Suggested UI divider:

> **Механізм пояснює, як це може працювати. Результат у людини перевіряється окремо.**

Then link to bounded Claims such as:

- resistance training and strength;
- resistance training and hypertrophy;
- training volume / intensity / proximity-to-failure questions;
- creatine and resistance-training outcomes where relevant.

Never derive hypertrophy effectiveness directly from one molecular animation.

---

## 5. Recommended interaction model

MVP should use a horizontal/vertical stepper rather than free 3D exploration.

Recommended controls:

- `← Назад`
- `Далі →`
- progress indicator `3 / 9`;
- `Просто` / `Детальніше` toggle;
- persistent `Чому ми так стверджуємо?` button;
- `Показати на тілі` link where relevant;
- `Пов’язана вправа` if entered from Exercise Library.

On mobile, one concept per screen is preferred over a dense scrolling article.

Use motion to clarify causality and sequence, not for decoration.

---

## 6. Visual system

The experience should match Evidence UA rather than look like a separate biology app.

Suggested visual language:

- dark Evidence UA background;
- restrained accent glow for active structures;
- anatomical structures simplified but not cartoonish;
- one highlighted process at a time;
- inactive context remains visible at lower contrast;
- labels appear only on demand;
- avoid fake medical scans or pseudo-realistic imagery that implies diagnostic precision.

Potential visual transitions:

`body → muscle → fascicle → fiber → sarcomere → molecular interaction → zoom out`.

Use 2D/SVG/canvas for MVP before considering 3D.

---

## 7. Data / content architecture

Do not hard-code all science directly into animation components.

Suggested reusable object:

```js
{
  id: 'one-rep-stage-calcium',
  order: 3,
  title_uk: 'Кальцій відкриває шлях до скорочення',
  simple_uk: '...',
  detailed_uk: '...',
  visual_key: 'calcium-release',
  related_anatomy_nodes: ['skeletal-muscle', 'sarcomere'],
  related_physiology_nodes: ['excitation-contraction-coupling'],
  related_claim_ids: [],
  related_source_ids: [],
  evidence_type: 'foundational',
  review_status: 'draft',
  last_reviewed: null
}
```

Recommended `evidence_type` values:

- `foundational`
- `mechanistic_human`
- `mechanistic_mixed`
- `human_outcome`
- `mixed`

The animation consumes content objects; Claims remain independent knowledge objects.

---

## 8. Evidence review boundaries

Before public release, every stage should be reviewed for two different things.

### A. Physiological accuracy

Check whether the sequence and wording are correct enough for the intended abstraction level.

### B. Inference safety

Check whether a mechanism is being used to imply an outcome it does not establish.

Specific red flags:

- mechanism → hypertrophy claim without human-outcome evidence;
- EMG → muscle growth superiority;
- metabolite accumulation → direct growth claim;
- soreness → adaptation quality;
- lactate → primary cause of fatigue;
- one-repetition molecular events → guaranteed chronic result;
- “more activation” → “better exercise” without comparator/outcome/context.

The Evidence Drawer must never use citation count as a confidence score.

---

## 9. MVP scope

### Include in v1

- 1 generic resistance-training movement animation;
- 9 stages listed above;
- Simple / Detailed toggle;
- Evidence Drawer shell;
- links to Anatomy / Physiology nodes;
- entry point from Exercise Library;
- responsive 360 / 390 / desktop layouts;
- reduced-motion support;
- keyboard navigation for step controls;
- screen-reader labels for interactive controls.

### Do not include in v1

- personalized real-time muscle activation;
- camera-based biomechanics;
- 3D full-body simulation;
- exact ATP molecule counting;
- exact motor-unit recruitment visualization;
- live wearable integration;
- diagnosis / treatment recommendations;
- automatic training prescription.

---

## 10. First exercise integration

Use **Bent-over Dumbbell Row** as the first Exercise Library entry that launches this experience.

Flow:

```text
Тяга гантелі в нахилі
↓
Що працює?
↓
Latissimus / posterior shoulder / scapular muscles / elbow flexors
↓
Що відбувається всередині м’яза?
↓
ONE REP experience
↓
How force is produced
↓
What fatigue means
↓
How repeated training can lead to adaptation
↓
Why do we say this?
```

The One Rep module should remain generic enough that later it can be opened from squat, press, pull-up, calf raise, etc., while each exercise supplies its own highlighted muscles / joints and movement context.

---

## 11. Research package required before publication

Before final scientific copy is marked reviewed, create a research package covering at least:

1. motor unit recruitment / rate coding overview;
2. neuromuscular junction and excitation–contraction coupling;
3. calcium regulation and sarcomere mechanics;
4. ATP use and energy-system overlap;
5. force–length / force–velocity / contraction-mode context;
6. neuromuscular fatigue mechanisms;
7. post-exercise recovery basics;
8. distinction between acute mechanism and chronic adaptation;
9. resistance-training human outcomes for strength and hypertrophy.

For each topic, create Sources / Evidence Records / bounded Claims only where Claims are needed.

Foundational physiology can use authoritative textbooks/reviews plus primary literature where useful; chronic training outcomes should prioritize high-quality human evidence.

---

## 12. Definition of Done

The first Interactive Physiology module is ready when:

- a user can enter from an Exercise Library entry;
- the full one-repetition sequence is understandable without prior physiology knowledge;
- Simple / Detailed layers work at every stage;
- mechanism and human outcomes are visibly separated;
- the user can always ask `Чому ми так стверджуємо?`;
- no stage overclaims from mechanism to outcome;
- fatigue is not reduced to lactate;
- energy systems are shown as overlapping, not sequential switches;
- mobile 360 / 390 layouts are tested;
- reduced-motion and keyboard controls work;
- scientific review status is visible internally;
- adding a second exercise does not require rewriting the module.

---

## 13. Working rule

**Show the mechanism because it helps the user understand the body — never because it makes a weak claim look scientifically impressive.**
