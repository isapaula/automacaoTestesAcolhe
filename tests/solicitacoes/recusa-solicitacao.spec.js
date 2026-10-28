import { test, expect } from '@playwright/test';
import { fazerLoginComoProfessor } from '../support/auth.js';

test.describe('Triagem de solicitações pelo professor', () => {

  test('deve recusar uma solicitação pendente', async ({ page }) => {

    // 1. Realiza login como professor
    await fazerLoginComoProfessor(page);

    // 2. Localiza e abre a solicitação de recusa
    await page.getByRole('button', {
      name: /Paciente Teste Recusa/,
    }).click();

    // 3. Confirma que a solicitação está aguardando triagem
    const solicitacao = page.getByRole('button', {
    name: /Paciente Teste Recusa/,
    });

    await expect(
    solicitacao.getByText('Aguardando triagem', { exact: true })
    ).toBeVisible();

    // 4. Aguarda a resposta da API e solicita a recusa
    const respostaRecusa = page.waitForResponse(response =>
      response.url().includes('/solicitacao/recusar') &&
      response.request().method() === 'POST'
    );

    await page.getByRole('button', {
      name: 'Recusar solicitação',
    }).click();

    const response = await respostaRecusa;

    // 5. Valida a resposta HTTP
    console.log('Status HTTP da recusa:', response.status());

    const respostaApi = await response.json();

    console.log(
      'Resposta da API:',
      JSON.stringify(respostaApi)
    );

    expect(response.status()).toBe(200);

    expect(respostaApi.mensagem).toBe(
      'Solicitação recusada com sucesso.'
    );

    // 6. Confirma o novo status na interface
    await expect(
    solicitacao.getByText('Recusada', { exact: true })
    ).toBeVisible();

    // 7. Confirma que a ação não está mais disponível
    await expect(
      page.getByRole('button', {
        name: 'Recusar solicitação',
      })
    ).toHaveCount(0);

    console.log('Solicitação recusada com sucesso!');
  });

});
