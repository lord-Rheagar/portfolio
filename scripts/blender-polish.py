"""Reproducible, conservative cleanup of Bodhi's own Meshy model in Blender.
Run: blender --background --python scripts/blender-polish.py -- <workspace>
All measurements below use the original GLB's Y-up coordinates.
"""
import bpy, bmesh, math, json, sys, os
import numpy as np
from pathlib import Path
from mathutils import Vector

ROOT = Path(sys.argv[sys.argv.index('--')+1])
OUT = ROOT / 'assets/avatar/blender'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/avatar/avatar-original.glb'))
body = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
bpy.context.view_layer.objects.active = body
body.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
body.name='BodhiAvatar'

def native(v): return (v.x, v.z, -v.y)
def coord(v): return Vector((v[0], -v[2], v[1]))
def aim(obj,target): obj.rotation_euler=(coord(target)-obj.location).to_track_quat('-Z','Y').to_euler()

# Studio used for comparable before/after renders only (not the exported site).
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Studio world');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.36,.43,.32,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.4
scene.view_settings.view_transform='AgX'
for name,pos,power,size,color in [('Key',[-2,3,4],350,3,(1,.88,.75)),('Fill',[3,1.6,2],240,2.5,(.8,.89,1)),('Rim',[-2,2,-2],400,2,(.84,.9,1))]:
    light=bpy.data.lights.new(name,'AREA');light.energy=power;light.shape='DISK';light.size=size;light.color=color
    ob=bpy.data.objects.new(name,light);scene.collection.objects.link(ob);ob.location=coord(pos);aim(ob,[0,.2,0])
camera_data=bpy.data.cameras.new('ReviewCamera');camera_data.type='ORTHO';camera_data.ortho_scale=1.04
camera=bpy.data.objects.new('ReviewCamera',camera_data);scene.collection.objects.link(camera);scene.camera=camera
camera.location=coord([0,.40,4]);aim(camera,[0,.40,0])

def render(name,position=None,target=None,scale=None):
    if position: camera.location=coord(position)
    if target: aim(camera,target)
    if scale: camera.data.ortho_scale=scale
    scene.render.filepath=str(OUT/name)
    bpy.ops.render.render(write_still=True)

if not (OUT/'before-face.png').exists():render('before-face.png')

# Weld UV-split vertices for gentle smoothing, retaining UVs on face corners.
bm=bmesh.new();bm.from_mesh(body.data)
before_faces=len(bm.faces)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000015)

# The diagonal lens tear floats ~0.08 units above the intact face. Remove
# only its foreground geometry inside the right lens, not the skin beneath it.
tear=[]
for face in bm.faces:
    x,y,z=native(face.calc_center_median())
    if .075<x<.207 and .233<y<.337 and .350<z<.410 and abs(y-(.371-.66*x))<.014:
        tear.append(face)
bmesh.ops.delete(bm,geom=tear,context='FACES')

# Cut shallow elliptical sockets through the old baked eyeball surfaces.
# Surrounding skin, eyelids, and frames are preserved; the new spheres fill them.
eye_specs=[('eye_L',(-.135,.335,.211),(.067,.032)),('eye_R',(.123,.329,.211),(.066,.030))]
cut=[]
for face in bm.faces:
    x,y,z=native(face.calc_center_median())
    for _,center,aperture in eye_specs:
        if ((x-center[0])/aperture[0])**2+((y-center[1])/aperture[1])**2<1 and .225<z<.308:
            cut.append(face);break
bmesh.ops.delete(bm,geom=cut,context='FACES')
for v in bm.verts:
    if not v.is_boundary:continue
    x,y,z=native(v.co)
    for _,center,aperture in eye_specs:
        r=math.hypot((x-center[0])/aperture[0],(y-center[1])/aperture[1])
        if .72<r<1.3 and .225<z<.308:
            v.co=coord([center[0]+(x-center[0])/r,center[1]+(y-center[1])/r,z])
            break

# Remove loose remnants created by the cuts; do not fill the deliberate sockets.
loose=[v for v in bm.verts if not v.link_faces]
if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
# Tiny surface relaxation on cheek/beard/neck only; leave silhouette and details.
smooth=[]
for v in bm.verts:
    x,y,z=native(v.co)
    if abs(x)<.33 and -.25<y<.27 and .16<z<.36 and not v.is_boundary:
        # Protect moustache, lips, and nose from any shape changes.
        if not (abs(x)<.255 and -.015<y<.20):smooth.append(v)
for _ in range(2):
    bmesh.ops.smooth_vert(bm,verts=smooth,factor=.16,use_axis_x=True,use_axis_y=True,use_axis_z=True)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
bm.to_mesh(body.data);bm.free();body.data.update()
for p in body.data.polygons:p.use_smooth=True

# Retain the painted likeness. Give surfaces separate non-metallic materials
# and reduce the exaggerated normal-map relief from the generated asset.
source=body.data.materials[0]
base_shader=next(n for n in source.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
base_image=base_shader.inputs['Base Color'].links[0].from_node.image
tex_w,tex_h=base_image.size
tex_pixels=np.empty(tex_w*tex_h*4,dtype=np.float32);base_image.pixels.foreach_get(tex_pixels)
tex_pixels=tex_pixels.reshape(tex_h,tex_w,4)
uv_layer=body.data.uv_layers.active
def face_color(poly):
    uv=sum((uv_layer.data[i].uv for i in poly.loop_indices),Vector((0,0)))/len(poly.loop_indices)
    return tex_pixels[min(tex_h-1,max(0,int(uv.y*tex_h))),min(tex_w-1,max(0,int(uv.x*tex_w))),:3]
def surface(name,roughness,normal_strength):
    m=source.copy();m.name=name
    bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    for socket,value in [('Metallic',0),('Roughness',roughness)]:
        for link in list(bs.inputs[socket].links):m.node_tree.links.remove(link)
        bs.inputs[socket].default_value=value
    for n in m.node_tree.nodes:
        if n.type=='NORMAL_MAP':n.inputs['Strength'].default_value=normal_strength
    return m
materials=[surface('Skin · soft satin',.64,.25),surface('Hair · soft charcoal',.69,.32),surface('Beard · matte',.77,.30),surface('Shirt · woven matte',.9,.4),surface('Glasses · frosted acetate',.30,.15)]
body.data.materials.clear()
for m in materials:body.data.materials.append(m)
for poly in body.data.polygons:
    x,y,z=native(poly.center)
    red,green,blue=face_color(poly)
    idx=0
    if y>.52 or (y>.41 and z<.10):idx=1
    # Follow the painted green collar boundary rather than slicing materials
    # across a horizontal height (which creates a visible seam on the shirt).
    if y<-.44 or (y<-.10 and green>red*1.04 and blue>red*.90):idx=3
    elif -.12<y<.20 and abs(x)<.34 and z>.12 and red<.30:idx=2
    # Foreground frames, excluding nose bridge skin.
    if .19<y<.405 and z>.345 and abs(x)<.33:idx=4
    poly.material_index=idx

def plain(name,color,roughness):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=roughness
    p.inputs['Coat Weight'].default_value=.55;p.inputs['Coat Roughness'].default_value=.12
    return m
sclera=plain('Sclera · warm ivory',(.79,.76,.68),.32)
limbus=plain('Iris · dark limbal ring',(.024,.014,.009),.26)
iris=[plain('Iris · brown fiber '+str(i),(.10+i*.009,.047+i*.004,.016+i*.002),.25) for i in range(5)]
pupil=plain('Pupil',(.003,.002,.001),.18)
eye_material=plain('Eyes · colored iris and glossy surface',(1,1,1),.20)
vertex_color=eye_material.node_tree.nodes.new('ShaderNodeVertexColor');vertex_color.layer_name='EyeColor'
eye_material.node_tree.links.new(vertex_color.outputs['Color'],eye_material.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
palette=[(.79,.76,.68),(.024,.014,.009)]+[(.10+i*.009,.047+i*.004,.016+i*.002) for i in range(5)]+[(.003,.002,.001),(.98,.96,.90)]
eyes=[]
for name,center,aperture in eye_specs:
    radius=.081
    # Sphere parameterized about its forward axis. Iris and pupil are actual
    # material regions of the same rotatable mesh, not a browser shader.
    theta=[0,.055,.11,math.asin(.014/radius),math.asin(.016/radius),.245,.30,math.asin(.028/radius),math.asin(.030/radius)]
    theta += [theta[-1]+(math.pi-theta[-1])*j/28 for j in range(1,29)]
    segments=96;verts=[];faces=[];slots=[]
    for a in theta:
        for j in range(segments):
            phi=2*math.pi*j/segments
            verts.append(tuple(coord([radius*math.sin(a)*math.cos(phi),radius*math.sin(a)*math.sin(phi),radius*math.cos(a)])))
    for k in range(len(theta)-1):
        for j in range(segments):
            n=(j+1)%segments
            faces.append((k*segments+j,(k+1)*segments+j,(k+1)*segments+n,k*segments+n))
            mid=(theta[k]+theta[k+1])/2
            if mid<math.asin(.014/radius):slot=7
            elif mid<math.asin(.028/radius):slot=2+((j*13+k*3)%5)
            elif mid<math.asin(.030/radius):slot=1
            else:slot=0
            px=radius*math.sin(mid)*math.cos(2*math.pi*(j+.5)/segments)
            py=radius*math.sin(mid)*math.sin(2*math.pi*(j+.5)/segments)
            # Small illustrated catchlight is part of the stylized eyeball itself.
            if mid<.35 and ((px+.008)/.0045)**2+((py-.010)/.005)**2<1:slot=8
            slots.append(slot)
    mesh=bpy.data.meshes.new(name+' geometry');mesh.from_pydata(verts,[],faces);mesh.update()
    eye=bpy.data.objects.new(name,mesh);scene.collection.objects.link(eye);eye.location=coord(center)
    mesh.materials.append(eye_material)
    color=mesh.color_attributes.new(name='EyeColor',type='FLOAT_COLOR',domain='CORNER')
    for p,slot in zip(mesh.polygons,slots):
        p.use_smooth=True
        for loop in p.loop_indices:color.data[loop].color=(*palette[slot],1)
    # Weld poles and ensure outward normals.
    eb=bmesh.new();eb.from_mesh(mesh);bmesh.ops.remove_doubles(eb,verts=list(eb.verts),dist=.000001);bmesh.ops.recalc_face_normals(eb,faces=list(eb.faces));eb.to_mesh(mesh);eb.free()
    eyes.append(eye)

report={'blender':bpy.app.version_string,'source':'avatar-original.glb','originalFaces':before_faces,'lensArtifactFacesRemoved':len(tear),'oldEyeFacesRemoved':len(cut),'gentlySmoothedVertices':len(smooth),'newEyes':[o.name for o in eyes],'eyePivotsNative':[spec[1] for spec in eye_specs],'preserved':'Original face texture, likeness, moustache, hairstyle, clothing, and frame silhouette.'}
(OUT/'polish-report.json').write_text(json.dumps(report,indent=2))
render('after-face.png')
render('after-three-quarter.png',[1.4,.40,4],[0,.40,0],1.08)
render('after-portrait.png',[0,.05,4],[0,.05,0],2.05)
# Save an editable Blender project with cameras and review lighting.
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'bodhi-polished.blend'))
# Only character meshes enter the website; preserve its existing scene separately.
bpy.ops.object.select_all(action='DESELECT')
for ob in [body,*eyes]:ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'bodhi-polished.glb'),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_yup=True)
print('POLISH_REPORT '+json.dumps(report))
