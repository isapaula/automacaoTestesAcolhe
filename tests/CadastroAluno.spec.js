import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('Deve cadastrar um Aluno com dados válidos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Login/Cadastro' }).click();
  await page.getByRole('link', { name: 'Aluno' }).click();
  await page.getByRole('textbox', { name: 'Digite o nome' }).click();
  let nome = faker.person.fullName();
  await page.getByRole('textbox', { name: 'Digite o nome' }).fill(nome);
  await page.getByRole('textbox', { name: 'Digite o e-mail' }).click();
  let email = faker.internet.email();
  await page.getByRole('textbox', { name: 'Digite o e-mail' }).fill(email);
  await page.getByRole('textbox', { name: '********' }).click();
  let senha = faker.internet.password({ length: 6, memorable: true });
  await page.getByRole('textbox', { name: '********' }).fill(senha);
  await page.getByPlaceholder('digite sua matricula').click();
  let matricula =  faker.number.int({ min: 1000 })
  await page.getByPlaceholder('digite sua matricula').fill('8745');
  await page.getByPlaceholder('Qual semestre?').click();
  let semestre = faker.number.int(9)
  await page.getByPlaceholder('Qual semestre?').fill('8');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await page.getByRole('textbox', { name: 'Digite seu e-mail' }).click();
  await page.getByRole('textbox', { name: 'Digite seu e-mail' }).fill(email);
  await page.getByRole('textbox', { name: '*********' }).click();
  await page.getByRole('textbox', { name: '*********' }).fill(senha);
  await page.getByRole('button', { name: 'Logar' }).click();
  await expect(page.getByRole('heading', { name: 'Área do Aluno!' })).toBeVisible();
  await expect(page.getByRole('heading', { name: nome })).toBeVisible();
});