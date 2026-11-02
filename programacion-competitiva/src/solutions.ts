// Generado a partir de soluciones/ (scripts/check_solutions.py verifica que coincide y que los veredictos son reales).
export type Verdict = "AC" | "WA" | "TLE" | "RTE";
export type Sub = {id: string; file: string; lang: string; verdict: Verdict; /** caso (1-based) donde falla; 0 = ninguno */ failAt: number; code: string[]};
export const CASES = [3, 10, 1000, 100000, 1000000000];
export const SUBS: Sub[] = [
	{id: "v1", file: "v1_wa.cpp", lang: "C++", verdict: "WA", failAt: 4, code: ["#include <iostream>", "using namespace std;", "int main() {", "    int n;", "    cin >> n;", "    int suma = 0;", "    for (int i = 1; i <= n; i++) suma += i;", "    cout << suma << endl;", "}"]},
	{id: "v2", file: "v2_tle.py", lang: "Python", verdict: "TLE", failAt: 5, code: ["n = int(input())", "suma = 0", "for i in range(1, n + 1):", "    suma += i", "print(suma)"]},
	{id: "v3", file: "v3_rte.py", lang: "Python", verdict: "RTE", failAt: 3, code: ["def suma(n):", "    if n == 0:", "        return 0", "    return n + suma(n - 1)", "", "print(suma(int(input())))"]},
	{id: "v4", file: "v4_ac.py", lang: "Python", verdict: "AC", failAt: 0, code: ["n = int(input())", "print(n * (n + 1) // 2)"]},
];
