# RELAPSE hero — camera/choreography + frame renderer.
# Usage:
#   blender -b --python render_frames.py -- preview            (keyframe stills)
#   blender -b --python render_frames.py -- desktop            (150 frames @1600)
#   blender -b --python render_frames.py -- mobile             (60 frames @960)
#   blender -b --python render_frames.py -- desktop 40 1200    (samples, res override)
import bpy, math, os, sys, time
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import hero_scene

# ---------------- math helpers ----------------
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def lin(p, a, b): return clamp((p - a) / (b - a)) if b > a else 0.0
def smooth(t): t = clamp(t); return t * t * (3 - 2 * t)
def ease_out(t): t = clamp(t); return 1 - (1 - t) ** 3
def ease_in(t): t = clamp(t); return t ** 3
def ease_io(t):
    t = clamp(t)
    return 4 * t ** 3 if t < 0.5 else 1 - ((-2 * t + 2) ** 3) / 2

def pw(p, keys, ease=smooth):
    if p <= keys[0][0]: return keys[0][1]
    if p >= keys[-1][0]: return keys[-1][1]
    for i in range(len(keys) - 1):
        p0, v0 = keys[i]; p1, v1 = keys[i + 1]
        if p0 <= p <= p1:
            t = ease(lin(p, p0, p1))
            return v0 + (v1 - v0) * t
    return keys[-1][1]

# ---------------- choreography (p = hero scroll progress 0..1) ----------------
CAM_AZ  = [(0.00, -16), (0.30, -6), (0.50, -4), (0.62, -3), (1.00, -7)]
CAM_D   = [(0.00, 0.345), (0.30, 0.333), (0.50, 0.168), (0.62, 0.161), (1.00, 0.345)]
CAM_Z   = [(0.00, 0.068), (0.30, 0.072), (0.50, 0.112), (0.62, 0.115), (1.00, 0.074)]
CAM_TZ  = [(0.00, 0.062), (0.30, 0.064), (0.50, 0.110), (0.62, 0.113), (1.00, 0.062)]
FSTOP   = [(0.00, 4.2), (0.30, 3.4), (0.50, 2.5), (0.62, 2.4), (1.00, 3.6)]
BOT_AZ  = [(0.00, -40), (0.30, 50), (0.50, 30), (0.62, 24), (1.00, -12)]

def pose(p):
    """returns dict of per-frame values"""
    az = math.radians(pw(p, BOT_AZ))
    wobble = math.sin(p * math.pi * 2.2) * 2.5 * (1 - lin(p, 0.16, 0.42))
    tilt = math.radians(3.5 + wobble)
    hover = 0.005 * (1 - smooth(lin(p, 0.55, 0.90)))
    bob = math.sin(p * math.pi * 2.6) * 0.0012 * (1 - lin(p, 0.18, 0.44))
    lift = 0.0
    if 0.50 <= p:
        lift = hero_scene.CAP_LIFT * ease_out(lin(p, 0.50, 0.62))
        lift *= 1.0 - ease_io(lin(p, 0.70, 0.88))
    spin = (math.radians(18) * ease_out(lin(p, 0.50, 0.62))) * (1.0 - ease_io(lin(p, 0.70, 0.88)))
    open_fac = lift / max(1e-9, hero_scene.CAP_LIFT)
    cap_tilt = math.radians(-6.0) * open_fac
    phi = math.radians(-pw(p, CAM_AZ))          # camera azimuth (deg, + = to the left of -Y)
    d = pw(p, CAM_D)
    z = pw(p, CAM_Z)
    tz = pw(p, CAM_TZ) + 0.55 * lift            # follow the cap up while it is open
    loc = Vector((d * math.sin(phi), -d * math.cos(phi), z))
    tgt = Vector((0, 0, tz))
    return {
        "loc": loc, "tgt": tgt, "fstop": pw(p, FSTOP),
        "rig_z": hover + bob, "rig_az": az, "rig_tilt": tilt,
        "cap_lift": lift, "cap_spin": spin, "cap_tilt": cap_tilt,
    }

# ---------------- scene setup ----------------
def setup(mode):
    sc = hero_scene.build()
    cy = sc.cycles
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "OPTIX"
    prefs.get_devices()
    for dev in prefs.devices:
        dev.use = dev.type in {"OPTIX", "CUDA"}
    cy.device = "GPU"
    rig = bpy.data.objects["Rig"]
    cap = bpy.data.objects["Cap"]
    cam = bpy.data.objects["Cam"]
    cam.rotation_mode = "QUATERNION"
    if mode == "preview":
        sc.render.resolution_x = sc.render.resolution_y = 1200
        cy.samples = 640
        cy.adaptive_threshold = 0.006
    elif mode == "stills":
        sc.render.resolution_x = sc.render.resolution_y = 1600
        cy.samples = 1024
        cy.adaptive_threshold = 0.003
    elif mode == "desktop":
        sc.render.resolution_x = sc.render.resolution_y = 1600
        cy.samples = 384
        cy.adaptive_threshold = 0.003
    elif mode == "mobile":
        sc.render.resolution_x = sc.render.resolution_y = 960
        cy.samples = 256
        cy.adaptive_threshold = 0.004
    return sc, rig, cap, cam

def apply_pose(rig, cap, cam, p):
    v = pose(p)
    rig.location = (0, 0, v["rig_z"])
    rig.rotation_euler = (v["rig_tilt"], 0, v["rig_az"])
    CAP_BASE = hero_scene.CAP_REST_CENTER   # cap rest height
    cap.location = (0, 0, CAP_BASE + v["cap_lift"])
    cap.rotation_euler = (v["cap_tilt"], 0, v["cap_spin"])
    cam.location = v["loc"]
    cam.rotation_quaternion = (v["tgt"] - v["loc"]).to_track_quat("-Z", "Y")
    cam.data.dof.focus_distance = (v["tgt"] - v["loc"]).length
    cam.data.dof.aperture_fstop = v["fstop"]

def render_to(sc, path):
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)

# ---------------- main ----------------
def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    mode = argv[0] if argv else "preview"
    samples_override = int(argv[1]) if len(argv) > 1 else None
    res_override = int(argv[2]) if len(argv) > 2 else None

    sc, rig, cap, cam = setup(mode)
    if samples_override: sc.cycles.samples = samples_override
    if res_override:
        sc.render.resolution_x = sc.render.resolution_y = res_override

    if mode == "preview":
        ps = [0.00, 0.16, 0.30, 0.42, 0.52, 0.58, 0.68, 0.84, 1.00]
        outdir = os.path.join(HERE, "renders", "preview")
        names = [f"p{int(p*100):03d}" for p in ps]
    elif mode == "stills":
        ps = [0.00, 0.30, 0.57, 1.00]
        outdir = os.path.join(HERE, "renders", "stills")
        names = [f"still-p{int(p*100):03d}" for p in ps]
    elif mode == "desktop":
        n = 150
        ps = [i / (n - 1) for i in range(n)]
        outdir = os.path.join(HERE, "renders", "desk-1600")
        names = [f"frame-{i+1:04d}" for i in range(n)]
    else:
        n = 60
        ps = [i / (n - 1) for i in range(n)]
        outdir = os.path.join(HERE, "renders", "mob-960")
        names = [f"frame-{j+1:04d}" for j in range(n)]

    os.makedirs(outdir, exist_ok=True)
    done = sum(1 for n in names if os.path.exists(os.path.join(outdir, f"{n}.png")))
    if done:
        print(f"RESUME: {done}/{len(names)} frames already rendered — skipping those", flush=True)
    t0 = time.time()
    rendered = 0
    for idx, (p, name) in enumerate(zip(ps, names)):
        path = os.path.join(outdir, f"{name}.png")
        if os.path.exists(path):
            continue
        apply_pose(rig, cap, cam, p)
        render_to(sc, path)
        rendered += 1
        el = time.time() - t0
        per = el / max(1, rendered)
        print(f"PROGRESS {idx+1}/{len(ps)} p={p:.3f} {per:.1f}s/frame eta {per*(len(ps)-idx-1)/60:.1f}min", flush=True)
    print("DONE", outdir)

if __name__ == "__main__":
    main()
