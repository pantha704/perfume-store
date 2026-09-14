# RELAPSE hero — cinematic house bottle (from the client's macro poster reference):
# faceted slab of amber glass, tapered shoulder, ribbed silver crimp collar,
# black pump stack, faceted crystal cap. Fully headless; Cycles/OptiX.
#
# Structural realism notes:
#  - body/shoulder/neck are ONE lofted surface (superellipse rings), top open
#  - solidify gives real glass wall thickness; the neck bore is real
#  - liquid is a separate inner volume with volume absorption (deep amber)
#  - pump stack sits inside the bore; crystal cap transmits it, like the ref
import bpy, bmesh, math, os
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, "textures")

# key bottle coordinates (meters) — shared with render_frames.py
CAP_REST_CENTER = 0.1340     # cap center z at rest
CAP_LIFT        = 0.0500     # rise when opened

# ---------- helpers ----------
def clean():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.unit_settings.system = "METRIC"
    return sc

def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj

def new_mesh_obj(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    return link(bpy.data.objects.new(name, me))

def smooth(obj, angle=40.0):
    for p in obj.data.polygons:
        p.use_smooth = True
    try:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
        obj.select_set(False)
    except Exception as e:
        print("smooth fallback:", e)

def principled(mat):
    return mat.node_tree.nodes.get("Principled BSDF")

def set_in(node, name, value):
    if name in node.inputs:
        node.inputs[name].default_value = value
    else:
        print("missing input", name)

def mat_new(name, base=(0.8, 0.8, 0.8, 1), metallic=0.0, rough=0.4, ior=1.45,
            transmission=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = principled(m)
    set_in(b, "Base Color", base)
    set_in(b, "Metallic", metallic)
    set_in(b, "Roughness", rough)
    set_in(b, "IOR", ior)
    if transmission:
        set_in(b, "Transmission Weight", transmission)
    return m

def cylinder(r, h, segs=96):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs,
                          radius1=r, radius2=r, depth=h, calc_uvs=True)
    return bm

def cube(sx, sy, sz):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0, calc_uvs=True)
    for v in bm.verts:
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
    return bm

def bevel(bm, offset, segments=4):
    bmesh.ops.bevel(bm, geom=list(bm.edges) + list(bm.verts),
                    offset=offset, offset_type="OFFSET",
                    segments=segments, profile=0.5, affect="EDGES",
                    clamp_overlap=True, loop_slide=True,
                    material=-1, harden_normals=False)

def ring_points(a, b, n_exp, z, segs):
    pts = []
    for i in range(segs):
        t = 2 * math.pi * i / segs
        c, s = math.cos(t), math.sin(t)
        x = a * math.copysign(abs(c) ** (2.0 / n_exp), c)
        y = b * math.copysign(abs(s) ** (2.0 / n_exp), s)
        pts.append((x, y, z))
    return pts

def loft(rings, close_bottom=True, close_top=False, segs=128):
    """rings: list of (a, b, n_exp, z) from bottom to top."""
    bm = bmesh.new()
    rows = []
    for (a, b, n_exp, z) in rings:
        row = [bm.verts.new(p) for p in ring_points(a, b, n_exp, z, segs)]
        rows.append(row)
    for r0, r1 in zip(rows, rows[1:]):
        for i in range(segs):
            j = (i + 1) % segs
            bm.faces.new((r0[i], r0[j], r1[j], r1[i]))
    if close_bottom:
        bm.faces.new(tuple(reversed(rows[0])))
    if close_top:
        bm.faces.new(tuple(rows[-1]))
    for f in bm.faces:
        f.smooth = True
    # ensure normals point outward (radially from the z axis)
    for f in bm.faces:
        c = f.calc_center_median()
        radial = Vector((c.x, c.y, 0.0))
        if radial.length > 1e-6 and f.normal.dot(radial) < 0:
            f.normal_flip()
    return bm

def set_absorption(mat, color, density):
    nt = mat.node_tree
    b = principled(mat)
    vol = nt.nodes.new("ShaderNodeVolumeAbsorption")
    vol.inputs["Color"].default_value = (*color, 1)
    vol.inputs["Density"].default_value = density
    out = nt.nodes.get("Material Output")
    nt.links.new(vol.outputs["Volume"], out.inputs["Volume"])

# ---------- bottle dimensions ----------
BODY_W, BODY_D = 0.025, 0.0125         # half-extents (50 x 25 mm slab)
BODY_TOP = 0.078
SH_TOP = 0.096
NECK_HW, NECK_D = 0.009, 0.009
NECK_TOP = 0.108
WALL = 0.0022
LIQ_TOP = 0.060

def build():
    sc = clean()
    cy = sc.cycles
    cy.max_bounces = 18
    cy.transmission_bounces = 12
    cy.transparent_max_bounces = 12
    cy.glossy_bounces = 8
    cy.diffuse_bounces = 6
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.004
    cy.use_denoising = True
    try:
        cy.denoiser = "OPENIMAGEDENOISE"
    except Exception as e:
        print("denoiser:", e)
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.color_depth = "8"
    sc.render.resolution_percentage = 100
    try:
        sc.view_settings.view_transform = "AgX"
        sc.view_settings.look = "AgX - Medium High Contrast"
    except Exception as e:
        print("view transform:", e)
    sc.view_settings.exposure = 0.30

    # ---- table ----
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=3.0, calc_uvs=True)
    table = new_mesh_obj("Table", bm)
    wood = mat_new("Wood", base=(1, 1, 1, 1), rough=0.5)
    nt = wood.node_tree
    b = principled(wood)
    img = bpy.data.images.load(os.path.join(TEX, "dark_wood_diff_2k.jpg"))
    img.colorspace_settings.name = "sRGB"
    uvn = nt.nodes.new("ShaderNodeTexCoord"); uvn.location = (-1150, 200)
    mapn = nt.nodes.new("ShaderNodeMapping"); mapn.location = (-950, 200)
    mapn.inputs["Scale"].default_value = (6.0, 6.0, 1)
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img; tex.location = (-700, 200)
    nt.links.new(uvn.outputs["UV"], mapn.inputs["Vector"])
    nt.links.new(mapn.outputs["Vector"], tex.inputs["Vector"])
    darkn = nt.nodes.new("ShaderNodeMix"); darkn.location = (-550, 350)
    darkn.data_type = "RGBA"; darkn.blend_type = "MULTIPLY"
    darkn.inputs["Factor"].default_value = 1.0
    darkn.inputs[7].default_value = (0.55, 0.48, 0.42, 1)
    nt.links.new(tex.outputs["Color"], darkn.inputs[6])
    nt.links.new(darkn.outputs[2], b.inputs["Base Color"])
    bw = nt.nodes.new("ShaderNodeRGBToBW"); bw.location = (-400, -100)
    nt.links.new(tex.outputs["Color"], bw.inputs["Color"])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.location = (-200, -100)
    mr.inputs["From Min"].default_value = 0.05
    mr.inputs["From Max"].default_value = 0.35
    mr.inputs["To Min"].default_value = 0.42
    mr.inputs["To Max"].default_value = 0.75
    nt.links.new(bw.outputs["Val"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.location = (-200, -350)
    bump.inputs["Strength"].default_value = 0.5
    nt.links.new(bw.outputs["Val"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    set_in(b, "Specular IOR Level", 0.12)
    table.data.materials.append(wood)

    # ---- glass body (lofted, open top so the bore is real) ----
    rings = []
    for z in (0.0, 0.012, 0.034, 0.056, BODY_TOP):
        rings.append((BODY_W, BODY_D, 12.0, z))
    steps = 12
    for i in range(1, steps + 1):
        t = i / steps
        e = t * t * (3 - 2 * t)                      # smooth shoulder curve
        a = BODY_W + (NECK_HW - BODY_W) * e
        bb = BODY_D + (NECK_D - BODY_D) * e
        rings.append((a, bb, 12.0 - 7.0 * e, BODY_TOP + (SH_TOP - BODY_TOP) * t))
    for z in (NECK_TOP * 0.94, NECK_TOP):
        rings.append((NECK_HW, NECK_D, 5.0, z))
    flask = new_mesh_obj("Flask", loft(rings, close_bottom=True, close_top=False, segs=160))
    glass = mat_new("Glass", base=(0.985, 1.0, 0.995, 1), rough=0.004, ior=1.50,
                    transmission=1.0)
    flask.data.materials.append(glass)
    sol = flask.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = WALL
    sol.offset = -1.0
    sol.use_even_offset = True
    smooth(flask, 55)

    # diamond-cut sparkle on the glass (very subtle, like the poster facets)
    gnt = glass.node_tree
    gb = principled(glass)
    tc = gnt.nodes.new("ShaderNodeTexCoord")
    w1 = gnt.nodes.new("ShaderNodeTexWave"); w1.location = (-800, -400)
    w1.wave_type = "BANDS"; w1.bands_direction = "DIAGONAL"
    w1.inputs["Scale"].default_value = 26.0
    w1.inputs["Distortion"].default_value = 0.0
    w2 = gnt.nodes.new("ShaderNodeTexWave"); w2.location = (-800, -650)
    w2.wave_type = "BANDS"; w2.bands_direction = "DIAGONAL"
    w2.inputs["Scale"].default_value = 26.0
    w2.inputs["Distortion"].default_value = 0.0
    wmap2 = gnt.nodes.new("ShaderNodeMapping"); wmap2.location = (-1000, -650)
    wmap2.inputs["Rotation"].default_value = (0, 0, math.radians(90))
    mixw = gnt.nodes.new("ShaderNodeMix"); mixw.location = (-450, -500)
    mixw.data_type = "RGBA"; mixw.blend_type = "MULTIPLY"
    mixw.inputs["Factor"].default_value = 1.0
    bumpg = gnt.nodes.new("ShaderNodeBump"); bumpg.location = (-220, -500)
    bumpg.inputs["Strength"].default_value = 0.045
    gnt.links.new(tc.outputs["Object"], w1.inputs["Vector"])
    gnt.links.new(tc.outputs["Object"], wmap2.inputs["Vector"])
    gnt.links.new(wmap2.outputs["Vector"], w2.inputs["Vector"])
    gnt.links.new(w1.outputs["Fac"], mixw.inputs[6])
    gnt.links.new(w2.outputs["Fac"], mixw.inputs[7])
    gnt.links.new(mixw.outputs[2], bumpg.inputs["Height"])
    gnt.links.new(bumpg.outputs["Normal"], gb.inputs["Normal"])

    # ---- amber liquid (inner volume, volume absorption) ----
    lrings = []
    for z in (0.0, 0.014, 0.036, 0.052, LIQ_TOP):
        lrings.append((BODY_W - WALL, BODY_D - WALL, 12.0, z))
    liquid = new_mesh_obj("Liquid", loft(lrings, close_bottom=True, close_top=True))
    liq = mat_new("Liquid", base=(0.92, 0.55, 0.16, 1), rough=0.002, ior=1.36,
                  transmission=1.0)
    set_absorption(liq, (0.75, 0.45, 0.13), 55.0)
    liquid.data.materials.append(liq)
    smooth(liquid, 55)

    # ---- silver crimp collar (ribbed) ----
    chrome = mat_new("Chrome", base=(0.86, 0.87, 0.90, 1), metallic=1.0, rough=0.16)
    collar_parts = []
    zc = 0.1085
    radii = [0.0128, 0.0123, 0.0129, 0.0122, 0.0127, 0.0120]
    for idx, r in enumerate(radii):
        c = new_mesh_obj(f"Collar{idx}", cylinder(r, 0.0021))
        c.location = (0, 0, zc + idx * 0.0021)
        c.data.materials.append(chrome)
        smooth(c, 30)
        collar_parts.append(c)
    # collar base flange ring
    base_ring = new_mesh_obj("CollarBase", cylinder(0.0150, 0.0028))
    base_ring.location = (0, 0, 0.1072)
    base_ring.data.materials.append(chrome)
    smooth(base_ring, 30)
    collar_parts.append(base_ring)

    # ---- black pump stack ----
    black = mat_new("Black", base=(0.018, 0.017, 0.016, 1), rough=0.32)
    stem = new_mesh_obj("Stem", cylinder(0.0026, 0.024))
    stem.location = (0, 0, 0.1160)
    stem.data.materials.append(black)
    smooth(stem, 30)
    act = new_mesh_obj("Actuator", cube(0.0052, 0.0052, 0.0056))
    act.location = (0, 0, 0.1270)
    act.data.materials.append(black)
    smooth(act, 24)

    # ---- faceted crystal cap ----
    bm = cube(0.026, 0.026, 0.020)
    bevel(bm, 0.0030, 5)
    cap = new_mesh_obj("Cap", bm)
    cap.location = (0, 0, CAP_REST_CENTER)
    crystal = mat_new("Crystal", base=(0.98, 1.0, 1.0, 1), rough=0.006, ior=1.52,
                      transmission=1.0)
    cap.data.materials.append(crystal)
    smooth(cap, 30)

    # ---- rig ----
    rig = link(bpy.data.objects.new("Rig", None))
    for o in [flask, liquid, stem, act] + collar_parts:
        o.parent = rig
    cap.parent = rig

    # ---- camera ----
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 70.0
    cam_data.sensor_width = 36.0
    cam_data.dof.use_dof = True
    cam = link(bpy.data.objects.new("Cam", cam_data))
    sc.camera = cam

    # ---- world ----
    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    sc.world = world
    wnt = world.node_tree
    wbg = wnt.nodes["Background"]
    wbg.inputs["Strength"].default_value = 0.06
    hdri = bpy.data.images.load(os.path.join(HERE, "hdri", "photo_studio_01_2k.hdr"))
    henv = wnt.nodes.new("ShaderNodeTexEnvironment")
    henv.image = hdri
    henv.location = (-400, 0)
    wmap = wnt.nodes.new("ShaderNodeMapping"); wmap.location = (-620, 0)
    wmap.inputs["Rotation"].default_value = (0, 0, math.radians(140))
    wnt.links.new(henv.outputs["Color"], wmap.inputs["Vector"])
    wnt.links.new(wmap.outputs["Vector"], wbg.inputs["Color"])

    # ---- lights (product-film setup, kept high to avoid table pools) ----
    def area(name, sx, sy, loc, color, watts):
        li = bpy.data.lights.new(name, "AREA")
        li.shape = "RECTANGLE"; li.size = sx; li.size_y = sy
        li.color = color; li.energy = watts
        ob = link(bpy.data.objects.new(name, li))
        ob.location = loc
        return ob

    def aim(ob, target):
        d = Vector(target) - ob.location
        ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()

    key = area("Key", 0.60, 0.90, (-0.34, -0.16, 0.52), (1.0, 0.90, 0.76), 26.0)
    aim(key, (0.0, 0.0, 0.09))
    strip = area("Strip", 0.025, 0.55, (0.16, 0.26, 0.34), (0.90, 0.93, 1.0), 8.0)
    aim(strip, (0.0, 0.0, 0.10))
    kicker = area("Kicker", 0.30, 0.44, (-0.26, 0.22, 0.30), (1.0, 0.88, 0.70), 7.0)
    aim(kicker, (0.0, 0.0, 0.10))
    fill = area("Fill", 0.5, 0.5, (0.24, -0.44, 0.26), (1.0, 0.95, 0.90), 4.0)
    aim(fill, (0.0, 0.0, 0.08))

    return sc

if __name__ == "__main__":
    build()
    out = os.path.join(HERE, "hero-base.blend")
    bpy.ops.wm.save_as_mainfile(filepath=out)
    print("SAVED", out)
