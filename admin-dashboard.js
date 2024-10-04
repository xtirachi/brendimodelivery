// Set today's date as default in the date picker and show today's orders
window.onload = function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('orderDateFilter').value = today;
  loadOrdersByDate(today);
};

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


// Load orders for the selected date
function loadOrdersByDate(date) {
  const selectedDate = date || document.getElementById('orderDateFilter').value;
  
  fetchDeliveryUsers().then(deliveryUsers => {
    fetch(`https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec?action=getOrdersByDate&date=${selectedDate}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const orders = data.orders;
          let html = '';
          let totalAmount = 0;
          const perCourierTotal = {};

          orders.forEach(order => {
            const orderAmount = parseFloat(order[10]) || 0;
            totalAmount += orderAmount;

            const courierName = order[7] || 'Təyin edilməyib';
            if (!perCourierTotal[courierName]) {
              perCourierTotal[courierName] = 0;
            }
            perCourierTotal[courierName] += orderAmount;

            let cardColor = '';
            switch (order[6]) {
              case 'Out for Delivery':
                cardColor = 'soft-yellow';
                break;
              case 'Delivered':
                cardColor = 'soft-green';
                break;
              case 'Canceled':
                cardColor = 'soft-red';
                break;
              default:
                cardColor = '';
            }

            html += `
              <div class="order-card ${cardColor}">
                <div class="order-info" onclick="toggleOrderDetails(${order[0]})">
                  <h3>Sifariş ID: ${order[0]}</h3>
                  <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
                  <p><strong>Status:</strong> ${order[6]}</p>
                  <p><strong>Çatdırıcı:</strong> <span id="courierName-${order[0]}">${courierName}</span></p>
                  <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
                  <p><strong>Qiymət:</strong> ${orderAmount} AZN</p>
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
          document.getElementById('totalAmount').innerText = `Toplam Məbləğ: ${totalAmount.toFixed(2)} AZN`;

          let perCourierHtml = 'Çatdırıcılar üzrə toplam məbləğ:<br>';
          for (const courier in perCourierTotal) {
            perCourierHtml += `${courier}: ${perCourierTotal[courier].toFixed(2)} AZN<br>`;
          }
          document.getElementById('totalPerCourier').innerHTML = perCourierHtml;
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
      loadOrdersByDate(); // Reload orders after update
    }
  });
}

// Toggle visibility of order details
function toggleOrderDetails(orderId) {
  const details = document.getElementById(`orderDetails-${orderId}`);
  if (details.style.display === 'none' || details.style.display === '') {
    details.style.display = 'block'; // Show details
  } else {
    details.style.display = 'none'; // Hide details
  }
}

// Redirect to order creation page when "Yeni Sifariş Yarat" button is clicked
document.getElementById('createOrderButton').addEventListener('click', function() {
  window.location.href = 'order-creation.html'; // Redirect to the order creation page
});

