var appClientes = function () {
  var selectedItem;

  function setupEvents () {
    $('form').on('click', '#save', save);
    $('form').on('click', '#cancel', cancel);
    $('form').on('click', '#search', search);
    $('table').on('click', '.edit-item', edit);
    $('table').on('click', '.remove-item', remove);
    $('form').on('blur', '#bairro, #rua', loadFrete);
  }

  function init () {
    setupEvents();
    setupAutocomplete();
    load();
  }

  function load () {
    app.db.loadData('clientes', function (err, data) {
      if (err) return;

      loadTable(data);
    });
  }

  function loadTable (data) {
    $('table#result tbody').html('');
    data.forEach(function (item) {
      $('table#result tbody').append(buildEnderecoRow(item));
    });
  }

  function save (event) {
    event.preventDefault();

    var cliente = getItemFromForm();

    if (!validate(cliente)) {
      alert('Campos inválidos');
      return;
    }

    var onSave = function (err) {
      if (err) return console.log(err);

      load();
      cleanForm();
      changeButtonSaveType();
    };

    if (!selectedItem) 
      app.db.create(cliente, 'clientes', onSave);
    else
      app.db.update(selectedItem.id, cliente, 'clientes', onSave);
  }

  function validate (cliente) {
    if ((!cliente.bairro && !cliente.rua) || !cliente.valor) return false;
    return true;
  }

  function search (event) {
    event.preventDefault();

    var searchTerm = buildSearchTerm();

    app.db.filter(searchTerm, 'clientes', function (err, data) {
      if (err) return;

      loadTable(data);
    });
  }

  function getItemFromForm () {
    var form = $('form');

    return {
      nome: form.find('#nome').val(),
      telefone: form.find('#telefone').val(),
      bairro: form.find('#bairro').val(),
      rua: form.find('#rua').val(),
      numero: form.find('#numero').val(),
      valor: form.find('#valor').val()
    };
  }

  function cancel (event) {
    event.preventDefault();
    cleanForm();
    changeButtonSaveType();
  }

  function edit (event) {
    event.preventDefault();
    var btn = $(this);

    getSelectedItem(btn);
    
    var form = $('form');

    form.find('#nome').val(selectedItem.nome);
    form.find('#telefone').val(selectedItem.telefone);
    form.find('#bairro').val(selectedItem.bairro);
    form.find('#rua').val(selectedItem.rua);
    form.find('#numero').val(selectedItem.numero);
    form.find('#valor').val(selectedItem.valor);

    changeButtonSaveType();
  }

  function remove () {
    event.preventDefault();
    var btn = $(this);

    getSelectedItem(btn);
    
    if (confirm('Deseja remover este item?')) {
      app.db.remove(selectedItem.id, 'clientes', function (err) {
        if (err) return console.log(err);

        load();
      });
    }
  }

  function getSelectedItem (btn) {
    var tr = btn.parents('tr');

    selectedItem = {
      id: tr.find('.id').val(),
      nome: tr.find('.nome').text(),
      telefone: tr.find('.telefone').text(),
      bairro: tr.find('.bairro').text(),
      rua: tr.find('.rua').text(),
      numero: tr.find('.numero').text(),
      valor: tr.find('.valor').text().match(/R\$ (.*)/i)[1]
    };
  }

  function buildSearchTerm () {
    var cliente = getItemFromForm();

    return function where (data) {
      var pattBairro = new RegExp(cliente.bairro, 'i');
      var pattRua = new RegExp(cliente.rua, 'i');
      var pattValor = new RegExp(cliente.valor, 'i');

      if (cliente.bairro && !pattBairro.test(data.bairro)) return false;
      if (cliente.rua && !pattRua.test(data.rua)) return false;
      if (cliente.valor && !pattValor.test(data.valor)) return false;
      
      return true;
    };
  }

  function cleanForm (form) {
    selectedItem = null;
    $('form').find('input').val('');
  }

  function buildEnderecoRow (data) {
    var html = [];
    html.push('<tr>');
    html.push('  <td class="nome">' + data.nome + '</td>');
    html.push('  <td class="telefone">' + data.telefone + '</td>');
    html.push('  <td class="bairro">' + data.bairro + '</td>');
    html.push('  <td class="rua">' + data.rua + '</td>');
    html.push('  <td class="numero">' + data.numero + '</td>');
    html.push('  <td class="valor">R$ ' + data.valor + '</td>');
    html.push('  <td>');
    html.push('    <input type="hidden" class="id" value="' + data.id + '" />');
    html.push('    ' + app.common.buildEditRemoveButtons());
    html.push('  </td>');
    html.push('</tr>');
    return html.join('');
  }

  function changeButtonSaveType (type) {
    $('#save').text(selectedItem ? 'Alterar' : 'Inserir');

    if (selectedItem)
      $('#cancel').show();
    else
      $('#cancel').hide();
  }

  function setupAutocomplete () {
      var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
          var matches, substringRegex;
       
          // an array that will be populated with substring matches
          matches = [];
       
          // regex used to determine if a string contains the substring `q`
          substrRegex = new RegExp(q, 'i');
       
          // iterate through the pool of strings and for any string that
          // contains the substring `q`, add it to the `matches` array
          $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
              // the typeahead jQuery plugin expects suggestions to a
              // JavaScript object, refer to typeahead docs for more info
              matches.push({ value: str });
            }
          });
       
          cb(matches);
        };
      };

      loadBairros(function (bairros) {
        $('#bairro').typeahead({
          hint: true,
          highlight: true,
          minLength: 1
        },
        {
          name: 'bairros',
          displayKey: 'value',
          source: substringMatcher(bairros)
        });
      });

      loadRuas(function (ruas) {
        $('#rua').typeahead({
          hint: true,
          highlight: true,
          minLength: 1
        },
        {
          name: 'ruas',
          displayKey: 'value',
          source: substringMatcher(ruas)
        });
      });
       
  }

  function loadBairros (cb) {
    app.db.loadData('enderecos', function (err, data) {
      if (err) return cb(err);

      var bairros = data.map(function (item) { return item.bairro; });

      cb(bairros);
    });
  }

  function loadRuas (cb) {
    app.db.loadData('enderecos', function (err, data) {
      if (err) return cb(err);

      var ruas = data.map(function (item) { return item.rua; });

      cb(ruas);
    });
  }

  function loadFrete () {
    var cliente = getItemFromForm();
    if (!cliente.bairro && !cliente.rua) {
      $('#valor').prop('disabled', false).val('');
      return;
    }

    var whereBairroRua = function (data) {
      var pattBairro = new RegExp('^' + cliente.bairro + '$', 'i');
      var pattRua = new RegExp('^' + cliente.rua + '$', 'i');

      var foundBairro = false;
      if (cliente.bairro) foundBairro = pattBairro.test(data.bairro);
      if (!foundBairro && cliente.rua && !pattRua.test(data.rua)) return false;
      
      return true;  
    };

    app.db.filter(whereBairroRua, 'enderecos', function (err, data) {
      if (err) return;

      if (!data || !data.length) {
        $('#valor').prop('disabled', false).val('');
        return;
      }

      $('#valor').prop('disabled', true);
      var valor = 0;

      if (data.length === 1) valor = data[0].valor;

      if (!valor) {
        // try to get by bairro and rua
        data.forEach(function (item) {
          if (item.bairro === cliente.bairro && item.rua === cliente.rua) {
            valor = item.valor;
            return;
          }
        });
      }

      if (!valor) {
        // try to get by bairro
        data.forEach(function (item) {
          if (item.bairro === cliente.bairro) {
            valor = item.valor;
            return;
          }
        });
      }

      if (!valor) {
        // try to get by rua
        data.forEach(function (item) {
          if (item.rua === cliente.rua) {
            valor = item.valor;
            return;
          }
        });
      }

      $('#valor').val(valor);
    });
  }

  return {
    init: init
  };
};