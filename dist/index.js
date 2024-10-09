"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const axios_1 = __importDefault(require("axios"));
const string_similarity_1 = __importDefault(require("string-similarity"));
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json());
const engenheiros = [
    { primeiroNome: "Danielly", sobrenome: "Melo", link: "https://ipbxcloudarctelecom12.my3cx.com.br:5001/danielly" },
    { primeiroNome: "Ricardo", sobrenome: "Costa", link: "https://ipbxcloudarctelecom12.my3cx.com.br:5001/ricardocostasuportea" },
    { primeiroNome: "Edson", sobrenome: "Holanda", link: "https://ipbxcloudarctelecom01.my3cx.com.br:5001/edsonarctelecom" },
    { primeiroNome: "Eduardo", sobrenome: "Trindade", link: "https://ipbxcloudarctelecom01.my3cx.com.br:5001/eduardoarc" },
    { primeiroNome: "Maxsuel", sobrenome: "Batista", link: "https://ipbxcloudarctelecom12.my3cx.com.br:5001/maxsuelbatistasuport" },
    { primeiroNome: "Ricardo", sobrenome: "Okabayashi", link: "https://ipbxcloudarctelecom01.my3cx.com.br:5001/ricardo" },
    { primeiroNome: "Gilberto", sobrenome: "Fernandes", link: "https://ipbxcloudarctelecom01.my3cx.com.br:5001/gilbertoarc" },
    { primeiroNome: "Caroline", sobrenome: "Franco", link: "https://ipbxcloudarctelecom01.my3cx.com.br:5001/carolinefrancorharc" },
    { primeiroNome: "Jessica", sobrenome: "Barbosa", link: "https://ipbxcloudarctelecom01.my3cx.com.br:5001/jessicafinanceiroarc" }
];
function encontrarEngenheiroPorPrimeiroNome(primeiroNome) {
    return engenheiros.filter(e => e.primeiroNome.toLowerCase() === primeiroNome.toLowerCase());
}
function encontrarEngenheiroPorNomeCompleto(nomeCompleto) {
    const nomeNormalizado = normalizeName(nomeCompleto);
    return engenheiros.find(e => { var _a; return normalizeName(`${e.primeiroNome} ${(_a = e.sobrenome) !== null && _a !== void 0 ? _a : ""}`) === nomeNormalizado; });
}
function normalizeName(name) {
    const normalized = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    return normalized.replace(/[^a-zA-Z0-9]/g, '');
}
app.post('/busca_engenheiros', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, content, id_contato, protocolo, id_cliente, estagio_funcao, cel_contato, cel_conectado, nome_contato } = req.body;
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
    }
    else {
        const engenheirosEncontrados = encontrarEngenheiroPorPrimeiroNome(nomeNormalizado);
        if (engenheirosEncontrados.length > 0) {
            resposta.content = `Atendentes encontrados com o nome '${content}':\n\n`;
            engenheirosEncontrados.forEach(e => {
                var _a;
                resposta.content += `- ${e.primeiroNome} ${(_a = e.sobrenome) !== null && _a !== void 0 ? _a : ""}:\n${e.link}\n`;
            });
            resposta.content += `\nPara contata-los, acesse os links. Até mais👋🏼`;
        }
        else {
            if (estagio_funcao < 4) {
                resposta.content = `Não encontrei atendentes com o nome '${content}'. Verifique o nome e tente novamente`;
                resposta.finaliza_protocolo = 0;
            }
            else {
                resposta.finaliza_protocolo = 0;
                const url = 'https://arccorpchatflow.arctelecom.com.br/api_system/api_system.php';
                const headers = {
                    'token': '473d93e8-678a1904-585f5eeb-3f522c33',
                    'apikey': 'ce9720cc45816bd57a31fe30b45ff6ec48e5fd41',
                    'rota': 'tranferencia_protocolo',
                    'protocolo': resposta.protocolo
                };
                const data = {
                    "login_atendente": "ricardo.c@arctelecom.com.br",
                    "id_departamento": 58843,
                    "id_canal": 4328
                };
                const protocolo = resposta.protocolo;
                try {
                    const response = yield axios_1.default.put(url, data, { headers });
                    console.log('Resposta da requisição:', response.data);
                    return response.data;
                }
                catch (error) {
                    console.error('Erro ao fazer requisição:', error);
                    throw error;
                }
            }
        }
    }
    res.json(resposta);
}));
app.post('/busca_empresa', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const similarity = string_similarity_1.default.compareTwoStrings(content.toLowerCase(), "mrv");
    if (similarity > 0.6) {
        atendente = "ricardo.c@arctelecom.com.br";
    }
    else {
        atendente = "raquel.ss@arctelecom.com.br";
    }
    const url = 'https://arccorpchatflow.arctelecom.com.br/api_system/api_system.php';
    const headers = {
        'token': '57ffa1ff-f322e65a-bf6eeb03-0305d317',
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
        const response = yield axios_1.default.put(url, data, { headers });
        console.log('Resposta da requisição:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Erro ao fazer requisição:', error);
        throw error;
    }
}));
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
