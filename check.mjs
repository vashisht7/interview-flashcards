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
