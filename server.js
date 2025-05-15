const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = 3000;

const timesPath = path.join(__dirname, 'times.json');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

let timesData = fs.readFileSync(timesPath, 'utf-8');
let times = JSON.parse(timesData);

function salvarDados(){
    fs.writeFileSync(timesPath, JSON.stringify(times, null, 2));
}

app.get('/index', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/index.html'));
}) 

app.get('/atualizar-time', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/atualizar-time.html'));
}) 

app.post('/atualizar-time', (req, res) =>{
    const { nome, ano, titulos, divisao, pais} = req.body

    const timeIndex = times.findIndex(time => time.nome.toLowerCase() === nome.toLowerCase());

    if(timeIndex === -1){
        res.send('<h1>Não foi encontrado nenhum time com esse nome</h1>')
        return
    }

    times[timeIndex].ano = ano
    times[timeIndex].titulos = titulos
    times[timeIndex].divisao = divisao
    times[timeIndex].pais = pais

    salvarDados();

    res.send('<h1> time atualizado com sucesso! <br><a href="/index">Pagina inícial</a>');

})

app.get('/adicionar-time', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/adicionar-time.html'));
}) 

app.post('/adicionar-time', (req, res) => {
    const novotime = req.body;

    if (times.find(time => time.nome.toLowerCase() === novotime.nome.toLowerCase())) {
        res.send('<h1> Esse nome de time já existe. Não é possivel adicionar duplicatas. </h1>');
        return;
    }

    times.push(novotime);

    salvarDados();

    res.send('<h1> time adicionado com sucesso! </h1> <br><a href="/index">Pagina inícial</a>');
});


app.get('/excluir-time', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/excluir-time.html'));
})

app.post('/excluir-time', (req, res) =>{
    const{nome} = req.body;
   
    const timeIndex = times.findIndex(time => time.nome.toLowerCase() === nome.toLowerCase());
   
    if(timeIndex === -1){
        res.send('<h1>time não encontrado.<h1/>');
        return;
    }
    else{
        times.splice(timeIndex, 1);
        salvarDados();
        res.send(`<h1>O time ${nome} foi excluido<h1/>`);  
    }
   
});

function buscarTimePorNomeOuPais(pesquisa) {

    let timeEncontrado = ''

    times.forEach(time => {
        if(time.nome.toLowerCase() === pesquisa.toLowerCase()|| time.país.toLowerCase() === pesquisa.toLowerCase()){
            timeEncontrado += `${JSON.stringify(time, null, 2)}`;
        }
        else if(pesquisa === 'all'){
            timeEncontrado = JSON.stringify(times, null, 2);
        }
    });

    return timeEncontrado; 
}

app.get('/buscar-time', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/buscar-time.html'));
}) 

app.post('/buscar-time', (req, res) => {

    const timeBuscado = req.body.nomePais

    const timeEncontrado = buscarTimePorNomeOuPais(timeBuscado);

    if (timeEncontrado) {
        res.send(`<h1>time encontrado:</h1> <pre>${timeEncontrado}</pre> <br><a href="/index">Pagina inícial</a>`);
    } else {
        res.send('<h1>time não encontrado.</h1> <br><a href="/index">Pagina inícial</a>');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}/index`);
});