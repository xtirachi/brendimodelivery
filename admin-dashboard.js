// Set today's date as default in the date picker and show today's orders automatically
window.onload = function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('orderDateFilter').value = today;

  loadOrdersByDate(today); // Load today's orders on page load
};


// Load orders for the selected date
function loadOrdersByDate(date) {
  const selectedDate = date || document.getElementById('orderDateFilter').value;

  fetch(`https://script.google.com/macros/s/AKfycbyvRg0NcjzEhcYEqJqN4WdJibkFND48M9aswxAeiTjAb1l7kfJKk0E4taICWl0Phz7i/exec?action=getOrdersByDate&date=${selectedDate}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const orders = data.orders;
        let html = '';
        let totalAmount = 0;
        let courierAmounts = {}; // Object to store total money to be returned by each courier
        let netCashPerCourier = {}; // Object to store Net Məbləğ for each courier

        orders.forEach(order => {
          const orderAmount = parseFloat(order[10]) || 0;  // Assuming Column K is Order Amount
          const status = order[6];  // Column G is Status
          const courier = order[7];  // Column H is Assigned Delivery Person
          const paymentMethod = order[9];  // Column J is Payment Method
          const orderDetails = order[4];  // Assuming Column E contains Order Details (Məhsullar, Miqdar)

          // Only count the order in the total amount if it is not canceled
          if (status !== 'Canceled') {
            totalAmount += orderAmount;
          }

         // Calculate Net Məbləğ for each courier (salary deduction of 6 AZN per "Cash" order)
if (status === 'Delivered' && paymentMethod.toLowerCase() === 'cash') {
  // Initialize courier's amount if not set yet
  if (!netCashPerCourier[courier]) {
    netCashPerCourier[courier] += orderAmount - 6;
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

              <!-- Sifariş Təfərrüatları (Order Details) -->
              <div id="orderDetails-${order[0]}" class="order-details">
                <label><strong>Sifariş Təfərrüatları (Məhsullar, Miqdar):</strong></label>
                <p>${orderDetails || 'Məlumat yoxdur'}</p>

                <!-- Status Update -->
                <label for="status-${order[0]}">Sifariş Statusu:</label>
                <select id="statusSelect-${order[0]}" class="form-control" onchange="changeStatus(${order[0]}, '${order[8]}')">
                  <option value="Out for Delivery" ${status === 'Out for Delivery' ? 'selected' : ''}>Çatdırılır</option>
                  <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>Çatdırılıb</option>
                  <option value="Canceled" ${status === 'Canceled' ? 'selected' : ''}>Ləğv edilib</option>
                </select>

                <!-- Courier Assignment -->
                <label for="courier-${order[0]}">Çatdırıcı Təyinatı:</label>
                <select id="courierSelect-${order[0]}" class="form-control" onchange="assignCourier(${order[0]})">
                  <option value="">Çatdırıcı seçin</option>
                </select>

<!-- Payment Method Change for Everyone -->
      <label for="payment-${order[0]}">Ödəniş Metodu:</label>
      <select id="paymentSelect-${order[0]}" class="form-control" onchange="changePaymentMethod(${order[0]})">
        <option value="Cash" ${paymentMethod.toLowerCase() === 'cash' ? 'selected' : ''}>Nağd</option>
        <option value="Card" ${paymentMethod.toLowerCase() === 'card' ? 'selected' : ''}>Karta</option>
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

        // Show the net cash for each courier (total amount minus 6 AZN per delivered order)
        let perCourierHtml = 'Net Məbləğ (hər bir çatdırıcıya):<br>';
        for (const courier in netCashPerCourier) {
          perCourierHtml += `${courier}: ${netCashPerCourier[courier].toFixed(2)} AZN<br>`;
        }
        document.getElementById('totalPerCourier').innerHTML = perCourierHtml;
      } else {
        document.getElementById('orderList').innerHTML = 'Sifariş tapılmadı.';
      }
    });
}

// Update the order status and ensure no other fields (like the date) are cleared
function changeStatus(orderId, orderDate) {
  const status = document.getElementById(`statusSelect-${orderId}`).value;

  // Fetch the original order date and include it in the request
  fetch('https://script.google.com/macros/s/AKfycbyvRg0NcjzEhcYEqJqN4WdJibkFND48M9aswxAeiTjAb1l7kfJKk0E4taICWl0Phz7i/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updateOrderStatusAndPayment',
      orderId: orderId,
      status: status,
      orderDate: orderDate // Include the order date to ensure it is not cleared
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

// Assign courier to the order
function assignCourier(orderId) {
  const courier = document.getElementById(`courierSelect-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbyvRg0NcjzEhcYEqJqN4WdJibkFND48M9aswxAeiTjAb1l7kfJKk0E4taICWl0Phz7i/exec', {
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
  fetch('https://script.google.com/macros/s/AKfycbyvRg0NcjzEhcYEqJqN4WdJibkFND48M9aswxAeiTjAb1l7kfJKk0E4taICWl0Phz7i/exec?action=getDeliveryUsers')
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

  fetch('https://script.google.com/macros/s/AKfycbyvRg0NcjzEhcYEqJqN4WdJibkFND48M9aswxAeiTjAb1l7kfJKk0E4taICWl0Phz7i/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updatePaymentMethod',
      orderId: orderId,
      paymentMethod: paymentMethod,
      orderDate: orderDate
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
