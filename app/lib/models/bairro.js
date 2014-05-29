var appModelBairro = function () {
  var repository = 'enderecos';

  function getAll (cb) {
    app.db.loadData(repository, cb);
  }

  function save (endereco, selectedItem, cb) {
    if (!validate(endereco)) return cb('Campos inválidos');

    if (!selectedItem) 
      app.db.create(endereco, repository, cb);
    else
      app.db.update(selectedItem.id, endereco, repository, cb);
  }

  function validate (endereco) {
    if ((!endereco.bairro) || !endereco.valor) return false;
    return true;
  }

  function find (endereco, where, cb) {
    var searchTerm = where || buildSearchTerm(endereco);

    app.db.filter(searchTerm, repository, cb);
  }

  function remove (selectedItem, cb) {
    app.db.remove(selectedItem.id, repository, cb);
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
    find: find,
    remove: remove
  };
};