"""Compare with historical HTML without changing authentic scientific digests.

The four named source results once formatted absent CI bounds as zero. Restore
only that exact historical rendering in the comparison tree; leave real data,
other intervals, and every other part of the article subject to its old hash.
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
