# AstroPulse model sources and licenses

Reviewed 2026-11-09. These are two independently imported models, not a removable suit over a single body. No procedural substitute anatomy is included.

## Astronaut

- Source: [NASA Astronaut](https://science.nasa.gov/3d-resources/astronaut/).
- Original file: [Astronaut.glb](https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/astronaut/Astronaut.glb).
- Creator credited by NASA: **DigitalSpace Corporation**.
- NASA's [3D resource hub](https://science.nasa.gov/3d-resources/) makes its assets available to download and use, subject to [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). This is not a blanket CC license. Credit NASA and the named contributor; do not imply NASA endorsement or use its identifiers as AstroPulse branding.
- Changes: imported into Blender, normalized to a 2-unit height, centered and grounded, mesh renamed `NASA_Astronaut`, exported as self-contained GLB. Original appearance retained. The small Draco-compressed source is decoded during preparation, avoiding a runtime decoder download; the output is consequently larger than the source.

## Anatomy

- Exact source: [Open source atlas of human anatomy, version 1.0](https://zenodo.org/records/4953712), DOI **10.5281/zenodo.4953712**, June 15, 2021.
- Creators: **Kousaku Okubo (BodyParts3D)** and **Gauthier Kervyn (Z-Anatomy)**.
- Original archive: [Z-Anatomy.zip](https://zenodo.org/records/4953712/files/Z-Anatomy.zip?download=1), 130,001,315 bytes; source MD5 `231a7c2f3b118ce250404a968fbd0525`.
- Required original attribution: **“BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan”**, mixed and modified by **Z-anatomy.com**.
- Preserved original license: [Z-Anatomy-original-Licence.txt](./Z-Anatomy-original-Licence.txt). License link: [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/).
- AstroPulse distributes its adapted `anatomy.glb` under the same **CC BY-SA 2.1 Japan** terms stated by the bundled license, with the original attribution and this modifications notice. Retain these notices and share-alike terms when redistributing the adapted asset.

### Metadata discrepancy

Zenodo's API metadata labels this record `cc-by-4.0`; the archive's own `Licence.txt` explicitly states BodyParts3D's CC BY-SA 2.1 Japan conditions. The [current Z-Anatomy repository](https://github.com/Z-Anatomy/Models-of-human-anatomy) states CC BY-SA 4.0 and lists additional third-party contributions, some noncommercial. Those labels should not be used to erase the more restrictive attribution/share-alike requirements shipped with this exact 2021 source. The original archive license and [retrieved record metadata](./zenodo-record.json) are preserved as evidence. No claim is made that the atlas is public domain or attribution-only.

### Subset and changes

The original contains 2,562 mesh objects. Only a skeleton subset, heart, five lung lobes, liver segments, stomach, and bilateral rectus femoris muscles are retained. No kidney, inner-ear, cranial-nerve, brain/white-matter additions, definitions, atlas scripts, cameras, or hidden atlas scenes are shipped. `preparation.json` records every retained source object, hashes, face counts and transforms.

Eight individually named output meshes:

| Mesh | Body-system control |
| --- | --- |
| `Heart` | Cardiovascular |
| `Lung_left`, `Lung_right` | Respiratory |
| `Skeleton` | Skeletal |
| `Quadriceps_left`, `Quadriceps_right` | Muscular |
| `Liver`, `Stomach` | Digestive |

Changes: selected and merged related structures, evaluated source modifiers, simplified topology, replaced materials with flat web materials, renamed meshes, rotated whole upper-limb bones toward the astronaut's T-pose, normalized height/center/ground, and exported a standalone GLB. Internal organ geometry remains from the atlas. Shared normalized height is a viewer convention, not a claim about actual crew height. Different body proportions and suit bulk remain; this is approximate pose matching for a prototype, not clinical registration.

See [preparation.json](./preparation.json) for the machine-readable provenance and `scripts/prepare_models.py` in the source repository for the reproducible Blender workflow.
