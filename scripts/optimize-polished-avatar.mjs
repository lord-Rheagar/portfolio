import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup, prune, weld, simplifyPrimitive, textureCompress, meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {stat,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const doc=await io.read('assets/avatar/blender/bodhi-polished.glb');
await doc.transform(dedup(),weld());
// Preserve the authored eyeballs, their pivots and fine vertex-color iris detail.
for(const node of doc.getRoot().listNodes()) {
  if(node.getName()==='BodhiAvatar') for(const p of node.getMesh().listPrimitives())
    simplifyPrimitive(p,{simplifier:MeshoptSimplifier,ratio:.32,error:.0007,lockBorder:true});
}
await doc.transform(prune(),textureCompress({encoder:sharp,targetFormat:'webp',resize:[2048,2048],quality:92}),meshopt({encoder:MeshoptEncoder,level:'high'}));
await io.write('public/models/avatar-polished.glb',doc);
const result=await io.read('public/models/avatar-polished.glb');
const eyes=result.getRoot().listNodes().filter(n=>/^eye_[LR]$/.test(n.getName()));
assert.equal(eyes.length,2);
for(const eye of eyes){assert(eye.getMesh());assert.equal(eye.getMesh().listPrimitives().length,1);assert(eye.getMesh().listPrimitives()[0].getAttribute('COLOR_0'));}
const report={bytes:(await stat('public/models/avatar-polished.glb')).size,triangles:result.getRoot().listMeshes().reduce((sum,m)=>sum+m.listPrimitives().reduce((n,p)=>n+p.getIndices().getCount()/3,0),0),eyes:eyes.map(n=>({name:n.getName(),translation:n.getTranslation(),rotation:n.getRotation(),mesh:n.getMesh().getName()})),materials:result.getRoot().listMaterials().map(m=>m.getName())};
await writeFile('assets/avatar/blender/web-export-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
