import { test, expect } from '@playwright/test';
import { fazerLoginComoAluno } from '../support/auth.js';
import { TEST_USERS } from '../support/test-users.js';

const PACIENTE_AGENDAMENTO = 'Paciente Teste Agendamento';

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

    // 1. Login como aluno.
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

    // 5. Aguarda a resposta do POST responsável pelo agendamento.
    const respostaAgendamento = page.waitForResponse(
      (response) =>
        response.url().includes('/sessao/store') &&
        response.request().method() === 'POST'
    );

    // 6. Confirma o agendamento.
    await modal.getByRole('button', {
      name: 'Confirmar agendamento',
    }).click();

    const responseAgendamento = await respostaAgendamento;

    expect(
      responseAgendamento.status(),
      'O agendamento deveria retornar HTTP 201.'
    ).toBe(201);

    const dadosAgendamento = await responseAgendamento.json();

    expect(
      dadosAgendamento.sucesso,
      'A API deveria confirmar o agendamento.'
    ).toBeTruthy();

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

    // 8. Consulta explicitamente as próximas sessões após o agendamento.
    const respostaProximasSessoes = await page.request.get(
      'http://localhost:8080/sessao/proximasSessoes'
    );

    expect(
      respostaProximasSessoes.ok(),
      'A consulta de próximas sessões deveria retornar sucesso.'
    ).toBeTruthy();

    const dadosSessoes = await respostaProximasSessoes.json();

    expect(
      Array.isArray(dadosSessoes.sessoes),
      'A API deveria retornar uma lista de sessões.'
    ).toBeTruthy();

    // 9. Verifica se a sessão recém-agendada aparece na consulta.
    const sessaoEncontrada = dadosSessoes.sessoes.some((sessao) => {
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
