"""Run in Blender with --background --factory-startup --python this_file."""
import bpy, json, pathlib
from mathutils import Vector

root = pathlib.Path('/tmp/astropulse-source')
blend = next(root.rglob('*.blend'), None)
if blend:
    bpy.ops.wm.open_mainfile(filepath=str(blend), load_ui=False, use_scripts=False)
    report = []
    for obj in bpy.data.objects:
        if obj.type != 'MESH':
            continue
        corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
        report.append({'name': obj.name, 'vertices': len(obj.data.vertices), 'faces': len(obj.data.polygons), 'collections': [c.name for c in obj.users_collection], 'min': [min(c[i] for c in corners) for i in range(3)], 'max': [max(c[i] for c in corners) for i in range(3)]})
    (root / 'anatomy-inventory.json').write_text(json.dumps(report, indent=2))
    for t in bpy.data.texts:
        (root / ('blend-text-' + t.name.replace('/', '_'))).write_text(t.as_string())
    print('ANATOMY', len(report), str(blend))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root / 'Astronaut.glb'))
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
        print('NASA', obj.name, len(obj.data.vertices), 'min', [min(c[i] for c in corners) for i in range(3)], 'max', [max(c[i] for c in corners) for i in range(3)])
