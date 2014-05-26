var appDB = function () {
  var fs = require('fs'),
      uuid = require('node-uuid');

  function loadData (name, cb) {
    var file = 'data/' + name + '.json';

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) return cb('Error: ' + err);
     
      cb(null, JSON.parse(data));
    });
  }

  function filter (condition, name, cb) {
    var items = [];
    var file = 'data/' + name + '.json';
    
    loadData(name, function (err, data) {
      if (err) return cb(err);

      data.forEach(function (item) {
        if (condition(item)) items.push(item);
      });

      cb(null, items);
    });    
  }

  function create (item, name, cb) {
    var file = 'data/' + name + '.json';
    
    loadData(name, function (err, data) {
      if (err) return cb(err);

      item.id = uuid.v4();
      
      data.push(item);

      saveChanges(file, data, cb);
    });    
  }

  function update (id, item, name, cb) {
    var file = 'data/' + name + '.json';
    
    loadData(name, function (err, data) {
      if (err) return cb(err);

      var index = getIndexById(id, data);
      if (typeof index === 'undefined') return cb();

      item.id = id;
      data[index] = item;

      saveChanges(file, data, cb);
    });    
  }

  function remove (id, name, cb) {
    var file = 'data/' + name + '.json';
    
    loadData(name, function (err, data) {
      if (err) return cb(err);

      var index = getIndexById(id, data);
      if (typeof index !== 'undefined') data.splice(index, 1);

      saveChanges(file, data, cb);
    });    
  }

  function  saveChanges (file, data, cb) {
    fs.writeFile(file, JSON.stringify(data, null, 2), function(err) {
      if (err) return cb('Error: ' + err);

      cb();
    });
  }

  function getIndexById (id, data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].id === id) return i;
    }
  }

  return {
    loadData: loadData,
    filter: filter,
    create: create,
    update: update,
    remove: remove
  };
};