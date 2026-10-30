export const topics = [
 ['all','All flashcards','▤','Build confidence across the whole interview.'],
 ['CORE','AI foundations','◈','Connect the fundamentals to your actual work.'],
 ['NOTEECHOES','NoteEchoes','◉','Local AI, fine-tuning, retrieval, and reliable capture.'],
 ['MFLASH','MFlash','ϟ','Model proposals, controlled execution, and recovery.'],
 ['ENGINEERING','Production & MCP','⌘','Think through enterprise design and operations.'],
 ['BEHAVIOR','Your story','☷','Explain your impact with clear, honest evidence.'],
 ['LLM_PROMPTS','LLMs & prompting','✦','Start with plain-language answers, then explore examples and deeper notes.'],
 ['RAG_DATA','RAG & data science','⌕','Learn retrieval, metrics, and independent evaluation step by step.'],
 ['AGENT_MCP','Agents & MCP basics','⇄','Understand orchestration, tools, frameworks, and access boundaries.'],
 ['SOFTWARE','Software fundamentals','◇','OOP, SOLID, APIs, testing, and enterprise design made practical.'],
 ['CLOUD_OPS','Cloud & operations','☁','Follow an AI feature from deployment to monitoring and maintenance.'],
 ['GOVERNANCE','Governance & delivery','✓','Responsible AI, experiments, Agile, and business outcomes.'],
 ['PYTHON','Python practice','⌁','Talk through code, contracts, and failure cases.']
];
export function filterCards(cards, {topic='all',difficulty='all',status='all',query=''}, progress={}) {
 const text=query.trim().toLowerCase();
 return cards.filter(c => (topic==='all'||c.topic===topic) && (difficulty==='all'||c.difficulty===difficulty) &&
 (status==='all'||(status==='saved'?progress[c.id]?.saved:(progress[c.id]?.rating||'new')===status)) &&
 (!text||[c.question,c.answer,c.cue,c.followup,c.example,c.deeper,c.topic].join(' ').toLowerCase().includes(text)));
}
export function shuffleCards(cards, random=Math.random) {
 const a=[...cards]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function stats(cards, progress={}) {
 return {total:cards.length,learning:cards.filter(c=>progress[c.id]?.rating==='learning').length,confident:cards.filter(c=>progress[c.id]?.rating==='confident').length};
}
export function sanitizeProgress(value,cards){
 const result={};if(!value||typeof value!=='object')return result;
 for(const {id} of cards){const p=value[id];if(p&&typeof p==='object')result[id]={rating:['learning','confident'].includes(p.rating)?p.rating:undefined,saved:p.saved===true};}return result;
}
