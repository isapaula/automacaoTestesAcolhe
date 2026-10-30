import { test, expect } from '@playwright/test';
import { fazerLoginComoAluno } from '../support/auth.js';
import { TEST_USERS } from '../support/test-users.js';

test.describe('Atribuição de solicitações ao aluno', () => {

  test('Aluno 1 deve assumir sua solicitação aprovada', async ({ page }) => {

    const nomePaciente = 'Paciente Teste Atribuicao 1';

    // 1. Login como Aluno Teste 1
    await fazerLoginComoAluno(page, TEST_USERS.aluno1);

    // 2. Abrir modal de casos disponíveis
    await page.getByRole('button', {
      name: 'Ver casos disponíveis',
    }).click();

    const modal = page.getByRole('dialog', {
      name: 'Casos disponíveis',
    });

    await expect(modal).toBeVisible();

    // 3. Localizar especificamente o paciente do Aluno 1
    const caso = modal.locator('article').filter({
      hasText: nomePaciente,
    });

    await expect(caso).toBeVisible();

    // 4. Aguardar a resposta da API ao assumir o caso
    const respostaAssuncao = page.waitForResponse(response =>
      response.url().includes('/aluno/assumir') &&
      response.request().method() === 'POST'
    );

    await caso.getByRole('button', {
      name: 'Assumir caso',
    }).click();

    const response = await respostaAssuncao;

    console.log('Status HTTP da atribuição - Aluno 1:', response.status());

    const respostaApi = await response.json();

    console.log(
      'Resposta da API - Aluno 1:',
      JSON.stringify(respostaApi)
    );

    // 5. Validar resposta da API
    expect(response.status()).toBe(200);

    expect(respostaApi.mensagem).toBe(
      'Caso assumido com sucesso!'
    );

    expect(respostaApi.id_solicitacao).toBeGreaterThan(0);

    // 6. Validar mensagem de sucesso na interface
    await expect(
      modal.getByRole('status')
    ).toContainText('Caso assumido com sucesso!');

    // 7. O caso não deve continuar disponível
    await expect(caso).toHaveCount(0);

    // 8. Fechar modal
    await modal.getByRole('button', {
    name: 'Fechar',
    exact: true,
    }).click();

    // 9. Recarregar a página
    await page.reload();

    // 10. Fazer login novamente como aluno
    await fazerLoginComoAluno(page, TEST_USERS.aluno1);

    // 11. Validar que o paciente aparece no painel de detalhes
    const pacienteHeading = page.getByRole('heading', {
        name: nomePaciente,
        exact: true
    }).first();

    await expect(pacienteHeading).toBeVisible();

    console.log('Aluno 1 assumiu a solicitação corretamente.');
  });


  test('Aluno 2 deve assumir sua solicitação aprovada', async ({ page }) => {

    const nomePaciente = 'Paciente Teste Atribuicao 2';

    // 1. Login como Aluno Teste 2
    await fazerLoginComoAluno(page, TEST_USERS.aluno2);

    // 2. Abrir modal de casos disponíveis
    await page.getByRole('button', {
      name: 'Ver casos disponíveis',
    }).click();

    const modal = page.getByRole('dialog', {
      name: 'Casos disponíveis',
    });

    await expect(modal).toBeVisible();

    // 3. Localizar especificamente o paciente do Aluno 2
    const caso = modal.locator('article').filter({
      hasText: nomePaciente,
    });

    await expect(caso).toBeVisible();

    // 4. Aguardar a resposta da API ao assumir o caso
    const respostaAssuncao = page.waitForResponse(response =>
      response.url().includes('/aluno/assumir') &&
      response.request().method() === 'POST'
    );

    await caso.getByRole('button', {
      name: 'Assumir caso',
    }).click();

    const response = await respostaAssuncao;

    console.log('Status HTTP da atribuição - Aluno 2:', response.status());

    const respostaApi = await response.json();

    console.log(
      'Resposta da API - Aluno 2:',
      JSON.stringify(respostaApi)
    );

    // 5. Validar resposta da API
    expect(response.status()).toBe(200);

    expect(respostaApi.mensagem).toBe(
      'Caso assumido com sucesso!'
    );

    expect(respostaApi.id_solicitacao).toBeGreaterThan(0);

    // 6. Validar mensagem de sucesso na interface
    await expect(
      modal.getByRole('status')
    ).toContainText('Caso assumido com sucesso!');

    // 7. O caso não deve continuar disponível
    await expect(caso).toHaveCount(0);

    // 8. Fechar modal
    await modal.getByRole('button', {
    name: 'Fechar',
    exact: true,
    }).click();

    // 9. Recarregar a página
    await page.reload();

    // 10. Fazer login novamente como aluno
    await fazerLoginComoAluno(page, TEST_USERS.aluno2);

    // 11. Validar que o paciente aparece no painel de detalhes
    const pacienteHeading = page.getByRole('heading', {
        name: nomePaciente,
        exact: true
    }).first();

    await expect(pacienteHeading).toBeVisible();

    console.log('Aluno 2 assumiu a solicitação corretamente.');
  });

});
