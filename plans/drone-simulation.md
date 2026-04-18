# Plan Symulacji Ruchu Dronów

## 1. Cel
Stworzenie mechanizmu symulującego przemieszczanie się dronów w czasie rzeczywistym. Symulacja ma aktualizować rekordy w tabeli `DroneStatus`, co przełoży się na płynny ruch markerów na mapie.

## 2. Architektura Symulatora
Symulator będzie działał jako niezależny proces (skrypt Node.js), który:
1. Odczytuje wszystkie aktywne statusy dronów z bazy danych.
2. Oblicza nową pozycję drona na podstawie wektora kierunkowego do celu (`destination`).
3. Aktualizuje pozycję (`currentLatitude`, `currentLongitude`) oraz poziom baterii w bazie.
4. Obsługuje cykl życia dostawy (np. reset drona po dotarciu do celu dla celów demonstracyjnych).

## 3. Szczegóły Techniczne
- **Częstotliwość:** Aktualizacja co 1000ms (1 sekunda).
- **Prędkość (Step):** Stały krok (np. 0.0001 stopnia geograficznego), aby ruch był przewidywalny.
- **Logika dotarcia do celu:**
    - Jeśli dystans do celu jest mniejszy niż krok, dron uznawany jest za przybyły.
    - Dla celów demo: dron "teleportuje się" z powrotem na punkt startowy (`origin`) po krótkim postoju, aby symulacja trwała w nieskończoność.
- **Bateria:** Losowe zmniejszanie poziomu baterii o 1% co kilka kroków.

## 4. Komponenty
- `lib/droneSimulator.ts`: Główny plik z logiką symulacji.
- `package.json`: Dodanie skryptu `npm run simulate` do łatwego uruchamiania.

## 5. Kroki wykonania
1. Utworzenie pliku `lib/droneSimulator.ts` z wykorzystaniem Prisma Client.
2. Implementacja funkcji `moveDrone` obliczającej nową pozycję (interpolacja liniowa).
3. Dodanie obsługi błędów i logowania statusów w konsoli.
4. Uruchomienie symulatora w tle za pomocą `run_shell_command`.

---
**Czy akceptujesz ten plan symulacji?**
