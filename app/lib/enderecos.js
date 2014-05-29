var appEnderecos = function () {
  var selectedItem;

  function setupEvents () {
    $('form').on('click', '#save', app.common.action(save));
    $('form').on('click', '#cancel', app.common.action(cancel));
    $('form').on('click', '#search', app.common.action(search));
    $('table').on('click', '.edit-item', app.common.action(edit));
    $('table').on('click', '.remove-item', app.common.action(remove));
  }

  function init () {
    setupEvents();
    load();
  }

  function load (err) {
    if (err) return console.log(err);
    app.models.bairro.getAll(loadTable);
  }

  function loadTable (err, data) {
    if (err) return console.log(err);

    $('table#result tbody').html('');
    data.forEach(function (item) {
      $('table#result tbody').append(buildEnderecoRow(item));
    });
  }

  function save () {
    app.models.bairro.save(getItemFromForm(), selectedItem, function (err) {
      if (err) return alert(err);

      load();
      cleanForm();
      changeButtonSaveType();
    });
  }

  function search () {
    app.models.bairro.find(getItemFromForm(), null, loadTable);
  }

  function getItemFromForm () {
    var form = $('form');

    return {
      bairro: form.find('#bairro').val(),
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

    form.find('#bairro').val(selectedItem.bairro);
    form.find('#valor').val(selectedItem.valor);

    changeButtonSaveType();
  }

  function remove () {
    var btn = $(this);

    getSelectedItem(btn);
    
    if (confirm('Deseja remover este item?')) {
      app.models.cliente.findByBairroId(selectedItem.id, function (err, clientes) {
        if (clientes && clientes.length) {
          alert('Exclusāo nāo permitida. Existe um cliente cadastrado com esse bairro.');
          return;
        }
        app.models.bairro.remove(selectedItem, load);
      });
    }
  }

  function getSelectedItem (btn) {
    var tr = btn.parents('tr');

    selectedItem = {
      id: tr.find('.id').val(),
      bairro: tr.find('.bairro').text(),
      valor: tr.find('.valor').text().match(/R\$ (.*)/i)[1]
    };
  }

  function cleanForm (form) {
    selectedItem = null;
    $('form').find('input').val('');
  }

  function buildEnderecoRow (data) {
    var html = [];
    html.push('<tr>');
    html.push('  <td class="bairro">' + data.bairro + '</td>');
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

  return {
    init: init
  };
};