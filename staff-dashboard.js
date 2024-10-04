// Load today's orders for Staff
function loadOrders() {
  fetch('https://script.google.com/macros/s/AKfycbzqjSSQ-BDRTLY9rkdSwyQ6ZWR9-iTTvWcERyTDF0gNFrJ6d6JJ79wVYasgNlJAsJsJ/exec?action=getTodaysOrders&role=Staff')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const orders = data.orders;
      let html = '<table class="table"><thead><tr><th>ID</th><th>Müştəri Adı</th><th>Status</th><th>Əməliyyatlar</th></tr></thead><tbody>';
      orders.forEach(order => {
        html += `<tr>
                  <td>${order[0]}</td>
                  <td>${order[1]}</td>
                  <td>${order[6]}</td>
                  <td>
                    <button class="btn btn-danger" onclick="cancelOrder(${order[0]})">Ləğv et</button>
                  </td>
                 </tr>`;
      });
      html += '</tbody></table>';
      document.getElementById('orderList').innerHTML = html;
    }
  });
}

// Cancel order
function cancelOrder(orderId) {
  fetch('https://script.google.com/macros/s/AKfycbzqjSSQ-BDRTLY9rkdSwyQ6ZWR9-iTTvWcERyTDF0gNFrJ6d6JJ79wVYasgNlJAsJsJ/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updateOrderStatus',
      orderId: orderId,
      status: 'Canceled'
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadOrders(); // Reload orders after canceling
    }
  });
}

// Load orders when page is ready
window.onload = function() {
  loadOrders();
};
