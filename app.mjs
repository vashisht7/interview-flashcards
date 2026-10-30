import {writeMathText,formulaPanel,cardFormulas,termFormulas} from './math-content.mjs';
import {termsForCard,searchTerms} from './glossary-core.mjs';
import {topics,filterCards,shuffleCards,stats,sanitizeProgress} from './study-core.mjs';
const $=id=>document.getElementById(id), KEY='vashisht-interview-studio-v1';
let cards=[],progress={},deck=[],index=0,revealed=false,view='study',completed=false,reviewed=new Set(),filter={topic:'all',difficulty:'all',status:'all',query:''};
let storageAvailable=true;
let glossary=[],flows=[],activeFlow=null,flowStep=0,flowTimer=null;
const label=topic=>topics.find(t=>t[0]===topic)?.[1]||topic;
function announce(text){$('announcement').textContent=text;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch{storageAvailable=false;$('save-note').textContent='Progress is temporary in this browser';}updateStats();}
function updateStats(){const s=stats(cards,progress);$('total-count').textContent=s.total;$('ring').querySelector('span').textContent=`of ${s.total} confident`;$('learning-count').textContent=s.learning;$('ready-count').textContent=s.confident;$('mastered-count').textContent=s.confident;$('ring').style.setProperty('--progress',`${s.confident/s.total*100}%`);}
function renderTopics(){const nav=$('topics');nav.replaceChildren();for(const [id,name,icon] of topics){const b=document.createElement('button');b.type='button';b.dataset.topic=id;b.className=id===filter.topic?'active':'';b.setAttribute('aria-pressed',String(id===filter.topic));const glyph=document.createElement('span');glyph.className='nav-icon';glyph.textContent=icon;const text=document.createElement('span');text.textContent=name;const count=document.createElement('span');count.className='count';count.textContent=id==='all'?cards.length:cards.filter(c=>c.topic===id).length;b.append(glyph,text,count);b.addEventListener('click',()=>{filter.topic=id;completed=false;refresh();closeMobileSidebar();});nav.append(b);}}
function refresh(){deck=filterCards(cards,filter,progress);index=0;revealed=false;completed=false;reviewed=new Set();renderTopics();const t=topics.find(t=>t[0]===filter.topic);$('deck-title').textContent=t[1];$('deck-description').textContent=t[3];render();}
function render(){stopFlow();const empty=!deck.length;$('empty').hidden=!empty;$('study-area').hidden=empty||view!=='study'||completed;$('browse-area').hidden=empty||view!=='browse';$('complete').hidden=empty||!completed||view!=='study';$('shuffle').disabled=empty;
 $('study-view').setAttribute('aria-pressed',String(view==='study'));$('browse-view').setAttribute('aria-pressed',String(view==='browse'));
 if(empty)return;if(view==='browse'){renderBrowse();return;}if(completed){if(readingMode)exitReadingMode();$('complete-description').textContent=`You reached the end of these ${deck.length} cards and rated ${reviewed.size} this session. Keep building on what you know.`;return;}
 const c=deck[index];$('position').textContent=`CARD ${index+1} OF ${deck.length}`;$('studied-session').textContent=`${reviewed.size} reviewed this session`;$('session-bar').style.width=`${(index+1)/deck.length*100}%`;
 $('card-topic').textContent=label(c.topic);$('card-difficulty').textContent=c.difficulty;$('card-difficulty').className=`difficulty ${c.difficulty.toLowerCase()}`;$('question').textContent=c.question;$('answer-question').textContent=c.question;writeMathText($('answer'),c.answer);writeMathText($('cue'),c.cue);writeMathText($('followup'),c.followup);
 $('learning-extras').hidden=!c.example;
 writeMathText($('simple-example'),c.example||'');writeMathText($('deeper-explanation'),c.deeper||'');$('experience-note').textContent=c.experience||'';$('deeper-details').open=false;
 $('card-sources').replaceChildren();for(const source of c.sources||[]){const a=document.createElement('a');a.textContent=source.label+' ↗';a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';$('card-sources').append(a);}
 const equations=cardFormulas[c.id]||[];$('card-formulas').hidden=!equations.length;$('formula-list').replaceChildren(...equations.map(formulaPanel));
 renderTerms(c);renderFlow(c);
 $('question-side').hidden=revealed;$('answer-side').hidden=!revealed;$('learning').disabled=!revealed;$('confident').disabled=!revealed;$('previous').disabled=index===0;
 const bookmarked=!!progress[c.id]?.saved;$('bookmark').textContent=bookmarked?'★':'☆';$('bookmark').setAttribute('aria-pressed',String(bookmarked));$('bookmark').setAttribute('aria-label',bookmarked?'Remove bookmark':'Bookmark this card');
 $('study-tip').textContent=revealed?'Be honest with yourself. You can revisit any card.':'Reveal the answer, then choose how confident you feel.';
}
function renderBrowse(){const area=$('browse-area');area.replaceChildren();for(const c of deck){const row=document.createElement('div');row.className='browse-card';const num=document.createElement('span');num.className='browse-number';num.textContent=String(c.id).padStart(2,'0');const b=document.createElement('button');const strong=document.createElement('strong');strong.textContent=c.question;const small=document.createElement('small');small.textContent=`${label(c.topic)} · ${c.difficulty}${progress[c.id]?.saved?' · ★ Bookmarked':''}`;b.append(strong,small);b.addEventListener('click',()=>{index=deck.findIndex(d=>d.id===c.id);view='study';completed=false;revealed=false;render();$('reveal').focus();});const status=document.createElement('span');status.className='browse-status';status.textContent=progress[c.id]?.rating==='confident'?'✓ Confident':progress[c.id]?.rating==='learning'?'↻ Learning':'New';row.append(num,b,status);area.append(row);}}
function flip(){if(view!=='study'||!deck.length||completed)return;revealed=!revealed;render();announce(revealed?'Answer revealed. Press 1 for still learning or 2 for got it.':'Question shown.');(revealed?$('hide-answer'):$('reveal')).focus();}
function move(step){if(!deck.length||view!=='study'||completed)return;if(index+step<0)return;if(index+step>=deck.length){completed=true;render();$('restart').focus();return;}index+=step;revealed=false;render();announce(`Card ${index+1} of ${deck.length}: ${deck[index].question}`);}
function rate(rating){if(!revealed||completed||!deck.length)return;const c=deck[index];progress[c.id]={...progress[c.id],rating};reviewed.add(c.id);save();announce(rating==='confident'?'Marked confident.':'Marked still learning.');move(1);if(!completed)$('reveal').focus();}
$('reveal').addEventListener('click',flip);$('hide-answer').addEventListener('click',flip);$('previous').addEventListener('click',()=>move(-1));$('next').addEventListener('click',()=>move(1));$('learning').addEventListener('click',()=>rate('learning'));$('confident').addEventListener('click',()=>rate('confident'));
$('bookmark').addEventListener('click',()=>{const c=deck[index];progress[c.id]={...progress[c.id],saved:!progress[c.id]?.saved};save();render();});
$('difficulty').addEventListener('change',e=>{filter.difficulty=e.target.value;refresh();});$('status').addEventListener('change',e=>{filter.status=e.target.value;refresh();});$('search').addEventListener('input',e=>{filter.query=e.target.value;refresh();});
$('shuffle').addEventListener('click',()=>{deck=shuffleCards(filterCards(cards,filter,progress));index=0;completed=false;revealed=false;reviewed=new Set();render();announce('Cards shuffled.');});
$('study-view').addEventListener('click',()=>{view='study';render();});$('browse-view').addEventListener('click',()=>{view='browse';render();});
$('clear-filters').addEventListener('click',()=>{filter={topic:'all',difficulty:'all',status:'all',query:''};$('search').value='';$('difficulty').value='all';$('status').value='all';refresh();});
$('restart').addEventListener('click',refresh);$('review-learning').addEventListener('click',()=>{filter.status='learning';$('status').value='learning';refresh();});
$('about').addEventListener('click',()=>$('about-dialog').showModal());$('reset').addEventListener('click',()=>$('reset-dialog').showModal());document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$('confirm-reset').addEventListener('click',()=>{progress={};save();$('reset-dialog').close();refresh();announce('Progress reset.');});
const mobileSidebar=window.matchMedia('(max-width:760px)');
let sidebarCollapsed=false;
try{sidebarCollapsed=localStorage.getItem('interview-sidebar-collapsed')==='true';}catch{}
function syncSidebar(){
 const open=mobileSidebar.matches?$('sidebar').classList.contains('open'):!sidebarCollapsed;
 document.body.classList.toggle('sidebar-collapsed',sidebarCollapsed);
 $('sidebar').inert=!open;
 $('menu').setAttribute('aria-expanded',String(open));
 $('menu').setAttribute('aria-label',open?'Collapse sidebar':'Expand sidebar');
}
function closeMobileSidebar(){if(mobileSidebar.matches){$('sidebar').classList.remove('open');syncSidebar();}}
function toggleSidebar(){
 if(mobileSidebar.matches)$('sidebar').classList.toggle('open');
 else{sidebarCollapsed=!sidebarCollapsed;try{localStorage.setItem('interview-sidebar-collapsed',String(sidebarCollapsed));}catch{}}
 syncSidebar();if($('sidebar').inert)$('menu').focus();
}
$('menu').addEventListener('click',toggleSidebar);
$('sidebar-close').addEventListener('click',toggleSidebar);
mobileSidebar.addEventListener('change',()=>{$('sidebar').classList.remove('open');syncSidebar();});
document.addEventListener('click',e=>{if(mobileSidebar.matches&&$('sidebar').classList.contains('open')&&!e.target.closest('#sidebar')&&!e.target.closest('#menu'))closeMobileSidebar();});
syncSidebar();
let readingMode=false,readingScroll=0;
function setReadingMode(on){
 readingMode=on;document.body.classList.toggle('reading-mode',on);
 $('study-area').classList.toggle('reading-active',on);
 $('fullscreen-toggle').textContent=on?'↙ Exit full screen':'⛶ Full screen';
 $('fullscreen-toggle').setAttribute('aria-pressed',String(on));
 $('fullscreen-toggle').setAttribute('aria-label',on?'Exit full-screen reading':'Read flashcards full screen');
 // Keep the surrounding application out of keyboard navigation in reading mode.
 for(const el of [$('sidebar'),document.querySelector('header'),...document.querySelector('main').children]){
  if(el!==$('study-area'))el.inert=on;
 }
 if(!on){syncSidebar();window.scrollTo(0,readingScroll);}
 $('fullscreen-toggle').focus();
}
async function enterReadingMode(){
 readingScroll=window.scrollY;setReadingMode(true);$('study-area').scrollTop=0;
 try{if($('study-area').requestFullscreen)await $('study-area').requestFullscreen();}catch{/* The full-window reading layout remains available. */}
}
async function exitReadingMode(){
 setReadingMode(false);
 try{if(document.fullscreenElement=== $('study-area'))await document.exitFullscreen();}catch{}
}
$('fullscreen-toggle').addEventListener('click',()=>readingMode?exitReadingMode():enterReadingMode());
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&readingMode)setReadingMode(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(readingMode){e.preventDefault();exitReadingMode();}else closeMobileSidebar();}});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||document.querySelector('dialog[open]')||e.target.closest('#flow-section,#card-terms,#card-formulas')||e.target.tagName==='SUMMARY'||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.code==='Space'){if(e.target.tagName==='BUTTON'&&!['hide-answer','reveal'].includes(e.target.id))return;e.preventDefault();flip();}else if(e.key==='ArrowRight'){e.preventDefault();move(1);}else if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}else if(e.key==='1')rate('learning');else if(e.key==='2')rate('confident');});
try{const responses=await Promise.all(['cards.json','glossary.json','flows.json'].map(path=>fetch(path)));if(responses.some(r=>!r.ok))throw new Error('Study content loading failed');[cards,glossary,flows]=await Promise.all(responses.map(r=>r.json()));try{progress=sanitizeProgress(JSON.parse(localStorage.getItem(KEY)||'{}'),cards);}catch{progress={};try{localStorage.setItem(KEY,'{}');}catch{storageAvailable=false;$('save-note').textContent='Progress is temporary in this browser';}}updateStats();refresh();}catch{$('study-area').hidden=true;$('empty').hidden=false;$('empty').querySelector('h3').textContent='The cards could not load';$('empty').querySelector('p').textContent='Refresh the page to try again.';$('clear-filters').textContent='Reload page';$('clear-filters').onclick=()=>location.reload();}

function termElement(term){
 const details=document.createElement('details');details.className='term-definition';
 const summary=document.createElement('summary');writeMathText(summary,term.term);
 const expansion=document.createElement('strong');expansion.className='term-expansion';expansion.textContent=term.expansion;
 const definition=document.createElement('p');writeMathText(definition,term.definition);
 const example=document.createElement('p');example.className='term-example';
 const prefix=document.createElement('b');prefix.textContent='Example: ';const exampleText=document.createElement('span');writeMathText(exampleText,term.example);example.append(prefix,exampleText);
 details.append(summary,expansion,definition,example);for(const id of termFormulas[term.term]||[])details.append(formulaPanel(id));return details;
}
function renderTerms(card){
 const terms=termsForCard(card,glossary);$('card-terms').hidden=!terms.length;
 $('card-term-list').replaceChildren(...terms.map(termElement));
}
function renderGlossary(){
 const terms=searchTerms(glossary,$('glossary-search').value);
 $('glossary-count').textContent=`${terms.length} of ${glossary.length} terms`;
 $('glossary-list').replaceChildren(...terms.map(termElement));
 if(!terms.length)$('glossary-list').textContent='No matching terms. Try a shorter word or an abbreviation.';
}
$('open-glossary').addEventListener('click',()=>{renderGlossary();$('glossary-dialog').showModal();$('glossary-search').focus();});
$('glossary-search').addEventListener('input',renderGlossary);
function stopFlow(){if(flowTimer!==null){clearInterval(flowTimer);flowTimer=null;}if($('flow-play')){$('flow-play').textContent='▶ Play flow';$('flow-play').setAttribute('aria-pressed','false');}}
function renderFlow(card){
 activeFlow=flows.find(f=>f.cards.includes(card.id))||null;flowStep=0;
 $('flow-section').hidden=!activeFlow;if(!activeFlow)return;
 $('flow-title').textContent=activeFlow.title;
 $('flow-steps').replaceChildren(...activeFlow.steps.map((step,i)=>{
  const button=document.createElement('button');button.className='flow-step';
  const number=document.createElement('span');number.textContent=String(i+1);number.className='flow-number';
  const label=document.createElement('span');label.textContent=step.label;button.append(number,label);
  button.addEventListener('click',()=>{stopFlow();flowStep=i;drawFlow();});return button;
 }));drawFlow();
}
function drawFlow(){
 if(!activeFlow)return;
 [...$('flow-steps').children].forEach((b,i)=>{b.classList.toggle('current',i===flowStep);b.classList.toggle('done',i<flowStep);if(i===flowStep)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 const heading=document.createElement('strong');heading.textContent=`Step ${flowStep+1} of ${activeFlow.steps.length}: ${activeFlow.steps[flowStep].label}`;
 const text=document.createElement('p');text.textContent=activeFlow.steps[flowStep].explanation;
 $('flow-explanation').replaceChildren(heading,text);$('flow-back').disabled=flowStep===0;$('flow-next').disabled=flowStep===activeFlow.steps.length-1;
}
$('flow-back').addEventListener('click',()=>{stopFlow();if(flowStep>0)flowStep--;drawFlow();});
$('flow-next').addEventListener('click',()=>{stopFlow();if(activeFlow&&flowStep<activeFlow.steps.length-1)flowStep++;drawFlow();});
$('flow-play').addEventListener('click',()=>{
 if(flowTimer!==null){stopFlow();return;}if(!activeFlow)return;
 if(flowStep===activeFlow.steps.length-1)flowStep=0;drawFlow();
 $('flow-play').textContent='Ⅱ Pause flow';$('flow-play').setAttribute('aria-pressed','true');
 flowTimer=setInterval(()=>{if(flowStep<activeFlow.steps.length-1){flowStep++;drawFlow();}else stopFlow();},4500);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFlow();});
