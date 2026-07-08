# -*- coding: utf-8 -*-
"""Black-box functional check terhadap backend live (http://localhost:3001).
Mencatat lulus/gagal per skenario lintas 4 role. Tidak mengarang: status
diambil dari respons HTTP nyata."""
import json, urllib.request, urllib.error, datetime, time

BASE = "http://localhost:3001"
results = []  # (role, scenario, expected, actual, passed)

def call(method, path, token=None, body=None, raw=False):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            txt = r.read().decode("utf-8", "replace")
            return r.status, (txt if raw else safe_json(txt))
    except urllib.error.HTTPError as e:
        txt = e.read().decode("utf-8", "replace")
        return e.code, (txt if raw else safe_json(txt))
    except Exception as e:
        return -1, {"error": str(e)}

def safe_json(t):
    try: return json.loads(t)
    except Exception: return {"_raw": t[:200]}

def login(email, pw):
    s, j = call("POST", "/auth/login", body={"email": email, "password": pw})
    if s == 200 and isinstance(j, dict):
        return (j.get("data") or {}).get("accessToken")
    return None

def rec(role, scenario, expected, passed, actual):
    results.append((role, scenario, expected, actual, passed))

today = datetime.datetime.now(datetime.UTC).date().isoformat()

# Login route dibatasi 5/60dtk. Tunggu window reset lalu pakai HANYA 4 login
# (admin + 3 akun UAT yang mewakili TIM_DAPUR/GURU/PM), token dipakai ulang.
print("Menunggu budget throttle login (per-IP 5/60dtk) bersih (~65 dtk)...")
time.sleep(65)

# ── AUTH (lintas role) — 4 login sukses + 1 login gagal (total 5 <= limit) ─────
ACC = {
    "ADMIN": ("admin@gmail.com", "Password123!"),
    "TIM_DAPUR": ("dapur.uat@demo.test", "UATDemo2025"),
    "GURU": ("guru.uat@demo.test", "UATDemo2025"),
    "PENERIMA_MANFAAT": ("siswa.uat@demo.test", "UATDemo2025"),
}
tok = {}
for role, (em, pw) in ACC.items():
    t = login(em, pw); tok[role] = t
    rec("Auth", f"Login {role} ({em})", "200 + accessToken", t is not None, "token" if t else "GAGAL login")

t_dapur_uat = tok["TIM_DAPUR"]
t_guru_uat  = tok["GURU"]
t_siswa_uat = tok["PENERIMA_MANFAAT"]

s, j = call("GET", "/dashboard/admin")
rec("Auth", "Akses tanpa token ditolak (/dashboard/admin)", "401", s == 401, f"HTTP {s}")

s, j = call("GET", "/dashboard/admin", token=tok["PENERIMA_MANFAAT"])
rec("Authz", "PM akses dashboard ADMIN ditolak", "403", s == 403, f"HTTP {s}")
s, j = call("GET", "/dashboard/pm", token=tok["TIM_DAPUR"])
rec("Authz", "TIM_DAPUR akses dashboard PM ditolak", "403", s == 403, f"HTTP {s}")
s, j = call("POST", "/dapur", token=tok["GURU"], body={"nama": "X"})
rec("Authz", "GURU akses CRUD Dapur (ADMIN-only) ditolak", "403", s == 403, f"HTTP {s}")

# ── ADMIN (read + CRUD self-clean) ────────────────────────────────────────────
a = tok["ADMIN"]
for name, path in [("dashboard admin", "/dashboard/admin"), ("list users", "/admin-users"),
                   ("list dapur", "/dapur"), ("list sekolah", "/sekolah"), ("list kelas", "/kelas")]:
    s, j = call("GET", path, token=a)
    rec("ADMIN", f"GET {name}", "200", s == 200, f"HTTP {s}")

ts = int(time.time())
s, j = call("POST", "/dapur", token=a, body={"nama": f"__TEST_DAPUR_{ts}", "alamat": "uji", "email": f"test_{ts}@demo.test"})
new_id = (j.get("data") or {}).get("id") if isinstance(j, dict) else None
rec("ADMIN", "Buat Dapur baru (CRUD create)", "2xx + id", s in (200, 201) and bool(new_id), f"HTTP {s}")
if new_id:
    s, j = call("DELETE", f"/dapur/{new_id}", token=a)
    rec("ADMIN", "Hapus Dapur (CRUD delete, self-clean)", "200", s == 200, f"HTTP {s}")
s, j = call("POST", "/sentimen/recategorize", token=a)
rec("ADMIN", "Trigger recategorize sentimen/kategori", "2xx", s in (200, 201), f"HTTP {s}")

# ── TIM_DAPUR (read) ──────────────────────────────────────────────────────────
d = tok["TIM_DAPUR"]
for name, path in [("dashboard dapur", "/dashboard/dapur"), ("list menu", "/menu"),
                   ("list distribusi", "/distribusi"), ("list feedback", "/feedback")]:
    s, j = call("GET", path, token=d)
    rec("TIM_DAPUR", f"GET {name}", "200", s == 200, f"HTTP {s}")

# ── GURU (read) ───────────────────────────────────────────────────────────────
g = tok["GURU"]
for name, path in [("dashboard guru", "/dashboard/guru"),
                   ("distribusi sekolah-saya", "/distribusi/sekolah-saya"),
                   ("presensi guru", "/dashboard/guru/presensi"),
                   ("list observasi", "/observasi")]:
    s, j = call("GET", path, token=g)
    rec("GURU", f"GET {name}", "200", s == 200, f"HTTP {s}")

# ── PENERIMA_MANFAAT (read) ───────────────────────────────────────────────────
p = tok["PENERIMA_MANFAAT"]
for name, path in [("menu today", f"/evaluasi/today?date={today}"),
                   ("dashboard pm", "/dashboard/pm"), ("riwayat evaluasi", "/evaluasi/riwayat")]:
    s, j = call("GET", path, token=p)
    rec("PENERIMA_MANFAAT", f"GET {name}", "200", s == 200, f"HTTP {s}")

# ── LAPORAN / EKSPOR ──────────────────────────────────────────────────────────
s, j = call("GET", "/laporan/distribusi/data", token=a)
rec("Laporan", "Laporan distribusi JSON (paginated, ADMIN)", "200", s == 200, f"HTTP {s}")
s, j = call("GET", "/laporan/feedback", token=a, raw=True)
ok_csv = s == 200 and isinstance(j, str) and ("ID" in j or "﻿" in j)
rec("Laporan", "Ekspor CSV feedback (ADMIN)", "200 + CSV", ok_csv, f"HTTP {s}")

# ── RANTAI TULIS UAT: Dapur -> Guru -> Siswa (entitas UAT, resettable) ─────────
# Cari sekolah UAT id (via admin) & menu UAT (via dapur.uat)
sek_id = None
s, j = call("GET", "/sekolah", token=a)
if s == 200 and isinstance(j, dict):
    for sk in (j.get("data") or []):
        if sk.get("nama") == "SMA UAT Demo":
            sek_id = sk.get("id"); break
menu_id = None
s, j = call("GET", "/menu", token=t_dapur_uat)
if s == 200 and isinstance(j, dict):
    arr = j.get("data") or []
    if arr: menu_id = arr[0].get("id")

dist_id = None
if sek_id:
    body = {"tanggal": today, "sekolahId": sek_id, "jumlahPorsi": 25}
    if menu_id: body["menuId"] = menu_id
    s, j = call("POST", "/distribusi", token=t_dapur_uat, body=body)
    dist_id = (j.get("data") or {}).get("id") if isinstance(j, dict) else None
    rec("TIM_DAPUR", "Buat distribusi hari ini (sekolah UAT)", "2xx + id (status DRAFT)",
        s in (200, 201) and bool(dist_id), f"HTTP {s}" + ("" if dist_id else f" body={str(j)[:120]}"))
else:
    rec("TIM_DAPUR", "Buat distribusi hari ini (sekolah UAT)", "200 + id", False, "Sekolah UAT tidak ditemukan")

if dist_id:
    s, j = call("PATCH", f"/distribusi/{dist_id}/status", token=t_dapur_uat, body={"status": "DIKIRIM"})
    rec("TIM_DAPUR", "Ubah status distribusi DRAFT->DIKIRIM", "200", s == 200, f"HTTP {s}")
    s, j = call("PATCH", f"/distribusi/{dist_id}/konfirmasi", token=t_guru_uat,
                body={"status": "DITERIMA", "catatanGuru": "Diterima (uji)"})
    rec("GURU", "Konfirmasi penerimaan DIKIRIM->DITERIMA", "200", s == 200, f"HTTP {s}")

# Siswa isi evaluasi (rating<=2 + feedback => sah; sekaligus buat feedback)
eval_id = None
body = {"tanggal": today, "statusKonsumsi": "KONSUMSI", "ratingKeseluruhan": 2,
        "feedback": "Porsinya sedikit dan sayur kurang matang (uji fungsional)."}
if dist_id: body["distribusiId"] = dist_id
s, j = call("POST", "/evaluasi", token=t_siswa_uat, body=body)
eval_id = (j.get("data") or {}).get("id") if isinstance(j, dict) else None
rec("PENERIMA_MANFAAT", "Isi evaluasi harian (rating 2 + feedback wajib)", "2xx + id",
    s in (200, 201) and bool(eval_id), f"HTTP {s}" + ("" if eval_id else f" body={str(j)[:120]}"))

# Negatif: isi evaluasi kedua di hari sama -> 400
s, j = call("POST", "/evaluasi", token=t_siswa_uat, body=body)
rec("PENERIMA_MANFAAT", "Tolak evaluasi ganda (tanggal sama)", "400", s == 400, f"HTTP {s}")

# Tim Dapur resolve feedback yang baru dibuat
if eval_id:
    s, j = call("POST", f"/feedback/{eval_id}/resolve", token=t_dapur_uat,
                body={"resolution": "Sudah ditindaklanjuti tim dapur (uji)."})
    rec("TIM_DAPUR", "Resolve keluhan (closed-loop)", "2xx", s in (200, 201), f"HTTP {s}")

# Guru buat observasi (sekolah & tanggal diturunkan dari distribusi; jangan kirim sekolahId)
obody = {"isi": "Observasi uji fungsional."}
if dist_id: obody["distribusiId"] = dist_id
else: obody["tanggal"] = today
s, j = call("POST", "/observasi", token=t_guru_uat, body=obody)
rec("GURU", "Buat observasi guru", "2xx", s in (200, 201), f"HTTP {s}")

# ── NEGATIF AUTH: login password salah (login ke-5, masih <= limit) ───────────
s, j = call("POST", "/auth/login", body={"email": "admin@gmail.com", "password": "salah999"})
rec("Auth", "Login password salah ditolak", "401", s == 401, f"HTTP {s}")

# ── OUTPUT ────────────────────────────────────────────────────────────────────
passed = sum(1 for r in results if r[4])
total = len(results)
print(f"\n[N] LULUS = {passed} / {total} skenario\n")
print(f"{'ROLE':<17}{'SKENARIO':<52}{'EXPECT':<16}{'ACTUAL':<22}{'STATUS'}")
print("-" * 120)
for role, scen, exp, act, ok in results:
    print(f"{role:<17}{scen[:50]:<52}{exp[:15]:<16}{str(act)[:20]:<22}{'LULUS' if ok else 'GAGAL'}")
from collections import Counter
byrole = Counter()
byrole_pass = Counter()
for role, scen, exp, act, ok in results:
    byrole[role]+=1
    if ok: byrole_pass[role]+=1
print("\nRekap per kelompok:")
for role in byrole:
    print(f"  {role:<18} {byrole_pass[role]}/{byrole[role]} lulus")
