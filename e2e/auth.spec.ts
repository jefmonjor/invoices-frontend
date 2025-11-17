import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /invoices app/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Wait for validation messages
    await expect(page.getByText(/required|requerido/i).first()).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/username|usuario/i).fill('admin');
    await page.getByLabel(/password|contraseña/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/username|usuario/i).fill('invalid');
    await page.getByLabel(/password|contraseña/i).fill('invalid123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Should show error message
    await expect(page.getByText(/error/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/username|usuario/i).fill('admin');
    await page.getByLabel(/password|contraseña/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/.*dashboard/);

    // Logout
    await page.getByRole('button', { name: /cerrar sesión/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});
