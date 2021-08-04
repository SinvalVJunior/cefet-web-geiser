// importação de dependência(s)
const express = require('express');
const fs = require('fs');
// variáveis globais deste módulo
const PORT = 3000
let db = {}
const app = express();
const MINUTES_HOURS = 60;
// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))
const jogadores = JSON.parse(fs.readFileSync('server/data/jogadores.json'));
const jogosPorJogador = JSON.parse(fs.readFileSync('server/data/jogosPorJogador.json'));
db = { jogadores, jogosPorJogador };


// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas
app.set('view engine', 'hbs');
app.set('views', 'server/views');
// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
app.get('/', (req, res) => {
    res.render('index', { jogadores });
});


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código

for(player of jogadores.players) {
    const playerSteamId = player.steamid;
    const playerGames = jogosPorJogador[`${playerSteamId}`].games;
    const playerCompleted = getPlayerWithCalculatedFields(player, playerGames);

    app.get(`/jogador/${playerSteamId}/`, (req, res) => {
        res.render('jogador', { player: playerCompleted });
    })
}

function getPlayerWithCalculatedFields(player, playerGames) {
    const playerTotalGames = playerGames.length;
    const totalNotPlayedGames = getTotalNotPlayedGames(playerGames);
    const playerTopGames = getPlayerTopGames(playerGames);
    const favoriteGame = getPlayerFavoriteGame(playerTopGames);

    const playerCompleted = { ...player, playerTotalGames, totalNotPlayedGames,  playerTopGames, favoriteGame};
    
    return playerCompleted;
}

function getTotalNotPlayedGames(playerGames) {
    return playerGames.filter((game) => game.playtime_forever === 0).length;
}

function getPlayerTopGames(playerGames) {
    const playerTopGames = getTopFiveGames(playerGames);
    const playerTopGamesTimeConverted = getTopFiveGamesWithHourPlayedTime(playerTopGames);
    
    return playerTopGamesTimeConverted;
}

function getTopFiveGames(playerGames) {
    return playerGames.sort(compare).slice(-5);
}

function getTopFiveGamesWithHourPlayedTime(playerTopGames) {
    return playerTopGames.map(
                (game) => { 
                    return { ...game, hour_playtime_forever: convertMinutesToHour(game.playtime_forever) }
                }
            );
    
}

function compare( a, b ) {
    if ( a.playtime_forever < b.playtime_forever ){
      return -1;
    }
    if ( a.playtime_forever > b.playtime_forever ){
      return 1;
    }
    return 0;
}

function convertMinutesToHour(minutes){
    return minutes / MINUTES_HOURS;
}

function getPlayerFavoriteGame(playerTopGames) {
    return playerTopGames.slice(-1)[0];
}
// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static('client'));


// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => {console.log(`server listening on PORT:${PORT}`)});
