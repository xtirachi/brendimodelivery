document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('https://script.google.com/macros/s/AKfycbwXFf2Ot4trb60iRLLIQVC2GnbGZC4N02-8ahdzpQ6E9O_cgJG6l6z6lrby9k2J2jXB/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'login',
      username: username,
      password: password
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      if (data.role === 'Admin') {
        window.location.href = 'admin-dashboard.html';
      } else if (data.role === 'Staff') {
        window.location.href = 'staff-dashboard.html';
      } else if (data.role === 'Delivery') {
        window.location.href = 'delivery-dashboard.html';
      }
    } else {
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('loginError').innerText = 'Yanlış giriş məlumatları';
    }
  })
  .catch(err => console.error('Login error:', err));
});
