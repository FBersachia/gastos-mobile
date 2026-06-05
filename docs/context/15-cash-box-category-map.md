# Cash Box Category Map

This file is the source of truth for the default cash box catalog and the default expense category to cash box mapping.

Runtime defaults in `mobile/src/sampleData.ts` must mirror this document. If a default expense category is added, removed, renamed, or moved to another cash box, update this file first and then update the code/tests to match.

## Cash boxes

| Cash box ID | English name | Spanish Argentina name |
| --- | --- | --- |
| `cashbox-basic` | Basic | Basico |
| `cashbox-fun` | Fun | Diversion |
| `cashbox-education` | Education | Educacion |
| `cashbox-savings` | Savings | Ahorro |
| `cashbox-investment` | Investment | Inversion |
| `cashbox-charity` | Charity | Caridad |

## Default expense category mapping

| Category ID | English name | Spanish Argentina name | Cash box ID | Cash box name |
| --- | --- | --- | --- | --- |
| `cat-exp-food` | Food | Comida | `cashbox-basic` | Basic |
| `cat-exp-transport` | Transport | Transporte | `cashbox-basic` | Basic |
| `cat-exp-housing` | Housing | Hogar | `cashbox-basic` | Basic |
| `cat-exp-services` | Services | Servicios | `cashbox-basic` | Basic |
| `cat-exp-health` | Health | Salud | `cashbox-basic` | Basic |
| `cat-exp-entertainment` | Entertainment | Entretenimiento | `cashbox-fun` | Fun |
| `cat-exp-shopping` | Shopping | Compras | `cashbox-basic` | Basic |
| `cat-exp-education` | Education | Educacion | `cashbox-education` | Education |
| `cat-exp-sports` | Sports | Deporte | `cashbox-basic` | Basic |
| `cat-exp-insurance` | Insurance | Seguros | `cashbox-basic` | Basic |
| `cat-exp-pets` | Pets | Mascotas | `cashbox-basic` | Basic |
| `cat-exp-personal` | Personal | Personal | `cashbox-basic` | Basic |
| `cat-exp-savings` | Savings | Ahorro | `cashbox-savings` | Savings |
| `cat-exp-investment` | Investment | Inversion | `cashbox-investment` | Investment |
| `cat-exp-charity` | Charity | Caridad | `cashbox-charity` | Charity |
| `cat-exp-other` | Other | Otros | `cashbox-basic` | Basic |

## Rules

- Only expense categories use `cashBoxId`.
- Income categories must keep `cashBoxId` empty.
- Custom expense categories can choose any active cash box from the default catalog.
- Cash boxes are currently a default catalog only; no cash box create/edit UI exists yet.
