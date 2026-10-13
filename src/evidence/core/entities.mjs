// Canonical identity catalog. Names and identifiers are not reviewed scientific Claims.
export const entityTypes=['cell_type','organelle','transporter','protein','pathway','molecule','hormone','tissue','metabolic_state','structure','entity_group'];
const entries=[
 ['CELL-GENERAL','cell_type','Загальна клітина людини'],['CELL-MUSCLE','cell_type','М’язове волокно'],['CELL-ENTEROCYTE','cell_type','Ентероцит'],['CELL-ADIPOCYTE','cell_type','Адипоцит'],['CELL-HEPATOCYTE','cell_type','Гепатоцит'],['CELL-BETA','cell_type','Бета-клітина підшлункової залози'],
 ['ORG-NUCLEUS','organelle','Ядро'],['ORG-NUCLEOLUS','organelle','Ядерце'],['ORG-MITOCHONDRION','organelle','Мітохондрія'],['ORG-RIBOSOME','organelle','Рибосома'],['ORG-ROUGH-ER','organelle','Шорстка ендоплазматична сітка'],['ORG-SMOOTH-ER','organelle','Гладка ендоплазматична сітка'],['ORG-GOLGI','organelle','Апарат Гольджі'],['ORG-LYSOSOME','organelle','Лізосома'],['ORG-PEROXISOME','organelle','Пероксисома'],['STRUCT-CYTOSKELETON','structure','Цитоскелет'],['STRUCT-PLASMA-MEMBRANE','structure','Плазматична мембрана'],['STRUCT-SARCOLEMMA','structure','Сарколема'],['ORG-SARCOPLASMIC-RETICULUM','organelle','Саркоплазматичний ретикулум'],
 ['TISSUE-SKELETAL-MUSCLE','tissue','М’яз'],['STRUCT-FASCICLE','structure','Пучок'],['STRUCT-MYOFIBRIL','structure','Міофібрила'],['STRUCT-SARCOMERE','structure','Саркомер'],['PRT-ACTIN','protein','Актин'],['PRT-MYOSIN','protein','Міозин'],['PRT-ACTIN-MYOSIN','entity_group','Актин і міозин'],
 ['MOL-ATP','molecule','ATP'],['MOL-ADP','molecule','ADP'],['MOL-CREATINE','molecule','Креатин'],['MOL-PHOSPHOCREATINE','molecule','Фосфокреатин'],['MOL-GLUCOSE','molecule','Глюкоза'],['MOL-AMINO-ACID','entity_group','Амінокислоти'],['MOL-FATTY-ACID','entity_group','Жирні кислоти'],['MOL-TRIGLYCERIDE','entity_group','Триацилгліцероли'],['MOL-GLYCOGEN','molecule','Глікоген'],['MOL-CALCIUM','molecule','Ca²⁺'],['MOL-SODIUM','molecule','Na⁺'],['MOL-POTASSIUM','molecule','K⁺'],
 ['TRN-SGLT1','transporter','SGLT1'],['TRN-GLUT2','transporter','GLUT2'],['TRN-GLUT4','transporter','GLUT4'],['TRN-PEPT1','transporter','PEPT1'],['PRT-NAK-ATPASE','protein','Na⁺/K⁺-ATPаза'],['PRT-CREATINE-KINASE','protein','Креатинкіназа'],
 ['PTH-ATP-PCR','pathway','Система ATP–PCr'],['PTH-GLUCOSE-ABSORPTION','pathway','Всмоктування глюкози'],['PTH-PROTEIN-ABSORPTION','pathway','Всмоктування продуктів перетравлення білків'],['PTH-LIPID-ABSORPTION','pathway','Всмоктування ліпідів'],['PTH-INSULIN-SECRETION','pathway','Секреція інсуліну'],['PTH-GLYCOGEN-SYNTHESIS','pathway','Синтез глікогену'],['PTH-LIPOLYSIS','pathway','Ліполіз'],['HORMONE-INSULIN','hormone','Інсулін'],['HORMONE-GLUCAGON','hormone','Глюкагон'],
 ['STATE-FED','metabolic_state','Після прийому їжі'],['STATE-FASTED','metabolic_state','Натще'],['STATE-EXERCISE','metabolic_state','Навантаження'],['STATE-POST-EXERCISE','metabolic_state','Після навантаження'],['STATE-ENERGY-DEFICIT','metabolic_state','Дефіцит енергії'],['STATE-ENERGY-SURPLUS','metabolic_state','Надлишок енергії']
];
export const scientificEntities=entries.map(([id,type,label])=>Object.freeze({id,type,label,version:'0.1',status:'identity_only',claimIds:[]}));
// Structural curriculum navigation only: these edges do not establish causal efficacy.
export const entityRelations=[
 {id:'REL-MUSCLE-001',fromId:'TISSUE-SKELETAL-MUSCLE',toId:'STRUCT-FASCICLE',type:'zoom_to',status:'curriculum',claimIds:[]},
 {id:'REL-MUSCLE-002',fromId:'STRUCT-FASCICLE',toId:'CELL-MUSCLE',type:'zoom_to',status:'curriculum',claimIds:[]},
 {id:'REL-MUSCLE-003',fromId:'CELL-MUSCLE',toId:'STRUCT-MYOFIBRIL',type:'zoom_to',status:'curriculum',claimIds:[]},
 {id:'REL-MUSCLE-004',fromId:'STRUCT-MYOFIBRIL',toId:'STRUCT-SARCOMERE',type:'zoom_to',status:'curriculum',claimIds:[]},
 {id:'REL-MUSCLE-005',fromId:'STRUCT-SARCOMERE',toId:'PRT-ACTIN-MYOSIN',type:'zoom_to',status:'curriculum',claimIds:[]},
 {id:'REL-MUSCLE-006',fromId:'PRT-ACTIN-MYOSIN',toId:'PRT-ACTIN',type:'group_member',status:'curriculum',claimIds:[]},
 {id:'REL-MUSCLE-007',fromId:'PRT-ACTIN-MYOSIN',toId:'PRT-MYOSIN',type:'group_member',status:'curriculum',claimIds:[]}
];
export function createEntityRegistry({entities=scientificEntities,relations=entityRelations}={}){
 const byId=new Map();for(const item of entities){if(!item.id||byId.has(item.id))throw Error('Duplicate or missing entity ID: '+item.id);if(!entityTypes.includes(item.type))throw Error('Unknown entity type: '+item.type);byId.set(item.id,item);}
 const relationIds=new Set();for(const r of relations){if(relationIds.has(r.id))throw Error('Duplicate relation: '+r.id);relationIds.add(r.id);if(!byId.has(r.fromId)||!byId.has(r.toId))throw Error('Unresolved entity relation: '+r.id);}
 return {entities,relations,get(id){if(!byId.has(id))throw Error('Unknown scientific entity: '+id);return byId.get(id);},byType(type){return entities.filter(e=>e.type===type);},related(id,type){this.get(id);return relations.filter(r=>r.fromId===id&&(!type||r.type===type)).map(r=>this.get(r.toId));}};
}
export const entityRegistry=createEntityRegistry();
