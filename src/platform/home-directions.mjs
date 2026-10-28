const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

// Build-time presentation of the canonical home topics, not another catalog.
export function homeDirectionsHTML(topics){
  return '<div class="label"><span>'+topics.length+' напрямів Evidence UA</span><span>Обери тему · статус указано на картці</span></div><div class="cards" id="cards" aria-label="Тематичні напрями Evidence UA">'+topics.map((topic,index)=>`<a class="topic-card" data-area="${esc(topic.id)}" href="${esc(topic.href)}" style="--topic-x:${esc(topic.position||'50%')}"><span class="topic-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><strong>${esc(topic.title)}</strong><small>${esc(topic.subtitle)}</small><span class="topic-state">${esc(topic.state)}</span><span class="topic-open">Відкрити <span aria-hidden="true">→</span></span></a>`).join('')+'</div>';
}
