# Dokumentacja Aplikacji Dostaw Dronami

## Przegląd
Aplikacja jest kompleksową platformą do zarządzania dostawami dronami, łączącą użytkowników, dostawców lądowisk oraz firmy kurierskie operujące dronami. System działa na zasadzie zbliżonej do paczkomatów (np. InPost), ale z wykorzystaniem dronów i wyznaczonych stref lądowania.

## Role Użytkowników i Funkcje

### 1. Interfejs Użytkownika (Ekrany Użytkownika)
*   **Mapa:**
    *   Podgląd dostępnych lądowisk (podobnie jak paczkomaty w okolicy).
    *   Śledzenie w czasie rzeczywistym dronów aktualnie lecących do użytkownika.
    *   (Opcjonalnie) Lista najbliższych lądowisk.
*   **Formularz dodawania lądowiska:**
    *   **Wymagane pola:**
        *   Nazwa
        *   Zdjęcie
        *   Pinezka z lokalizacją
        *   Typ: Podjazd, Plac, Punkt paczkowy, Dach, Inne.
        *   Dostępność: Prywatne (dostępne tylko dla twórcy) lub Publiczne (ogólnodostępne z ulicy).
*   **Moje zgłoszenia:**
    *   Śledzenie statusu zgłoszonych lądowisk (Oczekujące, Zaakceptowane, Odrzucone).
*   **Moje zamówienia:**
    *   Lista ostatnio dostarczonych przesyłek.
    *   Aktualnie lecące przesyłki (z możliwością oceny przesyłki i stanu paczki po dostarczeniu).

### 2. Interfejs Moderatora (Ekrany Moderatora)
*   **Akceptacja lądowisk:**
    *   Przeglądanie kolejki formularzy zgłoszeniowych lądowisk do akceptacji.
    *   Historia zaakceptowanych i odrzuconych zgłoszeń.

### 3. Interfejs Firmy Dronowej (Ekrany Firmy z Dronami)
*   **Mapa:**
    *   Podgląd dostępnych lądowisk.
    *   Szczegółowe informacje o flocie dronów firmy:
        *   Aktualna pozycja.
        *   Poziom naładowania baterii.
        *   Trasa lotu (Skąd dokąd leci).
        *   Szczegóły paczki (Jaka i jak duża przesyłka jest transportowana).
*   **Ustawienia:**
    *   **Integracja / API:** Klucze API i dane do podpięcia zewnętrznych systemów zarządzania dronami.
*   **Lista zamówień:**
    *   Aktualnie dostarczane przesyłki.
    *   Zakończone dostawy (Liczba dostaw udanych vs. nieudanych).

## Integracja Techniczna (Endpointy API)
System udostępnia zestaw punktów końcowych (endpoints) dla firm dronowych w celu integracji ich floty:

1.  **Telemetria Dronów:** Odbieranie w czasie rzeczywistym informacji o wszystkich aktywnych dronach.
2.  **Wyszukiwanie Lokalizacji:** Zapytanie o listę najbliższych lądowisk dla konkretnego miejsca docelowego.
3.  **Sprawdzanie Dostępności:** Zapytanie o dostępność i status konkretnych lądowisk.
4.  **Rezerwacje:** Obsługa rezerwacji lądowisk dla nadchodzących dostaw.
5.  **Śledzenie Przesyłek:** Pobieranie listy przesyłek gotowych do dostarczenia.
6.  **Potwierdzenie Dostawy:** Aktualizacja systemu po pomyślnym dostarczeniu przesyłki.
7.  **Przyjmowanie Zleceń:** Odbieranie nowych zleceń dostawy ze zintegrowanych serwisów zakupowych.
