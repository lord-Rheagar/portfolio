import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { BufferGeometry, BufferAttribute, Mesh, MeshBasicMaterial, DoubleSide, Raycaster, Vector3, Matrix4 } from 'three';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
await MeshoptDecoder.ready;
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public/models/avatar.glb');
const p=doc.getRoot().listMeshes()[0].listPrimitives()[0];
const geo=new BufferGeometry();
geo.setAttribute('position',new BufferAttribute(p.getAttribute('POSITION').getArray(),3,p.getAttribute('POSITION').getNormalized()));
geo.setAttribute('uv',new BufferAttribute(p.getAttribute('TEXCOORD_0').getArray(),2,p.getAttribute('TEXCOORD_0').getNormalized()));
// Convert normalized quantized attributes to float positions before baking the node matrix.
const pos=geo.getAttribute('position'),floats=new Float32Array(pos.count*3);
for(let i=0;i<pos.count;i++){floats[i*3]=pos.getX(i);floats[i*3+1]=pos.getY(i);floats[i*3+2]=pos.getZ(i);}
geo.setAttribute('position',new BufferAttribute(floats,3));
geo.applyMatrix4(new Matrix4().fromArray(doc.getRoot().listNodes()[0].getWorldMatrix()));
geo.setIndex(new BufferAttribute(p.getIndices().getArray(),1));
geo.boundsTree=new MeshBVH(geo);const mesh=new Mesh(geo,new MeshBasicMaterial({side:DoubleSide}));mesh.raycast=acceleratedRaycast;mesh.updateMatrixWorld();
const {data,info}=await sharp(p.getMaterial().getBaseColorTexture().getImage()).raw().toBuffer({resolveWithObject:true});
const width=600,height=450,out=Buffer.alloc(width*height*3);const rays=new Raycaster();rays.firstHitOnly=true;
const samples=[];
for(let j=0;j<height;j++)for(let i=0;i<width;i++){
 const x=-.4+i/width*.8,y=.7-j/height*.6;
 rays.set(new Vector3(x,y,3),new Vector3(0,0,-1));const hit=rays.intersectObject(mesh)[0];
 if(!hit)continue;const u=Math.min(info.width-1,Math.max(0,Math.round(hit.uv.x*info.width))),v=Math.min(info.height-1,Math.max(0,Math.round(hit.uv.y*info.height)));
 const offset=(v*info.width+u)*info.channels;const rgb=[data[offset],data[offset+1],data[offset+2]];
 for(let k=0;k<3;k++)out[(j*width+i)*3+k]=rgb[k];
 if(i%5===0&&j%5===0)samples.push({x,y,z:hit.point.z,rgb});
}
await mkdir('docs',{recursive:true});await sharp(out,{raw:{width,height,channels:3}}).png().toFile('docs/eye-surface-diagnostic.png');
await writeFile('docs/eye-surface-samples.json',JSON.stringify(samples));
console.log('Eye surface diagnostic saved; x -0.4 to 0.4, y 0.7 to 0.1.');
