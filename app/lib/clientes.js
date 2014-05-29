var appClientes = function () {
  var selectedItem, bairrosList = [];

  function setupEvents () {
    $('form').on('click', '#save', app.common.action(save));
    $('form').on('click', '#cancel', app.common.action(cancel));
    $('form').on('click', '#search', app.common.action(search));
    $('table').on('click', '.edit-item', app.common.action(edit));
    $('table').on('click', '.remove-item', app.common.action(remove));
    $('form').on('blur', '#bairro', app.common.action(loadFrete));
  }

  function init () {
    setupEvents();
    setupAutocomplete();
    load();
  }

  function load (err) {
    if (err) return console.log(err);
    app.models.cliente.getAll(loadTable);
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

  function loadTable (err, data) {
    if (err) return console.log(err);

    $('table#result tbody').html('');
    data.forEach(function (item) {
      $('table#result tbody').append(buildEnderecoRow(item));
    });
  }

  function save () {
    app.models.cliente.save(getItemFromForm(), selectedItem, function (err) {
      if (err) return alert(err);

      load();
      cleanForm();
      changeButtonSaveType();
      reloadBairros();
    });
  }

  function reloadBairros () {
    app.models.bairro.getAll(function (err, bairros) {
      if (err) console.log(err);
      bairrosList = bairros;
    });
  }

  function search () {
    app.models.cliente.find(getItemFromForm(), null, loadTable);
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

  function cancel () {
    cleanForm();
    changeButtonSaveType();
  }

  function edit () {
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
    var btn = $(this);

    getSelectedItem(btn);
    
    if (confirm('Deseja remover este item?')) {
      app.models.cliente.remove(selectedItem, load);
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
    function findMatches(q, cb) {
      var matches, substringRegex;
   
      // an array that will be populated with substring matches
      matches = [];
   
      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');
   
      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(bairrosList, function(i, item) {
        if (substrRegex.test(item.bairro)) {
          // the typeahead jQuery plugin expects suggestions to a
          // JavaScript object, refer to typeahead docs for more info
          matches.push(item);
        }
      });
   
      cb(matches);
    }

    app.models.bairro.getAll(function (err, bairros) {
      if (err) console.log(err);

      bairrosList = bairros;

      $('#bairro').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: 'bairros',
        displayKey: 'bairro',
        source: findMatches
      });
    });
  }

  function loadFrete () {
    var form = $('form');
    var cliente = getItemFromForm();

    if (!cliente.bairro) {
      $('#valor').prop('disabled', false).val('');
      return;
    }

    var whereBairro = function (data) {
      var pattBairro = new RegExp('^' + cliente.bairro + '$', 'i');

      return (cliente.bairro && pattBairro.test(data.bairro));  
    };

    app.models.bairro.find(cliente, whereBairro, function (err, data) {
      if (err) return console.log(err);

      if (!data || !data.length) {
        form.find('#valor').prop('disabled', false).val('');
        form.find('#bairro_id').val('');
        return;
      }

      form.find('#valor').prop('disabled', true).val(data[0].valor);
      form.find('#bairro_id').val(data[0].id);
    });
  }

  return {
    init: init
  };
};