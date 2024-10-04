// Load today's orders for the Admin
function loadOrders() {
  fetch('https://script.google.com/macros/s/AKfycbyZo9Nq7ulfaRUBDbSBIuQROEncQKrZPVGDmn4hq4RfUN7V6kxXdxgu1i5-aOO9Zg_P/exec?action=getTodaysOrders&role=Admin')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const orders = data.orders;
      let html = '<table class="table"><thead><tr><th>ID</th><th>Müştəri Adı</th><th>Status</th><th>Çatdırılma üçün</th><th>Ödəniş Metodu</th><th>Əməliyyatlar</th></tr></thead><tbody>';
      orders.forEach(order => {
        html += `<tr>
                  <td>${order[0]}</td>
                  <td>${order[1]}</td>
                  <td>${order[6]}</td>
                  <td>
                    <input type="text" class="form-control" id="assign-${order[0]}" placeholder="Çatdırıcı seçin">
                  </td>
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

// Update order status and assign delivery person
function updateOrder(orderId) {
  const assignedTo = document.getElementById(`assign-${orderId}`).value;
  const paymentMethod = document.getElementById(`payment-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbyZo9Nq7ulfaRUBDbSBIuQROEncQKrZPVGDmn4hq4RfUN7V6kxXdxgu1i5-aOO9Zg_P/exec', {
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
  fetch('https://script.google.com/macros/s/AKfycbyZo9Nq7ulfaRUBDbSBIuQROEncQKrZPVGDmn4hq4RfUN7V6kxXdxgu1i5-aOO9Zg_P/exec?action=calculateTotalAmount&role=Admin')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      document.getElementById('totalAmount').innerText = `Toplam Məbləğ: ${data.totalAmount} AZN, Çatdırılmış: ${data.totalDelivered} AZN`;
    }
  });
}

// Load orders and calculate total amount when page is ready
window.onload = function() {
  loadOrders();
  calculateTotalAmount();
};
