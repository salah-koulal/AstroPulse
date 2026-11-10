"""Blender --background --factory-startup --python scripts/prepare_models.py -- SOURCE_DIR

Uses only the two requested downloads. No substitute/procedural body geometry.
External .blend scripts are disabled. Source objects are flattened into a clean scene.
"""
import bpy, json, math, pathlib, sys, hashlib
from mathutils import Vector, Matrix

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = pathlib.Path(sys.argv[sys.argv.index('--') + 1])
OUT = ROOT / 'public/models'
OUT.mkdir(parents=True, exist_ok=True)
report = {'blender': bpy.app.version_string, 'sources': {}, 'anatomy_meshes': []}
for name in ['Astronaut.glb', 'Z-Anatomy.zip']:
    report['sources'][name] = {'sha256': hashlib.sha256((SOURCE/name).read_bytes()).hexdigest()}

def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = 0.65
    return mat

def bounds(objects):
    coords = [o.matrix_world @ v.co for o in objects for v in o.data.vertices]
    return Vector([min(v[i] for v in coords) for i in range(3)]), Vector([max(v[i] for v in coords) for i in range(3)])

def normalize(objects):
    lo, hi = bounds(objects)
    scale = 2 / (hi.z - lo.z)
    # Shared centerline and ground plane; glTF exports Z-up to Y-up.
    center = Vector(((lo.x+hi.x)/2, (lo.y+hi.y)/2, lo.z))
    for o in objects:
        world = o.matrix_world.copy()
        for v in o.data.vertices:
            v.co = (world @ v.co - center) * scale
        o.matrix_world = Matrix.Identity(4)
    return {'source_min': list(lo), 'source_max': list(hi), 'scale': scale, 'height': 2}

def export(objects, filename, copyright):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        o.hide_set(False)
        o.hide_viewport = False
        o.hide_render = False
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(filepath=str(OUT/filename), export_format='GLB', use_selection=True,
        export_animations=False, export_cameras=False, export_lights=False, export_extras=True,
        export_copyright=copyright, export_yup=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(SOURCE/'Astronaut.glb'))
astronaut = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in astronaut:
    o.name = 'NASA_Astronaut'
    o['source'] = 'NASA 3D Resources / DigitalSpace Corporation'
report['astronaut_alignment'] = normalize(astronaut)
export(astronaut, 'astronaut.glb', 'NASA / DigitalSpace Corporation. NASA media usage guidelines apply.')

bpy.ops.wm.open_mainfile(filepath=str(SOURCE/'Z-Anatomy.blend'), load_ui=False, use_scripts=False)
# Clear untrusted atlas drivers before evaluation, and make the requested objects evaluable.
for o in bpy.data.objects:
    o.animation_data_clear()
for col in bpy.data.collections:
    col.hide_viewport = False
    col.hide_render = False
def reveal(layer):
    layer.exclude = False
    layer.hide_viewport = False
    for child in layer.children: reveal(child)
reveal(bpy.context.view_layer.layer_collection)
bpy.context.view_layer.update()
groups = {}
for o in list(bpy.context.scene.objects):
    if o.type != 'MESH': continue
    n = o.name
    key = None
    if "Osteology'" in [c.name for c in o.users_collection]: key = 'Skeleton'
    if n == 'Heart': key = 'Heart'
    if 'lobe of left lung' in n: key = 'Lung_left'
    if 'lobe of right lung' in n: key = 'Lung_right'
    if 'segment of liver' in n: key = 'Liver'
    if n == 'Stomach.001': key = 'Stomach'
    if n == 'Rectus femoris muscle.l': key = 'Quadriceps_left'
    if n == 'Rectus femoris muscle.r': key = 'Quadriceps_right'
    if not key: continue
    o.hide_set(False)
    o.hide_viewport = False
    bpy.context.view_layer.update()
    evaluated = o.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = bpy.data.meshes.new_from_object(evaluated)
    mesh.transform(o.matrix_world)
    # Rotate upper-limb geometry about each shoulder to approximate NASA's T-pose.
    upper_limb = any('upper limb' in c.name.lower() for c in o.users_collection)
    if key == 'Skeleton' and upper_limb and not n.lower().startswith(('scapula', 'clavicle')):
        center = sum((v.co for v in mesh.vertices), Vector()) / max(1, len(mesh.vertices))
        sign = 1 if center.x > 0 else -1
        pivot = Vector((0.175*sign, 0.025, 1.40))
        rotation = Matrix.Rotation(math.radians(-75*sign), 3, 'Y')
        for v in mesh.vertices:
            v.co = pivot + rotation @ (v.co-pivot)
    groups.setdefault(key, []).append((mesh, n))

# Switch to a new empty scene: never ship atlas scripts, invisible geometry, or collections.
clean = bpy.data.scenes.new('AstroPulse_anatomy')
bpy.context.window.scene = clean
colors = {'Skeleton': (0.60,0.72,0.76), 'Heart':(0.58,0.13,0.19),
    'Lung_left':(0.55,0.30,0.37), 'Lung_right':(0.55,0.30,0.37),
    'Liver':(0.40,0.19,0.16), 'Stomach':(0.66,0.39,0.25),
    'Quadriceps_left':(0.48,0.18,0.20), 'Quadriceps_right':(0.48,0.18,0.20)}
result = []
for key, entries in groups.items():
    objects = []
    for mesh, source_name in entries:
        obj = bpy.data.objects.new(source_name, mesh)
        clean.collection.objects.link(obj)
        objects.append(obj)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects: o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = key
    obj['target_name'] = key
    obj.data.materials.clear()
    obj.data.materials.append(material(key, colors[key]))
    for p in obj.data.polygons: p.material_index = 0
    before = len(obj.data.polygons)
    target = 24000 if key == 'Skeleton' else 5000 if key == 'Heart' else 3500
    if before > target:
        mod = obj.modifiers.new('Web simplification', 'DECIMATE')
        mod.ratio = target / before
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in obj.data.polygons: p.use_smooth = True
    obj['source_names'] = [name for _,name in entries]
    obj['license'] = 'CC BY-SA 2.1 JP (bundled archive license)'
    report['anatomy_meshes'].append({'name':key,'source_objects':obj['source_names'].to_list() if hasattr(obj['source_names'],'to_list') else list(obj['source_names']), 'faces_before':before,'faces_after':len(obj.data.polygons)})
    result.append(obj)
assert set(groups) == set(colors), f'Missing required organs: {set(colors)-set(groups)}'
report['anatomy_alignment'] = normalize(result)
report['pose_adjustment'] = 'Whole upper-limb skeleton objects rotated 75 degrees about approximate shoulder pivots. Shared 2m height, centered XY and grounded Z. Approximate T-pose; different proportions remain.'
for obj in list(bpy.data.objects):
    if obj not in result: bpy.data.objects.remove(obj, do_unlink=True)
for obj in result: obj.name = obj['target_name']
for scene in list(bpy.data.scenes):
    if scene != clean: bpy.data.scenes.remove(scene)
export(result, 'anatomy.glb', 'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan; mixed and modified by Z-anatomy.com; simplified and posed for AstroPulse under the same license.')
for name in ['astronaut.glb','anatomy.glb']:
    report[name] = {'bytes':(OUT/name).stat().st_size,'sha256':hashlib.sha256((OUT/name).read_bytes()).hexdigest()}
(OUT/'preparation.json').write_text(json.dumps(report,indent=2))
print('ASTROPULSE_PREPARED', json.dumps({k:v for k,v in report.items() if k.endswith('.glb')}))
