// Єдине місце, де складається рядок про стан наукового перегляду під досьє добавок (бриф T8, 2026-11-02).
//
// Раніше цей рядок писався в трьох скриптах окремо: у build-supplement-cards.mjs з тихою підстановкою «21 жовтня 2026 року»
// (три картки взагалі не мали своєї дати), а в build-protein.mjs і build-berberine.mjs дати були вписані в сам рядок.
// Тепер дата погодження береться з даних (`approvedOn`, формат РРРР-ММ-ДД). Якщо її немає або вона не дата, збірка падає:
// невідома дата не підставляється.
//
// Цей модуль нічого не вигадує й нічого не підвищує. Стану «науковий перегляд завершено» тут немає: validateDossiers
// (dossier.mjs) відхиляє досьє з lastScientificReview, доки власник не змінить правило (рішення D4). Слова рядка не змінені.
const MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

// '2026-10-22' -> '22 жовтня 2026 року'. Кидає помилку, якщо це не справжня дата.
export function approvalDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ''));
  const [year, month, day] = match ? match.slice(1).map(Number) : [];
  const real = match && new Date(Date.UTC(year, month - 1, day));
  if (!real || real.getUTCFullYear() !== year || real.getUTCMonth() !== month - 1 || real.getUTCDate() !== day) {
    throw new Error(`approvedOn must be a real date written as YYYY-MM-DD, got ${JSON.stringify(iso)}`);
  }
  return `${day} ${MONTHS[month - 1]} ${year} року`;
}

export const STATUS_BEFORE_DATE = 'Науковий перегляд: не завершено · Формулювання погоджено ';
export const STATUS_AFTER_DATE = ' · Матеріал освітній і не є персональною медичною рекомендацією.';

// Рядок під досьє. Розмітка лишається такою, як була (`<p class="pc-status">`): розділи досьє входять у заморожені відбитки наукових текстів
// (tests/fixtures/*science-digests.json), і будь-який новий атрибут змінив би відбиток. Спільний вигляд із рядком «Перевірено …» у розборах
// задає не клас у розмітці, а селектор `.eua-stamp, .pc-status` у dist/eua-stamp.css.
export function provenanceStatus(approvedOn) {
  return `<p class="pc-status">${STATUS_BEFORE_DATE}${approvalDate(approvedOn)}${STATUS_AFTER_DATE}</p>`;
}
