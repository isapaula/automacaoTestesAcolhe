import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import {
  fazerLoginComoProfessor,
  fazerLoginComoAluno,
  fazerLoginComoPaciente,
} from '../support/auth.js';

import { TEST_USERS } from '../support/test-users.js';

test.describe('Fluxo completo de atendimento - Acolhe', () => {

  test('Paciente solicita atendimento, professor aprova, aluno assume e agenda, paciente visualiza a sessão', async ({ page }) => {

    const paciente = TEST_USERS.pacienteFluxoCompleto;

    const nomePaciente = paciente.nome;
    const emailPaciente = paciente.email;
    const senhaPaciente = paciente.password;

    // --------------------------------------------------
    // 1. CADASTRO DO PACIENTE
    // --------------------------------------------------

    await page.goto('/');

    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.getByRole('button', { name: 'Criar conta gratuita' }).click();

    await page.getByRole('button', { name: 'Paciente' }).first().click();
    await page.getByRole('button', { name: 'Paciente' }).last().click();

    await page.locator('input[type="text"]').nth(0).fill(nomePaciente);
    await page.locator('input[type="email"]').fill(emailPaciente);
    await page.locator('input[type="tel"]').fill(faker.phone.number());
    await page.locator('input[type="date"]').fill('1995-05-15');
    await page.locator('input[type="password"]').fill(senhaPaciente);

    await page.getByRole('checkbox').check();

    await page.getByRole('button', {
      name: 'Concluir Cadastro e Acessar',
    }).click();

  await expect(page.getByText('Seu espaço de acolhimento', { exact: true })).toBeVisible();

    // --------------------------------------------------
    // 2. PACIENTE SOLICITA ATENDIMENTO
    // --------------------------------------------------

    await page.getByRole('button', { name: 'Solicitar atendimento' }).click();

    await page.getByRole('combobox').nth(0).selectOption('10:00');

    await page.getByRole('combobox').nth(1).selectOption(
      'Plantão Psicológico e Triagem Acolhedora'
    );

    await page.getByRole('button', {
      name: 'Próximo Passo',
    }).click();

    await page.getByPlaceholder(
      'Conte um pouco do que você'
    ).fill(
      'Gostaria de solicitar atendimento psicológico para acompanhamento.'
    );

    await page.getByRole('checkbox').check();

    const respostaSolicitacao = page.waitForResponse(response =>
      response.url().includes('/solicitacao/store') &&
      response.request().method() === 'POST'
    );

    await page.getByRole('button', {
      name: 'Confirmar Solicitação de Vaga',
    }).click();

    const solicitacaoResponse = await respostaSolicitacao;

    expect(solicitacaoResponse.ok()).toBeTruthy();

    await expect(
      page.getByRole('heading', { name: 'Solicitação Recebida!' })
    ).toBeVisible();

    // --------------------------------------------------
    // 3. PROFESSOR APROVA A SOLICITAÇÃO
    // --------------------------------------------------

    await fazerLoginComoProfessor(page);

    await expect(page.getByRole('heading', { name: nomePaciente, exact: true, }) ).toBeVisible();

    const respostaAprovacao = page.waitForResponse(response =>
      response.url().includes('/solicitacao/aprovar') &&
      response.request().method() === 'POST'
    );

    await page.getByRole('button', {
      name: new RegExp(nomePaciente),
    }).click();

    await page.getByRole('button', {
      name: 'Aprovar solicitação',
    }).click();

    const aprovacaoResponse = await respostaAprovacao;

    expect(aprovacaoResponse.status()).toBe(200);

    // --------------------------------------------------
    // 4. ALUNO ASSUME O CASO
    // --------------------------------------------------

    await fazerLoginComoAluno(page, TEST_USERS.aluno1);

    await page.getByRole('button', {
      name: 'Ver casos disponíveis',
    }).click();

    const modalCasos = page.getByRole('dialog', {
      name: 'Casos disponíveis',
    });

    const casoPaciente = modalCasos.locator('article').filter({
      hasText: nomePaciente,
    });

    await expect(casoPaciente).toBeVisible();

    const respostaAtribuicao = page.waitForResponse(response =>
      response.url().includes('/aluno/assumir') &&
      response.request().method() === 'POST'
    );

    await casoPaciente.getByRole('button', {
      name: 'Assumir caso',
    }).click();

    const atribuicaoResponse = await respostaAtribuicao;

    expect(atribuicaoResponse.status()).toBe(200);

    const dadosAtribuicao = await atribuicaoResponse.json();

    expect(dadosAtribuicao.mensagem).toBe(
      'Caso assumido com sucesso!'
    );

    await expect(
      modalCasos.getByRole('status')
    ).toContainText('sucesso');

    await modalCasos.getByRole('button', {
      name: 'Fechar',
      exact: true,
    }).click();

    // --------------------------------------------------
    // 5. ALUNO AGENDA A SESSÃO
    // --------------------------------------------------

    await page.reload();

    await fazerLoginComoAluno(page, TEST_USERS.aluno1);

    await page.getByRole('button', {
      name: new RegExp(nomePaciente),
    }).click();

    await page.getByRole('button', {
      name: 'Marcar sessão',
    }).click();

    const dialogAgendamento = page.getByRole('dialog');

    const dataSessao = new Date();
    dataSessao.setDate(dataSessao.getDate() + 30);

    const dataFormatada = [
      dataSessao.getFullYear(),
      String(dataSessao.getMonth() + 1).padStart(2, '0'),
      String(dataSessao.getDate()).padStart(2, '0'),
    ].join('-');

    await dialogAgendamento.locator('#session-date').fill(dataFormatada);
    await dialogAgendamento.locator('#session-start').fill('14:00');
    await dialogAgendamento.locator('#session-end').fill('15:00');

    const respostaAgendamento = page.waitForResponse(response =>
      response.url().includes('/sessao/store') &&
      response.request().method() === 'POST'
    );

    await dialogAgendamento.getByRole('button', {
      name: 'Confirmar agendamento',
    }).click();

    const agendamentoResponse = await respostaAgendamento;

    expect(agendamentoResponse.status()).toBe(201);

    const dadosAgendamento = await agendamentoResponse.json();

    expect(dadosAgendamento.sucesso).toBe(true);

    await expect(
      page.getByRole('heading', { name: 'Sessão agendada!' })
    ).toBeVisible();

    // --------------------------------------------------
    // 6. PACIENTE ACESSA O SISTEMA E VISUALIZA A SESSÃO
    // --------------------------------------------------

    await fazerLoginComoPaciente(page, paciente);

        const respostaSessoesPaciente = await page.request.get(
    'http://localhost:8080/sessao/sessoesPaciente'
    );

    expect(respostaSessoesPaciente.ok()).toBeTruthy();

    const dadosSessoesPaciente = await respostaSessoesPaciente.json();

    expect(JSON.stringify(dadosSessoesPaciente)).toContain(dataFormatada);

    });

});