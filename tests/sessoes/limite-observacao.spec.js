import { test, expect } from '@playwright/test';
import { fazerLoginComoAluno } from '../support/auth.js';

test.describe('Validação da observação da sessão', () => {

  test('Backend deve rejeitar observação com mais de 100 caracteres', async ({ page }) => {
    await fazerLoginComoAluno(page);

    const observacaoLonga = 'A'.repeat(101);

    const resposta = await page.request.post(
      'http://localhost:8080/sessao/registrarRealizacao',
      {
        data: {
          id_sessao: 1,
          observacao: observacaoLonga
        }
      }
    );

    expect(resposta.status()).toBe(400);

    const dados = await resposta.json();

    expect(dados.sucesso).toBe(false);

    expect(dados.erro).toBe(
      'A observação deve ter no máximo 100 caracteres.'
    );
  });

});