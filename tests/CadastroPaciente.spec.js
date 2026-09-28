import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';


test('Deve cadastrar um Paciente com dados válidos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login/Cadastro' }).click();
  await page.getByRole('link', { name: 'Paciente' }).click();
  await page.getByRole('textbox', { name: 'Digite o nome' }).click();
  let email = faker.internet.email();
  await page.getByRole('textbox', { name: 'Digite o nome' }).fill(faker.person.fullName());
  await page.getByRole('textbox', { name: 'Digite o e-mail' }).click();
  await page.getByRole('textbox', { name: 'Digite o e-mail' }).fill(email);
  let senha = faker.internet.password({ length: 6, memorable: true });
  await page.locator('#senha').click();
  await page.locator('#senha').fill(senha);
  await page.getByPlaceholder('Data Nascimento').fill('2021-08-06');
  await page.getByRole('textbox', { name: '(00) 00000-' }).click();
  await page.getByRole('textbox', { name: '(00) 00000-' }).fill('(83)2554-8628');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByRole('heading', { name: 'Tela de Login' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Digite seu e-mail' }).click();
  await page.getByRole('textbox', { name: 'Digite seu e-mail' }).fill(email);
  await page.getByRole('textbox', { name: '*********' }).click();
  await page.getByRole('textbox', { name: '*********' }).fill(senha);
  await page.getByRole('button', { name: 'Logar' }).click();
  await expect(page.getByRole('heading', { name: 'Seja bem vindo!' })).toBeVisible();
  

});

// npx playwright test CadastroPaciente.spec.js