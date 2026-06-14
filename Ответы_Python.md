# Ответы к госэкзамену: «Разработка приложений на Python»

ОП 6B06103 — ВТиПО. Формат: **Вопрос — Ответ**.

---

## 1 блок — теоретические вопросы

### Вопрос 1. Структура программы на Python. Функции ввода/вывода (`print`, `input`)

**Структура программы.** Программа на Python состоит из последовательности инструкций, которые
интерпретатор выполняет сверху вниз. Типичные элементы: импорт модулей, объявление функций
и классов, основной код. Отступы (4 пробела) задают вложенность блоков — фигурных скобок нет.
Часто точка входа оформляется через `if __name__ == "__main__":`.

```python
import math                     # импорт модуля

def square(x):                  # определение функции
    return x * x

if __name__ == "__main__":      # точка входа
    print(square(5))
```

**Вывод — `print()`.** Выводит данные в консоль. Аргументы разделяются `sep` (по умолчанию
пробел), в конце добавляется `end` (по умолчанию `\n`).

```python
print("Привет", "мир")            # Привет мир
print("a", "b", sep="-")          # a-b
print("без переноса", end="")     # без перехода на новую строку
print(f"Сумма = {2 + 3}")         # f-строка: Сумма = 5
```

**Ввод — `input()`.** Считывает строку с клавиатуры (всегда тип `str`). Для чисел нужно
явное приведение.

```python
name = input("Имя: ")            # строка
age = int(input("Возраст: "))    # целое
price = float(input("Цена: "))   # вещественное
print(f"{name}, через год вам {age + 1}")
```

---

### Вопрос 2. Арифметические и логические операции

**Арифметические:**

| Оператор | Действие | Пример | Результат |
|----------|----------|--------|-----------|
| `+` `-` `*` | сложение, вычитание, умножение | `2 * 3` | `6` |
| `/` | деление (всегда float) | `7 / 2` | `3.5` |
| `//` | целочисленное деление | `7 // 2` | `3` |
| `%` | остаток от деления | `7 % 2` | `1` |
| `**` | возведение в степень | `2 ** 10` | `1024` |

**Логические:** `and`, `or`, `not` — работают с булевыми значениями, возвращают `True`/`False`.

```python
a, b = 5, 0
print(a > 3 and b == 0)   # True
print(a < 3 or b == 0)    # True
print(not (a > 3))        # False
```

---

### Вопрос 3. Операции сравнения

Операторы `==`, `!=`, `>`, `<`, `>=`, `<=` возвращают `bool`. Сравнивать можно числа,
строки (лексикографически), логические значения. Поддерживаются цепочки сравнений.

```python
print(5 == 5.0)          # True (значения равны)
print("abc" < "abd")     # True (лексикографически)
print(True == 1)         # True (True эквивалентно 1)
print(1 < 3 < 5)         # True (цепочка: 1<3 и 3<5)
print(3 != 4)            # True
```

---

### Вопрос 4. Конструкция `if` (полная и неполная форма)

`if` управляет ветвлением. **Неполная** форма — только `if`. **Полная** — с `else` и
дополнительными ветвями `elif`.

```python
# Неполная форма
n = 5
if n > 0:
    print("Положительное")

# Полная форма
if n > 0:
    print("Положительное")
elif n == 0:
    print("Ноль")
else:
    print("Отрицательное")
```

Синтаксис: после условия — двоеточие, тело с отступом.

---

### Вопрос 5. Цикл `while`

Цикл с предусловием: повторяет тело, пока условие истинно.

```python
# Синтаксис
i = 1
while i <= 5:
    print(i)
    i += 1          # обязательно меняем счётчик, иначе вечный цикл

# Сумма чисел до ввода 0
s = 0
x = int(input())
while x != 0:
    s += x
    x = int(input())
print("Сумма:", s)
```

---

### Вопрос 6. Цикл `for`

Перебирает элементы любой последовательности (списка, строки, кортежа, `range`).

```python
for c in "Hello":          # по символам строки
    print(c)

for x in [10, 20, 30]:     # по элементам списка
    print(x)

for i in range(5):         # 0,1,2,3,4
    print(i)

for idx, val in enumerate(["a", "b"]):   # с индексом
    print(idx, val)
```

Особенность: `for` не требует ручного счётчика — итерация по объекту идёт автоматически.

---

### Вопрос 7. Вложенный цикл

Цикл внутри другого цикла. Применяют для обработки таблиц (двумерных структур),
комбинаций пар, матриц. Уровень вложенности — сколько циклов друг в друге.

```python
# Таблица умножения (2 уровня вложенности)
for i in range(1, 4):          # внешний цикл
    for j in range(1, 4):      # внутренний цикл
        print(f"{i}*{j}={i*j}", end="  ")
    print()                    # перенос строки после строки таблицы
# 1*1=1  1*2=2  1*3=3
# 2*1=2  2*2=4  2*3=6
# 3*1=3  3*2=6  3*3=9
```

На каждую итерацию внешнего цикла внутренний выполняется полностью.

---

### Вопрос 8. Функция `range()`

Генерирует последовательность целых чисел.

```python
range(5)         # 0,1,2,3,4              (1 аргумент: stop)
range(2, 6)      # 2,3,4,5                (2 аргумента: start, stop)
range(1, 10, 2)  # 1,3,5,7,9             (3 аргумента: start, stop, step)
range(10, 0, -1) # 10,9,...,1            (обратный шаг)

print(list(range(0, 10, 3)))   # [0, 3, 6, 9]
```

Правая граница `stop` не включается.

---

### Вопрос 9. Строки. Операции, функции, срезы

**Строка** (`str`) — неизменяемая упорядоченная последовательность символов.

```python
s = "Python"
print(len(s))          # 6 — длина
print(s + "3")         # конкатенация: Python3
print(s * 2)           # повтор: PythonPython
print("y" in s)        # True — вхождение
```

**Функции/методы:** `len()`, `s.upper()`, `s.lower()`, `s.find()`, `s.replace()`,
`s.split()`, `s.strip()`, `s.count()`.

**Срез** `s[start:stop:step]` — подстрока (stop не включается):

```python
print(s[0:3])    # Pyt
print(s[2:])     # thon
print(s[:4])     # Pyth
print(s[::-1])   # nohtyP (разворот)
print(s[-1])     # n (последний символ)
```

---

### Вопрос 10. Кортеж (tuple)

**Кортеж** — неизменяемая упорядоченная последовательность.

```python
t = (1, 2, 3)            # создание
t2 = 4, 5, 6            # скобки необязательны
t3 = (7,)              # кортеж из одного элемента (запятая обязательна!)
empty = ()             # пустой

print(t[0])            # доступ по индексу: 1
print(t[-1])           # 3
print(t[0:2])          # срез: (1, 2)
for x in t:            # перебор
    print(x)
# t[0] = 99            # ОШИБКА — кортеж неизменяем
```

Применяют, когда набор данных не должен меняться (координаты, константы).

---

### Вопрос 11. Словарь (dict)

**Словарь** — изменяемая коллекция пар «ключ: значение». Ключи уникальны.

```python
d = {"name": "Anna", "age": 20}   # создание
d["city"] = "Aktobe"              # добавление
print(d["name"])                  # доступ: Anna
```

**Методы:** `keys()`, `values()`, `items()`, `get()`, `pop()`, `update()`, `clear()`.

```python
print(d.keys())          # dict_keys(['name','age','city'])
print(d.values())        # значения
print(d.get("age"))      # 20; get не падает, если ключа нет
d.pop("age")             # удаляет ключ и возвращает значение
for k, v in d.items():   # перебор пар
    print(k, v)
```

---

### Вопрос 12. Пользовательская функция

Объявляется через `def`, может принимать параметры и возвращать значение (`return`).
Особенности Python: значения по умолчанию, именованные аргументы, `*args`/`**kwargs`,
возврат нескольких значений.

```python
def greet(name, greeting="Привет"):   # параметр со значением по умолчанию
    return f"{greeting}, {name}!"

print(greet("Иван"))                  # Привет, Иван!
print(greet("Иван", greeting="Hi"))   # именованный аргумент

def min_max(lst):                     # возврат нескольких значений
    return min(lst), max(lst)

lo, hi = min_max([3, 1, 7])           # 1 7
```

---

### Вопрос 13. Файлы в Python

```python
f = open("data.txt", "r", encoding="utf-8")   # синтаксис открытия
```

Режимы: `r` (чтение), `w` (запись с очисткой), `a` (дозапись), `r+` (чтение+запись),
`b` (бинарный).

**Атрибуты объекта файла:** `f.name`, `f.mode`, `f.closed`, `f.encoding`.

**Методы:** `read()`, `readline()`, `readlines()`, `write()`, `writelines()`,
`close()`, `seek()`, `tell()`.

```python
with open("data.txt", "w", encoding="utf-8") as f:  # with закрывает файл автоматически
    f.write("Первая строка\n")

with open("data.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())
```

---

### Вопрос 14. GUI. Модуль Tkinter, стандартные виджеты

**Tkinter** — встроенная в Python библиотека для создания графического интерфейса
(обёртка над Tk). Позволяет создавать окна, размещать элементы управления, обрабатывать
события.

**Стандартные виджеты:** `Label` (надпись), `Button` (кнопка), `Entry` (однострочное поле),
`Text` (многострочное поле), `Checkbutton`, `Radiobutton`, `Listbox`, `Frame`, `Menu`,
`Canvas`, `Scrollbar`, `Scale`.

```python
import tkinter as tk

root = tk.Tk()
root.title("Пример")
tk.Label(root, text="Имя:").pack()
entry = tk.Entry(root)
entry.pack()
tk.Button(root, text="OK", command=lambda: print(entry.get())).pack()
root.mainloop()
```

---

### Вопрос 15. Меню в Tkinter

Меню создаётся виджетом `Menu`. Главное меню привязывается к окну через `root.config(menu=...)`,
выпадающие подменю добавляются через `add_cascade`, пункты — `add_command`, разделитель —
`add_separator`.

```python
import tkinter as tk

root = tk.Tk()
menubar = tk.Menu(root)

file_menu = tk.Menu(menubar, tearoff=0)
file_menu.add_command(label="Открыть", command=lambda: print("Открыть"))
file_menu.add_separator()
file_menu.add_command(label="Выход", command=root.quit)
menubar.add_cascade(label="Файл", menu=file_menu)

root.config(menu=menubar)
root.mainloop()
```

---

### Вопрос 16. Списки. Простые и вложенные

**Список** (`list`) — изменяемая упорядоченная коллекция.

```python
a = [1, 2, 3]                 # создание
a = list(range(5))            # из range
print(a[0])                   # доступ: 0
a.append(99)                  # добавление
a[1] = 50                     # изменение (список изменяем!)

# Вложенный список (матрица)
m = [[1, 2, 3], [4, 5, 6]]
print(m[0][1])                # 2 — строка 0, столбец 1
for row in m:                 # перебор вложенного списка
    for x in row:
        print(x, end=" ")
    print()
```

Особенность вложенных списков: элемент сам является списком, доступ — двойной индекс `m[i][j]`.

---

### Вопрос 17. Операторы `break` и `continue`

- `break` — немедленно прерывает цикл целиком.
- `continue` — пропускает остаток текущей итерации и переходит к следующей.

```python
for i in range(1, 6):
    if i == 3:
        break          # прервётся на 3
    print(i)           # 1 2

for i in range(1, 6):
    if i == 3:
        continue       # пропустит 3
    print(i)           # 1 2 4 5
```

---

### Вопрос 18. Множество (set)

**Множество** — изменяемая неупорядоченная коллекция уникальных элементов.

```python
s = {1, 2, 3, 3}        # {1, 2, 3} — дубликаты убираются
s2 = set([1, 2, 2])     # {1, 2}
empty = set()           # пустое ({} — это словарь!)

s.add(5)                # добавление
s.discard(1)            # удаление
print(2 in s)           # True — проверка вхождения (нет доступа по индексу!)

a, b = {1, 2, 3}, {2, 3, 4}
print(a | b)            # объединение {1,2,3,4}
print(a & b)            # пересечение {2,3}
print(a - b)            # разность {1}
```

К элементам обращаются перебором или проверкой `in` — индексации нет.

---

### Вопрос 19. Диалоговые окна в Tkinter

Стандартные диалоги — в модулях `messagebox`, `filedialog`, `simpledialog`.

```python
import tkinter as tk
from tkinter import messagebox, filedialog, simpledialog

root = tk.Tk()

messagebox.showinfo("Инфо", "Сообщение")          # информационное
messagebox.showwarning("Внимание", "Ошибка")       # предупреждение
answer = messagebox.askyesno("Вопрос", "Выйти?")   # да/нет -> True/False

name = simpledialog.askstring("Ввод", "Имя:")      # ввод строки
path = filedialog.askopenfilename()                # выбор файла
root.mainloop()
```

---

### Вопрос 20. Вложенные структуры

```python
# Кортеж кортежей
points = ((1, 2), (3, 4))
print(points[1][0])         # 3

# Список списков
matrix = [[1, 2], [3, 4]]
print(matrix[0][1])         # 2
matrix[0][1] = 99           # можно менять (список изменяем)

# Список кортежей
students = [("Anna", 20), ("Bob", 22)]
for name, age in students:  # удобная распаковка
    print(name, age)
```

Доступ к глубоким элементам — последовательность индексов. Кортежи внутри менять нельзя,
списки — можно.

---

### Вопрос 21. Модули. `import` vs `from ... import`

**Модуль** — файл `.py` с функциями/классами для повторного использования.

```python
import math                  # импорт всего модуля
print(math.sqrt(16))         # обращение через имя модуля

from math import sqrt, pi    # импорт конкретных имён
print(sqrt(16))              # без префикса

from math import *           # всё (не рекомендуется — засоряет пространство имён)
import math as m             # псевдоним
```

**Свой модуль:** создаём `mytools.py` с функциями, затем `import mytools` и
`mytools.func()`.

Разница: `import math` требует префикса `math.`, `from math import sqrt` даёт прямой доступ
к `sqrt`.

---

### Вопрос 22. Рекурсивные функции

**Рекурсия** — функция вызывает саму себя. Обязательны: **базовый случай** (условие
остановки) и **шаг рекурсии** (приближение к базовому случаю). Без базового случая —
бесконечная рекурсия и переполнение стека.

```python
def factorial(n):
    if n <= 1:           # базовый случай
        return 1
    return n * factorial(n - 1)   # шаг рекурсии

print(factorial(5))      # 120
```

На что обратить внимание: наличие условия выхода, уменьшение аргумента, глубина рекурсии
(по умолчанию ~1000).

---

### Вопрос 23. Принципы ООП

**ООП** — парадигма, где программа строится из объектов (экземпляров классов).

Принципы:
- **Инкапсуляция** — объединение данных и методов, скрытие внутренней реализации.
- **Наследование** — создание класса на основе существующего.
- **Полиморфизм** — единый интерфейс для разных типов (переопределение методов).
- **Абстракция** — выделение существенных характеристик.

```python
class Car:
    def __init__(self, brand, speed):   # конструктор
        self.brand = brand              # атрибут
        self.speed = speed

    def info(self):                     # метод
        return f"{self.brand}: {self.speed} км/ч"

car = Car("Toyota", 180)                # создание объекта
print(car.info())                       # Toyota: 180 км/ч
```

---

### Вопрос 24. События в Tkinter

**Событие** — действие пользователя (клик, нажатие клавиши, движение мыши). Tkinter работает
в **цикле обработки событий** (`mainloop()`), который ждёт события и вызывает привязанные
обработчики. Привязка — методом `bind()` или параметром `command`.

**Типы событий:** `<Button-1>` (ЛКМ), `<Double-Button-1>`, `<Key>`, `<Return>`,
`<Motion>`, `<Enter>`/`<Leave>`.

```python
import tkinter as tk

root = tk.Tk()
lbl = tk.Label(root, text="Кликни")
lbl.pack()

def on_click(event):
    print(f"Клик в ({event.x}, {event.y})")

lbl.bind("<Button-1>", on_click)
root.bind("<Return>", lambda e: print("Enter нажат"))
root.mainloop()
```

---

### Вопрос 25. Одномерные и двумерные массивы

В Python роль массивов чаще играют списки (или `numpy.ndarray`).

```python
# Одномерный массив
arr = [10, 20, 30, 40]
for x in arr:
    print(x)

# Двумерный массив (матрица) — список списков
m = [[1, 2, 3],
     [4, 5, 6]]
# Обработка: сумма всех элементов
total = 0
for row in m:
    for x in row:
        total += x
print(total)            # 21

# Создание матрицы 3x3 из нулей
zeros = [[0] * 3 for _ in range(3)]
```

---

### Вопрос 26. Модуль NumPy

**NumPy** — библиотека для эффективной работы с многомерными массивами и матрицами,
векторизованные вычисления.

```python
import numpy as np

a = np.array([1, 2, 3, 4])           # массив
m = np.array([[1, 2], [3, 4]])       # матрица
print(a.shape)                        # (4,)
print(a + 10)                         # [11 12 13 14] — векторно
print(a.sum(), a.mean(), a.max())     # 10 2.5 4
print(np.zeros((2, 3)))               # матрица нулей
print(np.arange(0, 10, 2))            # [0 2 4 6 8]
print(m.T)                            # транспонирование
print(np.dot(m, m))                   # матричное умножение
```

---

### Вопрос 27. Модуль Pandas

**Pandas** — библиотека для анализа табличных данных. Основные структуры: `Series`
(одномерная) и `DataFrame` (таблица).

```python
import pandas as pd

df = pd.DataFrame({
    "name": ["Anna", "Bob", "Cris"],
    "age":  [20, 22, 19]
})
print(df.head())            # первые строки
print(df["age"].mean())     # 20.33 — среднее по столбцу
print(df[df["age"] > 19])   # фильтрация
df["adult"] = df["age"] >= 18   # новый столбец
df.sort_values("age")       # сортировка
# df = pd.read_csv("data.csv")  # чтение из CSV
```

---

### Вопрос 28. Способы перебора словаря

```python
d = {"a": 1, "b": 2, "c": 3}

for k in d:               # по ключам (по умолчанию)
    print(k, d[k])

for k in d.keys():        # явно по ключам
    print(k)

for v in d.values():      # по значениям
    print(v)

for k, v in d.items():    # по парам ключ-значение (самый удобный)
    print(k, v)
```

`.items()` даёт сразу пару, что удобнее, чем доступ `d[k]` при переборе по ключам.

---

### Вопрос 29. Текстовый файл. Чтение, запись, дозапись. CSV

Этапы: открыть файл (`open`) → выполнить операции → закрыть (`close`, или `with`).

```python
# Запись (перезапись)
with open("f.txt", "w", encoding="utf-8") as f:
    f.write("строка 1\n")

# Дозапись
with open("f.txt", "a", encoding="utf-8") as f:
    f.write("строка 2\n")

# Чтение
with open("f.txt", "r", encoding="utf-8") as f:
    data = f.read()
print(data)
```

**CSV** — текстовый формат, где значения разделены запятыми (таблица). Модуль `csv`:

```python
import csv
with open("table.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "age"])
    writer.writerow(["Anna", 20])

with open("table.csv", "r", encoding="utf-8") as f:
    for row in csv.reader(f):
        print(row)
```

---

### Вопрос 30. Бинарный файл. Чтение и запись

Бинарные файлы хранят данные в виде байтов (режим `b`). Часто используют модуль `pickle`
для сериализации объектов.

```python
# Запись байтов
with open("data.bin", "wb") as f:
    f.write(bytes([65, 66, 67]))      # ABC

# Чтение байтов
with open("data.bin", "rb") as f:
    print(f.read())                   # b'ABC'

# Сохранение объекта Python через pickle
import pickle
obj = {"name": "Anna", "scores": [5, 4, 5]}
with open("obj.bin", "wb") as f:
    pickle.dump(obj, f)
with open("obj.bin", "rb") as f:
    print(pickle.load(f))             # {'name': 'Anna', 'scores': [5, 4, 5]}
```

---

## 3 блок — практические задачи

### Задача 1. «Счётчик символов» (GUI): подсчёт буквы «t»

```python
import tkinter as tk

def count_t(*args):
    text = entry_var.get()
    n = text.lower().count("t")
    result_var.set(f"Количество 't': {n}")

root = tk.Tk()
root.title("Счётчик символов")

entry_var = tk.StringVar()
entry_var.trace_add("write", count_t)        # реакция на каждый ввод

tk.Label(root, text="Введите текст:").pack(padx=10, pady=5)
tk.Entry(root, textvariable=entry_var, width=40).pack(padx=10)

result_var = tk.StringVar(value="Количество 't': 0")
tk.Label(root, textvariable=result_var, font=("Arial", 12)).pack(pady=10)

root.mainloop()
```

---

### Задача 2. «Цифровой сумматор»: сумма цифр каждого числа

```python
def digit_sum(n):
    return sum(int(d) for d in str(abs(n)))

numbers = list(map(int, input("Введите целые числа через пробел: ").split()))
sums = [digit_sum(n) for n in numbers]

for n, s in zip(numbers, sums):
    print(f"Сумма цифр {n} = {s}")
print("Результирующий список:", sums)
```

---

### Задача 3. Калькулятор суммы факториалов 1!+2!+…+n! (рекурсия)

```python
def factorial(k):
    if k <= 1:                       # строго рекурсивная функция
        return 1
    return k * factorial(k - 1)

n = int(input("Введите n: "))
total = sum(factorial(i) for i in range(1, n + 1))
print(f"1! + 2! + ... + {n}! = {total}")
```

> Примечание: в условии упомянут вход `x`, но в формуле `1!+2!+…+n!` он не участвует —
> расчёт ведётся по `n`.

---

### Задача 4. Анализатор: содержит ли n² цифру «3»

```python
n = int(input("Введите число n: "))
square = n ** 2
has_three = "3" in str(square)

print(f"{n}^2 = {square}")
if has_three:
    print("✓ Да, результат содержит цифру 3")
else:
    print("✗ Нет, цифры 3 в результате нет")
```

---

### Задача 5. Обработка трёх чисел: невозрастание → удвоить, иначе → модуль

```python
a, b, c = map(float, input("Введите три числа: ").split())

if a >= b >= c:
    a, b, c = a * 2, b * 2, c * 2
    print("Невозрастающий порядок — удвоено:")
else:
    a, b, c = abs(a), abs(b), abs(c)
    print("Порядок нарушен — взяты модули:")

print(a, b, c)
```

---

### Задача 6. Возможность построения треугольника

```python
x, y, z = map(float, input("Введите три стороны: ").split())

if x > 0 and y > 0 and z > 0 and (x + y > z) and (x + z > y) and (y + z > x):
    print("Треугольник построить можно")
else:
    print("Треугольник построить нельзя")
```

---

### Задача 7. Перераспределение значений трёх чисел

```python
x, y, z = map(float, input("Введите три числа: ").split())

if x + y + z < 1:
    # заменить минимальное полусуммой двух других
    m = min(x, y, z)
    if m == x:
        x = (y + z) / 2
    elif m == y:
        y = (x + z) / 2
    else:
        z = (x + y) / 2
else:
    # заменить меньшее из пары (x, y) полусуммой двух оставшихся
    if x <= y:
        x = (y + z) / 2
    else:
        y = (x + z) / 2

print(x, y, z)
```

---

### Задача 8. Сумма вложенных синусов

```python
import math

x = float(input("Введите x: "))
n = int(input("Введите число итераций n: "))

total = 0.0
value = x
for _ in range(n):
    value = math.sin(value)   # очередной вложенный sin
    total += value

print(f"Сумма вложенных синусов = {total}")
```

---

### Задача 9. Инвентаризация магазина игрушек (словарь, сортировка по алфавиту)

```python
toys = {
    "Кукла": "3+",
    "Конструктор": "6+",
    "Мяч": "0+",
    "Робот": "8+",
    "Машинка": "1+",
}

print("Список товаров (по алфавиту):")
for name in sorted(toys):
    print(f"  {name} — возрастное ограничение {toys[name]}")
```

---

### Задача 10. «Статистика квадратов»: квадраты положительных, среднее

```python
data = (4, -2, 7, 0, -5, 3)

positives = [x for x in data if x > 0]
squares = [x ** 2 for x in positives]

if squares:
    avg = sum(squares) / len(squares)
    print("Квадраты положительных:", squares)
    print(f"Среднее арифметическое: {avg}")
else:
    print("Положительных элементов нет")
```

---

### Задача 11. Учёт учеников: расширение словаря School

```python
school = {
    "1А": 25, "2Б": 28, "3В": 22, "4А": 30, "5Б": 26,
}

def add_classes(d, new_classes):
    d.update(new_classes)
    return d

add_classes(school, {"6А": 24, "7Б": 27})

print("Обновлённая ведомость:")
for cls, count in school.items():
    print(f"  {cls}: {count} учеников")
```

---

### Задача 12. Экспертная система для автомагазина (фильтр пар шин)

```python
import random

diameters = tuple(random.randint(14, 22) for _ in range(6))
weights = tuple(round(random.uniform(7, 15), 1) for _ in range(6))
print("Диаметры:", diameters)
print("Веса:", weights)

a = float(input("Допуск по диаметру a (см): "))
b = float(input("Допуск по весу b (кг): "))

print("Подходящие пары шин:")
for i in range(len(diameters)):
    for j in range(i + 1, len(diameters)):
        if abs(diameters[i] - diameters[j]) <= a and abs(weights[i] - weights[j]) <= b:
            print(f"  шина {i} и шина {j}: "
                  f"D=({diameters[i]},{diameters[j]}), W=({weights[i]},{weights[j]})")
```

---

### Задача 13. Распределение учеников по группам «Чётные»/«Нечётные»

```python
ages = [12, 15, 14, 11, 18, 13, 16]

even = [a for a in ages if a % 2 == 0]
odd = [a for a in ages if a % 2 != 0]

print("Группа B (чётные):", even)
print("Группа C (нечётные):", odd)
```

---

### Задача 14. Два окна (приветствие → дочернее с виджетами)

```python
import tkinter as tk

def open_child():
    child = tk.Toplevel(root)
    child.title("Дочернее окно")
    child.geometry("300x250")

    tk.Label(child, text="Введите сообщение:").pack(pady=5)
    entry = tk.Entry(child, width=30)
    entry.pack(pady=5)

    text = tk.Text(child, height=5, width=30)
    text.pack(pady=5)

    def show():
        text.insert(tk.END, entry.get() + "\n")

    tk.Button(child, text="Добавить в текст", command=show).pack(pady=5)

root = tk.Tk()
root.title("Главное окно — Приветствие")
root.geometry("300x150")

tk.Label(root, text="Добро пожаловать!", font=("Arial", 14)).pack(pady=20)
tk.Button(root, text="Перейти дальше", command=open_child).pack()

root.mainloop()
```

---

### Задача 15. Список из N случайных чисел, max, min, их разность

```python
import random

n = int(input("Введите N: "))
nums = [random.randint(1, 50) for _ in range(n)]

print("Список:", nums)
mx, mn = max(nums), min(nums)
print(f"Максимум: {mx}")
print(f"Минимум: {mn}")
print(f"Разность (max - min): {mx - mn}")
```
