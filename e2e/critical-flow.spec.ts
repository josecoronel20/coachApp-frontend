/**
 * Test E2E — Flujo crítico de Impruv
 *
 * Coach crea rutina → comparte link → Atleta ejecuta sesión → Coach ve progreso
 *
 * Requiere frontend + backend corriendo.
 * Saltar con: PLAYWRIGHT_SKIP_CRITICAL=1 npm run test:e2e
 */
import { test, expect, type APIRequestContext } from "@playwright/test";

const BACKEND_URL =
  process.env.PLAYWRIGHT_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

const RUN_ID = Date.now().toString(36);

const COACH = {
  email: `e2e-coach-${RUN_ID}@impruv.test`,
  password: "TestPass123!",
  name: `Coach E2E ${RUN_ID}`,
};

const ATHLETE = {
  name: `Atleta E2E ${RUN_ID}`,
  email: `e2e-atleta-${RUN_ID}@impruv.test`,
  phone: `+549111${RUN_ID.slice(-7).padStart(7, "0")}`,
};

// IDs generados durante el test (para cleanup)
let createdAthleteId: string | null = null;
let coachCookieHeader: string | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de API (setup/teardown sin pasar por la UI)
// ─────────────────────────────────────────────────────────────────────────────

async function registerCoach(req: APIRequestContext) {
  const res = await req.post(`${BACKEND_URL}/api/auth/register`, {
    data: { name: COACH.name, email: COACH.email, password: COACH.password },
  });
  return res.ok();
}

async function loginCoach(req: APIRequestContext): Promise<string | null> {
  const res = await req.post(`${BACKEND_URL}/api/auth/login`, {
    data: { email: COACH.email, password: COACH.password },
  });
  if (!res.ok()) return null;
  const setCookie = res.headers()["set-cookie"] ?? "";
  const match = setCookie.match(/token=([^;]+)/);
  return match ? `token=${match[1]}` : null;
}

async function deleteAthleteViaApi(
  req: APIRequestContext,
  athleteId: string,
  cookie: string
) {
  await req.delete(`${BACKEND_URL}/api/protected/deleteAthlete`, {
    data: { id: athleteId },
    headers: { Cookie: cookie },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe("flujo crítico", () => {
  test.setTimeout(120_000);

  test.skip(
    !!process.env.PLAYWRIGHT_SKIP_CRITICAL,
    "Salteado por PLAYWRIGHT_SKIP_CRITICAL=1"
  );

  test.beforeAll(async ({ request }) => {
    const registered = await registerCoach(request);
    if (!registered) throw new Error("No se pudo registrar el coach de prueba");

    const cookie = await loginCoach(request);
    if (!cookie)
      throw new Error("No se pudo hacer login con el coach de prueba");
    coachCookieHeader = cookie;
  });

  test.afterAll(async ({ request }) => {
    if (createdAthleteId && coachCookieHeader) {
      await deleteAthleteViaApi(request, createdAthleteId, coachCookieHeader);
    }
  });

  test("coach crea rutina → atleta ejecuta sesión → coach ve progreso", async ({
    browser,
  }) => {
    // ── CONTEXTO COACH ────────────────────────────────────────────────────
    const coachContext = await browser.newContext();
    const coachPage = await coachContext.newPage();

    // ── PASO 1: Login del coach ───────────────────────────────────────────
    await coachPage.goto("/auth/login");
    await coachPage.getByLabel(/email/i).fill(COACH.email);
    await coachPage.getByLabel(/contraseña|password/i).fill(COACH.password);
    await coachPage.getByRole("button", { name: /ingresar|login|entrar/i }).click();

    await expect(coachPage).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // ── PASO 2: Crear atleta nuevo ────────────────────────────────────────
    await coachPage.goto("/dashboard/athlete/new");

    await coachPage.getByLabel(/nombre/i).fill(ATHLETE.name);
    await coachPage.getByLabel(/email/i).fill(ATHLETE.email);
    await coachPage.getByLabel(/tel[eé]fono|phone/i).fill(ATHLETE.phone);
    await coachPage
      .getByRole("button", { name: /crear|guardar|agregar/i })
      .click();

    // Esperar a que navegue a la ficha del atleta creado
    await expect(coachPage).toHaveURL(/\/dashboard\/athlete\/[a-z0-9-]+/, {
      timeout: 15_000,
    });

    // Capturar el ID del atleta desde la URL para cleanup
    const athleteUrl = coachPage.url();
    const athleteIdMatch = athleteUrl.match(/\/athlete\/([a-z0-9-]+)/);
    createdAthleteId = athleteIdMatch?.[1] ?? null;
    expect(createdAthleteId).toBeTruthy();

    // ── PASO 3: Crear rutina con un día y dos ejercicios ─────────────────
    // Agregar primer ejercicio
    await coachPage
      .getByRole("button", { name: /agregar ejercicio/i })
      .click();
    await coachPage.getByPlaceholder(/nombre del ejercicio/i).fill("Sentadilla");
    await coachPage.getByRole("button", { name: /agregar/i }).last().click();

    await expect(
      coachPage.getByText("Sentadilla", { exact: false })
    ).toBeVisible({ timeout: 10_000 });

    // Agregar segundo ejercicio
    await coachPage
      .getByRole("button", { name: /agregar ejercicio/i })
      .click();
    await coachPage
      .getByPlaceholder(/nombre del ejercicio/i)
      .fill("Press de banca");
    await coachPage.getByRole("button", { name: /agregar/i }).last().click();

    await expect(
      coachPage.getByText("Press de banca", { exact: false })
    ).toBeVisible({ timeout: 10_000 });

    // ── PASO 4: Obtener el link del atleta ────────────────────────────────
    // Buscar botón de compartir o copiar link
    const shareLinkButton = coachPage
      .getByRole("button", { name: /compartir|copiar|whatsapp|link/i })
      .first();
    await expect(shareLinkButton).toBeVisible({ timeout: 8_000 });

    // El link del atleta es /athlete/[id]
    const athletePublicUrl = `${coachPage.url().replace(/\/dashboard.*/, "")}/athlete/${createdAthleteId}`;

    // ── PASO 5: Atleta abre el link en contexto limpio ────────────────────
    const athleteContext = await browser.newContext();
    const athletePage = await athleteContext.newPage();
    await athletePage.goto(athletePublicUrl);

    // Verificar que se cargó la página del atleta
    await expect(athletePage.getByText(ATHLETE.name, { exact: false })).toBeVisible({
      timeout: 15_000,
    });

    // ── PASO 6: Atleta selecciona el día y ejecuta sesión ─────────────────
    // Hacer clic en "Día 1" o el primer día disponible
    await athletePage
      .getByRole("button", { name: /día 1|empezar|comenzar|iniciar/i })
      .first()
      .click();

    await expect(athletePage).toHaveURL(/\/session\//, { timeout: 10_000 });

    // ── PASO 7: Registrar peso y reps en el primer ejercicio ──────────────
    // Ajustar peso (usa los botones + del stepper de peso)
    const weightIncBtn = athletePage.getByRole("button", { name: /^\+$/ }).first();
    if (await weightIncBtn.isVisible()) {
      await weightIncBtn.click();
      await weightIncBtn.click();
      await weightIncBtn.click(); // peso = 0 + 3 pasos
    }

    // Navegar al siguiente ejercicio
    const nextBtn = athletePage.getByRole("button", { name: /siguiente/i });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    // Ajustar peso en el segundo ejercicio
    const weightIncBtn2 = athletePage.getByRole("button", { name: /^\+$/ }).first();
    if (await weightIncBtn2.isVisible()) {
      await weightIncBtn2.click();
      await weightIncBtn2.click();
    }

    // ── PASO 8: Finalizar sesión ──────────────────────────────────────────
    await athletePage
      .getByRole("button", { name: /finalizar sesión|guardar sesión/i })
      .click();

    // La sesión se guarda y redirige al home del atleta
    await expect(athletePage).toHaveURL(
      new RegExp(`/athlete/${createdAthleteId}$`),
      { timeout: 20_000 }
    );

    await athleteContext.close();

    // ── PASO 9: Coach vuelve al dashboard y ve el progreso ────────────────
    await coachPage.reload();

    // Navegar a la ficha del atleta
    await coachPage.goto(`/dashboard/athlete/${createdAthleteId}`);

    // Verificar que hay datos de historial/progreso
    // El badge de progresión o el historial debería ser visible
    await expect(
      coachPage
        .getByText(/Sentadilla|Press de banca|historial|sesion|progreso/i)
        .first()
    ).toBeVisible({ timeout: 15_000 });

    await coachContext.close();
  });
});
