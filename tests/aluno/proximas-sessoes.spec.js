import { test, expect } from '@playwright/test';
import { fazerLoginComoAluno } from '../support/auth.js';
import { TEST_USERS } from '../support/test-users.js';

const PACIENTE_PROXIMAS_SESSOES = 'Paciente Teste Proximas Sessoes';

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
   
    // 3. Filtra somente as sessões do paciente deste cenário.
    const sessoesDoPaciente = dados.sessoes.filter(
      (sessao) => sessao.nome_paciente === PACIENTE_PROXIMAS_SESSOES
    );

    expect(
      sessoesDoPaciente.length,
      'O paciente deveria possuir três sessões futuras.'
    ).toBe(3);

    // 4. Verifica a ordem cronológica das sessões do paciente.
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

    const sessoesRecebidas = sessoesDoPaciente.map((sessao) => ({
      data: String(sessao.data_sessao).slice(0, 10),
      inicio: String(sessao.hora_inicio).slice(0, 5),
      fim: String(sessao.hora_fim).slice(0, 5),
    }));

    expect(
      sessoesRecebidas,
      'As sessões do paciente deveriam estar ordenadas por data e horário.'
    ).toEqual(sessoesEsperadas);

    // 5. Verifica se a API retorna as sessões globalmente ordenadas.
    const sessoesOrdenadas = [...dados.sessoes].sort((a, b) => {
      const dataA = `${a.data_sessao} ${a.hora_inicio}`;
      const dataB = `${b.data_sessao} ${b.hora_inicio}`;

      return dataA.localeCompare(dataB);
    });

    expect(
      dados.sessoes.map((sessao) => ({
        data: String(sessao.data_sessao).slice(0, 10),
        inicio: String(sessao.hora_inicio).slice(0, 5),
      }))
    ).toEqual(
      sessoesOrdenadas.map((sessao) => ({
        data: String(sessao.data_sessao).slice(0, 10),
        inicio: String(sessao.hora_inicio).slice(0, 5),
      }))
    );

    // 6. Verifica se o painel apresenta a sessão globalmente mais próxima.
    const proximaSessao = dados.sessoes[0];

    await expect(
      page.getByText('Próxima sessão', { exact: true })
    ).toBeVisible();

    await expect(
      page.getByText(proximaSessao.nome_paciente, {
        exact: true,
      }).first()
    ).toBeVisible();

    await expect(
      page.getByText(
        formatarData(String(proximaSessao.data_sessao).slice(0, 10)),
        { exact: false }
      )
    ).toBeVisible();

    await expect(
      page.getByText(
        `${String(proximaSessao.hora_inicio).slice(0, 5)} às ${String(proximaSessao.hora_fim).slice(0, 5)}`,
        { exact: true }
      )
    ).toBeVisible();
  });
});
