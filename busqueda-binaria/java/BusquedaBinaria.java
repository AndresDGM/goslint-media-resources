/**
 * Código Java que se muestra en el video «Búsqueda binaria» de Goslint.
 * Los dos métodos son, línea por línea, los que aparecen en pantalla (src/scenes/D.tsx).
 *
 *   javac -d out/java java/BusquedaBinaria.java && java -cp out/java BusquedaBinaria
 */
public class BusquedaBinaria {

    static int busquedaBinaria(int[] datos, int objetivo) {
        int low = 0;
        int high = datos.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;

            if (datos[mid] == objetivo) {
                return mid;
            } else if (datos[mid] < objetivo) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1;
    }

    static int buscar(int[] datos, int objetivo, int low, int high) {
        if (low > high) {
            return -1;          // caso base: intervalo vacío
        }
        int mid = low + (high - low) / 2;

        if (datos[mid] == objetivo) {
            return mid;         // caso base: encontrado
        }
        if (datos[mid] < objetivo) {
            return buscar(datos, objetivo, mid + 1, high);
        }
        return buscar(datos, objetivo, low, mid - 1);
    }

    public static void main(String[] args) {
        int[] datos = {3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63};
        int fallos = 0;
        // presentes: cada valor debe devolver su posición con ambas versiones
        for (int i = 0; i < datos.length; i++) {
            if (busquedaBinaria(datos, datos[i]) != i) fallos++;
            if (buscar(datos, datos[i], 0, datos.length - 1) != i) fallos++;
        }
        // ausentes: -1 con ambas versiones (también en los extremos y con el arreglo vacío)
        for (int x = 0; x <= 66; x++) {
            boolean esta = false;
            for (int v : datos) if (v == x) esta = true;
            if (!esta && busquedaBinaria(datos, x) != -1) fallos++;
            if (!esta && buscar(datos, x, 0, datos.length - 1) != -1) fallos++;
        }
        if (busquedaBinaria(new int[0], 5) != -1) fallos++;
        if (buscar(new int[0], 5, 0, -1) != -1) fallos++;
        System.out.println("iterativa(43) = " + busquedaBinaria(datos, 43) + " · recursiva(43) = " + buscar(datos, 43, 0, 15));
        System.out.println("iterativa(42) = " + busquedaBinaria(datos, 42) + " · recursiva(42) = " + buscar(datos, 42, 0, 15));
        System.out.println(fallos == 0 ? "Todas las pruebas pasaron" : fallos + " pruebas fallaron");
        if (fallos != 0) System.exit(1);
    }
}
