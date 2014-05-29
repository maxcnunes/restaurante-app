// namespace
var app = {
  common: appCommon(),
  db: appDB(),
  clientes: appClientes(),
  enderecos: appEnderecos(),
  models: {
    bairro: appModelBairro()
  }
};

var routes = {
  'clientes': postLoad(app.clientes.init),
  'enderecos': postLoad(app.enderecos.init)
};

function postLoad (init) {
  return function () {
    init();
    setupMasks();
  };
}

$(function () {
  loadMainPage();
});

function loadMainPage () {
  $('#navbar').load('../views/navbar.html', setupRoute);
  changePage('clientes', routes.clientes);
}

function changePage (page, cb) {
  $('#main').load('../views/' + page + '.html', cb || doNothing);
}

function setupRoute () {
  $('#menu').on('click', 'a', function () {
    var url = $(this).attr('href');
    var route = url.match(/.*#(.*)/i)[1];

    $('#menu li').removeClass('active');
    $(this).parent('li').addClass('active');

    changePage(route, routes[route]);
  });
}

function setupMasks () {
  $('.phone').mask('0000-0000');
  $('.money').mask('000.000.000.000.000,00', {reverse: true});
}

function doNothing() {}