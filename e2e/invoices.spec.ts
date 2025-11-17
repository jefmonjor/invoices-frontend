import { test, expect } from '@playwright/test';

// Helper to login before tests
async function login(page: any) {
  await page.goto('/login');
  await page.getByLabel(/username|usuario/i).fill('admin');
  await page.getByLabel(/password|contraseña/i).fill('admin123');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/.*dashboard/);
}

test.describe('Invoices Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display invoices list page', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page.getByRole('heading', { name: /facturas/i })).toBeVisible();
  });

  test('should navigate to create invoice page', async ({ page }) => {
    await page.goto('/invoices');
    await page.getByRole('button', { name: /nueva factura|crear/i }).click();
    await expect(page).toHaveURL(/.*invoices\/create/);
  });

  test('should show invoice wizard steps', async ({ page }) => {
    await page.goto('/invoices/create');

    // Should show stepper
    await expect(page.getByText(/empresa/i).first()).toBeVisible();
    await expect(page.getByText(/cliente/i).first()).toBeVisible();
  });

  test('should search invoices', async ({ page }) => {
    await page.goto('/invoices');

    const searchInput = page.getByPlaceholder(/buscar|search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('INV');
      // Wait for search results
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Invoice Detail', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should view invoice details', async ({ page }) => {
    await page.goto('/invoices');

    // Click on first invoice if exists
    const firstInvoice = page.getByRole('row').nth(1);
    if (await firstInvoice.isVisible()) {
      await firstInvoice.click();

      // Should show invoice details
      await expect(page.getByText(/factura|invoice/i)).toBeVisible();
    }
  });
});
