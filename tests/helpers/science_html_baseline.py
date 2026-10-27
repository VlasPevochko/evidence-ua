"""Compare with historical HTML without changing authentic scientific digests.

Restore only explicitly corrected historical formatting in the comparison tree;
leave scientific values and every other part of each article under its old hash.
"""

MISSING_INTERVALS = (
    ('collagen-source-SRC-000017', 'Безжирова маса — Стандартизована різниця середніх: ', '0,48 '),
    ('collagen-source-SRC-000017', 'Максимальна сила — Стандартизована різниця середніх: ', '0,19 '),
    ('collagen-source-SRC-000017', 'Будова сухожиль — Стандартизована різниця середніх: ', '0,67 '),
    ('citrulline-source-SRC-000105', 'Фізична працездатність загалом — Hedges g: ', '0,16 '),
)


def restore_historical_missing_ci(root):
    for source_id, label, estimate in MISSING_INTERVALS:
        sources = root.xpath('//*[@id=$source_id]', source_id=source_id)
        assert len(sources) == 1, f'Missing or duplicate historical source: {source_id}'
        results = [p for p in sources[0].xpath('.//dd/p') if p.text == label]
        assert len(results) == 1, f'Historical outcome changed: {source_id} {label}'
        numbers = results[0].findall('b')
        assert len(numbers) == 1 and numbers[0].text == estimate, 'Historical effect estimate changed'
        assert numbers[0].tail == ' · ДІ: див. першоджерело', 'Missing interval fallback changed'
        numbers[0].tail = ' · 95% ДІ 0–0'


INTERVAL_TYPE_LABELS = (
    ('beta-alanine-source-SRC-000103', 'Парестезія — Відношення шансів: ', '8,9 ',
     ' · 95% Байєсівський інтервал вірогідності 2,2–32,6', ' · 95% ДІ 2,2–32,6'),
    ('electrolytes-source-SRC-000110', 'Гіпотонічний напій проти води — Різниця зміни об’єму плазми: ', '1,1 pp',
     ' · 90% інтервал сумісності 0,1–2', ' · 90% ДІ 0,1–2'),
    ('electrolytes-source-SRC-000110', 'Гіпотонічний напій проти ізотонічного — Різниця зміни об’єму плазми: ', '2,3 pp',
     ' · 90% інтервал сумісності 1,1–3,5', ' · 90% ДІ 1,1–3,5'),
)


def restore_historical_rendering(root):
    restore_historical_missing_ci(root)
    # The stored interval types were previously discarded by the shared UI.
    # Match the exact source, outcome, estimate AND bounds; never mask data edits.
    for source_id, label, estimate, corrected, historical in INTERVAL_TYPE_LABELS:
        sources = root.xpath('//*[@id=$id]', id=source_id)
        assert len(sources) == 1, f'Missing or duplicate interval source: {source_id}'
        results = [p for p in sources[0].xpath('.//dd/p') if p.text == label]
        assert len(results) == 1, f'Interval outcome changed: {source_id} {label}'
        numbers = results[0].findall('b')
        assert len(numbers) == 1 and numbers[0].text == estimate, 'Interval estimate changed'
        assert numbers[0].tail == corrected, 'Interval label, confidence level or bounds changed'
        numbers[0].tail = historical
