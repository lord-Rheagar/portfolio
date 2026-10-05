import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, textureCompress, meshopt, getBounds } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { mkdir, stat, writeFile } from 'node:fs/promises';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const source = 'assets/avatar/avatar-original.glb';
const document = await io.read(source);
const primitive = document.getRoot().listMeshes()[0].listPrimitives()[0];
const positions = primitive.getAttribute('POSITION').getArray();
const indices = primitive.getIndices().getArray();
// Weld by position for this audit only, so texture seams don't masquerade as separate anatomy.
const parents = Array.from({length: positions.length / 3}, (_,i)=>i);
function find(a) { while(parents[a]!==a) { parents[a]=parents[parents[a]]; a=parents[a]; } return a; }
function union(a,b) { parents[find(b)]=find(a); }
const map = new Map();
for(let i=0;i<parents.length;i++) {
  const key = [0,1,2].map(k=>Math.round(positions[i*3+k]*1e6)).join(',');
  if(map.has(key)) union(i,map.get(key)); else map.set(key,i);
}
for(let i=0;i<indices.length;i+=3) { union(indices[i],indices[i+1]); union(indices[i],indices[i+2]); }
const components = new Map();
for(let i=0;i<parents.length;i++) {
  const root=find(i), c=components.get(root) || {vertices:0,min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
  c.vertices++;
  for(let k=0;k<3;k++){c.min[k]=Math.min(c.min[k],positions[i*3+k]);c.max[k]=Math.max(c.max[k],positions[i*3+k]);}
  components.set(root,c);
}
const audit={ originalBytes:(await stat(source)).size, originalTriangles:indices.length/3, bounds:getBounds(document.getRoot().listScenes()[0]), connectedComponents:[...components.values()].sort((a,b)=>b.vertices-a.vertices) };
await document.transform(dedup(), weld(), simplify({simplifier:MeshoptSimplifier,ratio:0.28,error:0.001}), prune(), textureCompress({encoder:sharp,targetFormat:'webp',resize:[2048,2048],quality:86}), meshopt({encoder:MeshoptEncoder,level:'high'}));
document.getRoot().listNodes()[0].setName('BodhiAvatar');
await mkdir('public/models',{recursive:true});
await io.write('public/models/avatar.glb',document);
const roundtrip=await io.read('public/models/avatar.glb');
audit.optimizedBytes=(await stat('public/models/avatar.glb')).size;
audit.optimizedTriangles=roundtrip.getRoot().listMeshes().reduce((sum,m)=>sum+m.listPrimitives().reduce((n,p)=>n+p.getIndices().getCount()/3,0),0);
audit.textureSizes=roundtrip.getRoot().listTextures().map(t=>({size:t.getSize(),mime:t.getMimeType()}));
await writeFile('assets/avatar/optimization-report.json',JSON.stringify(audit,null,2));
console.log(JSON.stringify(audit,null,2));
