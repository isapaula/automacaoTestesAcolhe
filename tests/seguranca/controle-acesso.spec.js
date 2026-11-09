import { test, expect } from '@playwright/test';
import { fazerLoginComoAluno, fazerLoginComoProfessor } from '../support/auth.js';
import { TEST_USERS } from '../support/test-users.js';

const BACKEND_URL = 'http://localhost:8080';

test.describe('Controle de acesso às sessões', () => {

  test('Aluno 2 não deve conseguir registrar sessão pertencente ao Aluno 1', async ({ browser }) => {

    // --------------------------------------------------
    // 1. Aluno 1 faz login e consulta suas sessões
    // --------------------------------------------------

    const contextoAluno1 = await browser.newContext();
    const pageAluno1 = await contextoAluno1.newPage();

    await fazerLoginComoAluno(pageAluno1, TEST_USERS.aluno1);

    const respostaSessoesAluno1 = await pageAluno1.request.get(
      `${BACKEND_URL}/sessao/sessoesAguardandoRegistro`
    );

    expect(respostaSessoesAluno1.status()).toBe(200);

    const dadosSessoesAluno1 = await respostaSessoesAluno1.json();

    expect(dadosSessoesAluno1.sessoes).toBeDefined();
    expect(dadosSessoesAluno1.sessoes.length).toBeGreaterThan(0);

    // A sessão retornada pertence ao Aluno 1.
    const sessaoAluno1 = dadosSessoesAluno1.sessoes[0];

    expect(sessaoAluno1.id_sessao).toBeDefined();

    const idSessaoAluno1 = Number(sessaoAluno1.id_sessao);

    console.log(
      `Sessão selecionada do Aluno 1: ${idSessaoAluno1}`
    );


    // --------------------------------------------------
    // 2. Aluno 2 faz login em outro contexto
    // --------------------------------------------------

    const contextoAluno2 = await browser.newContext();
    const pageAluno2 = await contextoAluno2.newPage();

    await fazerLoginComoAluno(pageAluno2, TEST_USERS.aluno2);


    // --------------------------------------------------
    // 3. Aluno 2 tenta registrar a sessão do Aluno 1
    // --------------------------------------------------

    const respostaRegistro = await pageAluno2.request.post(
      `${BACKEND_URL}/sessao/registrarRealizacao`,
      {
        data: {
          id_sessao: idSessaoAluno1,
          observacao: 'Tentativa de acesso indevido.',
        },
      }
    );

    // O backend deve impedir o acesso porque
    // a sessão pertence ao Aluno 1.
    expect(respostaRegistro.status()).toBe(404);

    const dadosRegistro = await respostaRegistro.json();

    expect(dadosRegistro.sucesso).toBe(false);

    expect(dadosRegistro.erro).toContain(
      'Sessão não encontrada para este aluno'
    );

    // --------------------------------------------------
    // 4. Aluno 1 consulta novamente sua sessão
    // --------------------------------------------------

    const respostaSessoesDepois = await pageAluno1.request.get(
      `${BACKEND_URL}/sessao/sessoesAguardandoRegistro`
    );

    expect(respostaSessoesDepois.status()).toBe(200);

    const dadosSessoesDepois = await respostaSessoesDepois.json();

    const sessaoContinuaDisponivel =
      dadosSessoesDepois.sessoes.some(
        (sessao) =>
          Number(sessao.id_sessao) === idSessaoAluno1
      );

    // Se o ataque tivesse conseguido registrar a sessão,
    // ela deixaria de estar AGENDADA e não apareceria mais
    // nesta lista.
    expect(sessaoContinuaDisponivel).toBe(true);


    // --------------------------------------------------
    // 5. Aluno 2 não deve enxergar a sessão do Aluno 1
    // --------------------------------------------------

    const respostaSessoesAluno2 = await pageAluno2.request.get(
      `${BACKEND_URL}/sessao/sessoesAguardandoRegistro`
    );

    expect(respostaSessoesAluno2.status()).toBe(200);

    const dadosSessoesAluno2 =
      await respostaSessoesAluno2.json();

    const encontrouSessaoDoAluno1 =
      dadosSessoesAluno2.sessoes.some(
        (sessao) =>
          Number(sessao.id_sessao) === idSessaoAluno1
      );

    expect(encontrouSessaoDoAluno1).toBe(false);


    await contextoAluno2.close();
    await contextoAluno1.close();
  });


    test('Aluno 2 não deve conseguir agendar solicitação pertencente ao Aluno 1', async ({ browser }) => {

    // --------------------------------------------------
    // 1. Aluno 1 consulta suas solicitações assumidas
    // --------------------------------------------------

    const contextoAluno1 = await browser.newContext();
    const pageAluno1 = await contextoAluno1.newPage();

    await fazerLoginComoAluno(pageAluno1, TEST_USERS.aluno1);

    const respostaCasos = await pageAluno1.request.get(
        `${BACKEND_URL}/aluno/casosDisponiveis`
    );

    expect(respostaCasos.status()).toBe(200);

    const dadosCasos = await respostaCasos.json();

    expect(dadosCasos.casos_assumidos).toBeDefined();
    expect(dadosCasos.casos_assumidos.length).toBeGreaterThan(0);

    // Seleciona uma solicitação que pertence ao Aluno 1.
    const solicitacaoAluno1 = dadosCasos.casos_assumidos[0];

    const idSolicitacaoAluno1 = Number(
        solicitacaoAluno1.id_solicitacao
    );

    expect(idSolicitacaoAluno1).toBeGreaterThan(0);

    console.log(
        `Solicitação pertencente ao Aluno 1: ${idSolicitacaoAluno1}`
    );


    // --------------------------------------------------
    // 2. Aluno 1 consulta suas sessões antes da tentativa
    // --------------------------------------------------

    const respostaAntes = await pageAluno1.request.get(
        `${BACKEND_URL}/sessao/proximasSessoes`
    );

    expect(respostaAntes.status()).toBe(200);

    const dadosAntes = await respostaAntes.json();

    expect(dadosAntes.sessoes).toBeDefined();

    const idsSessoesAntes = dadosAntes.sessoes
        .map(sessao => Number(sessao.id_sessao))
        .sort((a, b) => a - b);


    // --------------------------------------------------
    // 3. Aluno 2 faz login em outro contexto
    // --------------------------------------------------

    const contextoAluno2 = await browser.newContext();
    const pageAluno2 = await contextoAluno2.newPage();

    await fazerLoginComoAluno(pageAluno2, TEST_USERS.aluno2);


    // --------------------------------------------------
    // 4. Aluno 2 tenta agendar a solicitação do Aluno 1
    // --------------------------------------------------

    const respostaAgendamento = await pageAluno2.request.post(
        `${BACKEND_URL}/sessao/store`,
        {
        data: {
            id_solicitacao: idSolicitacaoAluno1,
            data_sessao: '2099-12-30',
            hora_inicio: '14:00',
            hora_fim: '15:00',
        },
        }
    );

    expect(respostaAgendamento.status()).toBe(403);

    const dadosAgendamento = await respostaAgendamento.json();

    expect(dadosAgendamento.sucesso).toBe(false);

    expect(dadosAgendamento.erro).toContain(
        'não pertence a este aluno'
    );


    // --------------------------------------------------
    // 5. Aluno 1 consulta novamente suas sessões
    // --------------------------------------------------

    const respostaDepois = await pageAluno1.request.get(
        `${BACKEND_URL}/sessao/proximasSessoes`
    );

    expect(respostaDepois.status()).toBe(200);

    const dadosDepois = await respostaDepois.json();

    const idsSessoesDepois = dadosDepois.sessoes
        .map(sessao => Number(sessao.id_sessao))
        .sort((a, b) => a - b);

    // Nenhuma sessão nova deve ter sido criada.
    expect(idsSessoesDepois).toEqual(idsSessoesAntes);


    await contextoAluno2.close();
    await contextoAluno1.close();
    });

    test('Usuário não autenticado não deve acessar endpoints protegidos de sessões', async ({ browser }) => {

    // Cria um contexto novo, sem realizar login.
    const contextoAnonimo = await browser.newContext();
    const pageAnonima = await contextoAnonimo.newPage();

    // 1. Tenta consultar as próximas sessões.
    const respostaProximas = await pageAnonima.request.get(
        `${BACKEND_URL}/sessao/proximasSessoes`
    );

    expect(respostaProximas.status()).toBe(401);

    // 2. Tenta consultar sessões aguardando registro.
    const respostaAguardando = await pageAnonima.request.get(
        `${BACKEND_URL}/sessao/sessoesAguardandoRegistro`
    );

    expect(respostaAguardando.status()).toBe(401);

    // 3. Tenta agendar uma sessão sem estar autenticado.
    const respostaAgendamento = await pageAnonima.request.post(
        `${BACKEND_URL}/sessao/store`,
        {
        data: {
            id_solicitacao: 54,
            data_sessao: '2099-12-30',
            hora_inicio: '14:00',
            hora_fim: '15:00',
        },
        }
    );

    expect(respostaAgendamento.status()).toBe(401);

    await contextoAnonimo.close();
    });

    test('Professor não deve acessar endpoints exclusivos de aluno', async ({ browser }) => {

    // 1. Professor faz login.
    const contextoProfessor = await browser.newContext();
    const pageProfessor = await contextoProfessor.newPage();

    await fazerLoginComoProfessor(pageProfessor);

    // 2. Professor tenta consultar os casos disponíveis de aluno.
    const respostaCasos = await pageProfessor.request.get(
        `${BACKEND_URL}/aluno/casosDisponiveis`
    );

    expect(respostaCasos.status()).toBe(403);

    // 3. Professor tenta consultar os dados de aluno.
    const respostaDados = await pageProfessor.request.get(
        `${BACKEND_URL}/aluno/dadosAluno`
    );

    expect(respostaDados.status()).toBe(403);

    await contextoProfessor.close();
    });
});