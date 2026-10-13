// Targeted discovery only. Not imported by the public application.
export const updateSearch = {
  searchedAt: '2026-10-11',
  status: 'targeted_discovery_incomplete',
  systematicSearchCompleted: false,
  scientificApproval: null,
  publicationApproved: false,
};

// Labels describe review questions, not new scientific conclusions.
export const updateCandidates = [
  { id: 'CAND-001', topic: 'protein', pmid: '41635649', type: 'network_meta_analysis', question: 'Сила й безжирова маса при силових тренуваннях', caution: 'Перевірити прямі порівняння, транзитивність і узгодженість мережі; рейтинг не є відсотком істини.', access: 'indexed_abstract_only' },
  { id: 'CAND-002', topic: 'caffeine', pmid: '42356375', type: 'systematic_review_meta_analysis', question: 'Аеробна працездатність і залежність від дози', caution: 'Не переносити результат на всі види спортивної діяльності.', access: 'indexed_abstract_only' },
  { id: 'CAND-003', topic: 'omega-3', pmid: '42517224', type: 'meta_analysis', question: 'Фібриляція передсердь як окремий результат безпеки', caution: 'Не підміняти цим результатом серцево-судинні події; перевірити зв’язок із препринтом PMID 41445624, не рахувати їх незалежними доказами.', access: 'pubmed_record', possibleRelatedPreprint: '41445624' },
  { id: 'CAND-004', topic: 'vitamin-d', pmid: '42161415', type: 'systematic_review_meta_analysis', question: 'Переломи: вітамін D окремо та разом із кальцієм', caution: 'Розділити режими, популяції й типи переломів; авторська впевненість не є оцінкою Evidence UA.', access: 'indexed_text_only' },
  { id: 'CAND-005', topic: 'magnesium', pmid: '32956536', type: 'cochrane_review', question: 'М’язові судоми в конкретних популяціях', caution: 'Огляд 2020 року, не називати найновішим; не переносити нічні судоми на судоми під час фізичних навантажень.', access: 'indexed_text_only' },
  { id: 'CAND-006', topic: 'magnesium', pmid: '38970118', type: 'systematic_review', question: 'Болючість м’язів після навантаження', caution: 'Це інший результат, не судоми; рекомендації дозування не переносити автоматично.', access: 'indexed_abstract_only' },
  { id: 'CAND-007', topic: 'collagen', pmid: '41900537', type: 'systematic_review', question: 'Структурні й функціональні результати сухожиль', caution: 'Не підміняти сухожильний результат приростом м’язової маси; перевірити відсутність кількісного об’єднання.', access: 'indexed_abstract_only' },
  { id: 'CAND-008', topic: 'beta-alanine', pmid: '41971372', type: 'systematic_review_meta_analysis', question: 'Здатність виконувати повторні спринти', caution: 'Не переносити на всі навантаження; формулювання назви про відсутність ефекту не замінює оцінку ДІ.', access: 'pubmed_record' },
  { id: 'CAND-009', topic: 'citrulline', pmid: '42356270', type: 'systematic_review_meta_analysis', question: 'Цитрулін малат і фізична працездатність', caution: 'Розділити форми, завдання й гострий та тривалий прийом; не закриває автоматично питання болючості через 48 годин.', access: 'indexed_abstract_only' },
  { id: 'CAND-010', topic: 'electrolytes', pmid: '38116803', type: 'systematic_review', question: 'Вуглеводно-електролітні розчини проти води після зневоднення', caution: 'Не ізольований ефект електролітів; пошук до червня 2022 року, новіший рік публікації не означає новішу базу.', access: 'indexed_text_only' },
].map(candidate => ({ ...candidate, url: `https://pubmed.ncbi.nlm.nih.gov/${candidate.pmid}/`, reviewStatus: 'pending', evidenceConfidence: null, publicationApproved: false }));
