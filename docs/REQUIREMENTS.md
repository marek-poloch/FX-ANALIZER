# REQUIREMENTS — Syntetyczny obraz rynku + predykcja audytowa

> Status: adopted 2026-04-20. Źródło: brief "Platforma SaaS – syntetyczny obraz rynku + predykcja audytowa".
> Ten dokument **nadpisuje** wcześniejszy, węższy zakres opisany w `MASTER.md` (FX Whale Radar
> pozostaje pierwszą domenową implementacją, ale docelowo jest jednym z rynków wewnątrz większej platformy).

---

## 0. Cel systemu (jedno zdanie)

Platforma SaaS, która **syntetyzuje stan rynków finansowych**, prezentuje ujednolicony punktowy
obraz rynku, dostarcza **rekomendacje jakościowe** oraz **audytowe predykcje** ceny i zmienności,
przy zachowaniu pełnej kontroli użytkownika nad logiką decyzyjną.

## 1. Zakres rynków

### R1.1 Klasy aktywów (MUST)
- Kryptowaluty
- Forex
- Surowce
- Indeksy giełdowe
- ETF-y

### R1.2 Zakres geograficzny (MUST)
- **Global** — rynek globalny (filtr środowiska)
- **USA** — rynek nadrzędny (główny obraz decyzyjny)
- **Polska** — rynek wtórny (potwierdzenie / opóźnienie / dywergencja)

### R1.3 Hierarchia decyzyjna (MUST)
```
Global  → filtr środowiska
USA     → główny obraz decyzyjny
Polska  → potwierdzenie / opóźnienie / dywergencja
```
**Zasada konstytucyjna:** Polska **nigdy** nie przebija obrazu USA.

---

## 2. Fundament: Syntetyczny Obraz Rynku

### R2.1 Architektura trzech obrazów (MUST)
- Osobny obraz **Global**, osobny **USA**, osobny **Polska**.
- **Identyczna struktura logiczna**, różne zestawy wag.

### R2.2 Model punktowy (MUST)
Obraz rynku = liczba całkowita w skali **–100 do +100**, wynikająca z **jakościowej oceny zjawisk**
(nie z czysto matematycznych wskaźników). Wskaźniki matematyczne są jedynie wejściem do oceny jakościowej.

### R2.3 Bloki składowe obrazu (MUST, dla każdego z 3 obrazów)
1. **Momentum i kierunek rynku**
2. **Spójność wewnętrzna**
3. **Reżim rynku**
4. **Newsy makroekonomiczne** — wzmacniacz/osłabiacz, **nie** kierunek
5. **Przepływy kapitału ("smart money")**:
   - ETF-y (instytucje)
   - Surowce (duże przepływy)
   - Krypto (wieloryby on-chain)
6. **Niepewność** — blok **korygujący, tylko ujemny**

### R2.4 Interpretacja punktów (MUST)
| Zakres | Interpretacja |
|---|---|
| `+60 … +100` | Bardzo pozytywny obraz |
| `+20 … +60`  | Pozytywny |
| `−20 … +20`  | Neutralny |
| `−60 … −20`  | Negatywny |
| `< −60`      | Bardzo negatywny |

---

## 3. System wag — model hybrydowy (User + AI)

### R3.1 Warstwa 1: Wagi bazowe użytkownika (MUST)
- Definiują filozofię rynku użytkownika.
- Dla **każdego** bloku obrazu użytkownik ustala zakres **min–max**.
- Mogą być zapisywane jako **profile** (np. „defensywny", „trendowy").

### R3.2 Warstwa 2: Modyfikatory AI (MUST)
- AI proponuje korekty wag.
- Korekty **zawsze** mieszczą się w zakresie `min–max` ustalonym przez użytkownika.
- Każda propozycja AI **musi** mieć **opisowe uzasadnienie**.
- Tryb domyślny: **hybrydowy** (np. 20 % user / 80 % AI — wartość konfigurowalna).

### R3.3 Profile wag (MUST)
- Użytkownik może zapisywać profile.
- AI może **proponować** nowe profile.
- Każdy nowy profil **wymaga zatwierdzenia** przez użytkownika.
- Historia zmian profili — pełna, audytowalna.

---

## 4. Rekomendacje (nie sygnały)

### R4.1 Charakter rekomendacji (MUST)
Rekomendacja = **interpretacja obrazu rynku**, **nie** decyzja transakcyjna.
System **nie generuje sygnałów kup/sprzedaj**. Użytkownik zachowuje pełną autonomię.

### R4.2 Struktura rekomendacji (MUST)
Każda rekomendacja zawiera:
- **Kierunek**: `long | short | neutral`
- **Siła**: `słaba | umiarkowana | silna`
- **Pewność**: `niska | średnia | wysoka`
- **Uzasadnienie kontekstowe** (tekst, bullet points)

### R4.3 Wejścia agenta rekomendacji (MUST)
- Syntetyczny obraz rynku (3 warstwy geograficzne)
- Aktywny profil wag
- Hierarchia `Global → USA → PL` (R1.3)

### R4.4 Wyłączenia (MUST-NOT)
- Rekomendacje **nie** korzystają bezpośrednio z predykcji.
- Rekomendacje **nie** generują sygnałów transakcyjnych.

---

## 5. Warstwa predykcyjna — tryb audytowy

### R5.1 Zasada konstytucyjna (MUST)
Predykcje są **widoczne i oceniane**, ale **NIE wpływają automatycznie** na rekomendacje ani sygnały.
Predykcja = **hipoteza przyszłości, nie decyzja**.

### R5.2 Zakresy czasowe (MUST)
AI analizuje wiele horyzontów wewnętrznie, ale użytkownik **zawsze** widzi **4 kanoniczne zakresy**:

| Zakres | Agregacja |
|---|---|
| **Short** (bardzo krótki) | 1m / 5m / 10m / 15m |
| **Intraday** (krótko-średni) | 30m / 1h / 3h |
| **Structural** (średni) | 6h / 12h / 1d / 2d |
| **Regime / Macro** (długi) | 1 tydzień / 1 miesiąc |

### R5.3 Struktura pojedynczej predykcji (MUST)
Dla **każdego** zakresu i **każdego** instrumentu:
- **Kierunek**: `↑ | ↓ | →`
- **Przewidywany zakres zmienności** (tunel ceny – min/max)
- **Poziom pewności**: `niska | średnia | wysoka`
- **Etykieta kontekstowa** — 1 zdanie

---

## 6. Uczenie AI (ciągłe, oddzielone od decyzji)

### R6.1 Zakres ewaluacji (MUST)
AI w trybie ciągłym ocenia trafność predykcji:
- Kierunek (trafiony / nietrafiony)
- Zakres (czy cena mieściła się w tunelu)
- Czas utrzymania hipotezy

### R6.2 Profil skuteczności (MUST)
Per **instrument** × **zakres czasowy** AI buduje profil własnej skuteczności.

### R6.3 Dozwolone akcje AI (MUST)
Na podstawie ewaluacji AI **może**:
- Obniżać pewność przyszłych predykcji
- Poszerzać przewidywany zakres zmienności
- Oznaczać zakres jako **„niskiej jakości"**

### R6.4 Zakazane akcje AI (MUST-NOT)
AI **nie może**:
- Zmieniać obrazu rynku
- Wpływać na rekomendacje
- Generować sygnałów
- Zmieniać wag (tylko proponować — R3.2)

---

## 7. Transparentność i audyt

### R7.1 Co widzi użytkownik (MUST)
- Aktualny **obraz rynku** (punkty + interpretacja jakościowa)
- Aktywny **profil wag** oraz ostatnie propozycje AI
- Predykcje w **4 zakresach czasowych**
- **Opisowe** oceny jakości AI (bez agresywnych metryk typu „zarobek")

### R7.2 Wymogi systemowe (MUST)
- System **nadaje się do audytu** (kompletny log decyzji, wag, predykcji, ewaluacji).
- System **jest wyjaśnialny** (każda decyzja ma uzasadnienie tekstowe).
- Spełnia wymogi regulacyjne — **brak black boxa**.

---

## 8. Architektura agentów AI (model operacyjny)

### Zasada nadrzędna (MUST)
**Każdy agent ma JEDNĄ odpowiedzialność decyzyjną i NIE wchodzi w kompetencje innych agentów.**
Szczegóły operacyjne każdego agenta → [`AGENTS.md`](./AGENTS.md).

### R8.1 Lista agentów (MUST)
| # | Nazwa | Rola |
|---|---|---|
| 0 | Koordynator | Chief Orchestrator — pilnuje architektury, prawo veta |
| 1 | Syntetyczny Obraz Rynku | Opisuje stan rynku TU I TERAZ |
| 2 | Wagi i Profile | Tłumacz intencji użytkownika ↔ logika systemu |
| 3 | Predykcja (audyt) | Stawia hipotezy przyszłości |
| 4 | Uczenie i Ewaluacja | Audytor skuteczności AI |
| 5 | Rekomendacje | Interpretuje obraz w języku decyzyjnym |
| 6 | Ryzyko i Zgodność | Hamulec bezpieczeństwa, prawo veta |

### R8.2 Separacja warstw (MUST)
```
DANE
  ↓
Agent 1 (Obraz)
  ↓
Agent 2 (Wagi) ←→ Użytkownik
  ↓
Agent 5 (Rekomendacje)
  ↓
UŻYTKOWNIK

Równolegle i niezależnie:
  Agent 3 (Predykcja) → Agent 4 (Uczenie)

Nad wszystkim:
  Agent 0 (Koordynator)
  Agent 6 (Ryzyko)
```

---

## 9. Zasady UX (nie do złamania)

### R9.1 (MUST-NOT)
- **Predykcja ≠ rekomendacja** — oddzielne sekcje, oddzielna kolorystyka.
- **Brak presji decyzyjnej** — żadnych modali typu „kup teraz".
- **Brak sygnałów domyślnych** — użytkownik musi je świadomie zdefiniować.
- **Pełna wyjaśnialność** — każda liczba i etykieta musi mieć tooltipa / rozwijane uzasadnienie.

### R9.2 Sekcje głównego dashboardu (MUST)
1. Obraz Globalny (score + opis jakościowy)
2. Obraz USA (score + opis)
3. Obraz Polski (score + opis)
4. Status niepewności
5. **Kolory: tylko informacyjne, nie emocjonalne**
6. **Brak przycisków „kup/sprzedaj"**

### R9.3 Widok instrumentu (MUST)
- **Górna sekcja**: aktualny kontekst + zgodność z USA / Global
- **Środkowa sekcja**: 4 zakresy czasowe (kierunek, tunel, pewność, kontekst)
- **Dolna sekcja**: rekomendacja jakościowa + uzasadnienie (bullet points)

### R9.4 Panel AI / Transparentność (MUST)
- Aktywny profil wag
- Ostatnie propozycje AI + ich uzasadnienia
- Opisowa skuteczność predykcji per zakres
- **Brak metryk „zarobku"**

---

## 10. Relacja do obecnego kodu (FX Whale Radar)

Obecna implementacja (monorepo `apps/api` + `apps/web` + `services/quant-engine`) pokrywa wybrane
elementy R2.3 (momentum, spójność, niepewność) oraz mapowanie na score, ale dotyczy **wyłącznie
rynku Forex**. Wymagania z tego dokumentu oznaczają rozszerzenie o:

- **3 klasy aktywów** dodatkowe (crypto, commodities, indices, ETF) — nowe adaptery + model danych
- **3 obrazy geograficzne** zamiast jednego rynku — nowy moduł `market-image`
- **Hierarchia Global → USA → PL** — nowa warstwa agregacji
- **System wag bazowych + profili** — nowy moduł `weights-profiles`, CRUD + historia
- **Predykcje w 4 zakresach** — nowy moduł `predictions`, ewaluacja historyczna
- **Agent uczenia** — nowy moduł `ai-evaluation`, profile skuteczności w TimescaleDB
- **Agent ryzyka** — warstwa vet poprzedzająca publikację rekomendacji
- **Agent koordynator** — orkiestrator między-modułowy, egzekwuje separację warstw
- **Dashboard trzech obrazów** — nowy widok, zastępuje dotychczasowy „Market Overview" jako punkt wejścia

Szczegółowy podział na epiki → [`ROADMAP.md`](./ROADMAP.md) (sekcja „Phase 2 – Market Image SaaS").

---

## 11. Status dokumentu

- **Wersja**: 1.0 (2026-04-20)
- **Adoptowany**: tak
- **Deprekuje**: `MASTER.md` w zakresie, w którym kolidował (szczególnie sekcje o automatycznych sygnałach)
