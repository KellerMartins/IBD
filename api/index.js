const db = require('../lib/db')
const escape = require('sql-template-strings')

// Exemplo de api
// Acessada como /api?name=NOME&address=ENDERECO
// Nesse exemplo, query.name e query.address vem da query string '?name=...&address=...'
// Aqui também é tratado o caso em que um dos parâmetros não foi passado ou que o dado
// não está presente no banco de dados

module.exports = async (req, res) => {
    if (!req.query.name)
        res.status(404).end("Faltou o parametro 'name'");
    else if (!req.query.address)
        res.status(404).end("Faltou o parametro 'address'");
    else {
        // O retorno de db.query é uma lista de objetos que representam as linhas retornadas pela consulta
        // Cada objeto da lista possui uma propriedade por coluna retornada pela consulta realizada
        // [profile] é só um açucar sintático para pegar o primeiro elemento da lista retornada e atribuir a var profile
        const [profile] = await db.query(escape`
            SELECT *
            FROM profiles
            WHERE name = ${req.query.name} and address=${req.query.address}
        `)
        if (profile)
            res.status(200).send('Ola ' + profile.name + " do " + profile.address + '!   ' + profile.avatar);
        else
            res.status(404).end('Nome ' + req.query.name + " e endereco " + req.query.address + " nao encontrados!");
    }
}