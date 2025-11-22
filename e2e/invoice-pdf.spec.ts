import { test, expect } from '@playwright/test';

test.describe('Invoice PDF Generation & VeriFactu', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@test.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');
    });

    test('should generate PDF and show VeriFactu status', async ({ page }) => {
        // 1. Navigate to invoices list
        await page.click('text=Facturas');
        await page.waitForURL('/invoices');

        // 2. Click on the first invoice to view details
        // Assuming there's at least one invoice. If not, we might need to create one first.
        // For now, we'll try to click the first row in the table
        await page.click('tbody tr:first-child');

        // 3. Verify we are on detail page
        await expect(page).toHaveURL(/\/invoices\/\d+/);

        // 4. Check initial status (might be "Sin verificar" or "Pending")
        // We look for the badge.
        // Note: The button text might vary, adjusting based on user request "Generar PDF"

        // 5. Click "Generar PDF" button
        // We need to ensure this button exists in the UI. 
        // If it doesn't exist yet, this test will fail, which is expected for TDD.
        const generatePdfBtn = page.locator('button', { hasText: 'Generar PDF' });
        await expect(generatePdfBtn).toBeVisible();
        await generatePdfBtn.click();

        // 6. Verify status changes to "Verificando..." (Processing)
        // The backend sets it to "pending" immediately.
        const badge = page.locator('[data-testid="verifactu-badge"]');
        await expect(badge).toContainText('Verificando...');

        // 7. Wait for potential update (mocked or real if backend processes it)
        // Since we don't have the actual VeriFactu consumer running, it might stay in "Verificando..."
        // or "Pending". 
        // For this test, verifying it enters the "Verificando..." state is sufficient to prove 
        // the frontend reacted to the generation event.

        // 8. Verify PDF download button appears or is enabled
        // const downloadBtn = page.locator('button', { hasText: 'Descargar PDF' });
        // await expect(downloadBtn).toBeVisible();
    });
});
