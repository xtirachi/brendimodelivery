var apiUrl = 'https://script.google.com/macros/s/AKfycbzRBQ6o28wdXuGodG_1pvVY9iXSmoIQnPp5gXJkx6DreokLUWAk-ziRucG5tM9IvxOI/exec';

$(document).ready(function() {
  // Giriş funksionallığı
  $('#loginForm').submit(function(e) {
    e.preventDefault();
    var username = $('#username').val();
    var password = $('#password').val();

    $.post(apiUrl, {
      action: 'login',
      username: username,
      password: password
    }, function(response) {
      var data = JSON.parse(response);
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'index.html';
      } else {
        $('#loginError').text(data.message);
      }
    });
  });

  // Ana səhifə funksionallığı
  if (window.location.pathname.endsWith('index.html')) {
    var user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      window.location.href = 'login.html';
    } else {
      $('#userRole').text('Rol: ' + user.role);
      // Navigasiya linklərini doldurmaq
      if (user.role === 'Admin' || user.role === 'İşçi') {
        $('#navLinks').append('<li class="nav-item"><a class="nav-link" href="#" id="createOrderLink">Sifariş Yarat</a></li>');
      }
      $('#navLinks').append('<li class="nav-item"><a class="nav-link" href="#" id="ordersLink">Sifarişlər</a></li>');
      // Çıxış düyməsi
      $('#logoutBtn').click(function() {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      });
      // Səhifə məzmununu doldurmaq
      loadOrders();
    }
  }
});

function loadOrders() {
  $.post(apiUrl, { action: 'getOrders' }, function(response) {
    var data = JSON.parse(response);
    if (data.success) {
      var orders = data.orders;
      var content = '<h3>Sifarişlər</h3><table class="table"><thead><tr><th>ID</th><th>Müştəri</th><th>Status</th><th>Əməliyyatlar</th></tr></thead><tbody>';
      orders.forEach(function(order) {
        content += '<tr><td>' + order.orderId + '</td><td>' + order.customerName + '</td><td>' + order.status + '</td><td><button class="btn btn-primary btn-sm" onclick="viewOrder(\'' + order.orderId + '\')">Bax</button></td></tr>';
      });
      content += '</tbody></table>';
      $('#mainContent').html(content);
    }
  });
}

function viewOrder(orderId) {
  // Sifariş detalları modalı
}
