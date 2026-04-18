# Plan Implementacji Ekranu Akceptacji Lądowisk (Moderator)

## 1. Cel
Implementacja interfejsu moderatora w `@app/moderator/approvals/page.tsx`, który pozwoli na przeglądanie, weryfikację (akceptację/odrzucenie) oraz edycję zgłoszonych punktów odbioru (lądowisk), zgodnie z dostarczonymi mockupami.

## 2. Nowe Komponenty

### A. `ApprovalsList`
- Wykorzystanie komponentu `Tabs` z `shadcn/ui` do filtrowania: "Oczekujące", "Odrzucone", "Zaakceptowane".
- Lista kart `LandingPadCard`, każda zawierająca:
    - Nazwę punktu.
    - Adres (koordynaty sformatowane).
    - Status widoczności (Prywatny/Publiczny).
    - Przycisk "Pokaż więcej", prowadzący do widoku szczegółowego.

### B. `LandingPadDetailsView`
- Widok szczegółowy punktu (read-only z opcją przełączenia w tryb edycji).
- Elementy (zgodnie z mockupem `Szczegóły punktu`):
    - Nazwa, Opis, Typ, Zdjęcie, Mapa z lokalizacją.
    - Sekcja "Dostęp do punktu" z opisem i opcjami.
    - Przyciski akcji na dole: **Zaakceptuj punkt** (czarny), **Odrzuć punkt** (czerwony outline).
    - Przycisk **Edytuj** w nagłówku (przełącza w tryb edycji).

## 3. Integracja Techniczna (tRPC)
- **Pobieranie:** Wykorzystanie `landingPad.getAll` (filtrowanie po stronie klienta lub rozszerzenie procedury o filtry statusu).
- **Aktualizacja statusu:** Dodanie nowej procedury `landingPad.updateStatus` (input: `id`, `status: ACCEPTED | REJECTED`).
- **Edycja:** Dodanie procedury `landingPad.update` do zapisywania zmian wprowadzonych przez moderatora.

## 4. Reużywalność Stylu
- Wykorzystanie istniejących klas i komponentów z `LandingPadForm.tsx` (np. `CoordinatesPicker`, `PageHeaderWithBack`).
- Zachowanie spójnej typografii i odstępów (space-y-8, p-4).

## 5. Kroki wykonania
1. Rozszerzenie routera tRPC o procedury `updateStatus` i `update`.
2. Stworzenie komponentu listy zgłoszeń z zakładkami.
3. Implementacja widoku szczegółowego punktu (read-only).
4. Integracja z istniejącym `LandingPadForm` lub jego adaptacja jako komponentu edycji wewnątrz panelu moderatora.
5. Dodanie logiki przycisków Akceptuj/Odrzuć wraz z powiadomieniami `toast`.

---
**Czy akceptujesz ten plan?**
