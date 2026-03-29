import { getConnection, Read, Create } from "../config/database.js";

class UserController {

    static async read(req, res) {
        try {
            const user = await Read("usuarios"); // lê os usuários da tabela "usuarios" usando a função read do database.js
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuários lidos com sucesso",
                dados: user
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os usuários",
                erro: e.message
            })
        }
    }


    static async create(req, res) {
        try {
            const { nome, dataNasci, cpf, cel, celE, email, tipo, imagem, senha} = req.body; // obtém os dados do usuário a partir do corpo da requisição    
            const data = {
                nome: nome,
                dataNasc: dataNasci,
                cpf: cpf,
                cel: cel,
                celE: celE,
                email: email,
                imagem: imagem,
                tipo: tipo,
                senha: senha
            }
            
            console.log(data)
            const result = await Create("usuarios", data) // cria um novo usuário na tabela "usuarios" usando a função create do database.js
            return res.status(201).json({
                sucesso: true,
                mensagem: "Usuário criado com sucesso",
            })

        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar o usuário",
                erro: e.message
            })
        }
    }


}

export default UserController;