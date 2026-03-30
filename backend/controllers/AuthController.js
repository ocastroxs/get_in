import { getConnection, Create, Read, Update, Delete } from '../config/database.js';
class AuthController {

    static async login(req, res) {
        try {
            const { email, senha } = req.body
            const user = await Read("usuarios", `email = '${email}' AND senha = '${senha}'`)// le o valor de email e senha do banco de dados
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
            const { nome, email, senha, cpf, tipo_usuario } = req.body
            const newUser = {
                nome,
                email,
                senha,
                cpf,
                tipo_usuario
            }
            const result = await Create("usuarios", newUser)// cria um novo usuario na tabela "usuarios" usando a função create do database.js
            return res.status(201).json({
                sucesso: true,
                mensagem: "Usuário registrado com sucesso",
                dados: { id: result.insertId, ...newUser } // retorna o ID do novo usuário junto com os dados fornecidos
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao registrar usuário",
                erro: e.message
            })
        }
    }

    static async logout(req, res) {
        try {// aqui você pode implementar a lógica de logout, como invalidar tokens ou limpar sessões, dependendo de como você gerencia a autenticação
            return res.status(200).json({
                sucesso: true,
                mensagem: "Logout bem-sucedido"
            })
        } catch (E) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar Logout",
                erro: e.message
            })
        }

    }

}

export default AuthController;