# Plan Implementacji Mapy Lądowisk i Dronów

## 1. Cel
Implementacja interaktywnej mapy w `@app/map/page.tsx`, która umożliwi podgląd lądowisk (LandingPads) oraz śledzenie dronów (DroneStatus) w czasie rzeczywistym wraz z wizualizacją ich tras.

## 2. Architektura Danych
Będziemy korzystać z modeli zdefiniowanych w `schema.prisma`:
- **LandingPad**: Wyświetlane jako stałe punkty (markery).
- **DroneStatus**: Wyświetlane jako ruchome punkty (markery) z dodatkowymi metadanymi (bateria, trasa).
- **Order/Delivery**: Powiązanie drona z konkretną paczką i celem.

## 3. Komponenty do implementacji / rozbudowy

### A. Markery Lądowisk (`LandingPadMarker`)
- Wykorzystanie `MapMarker` z ikoną `MapPinIcon`.
- `MapPopup` wyświetlający:
    - Nazwę i zdjęcie lądowiska.
    - Typ (np. Dach, Podjazd) i status dostępności.
    - Przycisk "Zamów tutaj" (dla roli USER).

### B. Markery Dronów (`DroneMarker`)
- Wykorzystanie `MapMarker` z ikoną drona (np. `NavigationIcon` obrócona w kierunku lotu).
- Kolor ikony zależny od poziomu baterii (np. czerwony < 20%).
- `MapPopup` wyświetlający:
    - ID drona i aktualną baterię.
    - Informacje o przesyłce (Order type, description).
    - Status (np. W locie, Powrót).

### C. Trasy Lotu (`DronePath`)
- Wykorzystanie `MapPolyline` do rysowania linii od `origin` przez `current` do `destination`.
- Stylizacja: Linia przerywana w kolorze `primary`.
- (Opcjonalnie) Strzałka wskazująca kierunek.

## 4. Warstwy Mapy (Layers)
Zastosowanie `MapLayers` i `MapLayerGroup` dla lepszej czytelności:
1. **Lądowiska**: Możliwość ukrycia/pokazania wszystkich punktów odbioru.
2. **Aktywne Dostawy**: Warstwa zawierająca drony oraz ich linie tras.

## 5. Logika i Dane (tRPC)
Będziemy korzystać z dedykowanych procedur tRPC do zasilania mapy danymi:
1. **`landingPad.getAll`**: Pobiera listę wszystkich lądowisk. Zwraca dane typu `LandingPadDetailsDTO`. Użyjemy tego do warstwy lądowisk.
2. **`droneStatus.getAllMine`**: Kluczowa procedura do śledzenia dronów. 
    - Jeśli zalogowany jest **USER**: zobaczy tylko drony lecące z jego zamówieniami.
    - Jeśli zalogowana jest **COMPANY**: zobaczy całą swoją aktywną flotę.
    - Procedura ta zwraca `DroneStatusDTO`, który zawiera współrzędne aktualne, startowe i docelowe (niezbędne do rysowania tras).

## 6. Kroki wykonania
1. Pobranie danych przez `trpc.landingPad.getAll.useQuery()` oraz `trpc.droneStatus.getAllMine.useQuery()`.
2. Implementacja `MapLayerGroup` dla Lądowisk i Dronów.
3. Stworzenie komponentów `LandingPadMarker` i `DroneMarker` z Popupami.
4. Renderowanie `MapPolyline` dla każdego drona na podstawie `origin` i `destination` z `DroneStatusDTO`.
5. Obsługa stanów ładowania i błędów (skeleton/spinner na mapie).

---
**Czy akceptujesz ten plan?**
