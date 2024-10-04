function loadOrders() {
  fetch('https://script.google.com/macros/s/AKfycbwXFf2Ot4trb60iRLLIQVC2GnbGZC4N02-8ahdzpQ6E9O_cgJG6l6z6lrby9k2J2jXB/exec')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const orders = data.data;
      let html = '<table class="table"><thead><tr><th>ID</th><th>Ad</th><th>Status</th><th>Əməliyyatlar</th></tr></thead><tbody>';
      orders.forEach(order => {
        html += `<tr>
                  <td>${order[0]}</td>
                  <td>${order[1]}</td>
                  <td>${order[5]}</td>
                  <td>
                    <button class="btn btn-primary" onclick="updateOrderStatus(${order[0]}, 'Ready for Delivery')">Hazır</button>
                    <button class="btn btn-success" onclick="updateOrderStatus(${order[0]}, 'Out for Delivery')">Çatdırılma üçün</button>
                    <button class="btn btn-warning" onclick="updateOrderStatus(${order[0]}, 'Delivered')">Çatdırıldı</button>
                  </td>
                 </tr>`;
      });
      html += '</tbody></table>';
      document.getElementById('orderList').innerHTML = html;
    }
  })
  .catch(err => console.error('Order load error:', err));
}

function updateOrderStatus(orderId, status) {
  fetch('https://script.google.com/macros/s/AKfycbwXFf2Ot4trb60iRLLIQVC2GnbGZC4N02-8ahdzpQ6E9O_cgJG6l6z6lrby9k2J2jXB/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updateOrderStatus',
      orderId: orderId,
      status: status
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      loadOrders();
    }
  })
  .catch(err => console.error('Status update error:', err));
}

window.onload = loadOrders;

