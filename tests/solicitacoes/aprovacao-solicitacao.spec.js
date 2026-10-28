import { test, expect } from '@playwright/test';
import { fazerLoginComoProfessor } from '../support/auth.js';

test.describe('Triagem de solicitações pelo professor', () => {

  test('deve aprovar uma solicitação pendente', async ({ page }) => {

    // 1. Realiza login como professor
    await fazerLoginComoProfessor(page);

    // 2. Localiza e abre a solicitação do paciente de aprovação
    await page.getByRole('button', {
      name: /Paciente Teste Aprovacao/,
    }).click();

    // 3. Confirma que a solicitação está aguardando triagem
    await expect(
      page.getByText('Aguardando triagem', { exact: true })
    ).toBeVisible();

    // 4. Aprova a solicitação
    await page.getByRole('button', {
      name: 'Aprovar solicitação',
    }).click();

    // 5. Confirma que o novo status foi apresentado
    await expect(
      page.getByText('Aprovada', { exact: true })
    ).toBeVisible();

    // 6. Confirma que a ação de aprovação não está mais disponível
    await expect(
      page.getByRole('button', {
        name: 'Aprovar solicitação',
      })
    ).toHaveCount(0);

    console.log('Solicitação aprovada com sucesso.');
  });


  test('deve recusar uma solicitação pendente', async ({ page }) => {

    // 1. Realiza login como professor
    await fazerLoginComoProfessor(page);

    // 2. Localiza e abre a solicitação do paciente de recusa
    await page.getByRole('button', {
      name: /Paciente Teste Recusa/,
    }).click();

    // 3. Confirma que a solicitação está aguardando triagem
    await expect(
      page.getByText('Aguardando triagem', { exact: true })
    ).toBeVisible();

    // 4. Recusa a solicitação
    await page.getByRole('button', {
      name: 'Recusar solicitação',
    }).click();

    // 5. Confirma que o novo status foi apresentado
    await expect(
      page.getByText('Recusada', { exact: true })
    ).toBeVisible();

    // 6. Confirma que a ação de recusa não está mais disponível
    await expect(
      page.getByRole('button', {
        name: 'Recusar solicitação',
      })
    ).toHaveCount(0);

    console.log('Solicitação recusada com sucesso.');
  });

});


// solicitacoes/aprovacao-solicitacao.spec

// npx playwright test tests/solicitacoes/aprovacao-solicitacao.spec --project=firefox