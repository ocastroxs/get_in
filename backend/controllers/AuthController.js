import { getConnection, hashPassword, Create, Read, Update, Delete } from '../config/database.js';


class AuthController {

    static async login(req, res) {
        try {
            const { email, senha } = req.body
            const senhaHash = await hashPassword(senha) // cria um hash da senha usando a função hashPassword do database.js
            const user = await Read("usuarios", `email = '${email}' AND senhaHash = '${senhaHash}'`)// le o valor de email e senha do banco de dados
            if (user.length > 0) {// verifica valor retornado ou seja se o usuario existe
                return res.status(200).json({
                    sucesso: true,
                    mensagem: "login bem-sucedido",
                    dados: user[0] // retorna resultados do usuário encontrado
                })
            } else {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "email ou senha incorretos"
                })
            }
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar login",
                erro: e.message
            })
        }
    }

    static async register(req, res) {

        try {
            const {
                nome,
                cpf,
                cel,
                email,
                idDepartamento,
                tipo,
                dataDeNascimento,
                imagem,
                senha
            } = req.body;

            // cria usuário
            const datauser = { nome, cpf, cel, email };
            const result = await Create("usuarios", datauser) // cria um novo usuário na tabela "usuarios" usando a função create do database.js

            try {
                const senhaHash = await hashPassword(senha);

                const newFunc = {
                    idUsuario: result.insertId,
                    idDepartamento,
                    tipo,
                    dataDeNascimento,
                    imagem,
                    senha: senhaHash
                };


                const resultfunc = await Create("funcionarios", newFunc);

                return res.status(201).json({
                    sucesso: true,
                    mensagem: "Usuário e funcionário criados com sucesso",
                    dados: { id: result.insertId, ...datauser },
                    dado2: { id: resultfunc.insertId, ...newFunc }
                });

            } catch (e) {
                await Delete("usuarios", `id = ${result.insertId}`);

                return res.status(500).json({
                    sucesso: false,
                    mensagem: "Erro ao registrar funcionário",
                    erro: e.message
                });
            }

        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao registrar usuário",
                erro: e.message
            });
        }

    }

    static async logout(req, res) {
        try {// aqui você pode implementar a lógica de logout, como invalidar tokens ou limpar sessões, dependendo de como você gerencia a autenticação
            return res.status(200).json({
                sucesso: true,
                mensagem: "Logout bem-sucedido"
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar Logout",
                erro: e.message
            })
        }

    }

}

export default AuthController;