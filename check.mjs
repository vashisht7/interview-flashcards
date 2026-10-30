import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterCards,shuffleCards,stats,sanitizeProgress} from './study-core.mjs';
const cards=JSON.parse(readFileSync(new URL('./cards.json',import.meta.url)));
assert.equal(cards.length,114);assert.equal(new Set(cards.map(c=>c.id)).size,114);
assert.equal(filterCards(cards,{topic:'NOTEECHOES'}).length,20);
assert.equal(filterCards(cards,{topic:'MFLASH'}).length,20);
assert(filterCards(cards,{query:'96.3%'}).length>0);
const progress={1:{rating:'confident',saved:true},2:{rating:'learning'}};
assert.deepEqual(stats(cards,progress),{total:114,learning:1,confident:1});
assert.equal(filterCards(cards,{status:'new'},progress).length,112);
assert.equal(filterCards(cards,{status:'saved'},progress)[0].id,1);
assert.equal(filterCards(cards,{status:'confident'},progress).length,1);
assert.equal(filterCards(cards,{topic:'PYTHON',difficulty:'Easy'}).length,1);
assert.equal(shuffleCards(cards,()=>.5).length,114);assert.equal(new Set(shuffleCards(cards).map(c=>c.id)).size,114);
assert.equal(sanitizeProgress({1:{rating:'bad',saved:'true'}},cards)[1].saved,false);
console.log('Passed: 114 cards, topic/difficulty/search filters, ratings, bookmarks, shuffle integrity, storage validation.');

const added=cards.filter(c=>c.id>=73);
assert.equal(added.length,42);
for(const c of added){assert(c.example && c.deeper && c.experience);assert(['Easy','Medium','Hard'].includes(c.difficulty));}
assert.equal(filterCards(cards,{topic:'LLM_PROMPTS'}).length,8);
assert.equal(filterCards(cards,{topic:'SOFTWARE'}).length,8);
assert.equal(filterCards(cards,{topic:'GOVERNANCE'}).length,6);
assert.equal(sanitizeProgress(progress,cards)[1].rating,'confident');
console.log('Passed: new JD topic counts, layered explanations, and original progress IDs.');

const {termsForCard,searchTerms}=await import('./glossary-core.mjs');
const glossary=JSON.parse(readFileSync(new URL('./glossary.json',import.meta.url)));
const flows=JSON.parse(readFileSync(new URL('./flows.json',import.meta.url)));
for(const c of cards)assert(termsForCard(c,glossary).length,`No terms for card ${c.id}`);
for(const term of glossary)assert(term.term&&term.expansion&&term.definition&&term.example);
assert.equal(new Set(glossary.map(t=>t.term)).size,glossary.length);
assert(termsForCard(cards[2],glossary).some(t=>t.term==='MLP'));
assert(!termsForCard({answer:'chair fair training'},glossary).some(t=>t.term==='AI'));
assert(!termsForCard({answer:'QLoRA'},glossary).some(t=>t.term==='LoRA'));
assert(searchTerms(glossary,'multilayer').some(t=>t.term==='MLP'));
assert(searchTerms(glossary,'write-ahead').some(t=>t.term==='WAL'));
assert.equal(searchTerms(glossary,'zzzznonexistent').length,0);
assert.equal(flows.length,9);
for(const f of flows){assert(f.steps.length>=3);for(const s of f.steps)assert(s.label&&s.explanation);for(const id of f.cards)assert(cards.some(c=>c.id===id));}
console.log(`Passed: all ${cards.length} cards have definitions; ${glossary.length} unique glossary terms; boundary-safe matching and search; nine valid flows.`);

const {formulas,cardFormulas,termFormulas}=await import('./math-content.mjs');
const arities={mfrac:2,msub:2,msup:2,msqrt:1,munder:2,munderover:3};
function checkMath(tree){assert(tree&&tree.tag&&Array.isArray(tree.children));if(tree.tag in arities)assert.equal(tree.children.length,arities[tree.tag]);for(const child of tree.children)if(typeof child!=='string')checkMath(child);}
for(const f of Object.values(formulas)){checkMath(f.expression);assert(f.symbols.length&&f.meaning&&f.example);for(const s of f.symbols){checkMath(s.symbol);assert(s.meaning);}}
for(const ids of [...Object.values(cardFormulas),...Object.values(termFormulas)])for(const id of ids)assert(formulas[id]);
assert(!JSON.stringify(cards).includes('softmax(QK-transpose'));
assert(!JSON.stringify(cards).includes('1/(60+rank)'));
console.log('Passed: 11 structured equations, symbol explanations, MathML node arities, card/glossary mappings, removed text-form formulas.');
