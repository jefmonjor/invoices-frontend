import { test, expect } from '@playwright/test';

// ⚠️ IMPORTANTE: Actualiza estas credenciales con las de tu entorno
// El backend requiere un email válido, no un username
const TEST_EMAIL = 'admin@invoices.com'; // Cambiar por email válido de tu backend
const TEST_PASSWORD = 'admin123'; // Cambiar por contraseña correcta

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

    await page.getByLabel(/email|correo/i).fill(TEST_EMAIL);
    await page.getByLabel(/password|contraseña/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email|correo/i).fill('invalid@example.com');
    await page.getByLabel(/password|contraseña/i).fill('invalid123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Should show error message
    await expect(page.getByText(/error|inválid/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email|correo/i).fill(TEST_EMAIL);
    await page.getByLabel(/password|contraseña/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/.*dashboard/);

    // Logout
    await page.getByRole('button', { name: /cerrar sesión/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});
