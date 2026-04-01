import { getConnection, hashPassword, Create, Read, Update, Delete, FindOne } from '../config/database.js';


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
                celular,
                email,
                idDepartamento,
                tipo,
                dataDeNascimento,
                imagem,
                senha
            } = req.body;

            let datauser
            let idUsuario

            //verifica se o usuario já existe
            const usuarioExistente = await FindOne("usuarios", "cpf = ? or email = ?", [cpf, email]);

            if (usuarioExistente) {
                idUsuario = usuarioExistente.id

            } else {
                // cria usuário
                datauser = { nome, cpf, celular, email };
                idUsuario = await Create("usuarios", datauser) // cria um novo usuário na tabela "usuarios" usando a função create do database.js

            }
            //verifica se a um registro na tabela funcionarios
            const funcExistente = await FindOne(
                "funcionarios",
                "idUsuario = ?",
                [idUsuario]
            );

            if (funcExistente) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Usuário já é funcionário"
                });
            }
            //segue apenas se não tiver um registro em ambas as tabelas



            try {

                const senhaHash = await hashPassword(senha);

                const newFunc = {
                    idUsuario,
                    idDepartamento,
                    tipo,
                    dataDeNascimento,
                    imagem,
                    senhaHash: senhaHash
                };

                const resultfunc = await Create("funcionarios", newFunc);

                return res.status(201).json({
                    sucesso: true,
                    mensagem: "Usuário e funcionário criados com sucesso",
                    dados: { id: idUsuario, ...datauser },
                    dado2: { id: resultfunc, ...newFunc }
                });

            } catch (e) {
                if (!usuarioExistente) {//deleta o usuario soamente se ele foi criado agora 
                    await Delete("usuarios", `id = ${result}`);
                }
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