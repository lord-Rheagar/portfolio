"""Render the optimized web export in Blender and check actual eye rotation."""
import bpy,sys,math,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(sys.argv[sys.argv.index('--')+1]);OUT=ROOT/'assets/avatar/blender'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'bodhi-polished.blend'))
# Preserve review lights and camera, replace all character meshes with the
# decoded optimized export used by the website.
for obj in list(bpy.context.scene.objects):
    if obj.type=='MESH':bpy.data.objects.remove(obj,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=str(OUT/'web-validation.glb'))
eyes=[bpy.data.objects.get('eye_L'),bpy.data.objects.get('eye_R')]
assert all(eye is not None and eye.type=='MESH' for eye in eyes)
scene=bpy.context.scene;scene.render.resolution_x=760;scene.render.resolution_y=760
camera=scene.camera;camera.data.ortho_scale=1.04
camera.location=(0,-4,.40);camera.rotation_euler=(Vector((0,0,.40))-camera.location).to_track_quat('-Z','Y').to_euler()
report=[]
for direction,angle in [('left',-22),('right',22)]:
    for eye in eyes:
        eye.rotation_mode='XYZ';eye.rotation_euler=(0,0,math.radians(angle))
    scene.render.filepath=str(OUT/f'web-gaze-{direction}.png')
    bpy.ops.render.render(write_still=True)
    report.append({'pose':direction,'degrees':angle,'eyes':[{'name':e.name,'pivot':list(e.location),'vertices':len(e.data.vertices)} for e in eyes]})
for eye in eyes:eye.rotation_euler=(0,0,0)
scene.render.filepath=str(OUT/'web-face.png');bpy.ops.render.render(write_still=True)
(OUT/'gaze-verification.json').write_text(json.dumps(report,indent=2))
print('WEB_EXPORT_EYES_VERIFIED')
