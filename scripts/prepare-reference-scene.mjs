// Author a scene compatible with the upstream 24fps / 50-frame-stop contract.
// Uses only Bodhi's Meshy geometry. No upstream character or baked animation is copied.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { PerspectiveCamera, Vector3, Quaternion, Euler } from 'three';
import { mkdir, writeFile } from 'node:fs/promises';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const doc = await io.read('public/models/avatar-polished.glb');
const root = doc.getRoot(), scene = root.listScenes()[0], buffer = root.listBuffers()[0];
const body = doc.createNode('BodhiCharacter').setScale([0.8,0.8,0.8]).setTranslation([0,0.2,0]);
for (const child of scene.listChildren()) {scene.removeChild(child);body.addChild(child);}
scene.addChild(body);
// Blender's eye_L and eye_R meshes already have physical rotation pivots.
const anchors = [[0,.468,.23],[.22,.53,.12],[.0,-.02,.13],[-.22,.49,.12],[-.35,-.23,.05],[0,.468,.24]];
anchors.forEach((p,i)=>scene.addChild(doc.createNode(`focus-${i}`).setTranslation(p)));
scene.addChild(doc.createNode('focus-works').setTranslation([0,.468,.23]));
const camera = doc.createCamera('PortfolioCamera').setType('perspective').setYFov(.399596484).setZNear(.1).setZFar(100);
const cameraNode = doc.createNode('Camera').setCamera(camera);
scene.addChild(cameraNode);
// Hero centered; five detail views leave the right-hand résumé rail readable;
// the final two stops pull back as the original pinned gallery enters.
const stops = [
  {f:0,p:[0,.24,4.13],t:[0,.27,0]},
  {f:50,p:[.67,.55,1.75],t:[.37,.45,.07]},
  {f:100,p:[.65,.05,1.65],t:[.30,.01,.10]},
  {f:150,p:[-.58,.68,1.75],t:[.02,.45,.10]},
  {f:200,p:[-.30,-.05,1.80],t:[.05,-.17,.05]},
  {f:250,p:[.50,.50,2.30],t:[.30,.42,.15]},
  {f:300,p:[0,.24,4.13],t:[0,.27,0]},
  {f:350,p:[-.32,.30,4.60],t:[0,.30,0]},
];
const cam = new PerspectiveCamera(), positions=[], rotations=[], times=[];
for (let f=0;f<=350;f++) {
  const i=Math.min(6,Math.floor(f/50)), a=stops[i], b=stops[i+1];
  const x=(f-a.f)/(b.f-a.f), u=x*x*(3-2*x);
  cam.position.fromArray(a.p).lerp(new Vector3().fromArray(b.p),u);
  cam.lookAt(new Vector3().fromArray(a.t).lerp(new Vector3().fromArray(b.t),u));
  times.push(f/24);positions.push(...cam.position.toArray());rotations.push(...cam.quaternion.toArray());
}
cameraNode.setTranslation(stops[0].p).setRotation(rotations.slice(0,4));
const accessor=(name,type,array)=>doc.createAccessor(name).setType(type).setArray(new Float32Array(array)).setBuffer(buffer);
const input=accessor('camera-time','SCALAR',times), animation=doc.createAnimation('CameraAction');
for(const [path,type,array] of [['translation','VEC3',positions],['rotation','VEC4',rotations]]) {
  const sampler=doc.createAnimationSampler().setInput(input).setOutput(accessor(`camera-${path}`,type,array)).setInterpolation('LINEAR');
  animation.addSampler(sampler).addChannel(doc.createAnimationChannel().setTargetNode(cameraNode).setTargetPath(path).setSampler(sampler));
}
const turn=doc.createAnimation('CharacterAction'), q=new Quaternion().setFromEuler(new Euler(0,-Math.PI/7,0));
const turnSampler=doc.createAnimationSampler().setInput(accessor('turn-time','SCALAR',[0,250/24,350/24])).setOutput(accessor('turn-rotation','VEC4',[0,0,0,1,0,0,0,1,...q.toArray()])).setInterpolation('LINEAR');
turn.addSampler(turnSampler).addChannel(doc.createAnimationChannel().setTargetNode(body).setTargetPath('rotation').setSampler(turnSampler));
await io.write('public/models/me.glb',doc);

// Self-authored neutral studio HDR, replacing upstream's unverified environment asset.
// Uncompressed RGBE scanlines, understood by Three's RGBELoader.
const w=256,h=128,pixels=Buffer.alloc(w*h*4);
for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
  const u=x/w,v=y/h;
  const softbox=(cx,cy,sx,sy)=>Math.exp(-(((u-cx)/sx)**2+((v-cy)/sy)**2)*2);
  const key=softbox(.68,.28,.14,.17)*2.2,fill=softbox(.18,.42,.19,.22)*.8;
  const base=.13+(1-v)*.24, rgb=[base+key+fill*.82,base+key*.93+fill*.91,base+key*.84+fill];
  const exp=Math.ceil(Math.log2(Math.max(...rgb))), mult=256/2**exp, at=(y*w+x)*4;
  for(let c=0;c<3;c++) pixels[at+c]=Math.min(255,Math.round(rgb[c]*mult));
  pixels[at+3]=exp+128;
}
await mkdir('public/textures',{recursive:true});
await writeFile('public/textures/env.hdr',Buffer.concat([Buffer.from(`#?RADIANCE\n# Procedural studio environment for Bodhi\nFORMAT=32-bit_rle_rgbe\n\n-Y ${h} +X ${w}\n`),pixels]));
await writeFile('assets/avatar/scene-rig.json',JSON.stringify({source:'avatar-polished.glb',fps:24,stops,focus:anchors,eyeImplementation:'Blender-authored separate eye_L and eye_R meshes with iris/pupil vertex colors and centered pivots. No browser surface shader.',animation:'Camera path and upstream playback/postprocessing preserved during model polish.'},null,2));
console.log('Wrote polished me.glb: camera, 350-frame CameraAction, 7 focus anchors, 2 physical eyeballs; own HDR.');
