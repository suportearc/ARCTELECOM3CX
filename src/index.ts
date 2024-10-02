import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import stringSimilarity from 'string-similarity';



const app = express();
const port = 3000;

app.use(bodyParser.json());

interface Engenheiro {
    primeiroNome: string;
    sobrenome?: string;
    link: string;
}

const engenheiros: Engenheiro[] = [
    { primeiroNome: "Raquel", sobrenome: "Santos", link: "https://ipbxcloudarctelecom01.my3cx.com.br:5001/raquel" },
    { primeiroNome: "Ricardo", sobrenome: "Costa", link: "https://ipbxcloudarctelecom01.my3cx.com.br:5001/ricardocosta" }
];

function encontrarEngenheiroPorPrimeiroNome(primeiroNome: string): Engenheiro[] {
    return engenheiros.filter(e => e.primeiroNome.toLowerCase() === primeiroNome.toLowerCase());
}

function encontrarEngenheiroPorNomeCompleto(nomeCompleto: string): Engenheiro | undefined {
    const nomeNormalizado = normalizeName(nomeCompleto);
    return engenheiros.find(e => normalizeName(`${e.primeiroNome} ${e.sobrenome ?? ""}`) === nomeNormalizado);
}

function normalizeName(name: string): string {
    const normalized = name.toLowerCase()
        .normalize('NFD') 
        .replace(/[\u0300-\u036f]/g, ''); 

    return normalized.replace(/[^a-zA-Z0-9]/g, '');
}

app.post('/busca_engenheiros', async (req: Request, res: Response) => {
    const { type, content, id_contato, protocolo, id_cliente, estagio_funcao, cel_contato, cel_conectado, nome_contato} = req.body;
    const nomeNormalizado = normalizeName(content);
    const novoEstagioFuncao = estagio_funcao + 1; 


 
    let resposta = {
        type,
        content: "", 
        id_contato,
        protocolo,
        id_cliente,
        estagio_funcao: novoEstagioFuncao,
        cel_contato,
        cel_conectado,
        nome_contato,
        finaliza_protocolo: 1
    };

 
    const engenheiro = encontrarEngenheiroPorNomeCompleto(content);
    
    if (engenheiro) {
        resposta.content = `Para falar com ${content}, acesse o link:\n${engenheiro.link}`;
    } else {
        
        const engenheirosEncontrados = encontrarEngenheiroPorPrimeiroNome(nomeNormalizado);

        if (engenheirosEncontrados.length > 0) {
            resposta.content = `Engenheiros encontrados com o nome '${content}':\n\n`;
            engenheirosEncontrados.forEach(e => {
                resposta.content += `- ${e.primeiroNome} ${e.sobrenome ?? ""}:\n${e.link}\n`;
                
            });
            resposta.content += `\nPara contata-los, acesse os links. Até mais👋🏼`;

        } else {

            if (estagio_funcao < 4){
                resposta.content = `Não encontrei engenheiros com o nome '${content}'. Verifique o nome e tente novamente`;
                resposta.finaliza_protocolo = 0;
            }
            else{


                resposta.finaliza_protocolo = 0;
                const url = 'https://arccorpchatflow.arctelecom.com.br/api_system/api_system.php';
                const headers = {
                    'token': 'f7325d47-98b78d2f-e89e544e-f136634b',
                    'apikey': 'ce9720cc45816bd57a31fe30b45ff6ec48e5fd41',
                    'rota': 'tranferencia_protocolo',
                    'protocolo' : resposta.protocolo
                };
                const data = {
                    "login_atendente": "raquel.ss@arctelecom.com.br",
                    "id_departamento": 47367,
                    "id_canal": 4328
                };
                const protocolo = resposta.protocolo;

                try {
                    const response = await axios.put(url, data, { headers });
                    console.log('Resposta da requisição:', response.data);
                    return response.data;
                } catch (error) {
                    console.error('Erro ao fazer requisição:', error);
                    throw error; 
                }
            }          
        }
    }


    res.json(resposta);
});


app.post('/busca_empresa', async (req: Request, res: Response) => {
    const { type, content, id_contato, protocolo, id_cliente, estagio_funcao, cel_contato, cel_conectado, nome_contato } = req.body;
    const nomeNormalizado = normalizeName(content);
    const novoEstagioFuncao = estagio_funcao + 1;
    let departamento = 58843;
    let atendente = "system";


    let resposta = {
        type,
        content: "",
        id_contato,
        protocolo,
        id_cliente,
        estagio_funcao: novoEstagioFuncao,
        cel_contato,
        cel_conectado,
        nome_contato,
        finaliza_protocolo: 1
    };


    const similarity = stringSimilarity.compareTwoStrings(content.toLowerCase(), "mrv");

    if (similarity > 0.6) {
        atendente = "ricardo.c@arctelecom.com.br";
    }
    else {
        atendente = "raquel.ss@arctelecom.com.br";
    }

    const url = 'https://arccorpchatflow.arctelecom.com.br/api_system/api_system.php';
    const headers = {
        'token': 'f7325d47-98b78d2f-e89e544e-f136634b',
        'apikey': 'ce9720cc45816bd57a31fe30b45ff6ec48e5fd41',
        'rota': 'tranferencia_protocolo',
        'protocolo': resposta.protocolo
    };
    const data = {
        "login_atendente": atendente,
        "id_departamento": departamento,
        "id_canal": 4328
    };
    
    try {
        const response = await axios.put(url, data, { headers });
        console.log('Resposta da requisição:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao fazer requisição:', error);
        throw error;
    }


});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
