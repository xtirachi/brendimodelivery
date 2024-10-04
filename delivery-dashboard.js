// Load today's orders for Delivery personnel
function loadOrders(username) {
  fetch(`https://script.google.com/macros/s/AKfycbyZo9Nq7ulfaRUBDbSBIuQROEncQKrZPVGDmn4hq4RfUN7V6kxXdxgu1i5-aOO9Zg_P/exec?action=getTodaysOrders&role=Delivery&username=${username}`)
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const orders = data.orders;
      let html = '<table class="table"><thead><tr><th>ID</th><th>Müştəri Adı</th><th>Status</th><th>Ödəniş Metodu</th><th>Əməliyyatlar</th></tr></thead><tbody>';
      orders.forEach(order => {
        html += `<tr>
                  <td>${order[0]}</td>
                  <td>${order[1]}</td>
                  <td>${order[6]}</td>
                  <td>
                    <select id="payment-${order[0]}" class="form-control">
                      <option value="cash">Nağd</option>
                      <option value="card">Karta</option>
                    </select>
                  </td>
                  <td>
                    <button class="btn btn-primary" onclick="updateOrder(${order[0]})">Yenilə</button>
                  </td>
                 </tr>`;
      });
      html += '</tbody></table>';
      document.getElementById('orderList').innerHTML = html;
    }
  });
}

// Update order status and payment method for Delivery personnel
function updateOrder(orderId) {
  const paymentMethod = document.getElementById(`payment-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbyZo9Nq7ulfaRUBDbSBIuQROEncQKrZPVGDmn4hq4RfUN7V6kxXdxgu1i5-aOO9Zg_P/exec', {
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
      loadOrders(); // Reload orders after update
    }
  });
}

// Calculate total amount delivered by the delivery person
function calculateTotalDelivered(username) {
  fetch(`https://script.google.com/macros/s/AKfycbyZo9Nq7ulfaRUBDbSBIuQROEncQKrZPVGDmn4hq4RfUN7V6kxXdxgu1i5-aOO9Zg_P/exec?action=calculateTotalAmount&role=Delivery&username=${username}`)
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      document.getElementById('totalDelivered').innerText = `Çatdırılmış: ${data.totalDelivered} AZN`;
    }
  });
}

// Load orders and calculate total delivered when page is ready
window.onload = function() {
  const username = 'delivery_person'; // Replace with logged-in delivery person's username
  loadOrders(username);
  calculateTotalDelivered(username);
};
