import { Create, Update, Delete , Read } from "../config/database";

class RequisicaoFuncionarioController{
    static async Create(req, res){
    //     idUsuario INT NOT NULL,
    // idDepartamento INT NOT NULL,
    // status ENUM('pendente','aprovado','recusado') DEFAULT 'pendente',
        try {
            const { idUsuario, idDepartamento} = req.body
            
            const dado = {
                idUsuario,
                idDepartamento
            }

            const result = await Create('requisicoesDeAcessos', dado)
            return res.status(201).json({
                sucesso: true,
                mensagem: "Requisição feita com sucesso",
                dado: {id: result.insertId, ...result}
            })
        } catch (e){
            return res.status(500).json({
                sucesso: false,
                mensage: "Erro ao realizar a requisição",
                erro: e.message
            })
        }
    }

    static async Update(req, res){
        
    }
}