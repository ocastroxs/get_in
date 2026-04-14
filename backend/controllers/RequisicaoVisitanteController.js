import { prisma } from '../config/prisma.js';

class RequisicaoVisitanteController{
    static async Create(req, res) {
        //     idUsuario INT NOT NULL,
        // idDepartamento INT NOT NULL,
        // status ENUM('pendente','aprovado','recusado') DEFAULT 'pendente',
        try {
            const { idUsuario, idDepartamento, status, motivo, validade } = req.body

            const dado = {
                idUsuario: Number(idUsuario),
                idDepartamento: Number(idDepartamento),
                status: 'pendente',
                motivo: motivo,
                validade: new Date(validade)


            }

            const result = await prisma.requisicaoDeVisita.create({
                data: dado
            })
            return res.status(201).json({
                sucesso: true,
                mensagem: "Requisição feita com sucesso",
                dado: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar a requisição",
                erro: e.message
            })
        }
    }

    static async Read(req, res) {
        try {
            const result = await prisma.requisicaoDeVisita.findMany() //le as requisições da tabela "requisicoesDeVisitantes"
            if (result.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma requisição encontrada"
                })
            }
            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisições listadas com sucesso",
                dados: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar as requisições",
                erro: e.message
            })
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params
            const result = await prisma.requisicaoDeVisita.findUnique({
                where: {
                    id: Number(id)
                }
            })
            if (!result) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Requisição não encontrada"
                })
            }
            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição lida com sucesso",
                dados: result
            })
        }
        catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler a requisição",
                erro: e.message
            })
        }
    }

    static async ReadByVisi(req, res) {
        try {
            const { id } = req.params
            const result = await prisma.requisicaoDeVisita.findMany({
                where: {
                    idUsuario: Number(id)
                }
            })

            if (result.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma requisição encontrada para esse visitante"
                })
            }
            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisições lidas com sucesso",
                dados: result
            })
        }
        catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler as requisições",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params
            const { status } = req.body
            const result = await prisma.requisicaoDeVisita.update({
                where: {
                    id: Number(id)
                },
                data: {
                    status: status
                }
            })
            return res.status(200).json({
                sucesso: true,
                mensagem: "Status da requisição atualizado",
                dados: result
            })
        }
        catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar o status da requisição",
                erro: e.message
            })
        }

    }

    static async Delete(req, res) {
        try {
            const { id } = req.params
            const result = await prisma.requisicaoDeVisita.delete({
                where: {
                    id: Number(id)
                }
            })
            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição deletada com sucesso",
                dados: result
            })
        }
        catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar a requisição",
                erro: e.message
            })
        }
    }

    static async ReadByDepartamento(req, res) {
        try {
            const { id } = req.params
            const departamento = await prisma.requisicaoDeVisita.findMany({
                where: {
                    idDepartamento: Number(id)
                }
            })
            if (departamento.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma requisição encontrada para esse departamento"
                })
            }
            res.status(200).json({
                sucesso: true,
                mensagem: "Requisições listadas com sucesso",
                data: departamento
            })
        }
        catch (e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar as requisições",
                erro: e.message
            })
        }
    }
}

export default RequisicaoVisitanteController;