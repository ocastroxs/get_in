import { getConnection, Create, Read, Update, Delete } from '../config/database.js';

class CrachaController {

    static async create(req, res) {
        try {
            const status = "disponivel";

            const data = {
                status: status
            }

            const result = await Create('crachas', data);

            if (!result) {
                return res.status(400).json({ erro: 'Erro ao criar crachá' });
            }

            res.status(201).json({
                sucesso: true,
                message: 'Crachá criado com sucesso'
            });


        } catch (e) {
            res.status(500).json({ 
                sucesso: false,
                mensagem: 'Erro ao criar crachá',
                erro: e.message});
        }
    }

    static async read(req, res) {
        try{
            const crachas = await Read('crachas');

            res.status(200).json({
                sucesso:true,
                mensagem: "Crachás listados com sucesso",
                data: crachas
            })
        } catch {
            res.status(500).json({
                sucesso:false,
                mensagem: "Erro ao listar crachás",
                erro: e.message
            })
        }
    }

    static async update(req,res){
        try {
            const {id} = req.params;
            const {status} = req.body;

            const result = await Update("crachas", status, `id = ${id}`);
            return res.status(200).json({
                sucesso: true,
                mensagem: "Crachá atualizado com sucesso",
                dados: result
            })
        } catch {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar o crachá",
                erro: e.message
            })
        }
    }

    static async delete(req,res){
        try{
            const {id} = req.params;

            const result = await Delete("crachas", `id = ${id}`);
            return res.status(200).json({
                sucesso: true,
                mensagem: "Crachá deletado com sucesso",
                dados: result
            })
        } catch {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar o crachá",
                erro: e.message
            })
        }
    }

    static async readById(req,res){
        try {
            const {id} = req.params;

            const result = await Read("crachas", `id = ${id}`);
            return res.status(200).json({
                sucesso: true,
                mensagem: "Crachá encontrado com sucesso",
                dado: result
            })
        } catch {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao encontrar o crachá",
                erro: e.message
            })
        }
    }

    static async readByStatus(req,res){
        try {
            const {status} = req.params;

            const result = await Read("crachas", `status = ${status}`);
            return res.status(200).json({
                sucesso: true,
                mensagem: "Crachás encontrados com sucesso",
                dados: result
            });
        } catch {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao encontrar os crachás",
                erro: e.message
            })
        }
    }
}

export default CrachaController;