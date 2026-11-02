"""Comprueba que los veredictos que muestra el video son reales.

Problema A · Suma hasta n: entrada un entero n (1 ≤ n ≤ 10^9); salida 1 + 2 + … + n. Límite: 1 s.
Ejecuta las cuatro versiones de soluciones/ con los mismos casos que dibuja la escena del juez y
clasifica cada resultado como lo haría un juez en línea (AC, WA, TLE, RTE).

Uso: python3 scripts/check_solutions.py
"""
import os, subprocess, sys, tempfile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "soluciones")
CASES = [3, 10, 1000, 100000, 1000000000]   # el primero es el ejemplo del enunciado
LIMIT = 1.0
EXPECT = {"v1_wa.cpp": "WA", "v2_tle.py": "TLE", "v3_rte.py": "RTE", "v4_ac.py": "AC"}


def run(cmd, n):
    try:
        p = subprocess.run(cmd, input=f"{n}\n", capture_output=True, text=True, timeout=LIMIT)
    except subprocess.TimeoutExpired:
        return "TLE"
    if p.returncode != 0:
        return "RTE"
    return "OK" if p.stdout.strip() == str(n * (n + 1) // 2) else "WA"


def main():
    exe = os.path.join(tempfile.mkdtemp(), "v1")
    subprocess.run(["g++", "-O2", "-std=c++17", "-o", exe, os.path.join(ROOT, "v1_wa.cpp")], check=True)
    ok = True
    for name, want in EXPECT.items():
        cmd = [exe] if name.endswith(".cpp") else [sys.executable, os.path.join(ROOT, name)]
        res = [run(cmd, n) for n in CASES]
        verdict = next((r for r in res if r != "OK"), "AC")
        print(f"{name:10s} casos {res}  ->  {verdict}  (esperado {want})")
        ok &= verdict == want and res[0] == "OK"   # todas pasan el ejemplo del enunciado
    # el código que se ve en pantalla (src/solutions.ts) debe ser exactamente el de soluciones/
    import json, re
    ts = open(os.path.join(ROOT, "..", "src", "solutions.ts"), encoding="utf-8").read()
    for name in EXPECT:
        code = open(os.path.join(ROOT, name), encoding="utf-8").read().rstrip("\n").split("\n")
        m = re.search(r'file: "' + re.escape(name) + r'".*?code: (\[.*?\])\}', ts)
        same = bool(m) and json.loads(m.group(1)) == code
        print(f"{name:10s} en pantalla = archivo: {same}")
        ok &= same
    print("TODO CORRECTO" if ok else "HAY DIFERENCIAS")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
