# Dados do IBGE - IBD

Trabalho final da disciplina de Introdução a Banco de dados - UFMG 2019/2.

Disponível em: https://ibge-kellermartins.vercel.app

Integrantes:

* Keller Clayderman Martins de Oliveira
* Jackson Nunes Silva
* Rafael Castro Araújo Beirão
* Rafael Fonseca de Mendonça

![Interface](interface.png?raw=true)

## Frontend

O frontend foi desenvolvido em JavaScript utilizando as frameworks Vue.js e Vuetify para a interface em geral, e a biblioteca three.js para o mapa interativo

## Backend

O backend foi desenvolvido em Node.js utilizando o runtime Node.js da Vercel, que gera e serve _serverless functions_ do código fonte presentes na pasta `/api`

## Banco de dados

O banco de dados foi desenvolvido em PosgreSQL, e seus dados estão disponíveis em [.sql](https://github.com/KellerMartins/IBD/releases/download/v1.0/ibge_postgres.sql) e [.csv](https://github.com/KellerMartins/IBD/releases/download/v1.0/ibge_csv.zip) na página de releases do repositório

## Desenvolvimento
#### Somente frontend
Instale as dependências com: 
```
yarn install
```

Para compilar para desenvolvimento e servir localmente
```
yarn serve
```

Para compilar e minificar para produção
```
yarn serve
```

#### Frontend e backend
Instale as dependências com: 
```
yarn install
```

Depois, instale o Vercel global
```
yarn global add vercel
```

Configure seu banco de dados PostgreSQL com os dados disponibilizados. Após isso, crie um arquivo .env na raiz do projeto com os dados de host, usuário, banco de dados e senha, similar ao abaixo:

```
POSTGRES_HOST=database.host.com
POSTGRES_USER=user
POSTGRES_DATABASE=database
POSTGRES_PASSWORD=passwrd
```
Então, para compilar para desenvolvimento e servir localmente
```
vercel dev
```

Para realizar o deploy em produção:
```
vercel
```
