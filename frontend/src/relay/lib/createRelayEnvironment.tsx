const {
    Environment,
    Network,
    RecordSource,
    Store,
  } = require('relay-runtime');
  
  const source = new RecordSource();
  const store = new Store(source);
  const network = Network.create(/*...*/); // see note below
  const handlerProvider: any = null;
  
  const environment = new Environment({
    handlerProvider, // Can omit.
    network,
    store,
  });

  export default environment;