// Attach an event listener to handle the login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();  // Prevent form from submitting the default way

  // Get the values of username and password from input fields
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Define the URL for the Google Apps Script to handle login
  const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzqjSSQ-BDRTLY9rkdSwyQ6ZWR9-iTTvWcERyTDF0gNFrJ6d6JJ79wVYasgNlJAsJsJ/exec';

  // Send login request to Google Apps Script via fetch API
  fetch(APPSCRIPT_URL, {
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
      // Handle redirection based on user role
      if (data.role === 'Admin') {
        window.location.href = 'admin-dashboard.html';
      } else if (data.role === 'Staff') {
        // Store the staff username in localStorage
        localStorage.setItem('staff_username', username);
        
        // Redirect to the staff dashboard
        window.location.href = 'staff-dashboard.html';
      } else if (data.role === 'Delivery') {
        // Store the delivery username in localStorage
        localStorage.setItem('delivery_username', username);
        
        // Redirect to the delivery dashboard
        window.location.href = 'delivery-dashboard.html';
      }
    } else {
      // Show an error message if login fails
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('loginError').innerText = 'Yanlış giriş məlumatları';
    }
  })
  .catch(err => console.error('Login error:', err));  // Log any errors in the console
});

