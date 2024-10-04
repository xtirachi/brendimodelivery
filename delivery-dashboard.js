// Load today's orders for the Delivery personnel
function loadOrders(username) {
  fetch(`https://script.google.com/macros/s/AKfycbyh_pGkht7jcRwlA-yzbBfgbRKvkyAXBCZblWEAe0ZQ2vP81rk8hqBC0nuumLVXrC37/exec?action=getTodaysOrders&role=Delivery&username=${username}`)
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
                <label for="payment-${order[0]}">Ödəniş Metodu:</label>
                <select id="payment-${order[0]}" class="form-control">
                  <option value="cash">Nağd</option>
                  <option value="card">Karta</option>
                </select>

                <button class="btn btn-primary" onclick="updateOrderStatus(${order[0]})">Yenilə</button>
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

// Update order status and payment method for Delivery personnel
function updateOrderStatus(orderId) {
  const paymentMethod = document.getElementById(`payment-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbyh_pGkht7jcRwlA-yzbBfgbRKvkyAXBCZblWEAe0ZQ2vP81rk8hqBC0nuumLVXrC37/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updateOrderStatusAndPayment',
      orderId: orderId,
      status: 'Delivered', // Delivery personnel deliver the order
      paymentMethod: paymentMethod
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadOrders('delivery_person_username'); // Replace with logged-in delivery person's username
    }
  });
}

// Calculate total amount delivered by the delivery person
function calculateTotalDelivered(username) {
  fetch(`https://script.google.com/macros/s/AKfycbyh_pGkht7jcRwlA-yzbBfgbRKvkyAXBCZblWEAe0ZQ2vP81rk8hqBC0nuumLVXrC37/exec?action=calculateTotalAmount&role=Delivery&username=${username}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.getElementById('totalDelivered').innerText = `Çatdırılmış: ${data.totalDelivered} AZN`;
      }
    });
}

// Load orders and calculate total delivered when page is ready
window.onload = function() {
  const username = 'delivery_person_username'; // Replace with logged-in delivery person's username
  loadOrders(username);
  calculateTotalDelivered(username);
};
