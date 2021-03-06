var appModelCliente = function () {
  var repository = 'clientes';

  function getAll (cb) {
    app.db.loadData(repository, function (err, clientes) {
      if (err) return cb(err);

      app.models.bairro.getAll(function (err, bairros) {
        if (err) return cb(err);

        mapBairroOnCliente(clientes, bairros);
        cb(null, clientes);
      });
    });
  }

  function mapBairroOnCliente (clientes, bairros) {
    clientes.map(function (cliente) {
      bairros.forEach(function (bairro) {
        if (cliente.bairro_id === bairro.id) {
          cliente.bairro = bairro.bairro;
          cliente.valor = bairro.valor;
          return;
        }
      });
      return cliente;
    });
  }

  function save (cliente, selectedItem, cb) {
    if (!validate(cliente)) return cb('Campos inválidos');

    var bairro = {
      bairro: cliente.bairro,
      valor: cliente.valor
    };

    // we do not store bairro's name, only bairro's id
    delete cliente.bairro;
    delete cliente.valor;

    function saveCliente (err, bairro) {
      if (err) return cb(err);
      if (bairro) cliente.bairro_id = bairro.id;
      
      if (!selectedItem) 
        app.db.create(cliente, repository, cb);
      else
        app.db.update(selectedItem.id, cliente, repository, cb);
    }

    // save only cliente
    if (cliente.bairro_id) return saveCliente();
    
    // save bairro then cliente
    app.models.bairro.save(bairro, null, saveCliente);
  }

  function validate (cliente) {
    if (!cliente.bairro || 
        !cliente.rua || 
        !cliente.nome || 
        !cliente.telefone || 
        !cliente.numero || 
        !cliente.valor
        ) return false;
    return true;
  }

  function find (cliente, where, cb) {
    var items = [];
    var searchTerm = where || buildSearchTerm(cliente);

    getAll(function (err, clientes) {
      if (err) return cb(err);

      clientes.forEach(function (item) {
        if (searchTerm(item)) items.push(item);
      });

      cb(null, items);
    });
  }

  function remove (selectedItem, cb) {
    app.db.remove(selectedItem.id, repository, cb);
  }

  function buildSearchTerm (cliente) {
    return function where (data) {
      var pattBairro = new RegExp(cliente.bairro, 'i');
      var pattRua = new RegExp(cliente.rua, 'i');
      var pattNome = new RegExp(cliente.nome, 'i');
      var pattTelefone = new RegExp(cliente.telefone, 'i');
      var pattNumero = new RegExp(cliente.numero, 'i');
      var pattValor = new RegExp(cliente.valor, 'i');

      if (cliente.bairro && !pattBairro.test(data.bairro)) return false;
      if (cliente.rua && !pattRua.test(data.rua)) return false;
      if (cliente.nome && !pattNome.test(data.nome)) return false;
      if (cliente.telefone && !pattTelefone.test(data.telefone)) return false;
      if (cliente.numero && !pattNumero.test(data.numero)) return false;
      if (cliente.valor && !pattValor.test(data.valor)) return false;
      
      return true;
    };
  }

  function findByBairroId (id, cb) {
    var whereBairro = function (data) {
      return data.bairro_id === id;  
    };

    app.models.cliente.find(null, whereBairro, cb);
  }

  return {
    getAll: getAll,
    save: save,
    find: find,
    remove: remove,
    findByBairroId: findByBairroId
  };
};