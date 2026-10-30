import { expect } from '@playwright/test';
import { TEST_USERS } from './test-users.js';

export async function fazerLoginComoProfessor(page) {
  await page.goto('/');

  await page.getByRole('button', {
    name: 'Entrar',
  }).click();

  await page.getByRole('button', {
    name: 'Professor',
  }).click();

  await page.locator('input[type="text"]').fill(
    TEST_USERS.professor.email
  );

  await page.locator('input[type="password"]').fill(
    TEST_USERS.professor.password
  );

  await page.getByRole('button', {
    name: 'Entrar no Painel',
  }).click();

  await expect(
    page.getByText('Painel do Professor Supervisor')
  ).toBeVisible();
}

export async function fazerLoginComoAluno(
  page,
  usuario = TEST_USERS.aluno1
) {
  await page.goto('/');

  await page.getByRole('button', {
    name: 'Entrar',
  }).click();

  await page.getByRole('button', {
    name: 'Aluno',
  }).click();

  await page.locator('input[type="text"]').fill(
    usuario.email
  );

  await page.locator('input[type="password"]').fill(
    usuario.password
  );

  await page.getByRole('button', {
    name: 'Entrar no Painel',
  }).click();

  await expect(
    page.getByRole('button', {
      name: 'Ver casos disponíveis',
    })
  ).toBeVisible();
}