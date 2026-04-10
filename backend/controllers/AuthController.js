import { getConnection, hashPassword, Create, Read, Update, Delete, FindOne, comparePassword } from '../config/database.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

class AuthController {

    static async login(req, res) {
        try {
            const { email, senha } = req.body

            const user = await prisma.usuarios.findUnique({
                where: {
                    email: email
                }
            })


            if (user.length > 0) {// verifica valor retornado ou seja se o usuario existe
                const validacao = comparePassword(senha, user.senhaHash)
                if (validacao) {
                    const token = jwt.sign({ id: user[0].id, email: user[0].email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })//cria um token JWT com o ID e email do usuário usando a chave secreta definida no .env e o tempo de expiração definido no .env

                    return res.status(200).json({
                        token: token,
                        sucesso: true,
                        mensagem: "login bem-sucedido",
                        dados: user[0] // retorna resultados do usuário encontrado
                    })
                } else {
                    return res.status(401).json({
                        sucesso: false,
                        mensagem: "senha incorretos"
                    })
                }
            } else {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "Usuario não encontrado"
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
            const usuarioExistente = await prisma.usuarios.findFirst({
                where: {
                    OR: [
                        { cpf: cpf },
                        { email: email }
                    ]
                }
            })
            if (usuarioExistente) {
                idUsuario = usuarioExistente.id

            } else {
                // cria usuário
                datauser = { nome, cpf, celular, email };
                const usuario = await prisma.usuarios.create({
                    data: datauser
                })

                const idUsuario = usuario.id // cria um novo usuário na tabela "usuarios" usando a função create do database.js

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

                const resultfunc = await prisma.funcionarios.create({
                    data: newFunc
                })
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
        try {
            sessionStorage.removeItem("token")//remove o token do sessionStorage para efetuar o logout do usuário
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