var appClientes = function () {
  var selectedItem;

  function setupEvents () {
    $('form').on('click', '#save', save);
    $('form').on('click', '#cancel', cancel);
    $('form').on('click', '#search', search);
    $('table').on('click', '.edit-item', edit);
    $('table').on('click', '.remove-item', remove);
    $('form').on('blur', '#bairro', loadFrete);
  }

  function init () {
    setupEvents();
    setupAutocomplete();
    load();
  }

  function load () {
    app.db.loadData('clientes', function (err, data) {
      if (err) return;

      loadBairros(function (err, bairros) {
        if (err) console.log(err);

        mapBairroOnCliente(data, bairros);
        loadTable(data);
      });
    });
  }

  function mapBairroOnCliente (clientes, bairros) {
    clientes.map(function (cliente) {
      bairros.forEach(function (bairro) {
        if (cliente.bairro_id === bairro.id) {
          cliente.bairro = bairro.bairro;
          return;
        }
      });
      return cliente;
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

    // we do not store bairro's name, only bairro's id
    delete cliente.bairro;

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
      bairro_id: form.find('#bairro_id').val(),
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
    $('form').find('input').prop('disabled', false).val('');
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
    var substringMatcher = function(items) {
      return function findMatches(q, cb) {
        var matches, substringRegex;
     
        // an array that will be populated with substring matches
        matches = [];
     
        // regex used to determine if a string contains the substring `q`
        console.log('q:',q);
        substrRegex = new RegExp(q, 'i');
     
        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(items, function(i, item) {
          if (substrRegex.test(item.bairro)) {
            // the typeahead jQuery plugin expects suggestions to a
            // JavaScript object, refer to typeahead docs for more info
            matches.push(item);
          }
        });
     
        cb(matches);
      };
    };

    loadBairros(function (err, bairros) {
      if (err) console.log(err);
      
      $('#bairro').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: 'bairros',
        displayKey: 'bairro',
        source: substringMatcher(bairros)
      });
    });
  }

  function loadBairros (cb) {
    app.db.loadData('enderecos', cb);
  }

  function loadFrete () {
    var cliente = getItemFromForm();
    console.log('bairro:',cliente.bairro);
    if (!cliente.bairro) {
      $('#valor').prop('disabled', false).val('');
      return;
    }

    var whereBairro = function (data) {
      var pattBairro = new RegExp('^' + cliente.bairro + '$', 'i');

      return (cliente.bairro && pattBairro.test(data.bairro));  
    };

    app.db.filter(whereBairro, 'enderecos', function (err, data) {
      if (err) return;

      if (!data || !data.length) {
        form.find('#valor').prop('disabled', false).val('');
        form.find('#bairro_id').val('');
        return;
      }

      var form = $('form');

      form.find('#valor').prop('disabled', true).val(data[0].valor);
      form.find('#bairro_id').val(data[0].id);
    });
  }

  return {
    init: init
  };
};