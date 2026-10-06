# Testes de API - Login

## Objetivo

Validar o comportamento do endpoint de autenticação,
incluindo cenários positivos, negativos e validações
relacionadas ao contrato da resposta.


## Endpoint 

POST usuario/store


<table>
  <tr>
    <th>ID</th>
    <th>Cenário</th>
    <th>Resultado esperado</th>
  </tr>
  <tr>
    <td>LOGIN-001</td>
    <td>Credenciais válidas</td>
    <td>200</td>
  </tr>
  <tr>
    <td>LOGIN-002</td>
    <td>E-mail inválido</td>
    <td>erro de validação</td>
  </tr>
    <tr>
    <td>LOGIN-003</td>
    <td>E-mail ausente</td>
    <td>erro de validação</td>
  </tr>
    <tr>
    <td>LOGIN-004</td>
    <td>Senha ausente</td>
    <td>erro de validação</td>
  </tr>
   <tr>
    <td>LOGIN-005</td>
    <td>E-mail inexistente</td>
    <td>erro de autenticação</td>
  </tr>
</table>