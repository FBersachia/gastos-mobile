# Categories and Subcategories Context

## Requirement

The app must support expense and income categories, with subcategories under each category. Used categories should not be hard deleted directly; the preferred MVP behavior is disabling them.

## Current data model

Defined in `mobile/src/types.ts`:

- `Category` has `id`, `name`, `type`, `active`, `createdAt`, `updatedAt`.
- `Subcategory` has `id`, `categoryId`, `name`, `active`, `createdAt`, `updatedAt`.

## Defaults

Created in `mobile/src/defaults.ts`.

Default expense categories:

- Food (Comida).
- Transport (Transporte).
- Housing (Hogar).
- Services (Servicios).
- Health (Salud).
- Entertainment (Entretenimiento).
- Shopping (Compras).
- Education (Educación).
- Sports (Deporte).
- Insurance (Seguros).
- Pets (Mascotas).
- Personal (Personal).
- Other (Otros).

Default income categories:

- Salary (Salario).
- Freelance (Prestaciones).
- Sales (Ventas).
- Refunds (Reembolsos).
- Other (Otros).

Default subcategories:

- Food: Groceries (Mercado), Delivery (Delivery), Breakfast (Desayuno), Lunch(Almuerzo), Dinner(Cena), Snacks(Aperitivos), Burgers (Hamburguesas), Beverages (Bebidas), Drinks (Tragos), Cravings (Bajon).
- Transport: Rides (Auto), Public Transit (Transporte público).
- Housing: Home Goods (Insumos hogar), Repairments (Arreglos).
- Services: Mobile Phone (Celular), Subscriptions (Suscripciones).
- Health: Personal Care (Cuidado Personal), Hospital (Hospital), Meds (Medicación).
- Entertainment: Movies (Cine), Games (Juegos), Concerts(Recitales).
- Shopping: Clothing(Ropa), Laundry(Lavadero).
- Education: Books(Libros), Courses(Cursos), University(Universidad).
- Sports: Football (Futbol), Gym (Gimnasio).
- Insurance: Car Insurance (Seguro auto).
- Pets: Pet Food (Comida mascotas).
- Other: Interests(Intereses).
- Salary: Payroll (Sueldo).
- Freelance: Projects(Trabajos) .
- Sales: Sales(Ventas).
- Refunds: Reimbursements(Reembolsos).
- Other income: Misc Income(Ingresos varios).

The default seed must not include the removed drug/cannabis category or sample rows.

## Current management UI

Implemented in `SettingsScreen`:

- Add category, with the expense/income toggle filtering both creation type and the visible category list.
- Add subcategory, choosing whether the parent category comes from expense or income categories; the toggle filters parent choices and visible accordions.
- Disable category.
- Active categories are shown in forms and settings.
- Settings shows active subcategories grouped under parent-category accordions instead of one mixed list.
- Category UI uses lucide icons for default and keyword-matched categories. Category names are displayed smaller than the icon.
- Subcategory UI has its own icon map and keyword fallback, so expense entry and dashboard rows can show more specific icons such as groceries, delivery, breakfast, rides, public transit, laundry, music, soccer, bike insurance, pet food, and payroll.

## Current deletion policy

Hard delete is not exposed. Disable is used for categories.

## Known gaps

- No validation prevents duplicate names.
- No reassign flow exists for historical transactions.
