import { test, expect } from '@playwright/test';
import { fazerLoginComoProfessor } from '../support/auth.js';

test('deve aprovar uma solicitação pendente', async ({ page }) => {

  await fazerLoginComoProfessor(page);

  // Seleciona o paciente correto
  await page.getByRole('button', {
    name: /Paciente Teste Aprovacao/,
  }).click();

  // Confirma que o botão de aprovação está disponível
  const botaoAprovar = page.getByRole('button', {
    name: 'Aprovar solicitação',
  });

  await expect(botaoAprovar).toBeVisible();

  // Aguarda a resposta da API ao clicar em aprovar
  const respostaApi = page.waitForResponse(response =>
    response.url().includes('/solicitacao/aprovar') &&
    response.request().method() === 'POST'
  );

  await botaoAprovar.click();

  const response = await respostaApi;

  console.log('Status HTTP da aprovação:', response.status());
  console.log('Resposta da API:', await response.text());

  // A API precisa responder com sucesso
  expect(
    response.status(),
    'A API não conseguiu aprovar a solicitação.'
  ).toBe(200);

  // O botão de aprovação não deve continuar disponível
  await expect(botaoAprovar).toHaveCount(0);

  console.log('Solicitação aprovada com sucesso!');
});
