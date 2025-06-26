# ADR-001: Lenient bidirectional synchronisation of `category_group` and `category`

Date: 2025-06-26

## Context

Historically we kept the two form fields in strict sync:

* wybór `category` nadpisywał `category_group` (jednokierunkowo w górę) — OK;
* zmiana `category_group` usuwała (`""`) `category`, jeśli już nie pasowała do grupy.

W praktyce przeszkadzało to w scenariuszu:
1. Użytkownik wybiera właściwą **kategorię** (np. `ads`).
2. Orientuje się, że powinna być przypisana do innej **grupy kategorii**.
3. Po zmianie grupy wybrana kategoria znika z listy, a pole `category` jest czyszczone.

Tym samym operacja nie mogła zostać dokończona.

## Decision

* Zachowujemy automatyczne **ustawianie** `category_group` po wyborze `category` (business shortcut).
* **Usuwamy** automatyczne czyszczenie `category` przy zmianie `category_group`.
* Lista kategorii (`availableCategories`) jest filtrowana *tylko* wtedy, gdy `category` jest puste. Gdy jest już wybrana – wyświetlamy pełną listę, tak aby wybrana pozycja była zawsze dostępna.

## Consequences

+ Użytkownik może najpierw wybrać kategorię, a później skorygować jej grupę bez utraty wyboru.
+ Możliwe są tymczasowo "niespójne" pary (kategoria spoza grupy). W UI można je ewentualnie wyróżnić.
+ Logika została wyekstrahowana do `computeAvailableCategories` + zaktualizowano `syncCategory`. Pokryte testami jednostkowymi. 