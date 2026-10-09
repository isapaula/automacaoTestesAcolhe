import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';


test('Deve cadastrar um Paciente com dados válidos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.getByRole('button', { name: 'Criar conta gratuita' }).click();
  await page.getByRole('button', { name: 'Paciente', exact: true }).click();
  await page.getByRole('button', { name: 'Paciente' }).click();
  await page.getByRole('textbox', { name: 'Seu nome' }).click();
  await page.getByRole('textbox', { name: 'Seu nome' }).fill(faker.person.fullName());
  await page.getByRole('textbox', { name: 'email@exemplo.com' }).click();
  await page.getByRole('textbox', { name: 'email@exemplo.com' }).fill(faker.internet.email());
  await page.getByRole('textbox', { name: '(61) 99999-' }).click();
  await page.getByRole('textbox', { name: '(61) 99999-' }).fill('(82) 3818-7574');
  await page.locator('input[type="date"]').fill('2023-02-01');
  await page.getByRole('textbox', { name: 'Mínimo 6 caracteres' }).click();
  await page.getByRole('textbox', { name: 'Mínimo 6 caracteres' }).fill(faker.internet.password({ length: 6, memorable: true }));
  await page.getByRole('checkbox', { name: 'Declaro estar ciente de que' }).check();
  await page.getByRole('button', { name: 'Concluir Cadastro e Acessar' }).click();
  await expect(page.getByRole('heading', { name: 'Bem-vinda de volta, Mariana.' })).toBeVisible();

});

// novo script de teste:
// npx playwright test CadastroPaciente.spec.js