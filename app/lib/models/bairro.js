var appModelBairro = function () {

  function getAll (cb) {
    app.db.loadData('enderecos', cb);
  }

  function save (endereco, selectedItem, cb) {
    if (!validate(endereco)) {
      return cb('Campos inválidos');
    }

    if (!selectedItem) 
      app.db.create(endereco, 'enderecos', cb);
    else
      app.db.update(selectedItem.id, endereco, 'enderecos', cb);
  }

  function validate (endereco) {
    if ((!endereco.bairro) || !endereco.valor) return false;
    return true;
  }

  function find (endereco, cb) {
    var searchTerm = buildSearchTerm(endereco);

    app.db.filter(searchTerm, 'enderecos', cb);
  }

  function remove (selectedItem, cb) {
    app.db.remove(selectedItem.id, 'enderecos', cb);
  }

  function buildSearchTerm (endereco) {
    return function where (data) {
      var pattBairro = new RegExp(endereco.bairro, 'i');
      var pattValor = new RegExp(endereco.valor, 'i');

      if (endereco.bairro && !pattBairro.test(data.bairro)) return false;
      if (endereco.valor && !pattValor.test(data.valor)) return false;
      
      return true;
    };
  }

  return {
    getAll: getAll,
    save: save,
    validate: validate,
    find: find,
    remove: remove,
    buildSearchTerm: buildSearchTerm
  };
};