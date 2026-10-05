import fs from 'node:fs/promises';
const read = async p => (await fs.readFile(p, 'utf8')).replace(/\r\n/g,'\n');
const write = (p,s) => fs.writeFile(p,s);
let app = await read('reference/web/src/App.tsx');
const copy = {en:{title:'About Bodhi',paragraphs:["I'm Bodhi. This is my personal portfolio — a space for my story, experience, and the things I create. My introduction and project details will be added here soon."]},zh:{title:'About Bodhi',paragraphs:['个人介绍即将添加。']}};
app = app.replace(/const COPY = \{[\s\S]*?\n\}\n/, `const COPY = ${JSON.stringify(copy,null,2)}\n`)
  .replace("useState<Lang>('zh')","useState<Lang>('en')")
  .replace('Sen Zheng 郑越升','Bodhi').replace('Creative Technologist','Personal Portfolio')
  .replace('Code · Art · Play','Story · Work · Play').replace('Based in Shenzhen','A work in progress');
await write('src/App.tsx',app);
let resume = await read('reference/web/src/ui/Resume.tsx');
resume = resume.replace("import { ZooopLogo } from './ZooopLogo'\n",'')
  .replace(/const SOCIAL_LINKS = \[[\s\S]*?\n\]\n/,'');
const entries = [
  {period:'Details coming soon',place:'Education',role:'My studies and background'},
  {period:'Details coming soon',place:'Experience',role:'My work and collaborations',points:['Roles, responsibilities, and milestones will be added here.']},
  {period:'Details coming soon',place:'Projects',role:'Things I have built',points:['Selected projects and their stories will be added here.']},
  {period:'Details coming soon',place:'Interests',groups:[{heading:'Beyond work',sub:'What keeps me curious',items:['Personal interests and creative explorations will be added here.']}]},
  {period:'Now',place:'What’s next',groups:[{heading:'Currently exploring',sub:'Updates coming soon'}]},
];
resume = resume.replace(/const RESUME:[\s\S]*?\n\}\n/,`const RESUME: Record<'en' | 'zh', { title: string; entries: ResumeEntry[] }> = ${JSON.stringify({en:{title:'Résumé',entries},zh:{title:'Résumé',entries}},null,2)}\n`)
  .replace(/group\.logo === 'zooop' \? \([\s\S]*?\) : group\.link \? \(/,'group.link ? (');
await write('src/ui/Resume.tsx',resume);
let works = await read('reference/web/src/data/works.ts');
works = works.slice(0,works.indexOf('export const WORKS'));
const sections = ['Selected Projects','Experiments','Current Work','Side Projects'].map((title,i)=>({id:['ad','maker','product','graphics'][i],no:String(i+1).padStart(2,'0'),title,tagline:'Details coming soon',items:Array.from({length:i===2?1:4},(_,j)=>({name:`${['Project','Experiment','Current project','Side project'][i]} ${String(j+1).padStart(2,'0')}`,meta:'Placeholder',slug:`section-${i+1}-project-${j+1}`})),...(i===3?{footer:'Avatar by doctorbunip · Created with Meshy · CC BY 4.0'}:{})}));
works += `const en: WorksLang = {\n title:'Works', closeLabel:'Back', openLabel:'Explore', hint:'Keep scrolling', awardsLabel:'Awards', visitLabel:'Visit site', detailPlaceholder:'Project description coming soon. This is a placeholder for my own work.', phImageLabel:'Image / Video', phButtonLabel:'Link coming soon', countLabel:(n)=>\`\${n} works\`, sections:${JSON.stringify(sections,null,2)}\n}\nexport const WORKS: Record<'en' | 'zh', WorksLang> = {en,zh:en}\nexport const SECTION_COVERS: Record<string,string> = {}\nexport function sectionCount(section: WorkSection): number {\n if(section.items) return section.items.length\n if(section.groups) return section.groups.reduce((n,g)=>n+g.items.length,0)\n return 0\n}\n`;
await write('src/data/works.ts',works);
await write('src/content/works/example.md','---\ntitle: Project title\nyear: Year\nrole: Your role\ntags: [Your tag]\n---\n\nDescribe your own project here. Rename this file to match a project slug in src/data/works.ts.\n');
let main = await read('reference/web/src/main.tsx');
main = `import '@fontsource/mansalva/400.css'\nimport '@fontsource/cormorant-upright/400.css'\nimport '@fontsource/cormorant-upright/500.css'\nimport '@fontsource/cormorant-upright/600.css'\n${main}`;
await write('src/main.tsx',main);
await write('index.html','<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta name="description" content="Bodhi’s personal portfolio — story, experience, and selected work."/><title>Bodhi — Portfolio</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n');
const pkg = JSON.parse(await read('package.json'));
Object.assign(pkg.scripts,{typecheck:'tsc --noEmit',lint:'eslint src', 'prepare:scene':'node scripts/prepare-reference-scene.mjs'});
await write('package.json',JSON.stringify(pkg,null,2)+'\n');
await write('eslint.config.js',(await read('eslint.config.js')).replace("ignores: ['dist']","ignores: ['dist', 'archive', 'reference']"));
await fs.mkdir('public/licenses',{recursive:true});
for(const font of ['mansalva','cormorant-upright']) await fs.copyFile(`node_modules/@fontsource/${font}/LICENSE`,`public/licenses/${font}-OFL.txt`);
await fs.copyFile('LICENSE','public/licenses/sen-3d-resume-MIT.txt');
console.log('Adopted upstream components and CSS; replaced personal content with placeholders.');
