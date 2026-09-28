import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('Deve cadastrar um Professor com dados válidos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login/Cadastro' }).click();
  await page.getByRole('link', { name: 'Professor' }).click();
  await page.getByRole('textbox', { name: 'Digite o nome' }).click();
  let nome = faker.person.fullName();
  await page.getByRole('textbox', { name: 'Digite o nome' }).fill(nome);
  await page.getByRole('textbox', { name: 'Digite o e-mail' }).click();
  let email = faker.internet.email();
  await page.getByRole('textbox', { name: 'Digite o e-mail' }).fill(email);
  await page.locator('#senha').click();
  let senha = faker.internet.password({ length: 6, memorable: true });
  await page.locator('#senha').fill(senha);
  await page.locator('#rp').click();
  await page.locator('#rp').fill('1235');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await page.getByRole('textbox', { name: 'Digite seu e-mail' }).click();
  await page.getByRole('textbox', { name: 'Digite seu e-mail' }).fill(email);
  await page.getByRole('textbox', { name: '*********' }).click();
  await page.getByRole('textbox', { name: '*********' }).fill(senha);
  await page.getByRole('button', { name: 'Logar' }).click();
  await expect(page.getByRole('heading', { name: 'Bem vindo, Professor!' })).toBeVisible();
  await page.waitForTimeout(4000);
});