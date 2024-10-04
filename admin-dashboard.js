// Fetch users with Delivery role from the Users Sheet
function fetchDeliveryUsers() {
  return fetch('https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec?action=getDeliveryUsers')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        return data.users; // Return the list of delivery users
      } else {
        console.error('Failed to fetch delivery users');
        return [];
      }
    });
}

// Load orders for a specific date selected from the date picker
function loadOrdersByDate() {
  const selectedDate = document.getElementById('orderDateFilter').value;
  if (!selectedDate) {
    loadOrders(); // If no date is selected, load today's orders
    return;
  }

  fetchDeliveryUsers().then(deliveryUsers => {
    fetch(`https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec?action=getOrdersByDate&date=${selectedDate}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const orders = data.orders;
          let html = ''; // Use a string to hold the dynamic HTML
          orders.forEach(order => {
            html += `
              <div class="order-card">
                <div class="order-info" onclick="toggleOrderDetails(${order[0]})">
                  <h3>Sifariş ID: ${order[0]}</h3>
                  <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
                  <p><strong>Status:</strong> ${order[6]}</p>
                  <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
                  <p><strong>Qiymət:</strong> ${order[10]} AZN</p>
                  <p><strong>Çatdırıcı:</strong> <span id="courierName-${order[0]}">${order[7] ? order[7] : 'Təyin edilməyib'}</span></p>
                </div>
                <div id="orderDetails-${order[0]}" class="order-details">
                  <label for="assign-${order[0]}">Çatdırıcı:</label>
                  <select id="assign-${order[0]}" class="form-control">
                    ${deliveryUsers.map(user => `<option value="${user.username}" ${order[7] === user.username ? 'selected' : ''}>${user.username}</option>`).join('')}
                  </select>

                  <label for="status-${order[0]}">Sifariş Statusu:</label>
                  <select id="status-${order[0]}" class="form-control">
                    <option value="Preparing" ${order[6] === 'Preparing' ? 'selected' : ''}>Hazırlanır</option>
                    <option value="Ready for Delivery" ${order[6] === 'Ready for Delivery' ? 'selected' : ''}>Çatdırılmaya Hazır</option>
                    <option value="Out for Delivery" ${order[6] === 'Out for Delivery' ? 'selected' : ''}>Çatdırılır</option>
                    <option value="Delivered" ${order[6] === 'Delivered' ? 'selected' : ''}>Çatdırılıb</option>
                    <option value="Canceled" ${order[6] === 'Canceled' ? 'selected' : ''}>Ləğv edilib</option>
                  </select>

                  <button class="btn btn-primary" onclick="updateOrder(${order[0]})">Yenilə</button>
                </div>
              </div>
            `;
          });
          document.getElementById('orderList').innerHTML = html;
        } else {
          document.getElementById('orderList').innerHTML = 'Sifariş tapılmadı.';
        }
      });
  });
}

// Update order status and assign delivery person
function updateOrder(orderId) {
  const assignedTo = document.getElementById(`assign-${orderId}`).value;
  const status = document.getElementById(`status-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'assignOrder',
      orderId: orderId,
      assignedTo: assignedTo,
      status: status
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      document.getElementById(`courierName-${orderId}`).innerText = assignedTo; // Update the courier name in the UI
      loadOrders(); // Reload orders after update
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
};
