<?php

use PHPUnit\Framework\TestCase;
use App\Service\UsuarioService; 

class UsuarioServiceTest extends TestCase{
    
    private $pdo; 

    protected function setUp(): void
    {
        // banco em memória (não afeta seu sistema real)
        $this->pdo = new PDO('sqlite::memory:');

        // cria tabela fake
        $this->pdo->exec("
            CREATE TABLE usuario (
                id_user INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_user TEXT,
                email_user TEXT,
                senha_user TEXT,
                id_papel INTEGER
            )
        ");
    }

    public function testDeveCriarUsuarioComSucesso()
    {
        $service = new UsuarioService($this->pdo);

        $dados = [
            'nome' => 'PEDRO',
            'email' => 'Pedro<script/><>@gmail.com',
            'senha' => 'PeDrO@3485777'
        ];

        $id = $service->criarUsuario($dados, 1);

        $this->assertNotNull($id);

        
        $stmt = $this->pdo->query("SELECT * FROM usuario");
        $usuarios = $stmt->fetchAll();

        $this->assertCount(1, $usuarios);
        $this->assertEquals('PEDRO', $usuarios[0]['nome_user']);

        $this->assertEquals('Pedroscript@gmail.com', $usuarios[0]['email_user']);
        $this->assertNotNull($usuarios[0]['senha_user']);

    }

    /*
    public function testDeveVerificarCamposVazios(){
   
        $service = new UsuarioService($this->pdo); 

    }*/


}