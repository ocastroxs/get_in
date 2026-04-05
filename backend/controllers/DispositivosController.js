import { Create, Read, Delete, Update } from "../config/database";

class DispositivosController {

    static async Create(req, res) {
        //     //idDepartamento INT NOT NULL,
        // local VARCHAR(150),
        // dataManutencao TIMESTAMP,
        try {
            const { idDepartamento, local, dataManutencao } = req.body// faz a requisição dos valores do body
            const data = { idDepartamento, local, dataManutencao }

            const result = await Create("dispositivos", data)//cria o registro na tabela
            return res.status(201).json({
                sucesso: true,
                mensagem: "Dispositivo cadastrado com sucesso",
                dados: { id: result.insertId, ...data }//retorna os valores com o id do dispositivo que foi criado
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao cadastrar o dispositivo",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { idDepartamento, local, dataManutencao } = req.body;
            const data = {
                idDepartamento,
                local,
                dataManutencao
            }

            const result = await Update("dispositivos", data, `id=${id}`)
            return res.status(200).json({
                sucesso: true,
                mensagem: "Dados do dispositivos atualizados",
                dados: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar so dados dos funcionarios",
                dados: e.message
            })
        }
    }

    static async Read(req,res){
        try {
            const dispositivos = await Read("dispositivos")
            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivos lidos com sucesso",
                dados: dispositivos
            })
        } catch (e){
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler dispositivos",
                erro: e.message
            })
        }
    }

    static async ReadById(req,res){
        try{
            const {id} = req.params

            const dado = await Read("dispositivos", `id= ${id}`)
            return res.status(200).json({
                sucesso: true,
                mensagem: "dispositivo lido com sucesso",
                dados: dado
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o dispositivo",
                erro: e.message
            })
        }
    }

    static async ReadBySetor(req,res) {
        try {
            const {id} = req.params

            const dado = await Read("dispositivos", `idDepartamento =${id}`)
            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivos encontrados com sucesso",
                dados: dado
            })
        } catch (e){
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao encontrar dispositivos",
                erro: e.message
            })
        }
    }

    static async ReadByName(req,res){
        try {
            const {name} = req.params

            const dado = await Read("dipositivos", `local like '%${name}%`) // verifica se tem o valor procurado em qualquer posição no nome dos registros
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuarios encontrados com sucesso",
                dados: dado
            })
        
        } catch (e){
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao procurar usuarios desejados",
                erro: e.message
            })
        }
    }

}

export default DispositivosController;