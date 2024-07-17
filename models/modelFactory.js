
// ref:
// https://climaco.medium.com/design-pattern-factory-method-61754266299#:~:text=Factory%20Method%20—%20Definição%20do%20GoF&text=Resumindo%2C%20o%20padrão%20Factory%20Method,instaciada%20é%20de%20suas%20subclasses.

// Resumindo, o padrão Factory Method dispõe de uma classe abstrata ou uma interface que “realiza a criação do objeto”, 
// porém a decisão de que classe concreta será instaciada é de suas subclasses

// como nao tinha o modelFctory antes, nao tem um exemplo claro, mas vou explicar, antes a criacao das instancias era feita direta
// no controller. Exemplo:

// const Tought = require('../models/Tought');
// const User = require('../models/User');

// novamente, o codigo vai rodar, porem como o foco disso e a manutencao mais facil, nao ia ficar legal, ia gerar codigos duplicados, 
// deixando a manutencao chata, pensando num projeto que escalaria.

// como esse codigo ja depende mais do contexto da aplicacao vou explicar o que foi feito. 
// eu criei essa classe modelFactory e nela tem esse metodo estatico (static) createModel que passa como parametro o nome da model,
// isso vai fazer com que ele retorne o model certo de acordo com o nome



// nos controllers a diferenca foi no require(import tambem pode ser usado como em outras linguagens) que eram feitos assim: const Tought = require('../models/Tought');
// const User = require('../models/User');

// module.exports = class ToughtController {
  // Métodos do controlador...
// };
// eram importados direto

// agora eles os modelos sao criados atraves do metodo factory, que e literalmente isso ai, uma fabrica de modelos, na pratica,
// centraliza a criacao das instancias de modelo



//  const ModelFactory = require('../models/modelFactory');
// const Tought = ModelFactory.createModel('Tought');
// const User = ModelFactory.createModel('User');

// module.exports = class ToughtController {
//   // Métodos do controlador...
// };


// so pra resumir o por que usar ou nao, sem isso, ele dificulta a manutencao duplicando codigo sem necessidade, com ele da pra focar a logica
// de criar models 





class ModelFactory {
    static createModel(modelName) {
      switch (modelName) {
        case 'User':
          return require('./User');
        case 'Tought':
          return require('./Tought');
        default:
          throw new Error(`Model ${modelName} not found`);
      }
    }
  }
  
  module.exports = ModelFactory;
  