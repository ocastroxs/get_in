import { Read, Create } from "../config/database.js"

class DepartamentoController {

    static async read(req, res){
        try{
            const departamento = await Read("departamentos")
            res.status(200).json({
                sucesso: true,
                mensagem: "Departamentos listados com sucesso",
                data: departamento
            })

        }
        catch(e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar Departamentos",
                erro: e.message
            })
        }

    }

        static async create(req, res){
        try{
            const {nome, idGestor} = req.body;
            const data = await {
                nome: nome,
                idGestor: idGestor
            } 

            await Create("departamentos", data)
            
            res.status(200).json({
                sucesso: true,
                mensagem: `Criado o departamento ${nome} com sucesso!`
            })

        }
        catch(e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar um departamento",
                erro: e.message
            })
        }

    }

}

export default DepartamentoController