import { test, expect } from '@playwright/test';
import { fazerLoginComoAluno } from '../support/auth.js';
import { TEST_USERS } from '../support/test-users.js';

const PACIENTE_PROXIMAS_SESSOES =
  'Paciente Teste Proximas Sessoes';

// Calcula uma data futura no calendário local.
function obterDataFutura(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

// Converte YYYY-MM-DD para DD/MM/YYYY.
function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

test.describe('Consulta das próximas sessões', () => {
  test('Aluno deve visualizar a próxima sessão e receber as sessões em ordem cronológica', async ({
    page,
  }) => {
    // Datas esperadas conforme o seed SQL.
    const dataPrimeirasSessoes = obterDataFutura(35);
    const dataTerceiraSessao = obterDataFutura(40);

    // Aguarda a chamada da API durante o carregamento do painel.
    const respostaProximasSessoes = page.waitForResponse(
      (response) =>
        response.url().includes('/sessao/proximasSessoes') &&
        response.request().method() === 'GET'
    );

    // 1. Login como Aluno Teste 1.
    await fazerLoginComoAluno(page, TEST_USERS.aluno1);

    // 2. Verifica se a consulta da API foi bem-sucedida.
    const response = await respostaProximasSessoes;

    expect(
      response.ok(),
      'A API de próximas sessões deveria retornar sucesso.'
    ).toBeTruthy();

    const dados = await response.json();

    expect(
      Array.isArray(dados.sessoes),
      'A API deveria retornar uma lista de sessões.'
    ).toBeTruthy();

    // 3. Verifica se as três sessões do seed foram retornadas.
    expect(
      dados.sessoes.length,
      'Deveriam existir três sessões futuras para o cenário de teste.'
    ).toBe(3);

    // 4. Verifica a ordem cronológica:
    // primeiro data, depois horário de início.
    const sessoesEsperadas = [
      {
        data: dataPrimeirasSessoes,
        inicio: '10:00',
        fim: '11:00',
      },
      {
        data: dataPrimeirasSessoes,
        inicio: '14:00',
        fim: '15:00',
      },
      {
        data: dataTerceiraSessao,
        inicio: '09:00',
        fim: '10:00',
      },
    ];

    const sessoesRecebidas = dados.sessoes.map((sessao) => ({
      data: String(sessao.data_sessao).slice(0, 10),
      inicio: String(sessao.hora_inicio).slice(0, 5),
      fim: String(sessao.hora_fim).slice(0, 5),
    }));

    expect(
      sessoesRecebidas,
      'As sessões deveriam estar ordenadas por data e horário de início.'
    ).toEqual(sessoesEsperadas);

    // 5. Verifica se todas as sessões pertencem ao paciente de teste.
    for (const sessao of dados.sessoes) {
      expect(sessao.nome_paciente).toBe(
        PACIENTE_PROXIMAS_SESSOES
      );
    }

    // 6. Verifica a próxima sessão apresentada no painel.
    await expect(
      page.getByText('Próxima sessão', { exact: true })
    ).toBeVisible();

    await expect(
      page.getByText(PACIENTE_PROXIMAS_SESSOES, {
        exact: true,
      }).first()
    ).toBeVisible();

    // A primeira sessão deve ser a de 10h, não a de 14h.
    await expect(
      page.getByText(formatarData(dataPrimeirasSessoes), {
        exact: false,
      })
    ).toBeVisible();

    await expect(
      page.getByText('10:00 às 11:00', {
        exact: true,
      })
    ).toBeVisible();
  });
});
