import { test, expect } from '@playwright/test';
import { fazerLoginComoAluno } from '../support/auth.js';
import { TEST_USERS } from '../support/test-users.js';

const PACIENTE_AGENDAMENTO = 'Paciente Teste Agendamento';

// Gera uma data 30 dias à frente, usando o calendário local.
function obterDataFutura(dias = 30) {
  const data = new Date();
  data.setDate(data.getDate() + dias);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

test.describe('Agendamento de sessões pelo aluno', () => {
  test('Aluno deve agendar uma sessão para um paciente assumido', async ({
    page,
  }) => {
    const dataSessao = obterDataFutura();
    const horaInicio = '14:00';
    const horaFim = '15:00';

    // 1. Login como Aluno Teste 1.
    await fazerLoginComoAluno(page, TEST_USERS.aluno1);

    // 2. Localiza e seleciona o paciente exclusivo deste teste.
    const paciente = page.getByRole('button', {
      name: PACIENTE_AGENDAMENTO,
    });

    await expect(paciente).toBeVisible();
    await paciente.click();

    // 3. Abre o modal de agendamento.
    await page.getByRole('button', {
      name: 'Marcar sessão',
    }).click();

    const modal = page.getByRole('dialog');

    await expect(modal).toBeVisible();
    await expect(
      modal.getByText(PACIENTE_AGENDAMENTO)
    ).toBeVisible();

    // 4. Preenche os dados da sessão.
    await modal.locator('#session-date').fill(dataSessao);
    await modal.locator('#session-start').fill(horaInicio);
    await modal.locator('#session-end').fill(horaFim);

    // 5. Aguarda a consulta de próximas sessões que será
    // disparada após o agendamento ser confirmado.
    const respostaProximasSessoes = page.waitForResponse(
      (response) =>
        response.url().includes('/sessao/proximasSessoes') &&
        response.request().method() === 'GET'
    );

    // 6. Confirma o agendamento.
    await modal.getByRole('button', {
      name: 'Confirmar agendamento',
    }).click();

    // 7. Verifica a confirmação apresentada pelo frontend.
    await expect(
      modal.getByRole('heading', {
        name: 'Sessão agendada!',
      })
    ).toBeVisible();

    await expect(
      modal.getByText(
        `A sessão de ${PACIENTE_AGENDAMENTO} foi registrada com sucesso.`
      )
    ).toBeVisible();

    // 8. Verifica se a API retornou a sessão recém-agendada.
    const response = await respostaProximasSessoes;

    expect(
      response.ok(),
      'A consulta de próximas sessões deveria retornar sucesso.'
    ).toBeTruthy();

    const dados = await response.json();

    expect(
      Array.isArray(dados.sessoes),
      'A API deveria retornar uma lista de sessões.'
    ).toBeTruthy();

    const sessaoEncontrada = dados.sessoes.some((sessao) => {
      const mesmaData = String(sessao.data_sessao).startsWith(dataSessao);
      const mesmoInicio = String(sessao.hora_inicio).startsWith(horaInicio);
      const mesmoFim = String(sessao.hora_fim).startsWith(horaFim);

      return mesmaData && mesmoInicio && mesmoFim;
    });

    expect(
      sessaoEncontrada,
      'A sessão agendada deveria aparecer na consulta de próximas sessões.'
    ).toBeTruthy();
  });
});
