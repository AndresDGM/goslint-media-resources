def suma(n):
    if n == 0:
        return 0
    return n + suma(n - 1)

print(suma(int(input())))
