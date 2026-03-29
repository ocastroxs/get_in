import express from "express";


const app = express();
app.use(express.json());


// ------IMPORT DAS ROTAS------ //

import AuthRouter  from './router/AuthRouter.js';
import UserRouter from './router/UserRouter.js';

// -------REGISTRO DAS ROTAS------- //

app.use("/user", UserRouter)
app.use('/auth', AuthRouter);




// inicializações do server//

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server rodando em: http://localhost:${PORT}`);
})