import {getOrganelle} from './module.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const atlasSize=Object.freeze({width:1448,height:1086});
const image='./cell-atlas-v2.webp';
// Presentation geometry traced on the artistic plate, not measured anatomy.
// Vesicle identities are assigned illustrative labels. Fibers and ER targets
// indicate representative visible regions of the distributed structures.
const regions=[
 {id:'STRUCT-PLASMA-MEMBRANE',x:724,y:543,boundary:true,d:'M676 28C771 29 811 72 919 101C1109 95 1295 177 1378 321C1459 453 1455 658 1372 794C1279 955 1046 1042 815 1031C596 1061 309 1010 163 893C49 803 26 672 34 530C30 382 117 276 234 171C335 75 516 50 676 28Z'},
 {id:'STRUCT-CYTOSKELETON',x:791,y:905,fibers:true,d:'M634 783Q779 841 1075 845M568 798Q849 827 1051 948M459 853Q787 862 916 992M646 860Q868 867 1026 938M667 969Q884 819 1097 812M570 936Q744 886 974 974'},
 {id:'ORG-SMOOTH-ER',x:385,y:222,d:'M162 270C143 210 205 134 277 128C344 120 389 87 436 107C473 57 512 79 510 120C547 51 585 79 579 119C612 75 654 93 625 152C612 184 590 198 580 228L484 250C417 265 366 340 298 359L181 342Z'},
 {id:'ORG-ROUGH-ER',x:352,y:501,d:'M104 376C120 355 154 370 177 412C188 352 222 356 254 401L325 467C315 387 339 302 389 327C414 344 411 414 441 460C470 504 505 518 530 550C570 564 609 577 640 607C671 613 714 633 701 663L594 659C559 639 527 628 479 613L421 607L366 584C282 579 222 576 169 543C123 514 75 458 91 412Z M478 618C556 652 622 673 687 682C730 686 747 739 721 772L671 780C654 732 584 703 540 689Z'},
 {id:'ORG-NUCLEUS',x:686,y:432,d:'M585 219C731 179 875 227 929 353C979 473 936 575 833 625C738 675 602 657 503 584C421 522 405 407 442 326C469 270 510 240 585 219Z'},
 {id:'ORG-NUCLEOLUS',x:750,y:422,shape:'<ellipse cx="750" cy="422" rx="59" ry="69"/>'},
 {id:'ORG-MITOCHONDRION',x:425,y:759,d:'M288 627C216 636 188 699 225 763C272 843 392 901 509 910C596 917 651 866 636 814C623 747 513 683 431 655C378 632 332 613 288 627Z M978 169C938 172 921 209 946 240C968 269 1031 300 1081 296C1124 294 1144 266 1124 232C1096 190 1025 160 978 169Z'},
 {id:'ORG-GOLGI',x:985,y:654,d:'M865 543C890 529 922 527 948 498C961 485 989 496 987 522C1025 541 1037 516 1043 504C1069 485 1089 502 1089 530C1129 544 1154 579 1151 623C1151 685 1114 750 1060 779C1004 808 915 803 864 767C814 732 787 667 822 626C829 594 838 567 865 543Z'},
 {id:'ORG-LYSOSOME',x:1129,y:389,shape:'<ellipse cx="1129" cy="389" rx="88" ry="88"/>'},
 {id:'ORG-PEROXISOME',x:1260,y:629,shape:'<ellipse cx="1260" cy="629" rx="84" ry="76"/>'},
 {id:'ORG-RIBOSOME',x:1259,y:478,
  shape:[[1247,434],[1267,430],[1285,441],[1305,442],[1330,457],[1214,456],[1237,462],[1255,455],[1270,476],[1292,469],[1309,481],[1320,502],[1210,487],[1240,488],[1254,511],[1228,526],[1257,535],[1282,526],[1303,518],[1336,484],[1208,516],[1180,511]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="10"/>`).join(''),
  hit:'<path d="M1190 423H1346V545H1168V490Z"/>'}
];
function shape(region){return region.shape||`<path d="${region.d}"/>`;}
function outline(region){
 if(region.boundary||region.fibers)return `<path d="${region.d}" fill="none" stroke="currentColor" stroke-width="${region.fibers?5:7}"/>`;
 return shape(region);
}
export function renderCellAtlas(selectedId='ORG-MITOCHONDRION'){
 const selected=getOrganelle(selectedId);
 const clips=regions.map(r=>r.boundary||r.fibers?`<mask id="cell-mask-${r.id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1448" height="1086"><rect width="1448" height="1086" fill="black"/><path d="${r.d}" fill="none" stroke="white" stroke-width="${r.fibers?20:38}"/></mask>`:`<clipPath id="cell-clip-${r.id}">${shape(r)}</clipPath>`).join('');
 const controls=regions.map(r=>{
  const o=getOrganelle(r.id),active=r.id===selectedId;
  const hit=r.boundary||r.fibers?`<path class="organelle-hit ${r.boundary?'boundary-hit':'fiber-hit'}" d="${r.d}" fill="none" stroke="transparent" stroke-width="${r.boundary?42:28}" pointer-events="stroke"/>`:`<g class="organelle-hit" fill="transparent" pointer-events="all">${r.hit||shape(r)}</g>`;
  const crop=r.boundary||r.fibers?`mask="url(#cell-mask-${r.id})"`:`clip-path="url(#cell-clip-${r.id})"`;
  return `<g class="organelle${active?' selected':''}" data-organelle="${r.id}" role="button" tabindex="0" aria-pressed="${active}" aria-label="Обрати: ${esc(o.label)}" aria-controls="organelle-panel"><title>${esc(o.label)}</title><g class="organelle-motion" style="transform-origin:${r.x}px ${r.y}px"><image class="organelle-fragment" href="${image}" width="1448" height="1086" ${crop} pointer-events="none"/><g class="organelle-contour${r.boundary?' boundary-contour':r.fibers?' fiber-contour':''}" pointer-events="none">${outline(r)}</g></g>${hit}</g>`;
 }).join('');
 return `<div class="cell-atlas-frame"><div class="cell-atlas-toolbar" aria-hidden="true"><span id="cell-preview-caption">Обрана структура</span><strong id="cell-preview-name">${esc(selected.label)}</strong><span class="cell-atlas-hint">Натисни для детальної будови</span></div><svg class="cell-atlas" viewBox="0 0 1448 1086" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Інтерактивна художня ілюстрація клітини"><defs>${clips}</defs><image class="cell-atlas-base" href="${image}" width="1448" height="1086" pointer-events="none"/>${controls}</svg></div>`;
}
