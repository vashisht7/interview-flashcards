export function termsForCard(card, glossary) {
 const text=['question','answer','cue','followup','example','deeper'].map(k=>card[k]||'').join(' ');
 return glossary.filter(entry=>[entry.term,...entry.aliases].some(alias=>{
  const escaped=alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp('(^|[^a-z0-9])'+escaped+'(?=$|[^a-z0-9])','i').test(text);
 })).sort((a,b)=>a.term.localeCompare(b.term));
}
export function searchTerms(glossary,query=''){
 const text=query.trim().toLowerCase();
 return glossary.filter(t=>[t.term,t.expansion,t.definition,...t.aliases].join(' ').toLowerCase().includes(text)).sort((a,b)=>a.term.localeCompare(b.term));
}
