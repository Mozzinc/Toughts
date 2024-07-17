// ref https://www.softplan.com.br/tech-writers/padrao-de-projeto-decorator/

// O Decorator é um padrão de projeto estrutural que permite adicionar comportamentos a um objeto dinamicamente, sem precisar alterar o código original do objeto.

// de inicio pensei em colocar o observer pra notificar no sistema quando novos pensamentos sao criados, mas como ja tem os logs, pensei em usar o decorator
// pra poder colocar mais funcionalidades sem mudar tanto o codigo ja que eu teria que ir pra coisas que nao entendo muito ainda em express
// O padrão Decorator foi aplicado nos métodos do ToughtController para adicionar logs de chamadas de método e resultados. Isso facilita o rastreamento de chamadas de método e a visualização dos dados processados, 
// sem modificar a lógica principal dos métodos.
// O padrão Decorator foi utilizado para adicionar funcionalidades de logging aos métodos do ToughtController de forma modular e extensível. Isso permitiu a implementação de logs detalhados sem alterar a lógica principal dos métodos, 
// melhorando a manutenção e a capacidade de depuração do sistema. 

// obs nao coloquei antes e depois nesse por que o codigo antes tava enorme ia confundir geral.




function safeStringify(obj) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return; // Remove referências circulares
      }
      cache.add(value);
    }
    return value;
  });
}

function logDecorator(fn) {
  return async function (...args) {
    const [req, res, next] = args;
  
    // Extrair informações relevantes
    const loggableArgs = {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      params: req.params,
      session: req.session,
      user: req.user
    };
  
    console.log(`Calling ${fn.name} with arguments: ${safeStringify(loggableArgs)}`);
    const result = await fn.apply(this, args);
    console.log(`Result of ${fn.name}: ${result}`);
    return result;
  };
}
  
module.exports = logDecorator;

  