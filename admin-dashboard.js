// Load today's orders for the Admin
function loadOrders() {
  fetch('https://script.google.com/macros/s/AKfycbzqjSSQ-BDRTLY9rkdSwyQ6ZWR9-iTTvWcERyTDF0gNFrJ6d6JJ79wVYasgNlJAsJsJ/exec?action=getTodaysOrders&role=Admin')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const orders = data.orders;
      let html = ''; // Use a string to hold the dynamic HTML
      orders.forEach(order => {
        html += `
          <div class="order-card">
            <div class="order-info">
              <h3>Sifariş ID: ${order[0]}</h3>
              <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
              <p><strong>Status:</strong> ${order[6]}</p>
              <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
              <p><strong>Qiymət:</strong> ${order[10]} AZN</p>
            </div>
            <div class="order-actions">
              <label for="assign-${order[0]}">Çatdırıcı:</label>
              <input type="text" class="form-control" id="assign-${order[0]}" placeholder="Çatdırıcı seçin">

              <label for="payment-${order[0]}">Ödəniş Metodu:</label>
              <select id="payment-${order[0]}" class="form-control">
                <option value="cash">Nağd</option>
                <option value="card">Karta</option>
              </select>

              <button class="btn btn-primary" onclick="updateOrder(${order[0]})">Yenilə</button>
            </div>
          </div>
        `;
      });
      document.getElementById('orderList').innerHTML = html;
    } else {
      document.getElementById('orderList').innerHTML = 'Bugünkü sifarişlər tapılmadı.';
    }
  });
}

// Update order status and assign delivery person
function updateOrder(orderId) {
  const assignedTo = document.getElementById(`assign-${orderId}`).value;
  const paymentMethod = document.getElementById(`payment-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbzqjSSQ-BDRTLY9rkdSwyQ6ZWR9-iTTvWcERyTDF0gNFrJ6d6JJ79wVYasgNlJAsJsJ/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'assignOrder',
      orderId: orderId,
      assignedTo: assignedTo,
      paymentMethod: paymentMethod
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadOrders(); // Reload orders after update
    }
  });
}

// Calculate total amount of today's orders
function calculateTotalAmount() {
  fetch('https://script.google.com/macros/s/AKfycbzqjSSQ-BDRTLY9rkdSwyQ6ZWR9-iTTvWcERyTDF0gNFrJ6d6JJ79wVYasgNlJAsJsJ/exec?action=calculateTotalAmount&role=Admin')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      document.getElementById('totalAmount').innerText = `Toplam Məbləğ: ${data.totalAmount} AZN, Çatdırılmış: ${data.totalDelivered} AZN`;
    }
  });
}

// Redirect to order creation page when "Yeni Sifariş Yarat" button is clicked
document.getElementById('createOrderButton').addEventListener('click', function() {
  window.location.href = 'order-creation.html'; // Redirect to the order creation page
});

// Load orders and calculate total amount when page is ready
window.onload = function() {
  loadOrders();
  calculateTotalAmount();
};
