var appDB = function () {
  var fs = require('fs'),
      uuid = require('node-uuid'),
      isWin = /^win/i.test(require('os').platform()),
      path = require('path'),
      dataPath = isWin ? 'c:\\restaurante-app' : path.join(process.env.HOME, 'restaurante-app');

  if (!fs.existsSync(dataPath)) alert('Diretório nāo encontrado: ' + dataPath);


  function loadData (name, cb) {
    var file = getDataFilePath(name);
    if (!fs.existsSync(file)) return cb('Arquivo nāo encontrado: ' + file);

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) return cb('Error: ' + err);
     
      cb(null, JSON.parse(data));
    });
  }

  function filter (condition, name, cb) {
    var items = [];
    var file = getDataFilePath(name);
    
    loadData(name, function (err, data) {
      if (err) return cb(err);

      data.forEach(function (item) {
        if (condition(item)) items.push(item);
      });

      cb(null, items);
    });    
  }

  function findById (id, name, cb) {
    var file = getDataFilePath(name);
    
    loadData(name, function (err, data) {
      if (err) return cb(err);

      var index = getIndexById(id, data);
      if (typeof index === 'undefined') return cb('Not found');

      cb(null, data[index]);
    });    
  }

  function create (item, name, cb) {
    var file = getDataFilePath(name);
    
    loadData(name, function (err, data) {
      if (err) return cb(err);

      item.id = uuid.v4();
      
      data.push(item);

      saveChanges(file, data, item, cb);
    });    
  }

  function update (id, item, name, cb) {
    var file = getDataFilePath(name);
    
    loadData(name, function (err, data) {
      if (err) return cb(err);

      var index = getIndexById(id, data);
      if (typeof index === 'undefined') return cb();

      item.id = id;
      data[index] = item;

      saveChanges(file, data, item, cb);
    });    
  }

  function remove (id, name, cb) {
    var file = dataPath + name + '.json';
    
    loadData(name, function (err, data) {
      if (err) return cb(err);

      var index = getIndexById(id, data);
      if (typeof index !== 'undefined') data.splice(index, 1);

      saveChanges(file, data, null, cb);
    });    
  }

  function  saveChanges (file, data, item, cb) {
    fs.writeFile(file, JSON.stringify(data, null, 2), function(err) {
      if (err) return cb('Error: ' + err);

      cb(null, item);
    });
  }

  function getIndexById (id, data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].id === id) return i;
    }
  }

  function getDataFilePath (name) {
    return path.join(dataPath, name + '.json');
  }

  return {
    loadData: loadData,
    filter: filter,
    create: create,
    update: update,
    remove: remove,
    findById: findById
  };
};