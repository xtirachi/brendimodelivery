// Set today's date as default in the date picker and show today's orders automatically
window.onload = function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('orderDateFilter').value = today;

  loadOrdersByDate(today); // Load today's orders on page load
};

// Load orders for the selected date
function loadOrdersByDate(date) {
  const selectedDate = date || document.getElementById('orderDateFilter').value;

  fetch(`https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec?action=getOrdersByDate&date=${selectedDate}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const orders = data.orders;
        let html = '';
        let totalAmount = 0;
        let courierAmounts = {}; // Object to store total money to be returned by each courier
        let netCashPerCourier = {}; // Object to store Net Nağd Məbləğ for each courier

        orders.forEach(order => {
          const orderAmount = parseFloat(order[10]) || 0;  // Assuming Column K is Order Amount
          const status = order[6];  // Column G is Status
          const courier = order[7];  // Column H is Assigned Delivery Person
          const paymentMethod = order[9];  // Column J is Payment Method

          // Add to the total amount for Admin (we want to track all orders)
          totalAmount += orderAmount;

          // If the order is "Delivered" and the payment method is "Cash", deduct 6 AZN for the courier
          if (status === 'Delivered' && paymentMethod === 'Cash') {
            const returnAmount = orderAmount - 6;

            // If the courier doesn't exist in the courierAmounts object, initialize it
            if (!courierAmounts[courier]) {
              courierAmounts[courier] = 0;
            }
            if (!netCashPerCourier[courier]) {
              netCashPerCourier[courier] = 0;
            }

            // Add the full order amount to courier's total cash
            courierAmounts[courier] += orderAmount;

            // Deduct 6 AZN for each delivered cash order
            netCashPerCourier[courier] += returnAmount;
          }

          // Add the order to the HTML
          let cardColor = '';
          if (status === 'Delivered') {
            cardColor = 'soft-green';
          } else if (status === 'Out for Delivery') {
            cardColor = 'soft-yellow';
          } else if (status === 'Canceled') {
            cardColor = 'soft-red';
          }

          html += `
            <div class="order-card ${cardColor}" id="order-${order[0]}">
              <div class="order-info">
                <h3>Sifariş ID: ${order[0]}</h3>
                <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
                <p><strong>Status:</strong> <span id="status-${order[0]}">${status}</span></p>
                <p><strong>Çatdırıcı:</strong> <span id="courier-${order[0]}">${courier || 'Təyin edilməyib'}</span></p>
                <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
                <p><strong>Qiymət:</strong> ${orderAmount} AZN</p>
                <p><strong>Ödəniş Metodu:</strong> ${paymentMethod}</p>
              </div>

              <!-- Status and Courier Assignment Controls -->
              <div id="orderDetails-${order[0]}" class="order-details">
                <!-- Status Update -->
                <label for="status-${order[0]}">Sifariş Statusu:</label>
                <select id="statusSelect-${order[0]}" class="form-control" onchange="changeStatus(${order[0]})">
                  <option value="Out for Delivery" ${status === 'Out for Delivery' ? 'selected' : ''}>Çatdırılır</option>
                  <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>Çatdırılıb</option>
                  <option value="Canceled" ${status === 'Canceled' ? 'selected' : ''}>Ləğv edilib</option>
                </select>

                <!-- Courier Assignment -->
                <label for="courier-${order[0]}">Çatdırıcı Təyinatı:</label>
                <select id="courierSelect-${order[0]}" class="form-control" onchange="assignCourier(${order[0]})">
                  <option value="">Çatdırıcı seçin</option>
                </select>

                <button class="btn btn-primary" onclick="updateOrder(${order[0]})">Yenilə</button>
              </div>
            </div>
          `;

          // Fetch and populate couriers in the select dropdown
          fetchDeliveryUsers(order[0]);
        });

        document.getElementById('orderList').innerHTML = html;
        document.getElementById('totalAmount').innerText = `Toplam Məbləğ: ${totalAmount.toFixed(2)} AZN`;

        // Show the total amount that each courier has to return (after deducting 6 AZN per delivered order)
        let perCourierHtml = 'Net Nağd Məbləğ (hər bir çatdırıcıya):<br>';
        for (const courier in netCashPerCourier) {
          perCourierHtml += `${courier}: ${netCashPerCourier[courier].toFixed(2)} AZN<br>`;
        }
        document.getElementById('totalPerCourier').innerHTML = perCourierHtml;
      } else {
        document.getElementById('orderList').innerHTML = 'Sifariş tapılmadı.';
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
      } else if (status === 'Canceled') {
        orderCard.classList.remove('soft-green', 'soft-yellow');
        orderCard.classList.add('soft-red');
      }
    }
  });
}

// Assign courier to the order
function assignCourier(orderId) {
  const courier = document.getElementById(`courierSelect-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'assignOrder',
      orderId: orderId,
      assignedTo: courier
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update the courier text in the card
      document.getElementById(`courier-${orderId}`).innerText = courier;
    }
  });
}

// Fetch delivery users to populate courier dropdowns
function fetchDeliveryUsers(orderId) {
  fetch('https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec?action=getDeliveryUsers')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const select = document.getElementById(`courierSelect-${orderId}`);
        data.users.forEach(user => {
          const option = document.createElement('option');
          option.value = user.username;
          option.text = user.username;
          select.appendChild(option);
        });
      }
    });
}

// Change the payment method and recalculate the total cash on hand
function changePaymentMethod(orderId) {
  const paymentMethod = document.getElementById(`paymentSelect-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updatePaymentMethod',
      orderId: orderId,
      paymentMethod: paymentMethod
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Recalculate the cash on hand based on the new payment method
      loadOrdersByDate(null); // Reload the orders and recalculate
    }
  });
}
