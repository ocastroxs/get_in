import { prisma } from '../config/prisma.js';

class LogsController {

    static async Read(req, res) {
        try {
            const logs = await prisma.log.findMany() //le os logs do banco
            
            if(logs.length === 0){
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhum log encontrado",
                })
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Logs lidas com sucesso",
                dados: logs
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os Logs",
                erro: e.message
            })
        }
    }

    static async Create(req, res) {
        try {
            const { idDispositivo, idUsuario, dataDeEntrada, dataDeSaida } = req.body

            const newlog = {
                idDispositivo,
                idUsuario,
                dataDeEntrada,
                dataDeSaida
            }

            await prisma.log.create({
                data: newlog
            }) //cria uma nova log no banco

            return res.status(200).json({
                sucesso: true,
                mensagem: "Log criado com sucesso",
                dados: newlog
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar a log",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params
            const { idDispositivo, idUsuario, dataDeEntrada, dataDeSaida } = req.body
            const updatedLog = {
                idDispositivo,
                idUsuario,
                dataDeEntrada,
                dataDeSaida
            }
            await prisma.log.update({
                where: { id: Number(id) },
                data: updatedLog
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "Log atualizada com sucesso",
                dados: updatedLog
            })

        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar a log",
                erro: e.message
            })
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params
            await prisma.log.delete({
                where: {id: Number(id)}
            })  //deleta a log com o id fornecido

            return res.status(200).json({
                sucesso: true,
                mensagem: "Log deletado com sucesso",
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar a log",
                erro: e.message
            })
        }
    }

    static async ReadByUser(req, res) {
        try {
            const { idUsuario } = req.params

            const logs = await prisma.log.findMany({
                where: { idUsuario: Number(idUsuario) }
            }) //le as logs de um usuario especifico

            if(logs.length === 0){
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhum log encontrado para esse usuário",
                })
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Logs lidas com sucesso",
                dados: logs
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os logs",
                erro: e.message
            })
        }
    }

    static async ReadByDevice(req, res) {
        try {
            const { idDispositivo } = req.params

            const logs = await prisma.log.findMany({
                where: { idDispositivo: Number(idDispositivo) }
            }) // le as logs baseado em um unico dispositivo

            if(logs.length === 0){
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhum log encontrado para esse dispositivo",
                })
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Logs lidas com sucesso",
                dados: logs
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os logs",
                erro: e.message
            })
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params
            const log = await prisma.log.findUnique({
                where: { id: Number(id) }
            })

            if(!log){
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhum log encontrado com esse id",
                })
            }


            return res.status(200).json({
                sucesso:true,
                mensagem: "Log lida com sucesso",
                dados: log
            })
        } catch (e){
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler a log",
                erro: e.message
            })
        }
    }
}


export default LogsController