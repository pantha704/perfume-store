# RELAPSE hero — faceted square flacon (client-supplied design, repaired to
# reference quality): cut-crystal diamond facet field, rich amber liquid with
# volume absorption, chrome ribbed collar + sprayer, faceted crystal cap,
# white RELAPSE serif wordmark. Headless; Cycles/OptiX.
import bpy, bmesh, math, os, random
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, "textures")

CAP_REST_CENTER = 0.1170
CAP_LIFT        = 0.0260

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

def facet_field(name, origin, u, v, nrm, cols, rows, tile_w, tile_h,
                push=0.0003, lift=0.00012, material=None):
    """Diamond-cut facet tiles on a flat face (flat-shaded pyramids)."""
    bm = bmesh.new()
    o = Vector(origin); U = Vector(u); V = Vector(v); N = Vector(nrm)
    for i in range(cols):
        for j in range(rows):
            cu = (i + 0.5) * tile_w
            cv = (j + 0.5) * tile_h
            c = o + U * cu + V * cv
            corners = [c + U * (tile_w / 2), c + V * (tile_h / 2),
                       c - U * (tile_w / 2), c - V * (tile_h / 2)]
            vs = [bm.verts.new(p + N * lift) for p in corners]
            va = bm.verts.new(c + N * push)
            for k in range(4):
                bm.faces.new((vs[k], vs[(k + 1) % 4], va))
    for f in bm.faces:
        f.smooth = False
        if f.normal.dot(N) < 0:
            f.normal_flip()
    obj = new_mesh_obj(name, bm)
    if material:
        obj.data.materials.append(material)
    return obj

# ---------- bottle dimensions ----------
BODY_W, BODY_D = 0.027, 0.013          # half extents: 54 x 26 mm slab
BODY_TOP = 0.070
SH_TOP = 0.084
NECK_HW = 0.009
NECK_TOP = 0.094
WALL = 0.0022
LIQ_TOP = 0.056
FACET_Z0 = 0.008                       # facet field from 8mm up
FACET_ROWS, FACET_COLS = 7, 8
TILE_W, TILE_H = 0.0052, 0.0054        # 41.6 x 37.8 mm field on front/back

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

    # ---- glass body (lofted slab, open top ⇒ real bore) ----
    rings = []
    for z in (0.0, 0.012, 0.030, 0.050, BODY_TOP):
        rings.append((BODY_W, BODY_D, 14.0, z))
    steps = 12
    for i in range(1, steps + 1):
        t = i / steps
        e = t * t * (3 - 2 * t)
        a = BODY_W + (NECK_HW - BODY_W) * e
        bb = BODY_D + (NECK_HW - BODY_D) * e
        rings.append((a, bb, 14.0 - 8.0 * e, BODY_TOP + (SH_TOP - BODY_TOP) * t))
    for z in (NECK_TOP * 0.94, NECK_TOP):
        rings.append((NECK_HW, NECK_HW, 6.0, z))
    flask = new_mesh_obj("Flask", loft(rings, close_bottom=True, close_top=False, segs=160))
    glass = mat_new("Glass", base=(0.985, 1.0, 0.995, 1), rough=0.004, ior=1.50,
                    transmission=1.0)
    flask.data.materials.append(glass)
    sol = flask.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = WALL
    sol.offset = -1.0
    sol.use_even_offset = True
    smooth(flask, 55)

    # ---- cut-crystal facet fields (front, back, sides) ----
    facets = []
    fz0 = FACET_Z0
    fw = FACET_COLS * TILE_W; fh = FACET_ROWS * TILE_H
    facets.append(facet_field("FacetFront", (-fw/2, -BODY_D, fz0), (1,0,0), (0,0,1),
                              (0,-1,0), FACET_COLS, FACET_ROWS, TILE_W, TILE_H, material=glass))
    facets.append(facet_field("FacetBack", (fw/2, BODY_D, fz0), (-1,0,0), (0,0,1),
                              (0,1,0), FACET_COLS, FACET_ROWS, TILE_W, TILE_H, material=glass))
    side_h = FACET_ROWS * TILE_H
    facets.append(facet_field("FacetLeft", (-BODY_W, -side_h/2, fz0), (0,1,0), (0,0,1),
                              (-1,0,0), 3, FACET_ROWS, TILE_W, TILE_H, material=glass))
    facets.append(facet_field("FacetRight", (BODY_W, side_h/2, fz0), (0,-1,0), (0,0,1),
                              (1,0,0), 3, FACET_ROWS, TILE_W, TILE_H, material=glass))

    # ---- amber liquid (inner volume + absorption) ----
    lrings = []
    for z in (0.0, 0.014, 0.034, 0.048, LIQ_TOP):
        lrings.append((BODY_W - WALL, BODY_D - WALL, 14.0, z))
    liquid = new_mesh_obj("Liquid", loft(lrings, close_bottom=True, close_top=True))
    liq = mat_new("Liquid", base=(0.90, 0.52, 0.14, 1), rough=0.002, ior=1.36,
                  transmission=1.0)
    set_absorption(liq, (0.72, 0.42, 0.12), 60.0)
    liquid.data.materials.append(liq)
    smooth(liquid, 55)

    # ---- suspended air bubbles (subtle, inside the liquid) ----
    rnd = random.Random(7)
    bubbles = []
    for k in range(14):
        r = rnd.uniform(0.0007, 0.0013)
        x = rnd.uniform(-0.018, 0.018)
        y = rnd.uniform(-0.007, 0.007)
        z = rnd.uniform(0.030, 0.052)
        bmb = bmesh.new()
        bmesh.ops.create_uvsphere(bmb, u_segments=24, v_segments=16, radius=r)
        bub = new_mesh_obj(f"Bubble{k}", bmb)
        bub.location = (x, y, z)
        bub.data.materials.append(glass)
        smooth(bub, 60)
        bubbles.append(bub)

    # ---- chrome collar + sprayer (clearly readable when the cap lifts) ----
    chrome = mat_new("Chrome", base=(0.86, 0.87, 0.90, 1), metallic=1.0, rough=0.16)
    collar_parts = []
    zc = 0.0870
    radii = [0.0126, 0.0120, 0.0127, 0.0119, 0.0124, 0.0117]
    for idx, r in enumerate(radii):
        c = new_mesh_obj(f"Collar{idx}", cylinder(r, 0.0021))
        c.location = (0, 0, zc + idx * 0.0021)
        c.data.materials.append(chrome)
        smooth(c, 30)
        collar_parts.append(c)
    base_ring = new_mesh_obj("CollarBase", cylinder(0.0148, 0.0030))
    base_ring.location = (0, 0, 0.0855)
    base_ring.data.materials.append(chrome)
    smooth(base_ring, 30)
    collar_parts.append(base_ring)
    # pump body: wide chrome cylinder the actuator sits on (reads as a real sprayer)
    sprayer = new_mesh_obj("Sprayer", cylinder(0.0100, 0.0080))
    sprayer.location = (0, 0, 0.1036)      # 0.0996..0.1076
    sprayer.data.materials.append(chrome)
    smooth(sprayer, 36)
    collar_parts.append(sprayer)

    black = mat_new("Black", base=(0.015, 0.014, 0.013, 1), rough=0.50)
    # actuator: wide pressable cap with a side nozzle (tucks inside the crystal cap)
    knob = new_mesh_obj("NozzleButton", cylinder(0.0080, 0.0070, segs=48))
    knob.location = (0, 0, 0.1111)         # 0.1076..0.1146
    knob.data.materials.append(black)
    smooth(knob, 40)
    tip = new_mesh_obj("NozzleTip", cylinder(0.0024, 0.0080))
    tip.location = (0, -0.0056, 0.1110)
    tip.rotation_euler = (math.radians(90), 0, 0)
    tip.data.materials.append(black)
    smooth(tip, 30)

    # ---- faceted crystal cap ----
    bm = cube(0.023, 0.023, 0.020)
    bevel(bm, 0.0030, 5)
    cap = new_mesh_obj("Cap", bm)
    cap.location = (0, 0, CAP_REST_CENTER)
    crystal = mat_new("Crystal", base=(0.98, 1.0, 1.0, 1), rough=0.006, ior=1.52,
                      transmission=1.0)
    cap.data.materials.append(crystal)
    smooth(cap, 30)

    # ---- white RELAPSE wordmark decal (front upper zone) ----
    wm_w = 0.040
    wimg = bpy.data.images.load(os.path.join(TEX, "relapse-wordmark-white.png"))
    wimg.colorspace_settings.name = "sRGB"
    wm_h = wm_w * (wimg.size[1] / wimg.size[0])
    bpy.ops.mesh.primitive_plane_add(size=1.0)
    wordmark = bpy.context.active_object
    wordmark.name = "Wordmark"
    wordmark.scale = (wm_w, wm_h, 1.0)
    wordmark.rotation_euler = (math.radians(90), 0, 0)
    wordmark.location = (0, -BODY_D - 0.0004, 0.0605)
    wm_mat = mat_new("WordmarkMat", base=(1, 1, 1, 1), rough=0.38)
    wb = principled(wm_mat)
    wtex = wm_mat.node_tree.nodes.new("ShaderNodeTexImage")
    wtex.image = wimg
    wtex.extension = "EXTEND"
    wm_mat.node_tree.links.new(wtex.outputs["Color"], wb.inputs["Base Color"])
    wm_mat.node_tree.links.new(wtex.outputs["Alpha"], wb.inputs["Alpha"])
    wordmark.data.materials.append(wm_mat)
    for f in wordmark.data.polygons:
        f.use_smooth = True

    # ---- rig ----
    rig = link(bpy.data.objects.new("Rig", None))
    for o in [flask, liquid, knob, tip] + facets + bubbles + collar_parts:
        o.parent = rig
    cap.parent = rig
    wordmark.parent = rig

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

    # ---- lights ----
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
