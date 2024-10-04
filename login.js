document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();  // Prevent form from submitting the default way
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('https://script.google.com/macros/s/AKfycbzqjSSQ-BDRTLY9rkdSwyQ6ZWR9-iTTvWcERyTDF0gNFrJ6d6JJ79wVYasgNlJAsJsJ/exec', {
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
        // Store the delivery person's username in localStorage
        localStorage.setItem('delivery_username', username);
        
        // Redirect to the delivery dashboard
        window.location.href = 'delivery-dashboard.html';
      }
    } else {
      // Show an error if login fails
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('loginError').innerText = 'Yanlış giriş məlumatları';
    }
  })
  .catch(err => console.error('Login error:', err));
});
