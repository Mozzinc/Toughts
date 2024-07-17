// //  codigo sem padrao pra comparar pro prof, essa parte e so a configuracao pra poder connectar com o db
// esse sequelize e um orm, que serve so pra interagir com o banco  usando POO, ai ao inves de usar 
// os comandos sql direto, usa objetos e metodos, fica mais facil pra manutencao do codigo

// const { Sequelize } = require('sequelize')

// const sequelize = new Sequelize('toughts', 'root', '', {
//   host: 'localhost',
//   dialect: 'mysql',
// })

// try {
//   sequelize.authenticate()
//   console.log('Conectamos com o Sequelize!')
// } catch (error) {
//   console.error('Não foi possível conectar:', error)
// }

// module.exports = sequelize



// OBS:o código de conexão ao banco de dados era feito diretamente no arquivo db/conn.js, 
// Entao entra no lance de toda vez que requisitado no codigo, ele criaria uma nova instancia


// codigo que eu coloquei singleton, a definicao dele e Singleton é:
//  padrão de design que garante que apenas uma instância de uma classe exista em todo o sistema
// referencia pra voces darem uma olhada e entenderem melhor: https://consolelog.com.br/aprenda-design-pattern-singleton-na-teoria-e-na-pratica/#:~:text=Singleton%20é%20um%20padrão%20de,exista%20em%20todo%20o%20sistema.


// eu coloquei o uso do singleton aqui, por conta do contexto, como ele usa so uma instancia da classe pro projeto todo, ele vai garantir que so seja criada uma conexao pro codigo todo
// sem isso, ele pode acabar criando conexoes desnecessarias, nao vai gerar um erro direto, mas vai so complicar tudo, em casos de projetos grandes, com o tempo a manutencao fica complicada 



const { Sequelize } = require('sequelize');
const moment = require('moment-timezone');

class Database {
  constructor() {
    if (!Database.instance) {
      this._sequelize = new Sequelize('toughts', 'root', '', {
        host: 'localhost',
        dialect: 'mysql',
        timezone: '-03:00', // Configura o fuso horário para -3 UTC
        dialectOptions: {
          useUTC: false, // Ignora UTC
          dateStrings: true,
          typeCast: function (field, next) { // Converte todos os campos DATE para string
            if (field.type === 'DATETIME') {
              return field.string();
            }
            return next();
          },
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });

      this._authenticate();
      Database.instance = this;
    }
    return Database.instance;
  }

  _authenticate() {
    this._sequelize.authenticate()
      .then(() => {
        console.log('Conectamos com o Sequelize!');
      })
      .catch(error => {
        console.error('Não foi possível conectar:', error);
      });
  }

  get sequelize() {
    return this._sequelize;
  }
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance.sequelize;
