var appCommon = function () {

  function buildEditRemoveButtons (data) {
    var html = [];
    html.push('<div class="btn-toolbar" role="toolbar">');
    html.push('  <div class="btn-group">');
    html.push('    <button type="button" class="btn btn-xs btn-default edit-item"><span class="glyphicon glyphicon-pencil"></span></button>');
    html.push('    <button type="button" class="btn btn-xs btn-danger remove-item"><span class="glyphicon glyphicon-trash"></span></button>');
    html.push('  </div>');
    html.push('</div>');
    return html.join('');
  }

  return {
    buildEditRemoveButtons: buildEditRemoveButtons
  };
};