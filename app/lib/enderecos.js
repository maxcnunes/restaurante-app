var appEnderecos = function () {
  var selectedItem;

  function setupEvents () {
    $('form').on('click', '#save', save);
    $('form').on('click', '#cancel', cancel);
    $('form').on('click', '#search', search);
    $('table').on('click', '.edit-item', edit);
    $('table').on('click', '.remove-item', remove);
  }

  function init () {
    setupEvents();
    load();
  }

  function load () {
    app.db.loadData('enderecos', function (err, data) {
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

    var endereco = getItemFromForm();

    if (!validate(endereco)) {
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
      app.db.create(endereco, 'enderecos', onSave);
    else
      app.db.update(selectedItem.id, endereco, 'enderecos', onSave);
  }

  function validate (endereco) {
    if ((!endereco.bairro) || !endereco.valor) return false;
    return true;
  }

  function search (event) {
    event.preventDefault();

    var searchTerm = buildSearchTerm();

    app.db.filter(searchTerm, 'enderecos', function (err, data) {
      if (err) return;

      loadTable(data);
    });
  }

  function getItemFromForm () {
    var form = $('form');

    return {
      bairro: form.find('#bairro').val(),
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

    form.find('#bairro').val(selectedItem.bairro);
    form.find('#valor').val(selectedItem.valor);

    changeButtonSaveType();
  }

  function remove () {
    event.preventDefault();
    var btn = $(this);

    getSelectedItem(btn);
    
    if (confirm('Deseja remover este item?')) {
      app.db.remove(selectedItem.id, 'enderecos', function (err) {
        if (err) return console.log(err);

        load();
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

  function buildSearchTerm () {
    var endereco = getItemFromForm();

    return function where (data) {
      var pattBairro = new RegExp(endereco.bairro, 'i');
      var pattValor = new RegExp(endereco.valor, 'i');

      if (endereco.bairro && !pattBairro.test(data.bairro)) return false;
      if (endereco.valor && !pattValor.test(data.valor)) return false;
      
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