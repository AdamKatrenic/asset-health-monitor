# Asset Health Monitor

REST API pre real-time monitoring priemyselných zariadení. Projekt postavený s cieľom demonštrovať produkčné best practices v Node.js ekosystéme.

---

## O projekte

Systém umožňuje sledovať stav priemyselných strojov (teplota, online/offline status) a automaticky generovať alerty pri prekročení kritických hodnôt. Architektúra je inšpirovaná riešeniami používanými v IoT platformách pre správu veľkého množstva zariadení.

---

## Technológie

| Vrstva | Technológia | Účel |
|---|---|---|
| Runtime | Node.js 20 | Serverové prostredie |
| Framework | Express.js | REST API a routing |
| Databáza | PostgreSQL 16 | Trvalé ukladanie dát |
| Cache | Redis 7 | Cachovanie odpovedí, zníženie záťaže DB |
| Kontajnery | Docker + Docker Compose | Orchestrácia celého stacku |
| Testovanie | Jest + Supertest | Unit a integration testy |
| CI/CD | GitHub Actions | Automatické testy a Docker build pri každom pushu |

---

## Spustenie projektu

### Požiadavky
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)

### Inštalácia

```bash
# 1. Klonovanie repozitára
git clone https://github.com/AdamKatrenic/asset-health-monitor.git
cd asset-health-monitor

# 2. Inštalácia závislostí
npm install

# 3. Spustenie celého stacku (app + PostgreSQL + Redis)
docker-compose up --build
```

API beží na `http://localhost:3000`

---

## API Endpointy

### Zdravie servera
```
GET /health
```

### Zariadenia (Machines)

| Metóda | Endpoint | Popis |
|---|---|---|
| GET | `/api/machines` | Zoznam všetkých zariadení |
| GET | `/api/machines/:id` | Detail zariadenia (s Redis cachom) |
| POST | `/api/machines` | Vytvorenie nového zariadenia |
| PUT | `/api/machines/:id` | Úprava zariadenia |
| DELETE | `/api/machines/:id` | Vymazanie zariadenia |
| POST | `/api/machines/:id/alert` | Manuálne spustenie alertu |

### Príklad requestu

```bash
# Vytvorenie zariadenia
curl -X POST http://localhost:3000/api/machines \
  -H "Content-Type: application/json" \
  -d '{"name": "Excavator CAT 320", "status": "online", "temperature": 72}'

# Spustenie alertu (threshold v °C)
curl -X POST http://localhost:3000/api/machines/1/alert \
  -H "Content-Type: application/json" \
  -d '{"threshold": 60}'
```

---

## Architektúra

```
asset-health-monitor/
├── src/
│   ├── routes/         # Express routery
│   ├── controllers/    # Business logika
│   ├── middleware/     # Error handling
│   ├── lambda/         # Alert handler (simulácia AWS Lambda)
│   ├── app.js          # Express aplikácia
│   ├── db.js           # PostgreSQL pripojenie
│   └── redis.js        # Redis klient
├── tests/              # Jest + Supertest testy
├── .github/workflows/  # GitHub Actions CI pipeline
├── docker-compose.yml  # Orchestrácia kontajnerov
├── Dockerfile          # Docker image definícia
└── server.js           # Entry point
```

---

## Testovanie

```bash
# Spustenie testov
npm test

# Spustenie testov s coverage reportom
npm run test -- --coverage
```

**Výsledky:** 7 testov, 83% code coverage

---

## CI/CD Pipeline

Pri každom `git push` na `main` vetvu GitHub Actions automaticky:

1. Spustí PostgreSQL a Redis service kontajnery
2. Nainštaluje závislosti
3. Spustí všetky testy
4. Postaví Docker image

Pipeline prebehne za ~46 sekúnd.

---

## Kľúčové koncepty

**Redis caching** — Detail zariadenia sa pri prvom requeste stiahne z PostgreSQL a uloží do Redisu na 60 sekúnd. Každý ďalší request v tomto okne obslúži Redis bez záťaže databázy.

**Lambda alerting** — `alertHandler` simuluje AWS Lambda funkciu ktorá sa spustí keď teplota zariadenia prekročí definovaný limit. V produkcii by odoslal notifikáciu (email, SMS, Slack).

**Error handling middleware** — Centralizovaný error handler zachytí všetky neočakávané chyby a vráti štruktúrovanú JSON odpoveď. V development móde obsahuje aj stack trace.

---

## Konvencie commitov

Projekt používa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — nová funkcionalita
- `fix:` — oprava chyby
- `test:` — pridanie alebo úprava testov
- `ci:` — zmeny v CI/CD pipeline
- `chore:` — konfigurácia, závislosti