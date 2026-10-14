import type {EvidenceClaim, EvidenceSource} from '../../evidence/types.ts';

export const creatineJourneyData: {
  claims: Record<string, EvidenceClaim>;
  sources: Record<string, EvidenceSource>;
} = {
  sources: {
    'balsom-1994': {
      id: 'balsom-1994',
      shortLabel: 'Balsom et al., 1994',
      title: 'Creatine in humans with special reference to creatine supplementation',
      pmid: '7817065',
      doi: '10.2165/00007256-199418040-00005',
      url: 'https://pubmed.ncbi.nlm.nih.gov/7817065/',
    },
    'hultman-1996': {
      id: 'hultman-1996',
      shortLabel: 'Hultman et al., 1996',
      title: 'Muscle creatine loading in men',
      pmid: '8828669',
      doi: '10.1152/jappl.1996.81.1.232',
      url: 'https://pubmed.ncbi.nlm.nih.gov/8828669/',
    },
    'kreider-2017': {
      id: 'kreider-2017',
      shortLabel: 'Kreider et al., 2017',
      title: 'ISSN position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine',
      pmid: '28615996',
      doi: '10.1186/s12970-017-0173-z',
      url: 'https://pubmed.ncbi.nlm.nih.gov/28615996/',
    },
    'antonio-2021': {
      id: 'antonio-2021',
      shortLabel: 'Antonio et al., 2021',
      title: 'Common questions and misconceptions about creatine supplementation: what does the scientific evidence really show?',
      pmid: '33557850',
      doi: '10.1186/s12970-021-00412-w',
      url: 'https://pubmed.ncbi.nlm.nih.gov/33557850/',
    },
  },
  claims: {
    absorption: {
      id: 'absorption',
      display: 'ШКТ → кров',
      meaning: 'Orally consumed creatine is absorbed from the gastrointestinal tract and enters systemic circulation.',
      sourceIds: ['antonio-2021'],
    },
    'cellular-uptake': {
      id: 'cellular-uptake',
      display: 'Кров → тканини',
      meaning: 'Circulating creatine is distributed to tissues and cellular uptake is transporter-mediated.',
      sourceIds: ['balsom-1994', 'kreider-2017'],
    },
    'skeletal-muscle-pool': {
      id: 'skeletal-muscle-pool',
      display: '≈95%',
      meaning: 'More than about 95% of total-body creatine is located in skeletal muscle; this is total-body distribution, not the fraction of one swallowed dose that enters muscle.',
      sourceIds: ['balsom-1994'],
    },
    'atp-mechanism': {
      id: 'atp-mechanism',
      display: 'PCr + ADP → ATP',
      meaning: 'Phosphocreatine buffering supports rapid ATP resynthesis; creatine does not create energy.',
      sourceIds: ['balsom-1994', 'kreider-2017'],
    },
    'daily-dose': {
      id: 'daily-dose',
      display: '3–5 г / день',
      meaning: 'A commonly recommended daily creatine dose range for supplementation.',
      sourceIds: ['kreider-2017', 'antonio-2021'],
    },
    'saturation-time': {
      id: 'saturation-time',
      display: '≈3–4 тижні',
      meaning: 'Lower daily dosing raises muscle creatine gradually over several weeks rather than saturating muscle after one dose.',
      qualifier: 'без фази завантаження',
      sourceIds: ['hultman-1996', 'kreider-2017'],
    },
    takeaway: {
      id: 'takeaway',
      display: 'ЕНЕРГЕТИЧНИЙ БУФЕР',
      meaning: 'The creatine/phosphocreatine system acts as a rapid energy-buffering system rather than a stimulant.',
      sourceIds: ['balsom-1994', 'kreider-2017'],
    },
  },
};
