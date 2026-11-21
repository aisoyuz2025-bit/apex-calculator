# Калькулятор дохода APEX

Одностраничный калькулятор (один файл `index.html`). Считает по реальной статистике счёта методом Монте-Карло (5000 симуляций): плохая серия, медиана, хорошая серия и шанс потерять депозит.

> **Важно: рабочая (живая) копия сайта** лежит в репозитории [aisoyuz2025-bit.github.io](https://github.com/aisoyuz2025-bit/aisoyuz2025-bit.github.io), в папке `apex-calculator/`, и открывается по адресу https://aisoyuz2025-bit.github.io/apex-calculator/
> Еженедельно правьте статистику именно в файле **`aisoyuz2025-bit.github.io/apex-calculator/index.html`**: https://github.com/aisoyuz2025-bit/aisoyuz2025-bit.github.io/edit/main/apex-calculator/index.html
> Этот репозиторий (apex-calculator) — исходник/копия; изменения здесь на сайт не попадают.

## Как обновлять статистику раз в неделю
1. Откройте `apex-calculator/index.html` в репозитории `aisoyuz2025-bit.github.io` на github.com.
2. Нажмите значок карандаша (Edit this file).
3. В самом начале блока `<script>` найдите `var STATS = { ... }` и поменяйте числа (дата, сделки, % прибыльных, выплата и т.д.).
4. Нажмите «Commit changes».
5. Через ~1 минуту сайт обновится: https://aisoyuz2025-bit.github.io/apex-calculator/

Прошлые результаты не гарантируют будущих, торговля может привести к потере всего депозита.
