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
}

export default CrachaController;