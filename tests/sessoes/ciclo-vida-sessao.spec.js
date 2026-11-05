import { test, expect } from '@playwright/test';
import { fazerLoginComoAluno } from '../support/auth.js';

test.describe('Ciclo de vida da sessão', () => {

  test('Aluno deve registrar a realização de uma sessão encerrada, visualizar no histórico e não conseguir registrar novamente', async ({ page }) => {
    await fazerLoginComoAluno(page);

    const secaoPendentes = page.getByRole('heading', {
      name: 'Sessões aguardando registro'
    });

    await expect(secaoPendentes).toBeVisible();

    const botaoRegistrar = page.getByRole('button', {
      name: 'Registrar realização'
    });

    await expect(botaoRegistrar).toBeVisible();

    await botaoRegistrar.click();

    const modal = page.getByRole('dialog');

    await expect(modal).toBeVisible();
    // Calcula a data de ontem considerando o fuso horário de São Paulo.
    const partesData = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
    }).formatToParts(new Date());

    const ano = Number(partesData.find(p => p.type === 'year').value);
    const mes = Number(partesData.find(p => p.type === 'month').value);
    const dia = Number(partesData.find(p => p.type === 'day').value);

    const ontem = new Date(Date.UTC(ano, mes - 1, dia - 1));

    const dataEsperada = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
    }).format(ontem);

    await expect(modal).toContainText(dataEsperada);
    await expect(modal).toContainText('09:00');
    await expect(modal).toContainText('10:00');

    const observacao = 'Sessão realizada para validação do ciclo de vida.';

    await page
      .getByLabel('Observação da sessão (opcional)')
      .fill(observacao);

    // Aguarda a resposta da API que registra a realização.
    const respostaRegistroPromise = page.waitForResponse(response =>
      response.url().includes('/sessao/registrarRealizacao') &&
      response.request().method() === 'POST'
    );

    await page
      .getByRole('button', { name: 'Confirmar realização' })
      .click();

    const respostaRegistro = await respostaRegistroPromise;

    expect(respostaRegistro.status()).toBe(200);

    const dadosRegistro = await respostaRegistro.json();

    expect(dadosRegistro.sucesso).toBe(true);
    expect(dadosRegistro.status_sessao).toBe('REALIZADA');

    // Captura o ID real da sessão, sem depender de um número fixo.
    const idSessao = dadosRegistro.id_sessao;

    expect(idSessao).toBeTruthy();

    await expect(modal).not.toBeVisible();
    await expect(botaoRegistrar).not.toBeVisible();

    const historico = page.getByRole('heading', {
      name: 'Histórico de sessões realizadas'
    });

    await expect(historico).toBeVisible();
    await expect(page.getByText(observacao)).toBeVisible();

    // Simula uma nova entrada no portal.
    await page.reload();
    await fazerLoginComoAluno(page);

    await expect(
      page.getByRole('heading', {
        name: 'Histórico de sessões realizadas'
      })
    ).toBeVisible();

    await expect(page.getByText(observacao)).toBeVisible();

    // Tenta registrar novamente a mesma sessão diretamente pela API.
    const respostaDuplicada = await page.request.post(
      'http://localhost:8080/sessao/registrarRealizacao',
      {
        data: {
          id_sessao: idSessao,
          observacao: 'Tentativa de registro duplicado.'
        }
      }
    );

    expect(respostaDuplicada.status()).toBe(409);

    const dadosDuplicados = await respostaDuplicada.json();

    expect(dadosDuplicados.sucesso).toBe(false);

    expect(dadosDuplicados.erro).toBe(
      'Esta sessão já foi registrada ou não está disponível para registro.'
    );

    // A observação original deve continuar no histórico.
    await expect(page.getByText(observacao)).toBeVisible();
    await expect(
      page.getByText('Tentativa de registro duplicado.')
    ).not.toBeVisible();

    // Tenta registrar uma observação com mais de 100 caracteres.
    const observacaoLonga = 'A'.repeat(101);

    const respostaObservacaoLonga = await page.request.post(
    'http://localhost:8080/sessao/registrarRealizacao',
    {
        data: {
        id_sessao: idSessao,
        observacao: observacaoLonga
        }
    }
    );

    // O backend deve rejeitar a observação antes de tentar atualizar a sessão.
    expect(respostaObservacaoLonga.status()).toBe(400);

    const dadosObservacaoLonga = await respostaObservacaoLonga.json();

    expect(dadosObservacaoLonga.sucesso).toBe(false);

    expect(dadosObservacaoLonga.erro).toBe(
    'A observação deve ter no máximo 100 caracteres.'
    );
  });

});