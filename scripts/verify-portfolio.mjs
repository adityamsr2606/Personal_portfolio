import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function moduleUrl(file, imports = {}) {
  let source = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  for (const [name, url] of Object.entries(imports)) source = source.replaceAll("'" + name + "'", "'" + url + "'");
  const output = ts.transpile(source, {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext});
  return 'data:text/javascript;base64,' + Buffer.from(output).toString('base64');
}
const contentUrl = moduleUrl('lib/content.ts');
const {initialContent, publicContent} = await import(contentUrl);
const {archiveSources, findSources, archiveAnswer} = await import(moduleUrl('lib/aurel.ts', {'./content': contentUrl}));
const {parseContributions} = await import(moduleUrl('lib/github.ts'));

const edited = structuredClone(initialContent);
edited.projects[0].description = 'LATEST_PUBLISHED_DESCRIPTION';
edited.projects.push({...edited.projects[0], id:'private-project', published:false, description:'PRIVATE_DRAFT_MARKER'});
edited.projects.push({...edited.projects[0], id:'deleted-project', deleted:true, description:'DELETED_MARKER'});
const published = publicContent(edited);
assert(!JSON.stringify(published).includes('PRIVATE_DRAFT_MARKER'));
assert(!JSON.stringify(published).includes('DELETED_MARKER'));
const sources = archiveSources(published);
const answer = findSources('Tell me about Consumer360', sources);
assert.equal(answer[0].id, 'projects:consumer360');
assert(archiveAnswer(answer).includes('LATEST_PUBLISHED_DESCRIPTION'));
assert.equal(findSources('zqxvunknown', sources).length, 0);
assert.match(archiveAnswer([]), /could not find/);
edited.settings.hidden = 'projects';
assert(!archiveSources(publicContent(edited)).some(source=>source.id.startsWith('projects:')));

const html = '<td id="day-1" data-date="2026-09-16" data-level="2"></td><tool-tip for="day-1">12 contributions on September 16.</tool-tip><td id="day-0" data-date="2026-09-15" data-level="0"></td>';
assert.deepEqual(parseContributions(html), [{date:'2026-09-15',count:0,level:0},{date:'2026-09-16',count:12,level:2}]);
assert.deepEqual(parseContributions('<html>GitHub unavailable</html>'), []);
assert.equal(parseContributions('<td data-date="2026-09-16" data-level="3"></td>')[0].count, null);
console.log('Passed: published-only content, removed entries, current-content retrieval, hidden sections, unknown questions, GitHub calendar parsing.');
