// Retrieve the logged-in delivery person's username from localStorage
const username = localStorage.getItem('delivery_username');

// Check if the username exists, if not redirect to login page
if (!username) {
  window.location.href = 'login.html'; // Redirect to login page if not logged in
}

// Set today's date as default in the date picker and load today's orders automatically
window.onload = function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('orderDateFilter').value = today;

  loadOrdersByDate(today, username); // Load today's orders on page load
};

// Load orders for the selected date and logged-in delivery person
function loadOrdersByDate(date, username) {
  const selectedDate = date || document.getElementById('orderDateFilter').value;

  fetch(`https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec?action=getOrdersByDate&date=${selectedDate}&role=Delivery&username=${username}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const orders = data.orders.filter(order => order[7] === username); // Filter orders where Column H matches the delivery person
        let html = '';
        let totalDelivered = 0;

        orders.forEach(order => {
          let cardColor = '';
          if (order[6] === 'Delivered') {
            cardColor = 'soft-green';
            totalDelivered += parseFloat(order[10]) || 0;
          } else if (order[6] === 'Out for Delivery') {
            cardColor = 'soft-yellow';
          } else if (order[6] === 'Canceled') {
            cardColor = 'soft-red';
          }

          html += `
            <div class="order-card ${cardColor}" id="order-${order[0]}">
              <div class="order-info" onclick="toggleOrderDetails(${order[0]})">
                <h3>Sifariş ID: ${order[0]}</h3>
                <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
                <p><strong>Status:</strong> <span id="status-${order[0]}">${order[6]}</span></p>
                <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
                <p><strong>Qiymət:</strong> ${order[10]} AZN</p>
              </div>
              <div id="orderDetails-${order[0]}" class="order-details">
                <label for="status-${order[0]}">Sifariş Statusu:</label>
                <select id="statusSelect-${order[0]}" class="form-control" onchange="changeStatus(${order[0]})">
                  <option value="Out for Delivery" ${order[6] === 'Out for Delivery' ? 'selected' : ''}>Çatdırılır</option>
                  <option value="Delivered" ${order[6] === 'Delivered' ? 'selected' : ''}>Çatdırılıb</option>
                </select>
              </div>
            </div>
          `;
        });

        document.getElementById('orderList').innerHTML = html;
        document.getElementById('totalDelivered').innerText = `Çatdırılmış Toplam Məbləğ: ${totalDelivered.toFixed(2)} AZN`;
      } else {
        document.getElementById('orderList').innerHTML = 'Bugünkü sifarişlər tapılmadı.';
      }
    });
}

// Update the order status and change the card color dynamically
function changeStatus(orderId) {
  const status = document.getElementById(`statusSelect-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updateOrderStatusAndPayment',
      orderId: orderId,
      status: status
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update the status text in the card
      document.getElementById(`status-${orderId}`).innerText = status;

      // Change the card color based on the new status
      const orderCard = document.getElementById(`order-${orderId}`);
      if (status === 'Delivered') {
        orderCard.classList.remove('soft-yellow', 'soft-red');
        orderCard.classList.add('soft-green');
      } else if (status === 'Out for Delivery') {
        orderCard.classList.remove('soft-green', 'soft-red');
        orderCard.classList.add('soft-yellow');
      }
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
