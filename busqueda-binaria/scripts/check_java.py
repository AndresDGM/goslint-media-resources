"""Comprueba que el Java del video es Java real: compila y ejecuta java/BusquedaBinaria.java y verifica que
las líneas que se muestran en pantalla (JAVA_ITER y JAVA_REC en src/scenes/D.tsx) son exactamente las del archivo.
Uso: python3 scripts/check_java.py"""
import os, re, subprocess, sys
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
tsx = open(f"{R}/src/scenes/D.tsx", encoding="utf-8").read()
java = [l[4:] if l.startswith("    ") else l for l in open(f"{R}/java/BusquedaBinaria.java", encoding="utf-8").read().split("\n")]
ok = True
for name in ("JAVA_ITER", "JAVA_REC"):
    body = re.search(rf"export const {name} = \[(.*?)\n\];", tsx, re.S).group(1)
    lines = [m.group(1) for m in re.finditer(r"^\t'(.*)',$", body, re.M)]
    start = java.index(lines[0])
    same = java[start:start + len(lines)] == lines
    ok &= same
    print(f"{'OK   ' if same else 'FALLA'} {name}: {len(lines)} líneas idénticas a java/BusquedaBinaria.java")
os.makedirs(f"{R}/out/java", exist_ok=True)
subprocess.run(["javac", "-d", f"{R}/out/java", f"{R}/java/BusquedaBinaria.java"], check=True)
run = subprocess.run(["java", "-cp", f"{R}/out/java", "BusquedaBinaria"], capture_output=True, text=True)
print(run.stdout.strip()); ok &= run.returncode == 0
sys.exit(0 if ok else 1)
