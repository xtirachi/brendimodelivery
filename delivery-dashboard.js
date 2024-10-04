// Function to set the username in localStorage when the user logs in (you should call this on successful login)
function setUsername(username) {
  localStorage.setItem('delivery_username', username);
}

// Function to get the username from localStorage
function getUsername() {
  const username = localStorage.getItem('delivery_username');
  if (!username) {
    window.location.href = 'login.html'; // Redirect to login page if username is missing
  }
  return username;
}

// Function to check if the courier is logged in, otherwise redirect to the login page
function checkLoginStatus() {
  const username = getUsername();
  return username;
}


// Set today's date as default in the date picker and load today's orders automatically
window.onload = function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('orderDateFilter').value = today;

  const username = checkLoginStatus(); // Ensure username is available
  loadOrdersByDate(today); // Load today's orders on page load
};

// Load orders for the selected date and logged-in delivery person
function loadOrdersByDate(date) {
  const selectedDate = date || document.getElementById('orderDateFilter').value;
  const username = getUsername(); // Always get the username from localStorage to ensure it's not lost

  fetch(`https://script.google.com/macros/s/AKfycbzaX_Dhlr3lyVLNFgiUOvwSJwXrWmJKbNsrbo8y8QHPLcqX_Pq67nxC3EmZK8uArGy7/exec?action=getOrdersByDate&date=${selectedDate}&role=Delivery&username=${username}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log("Logged-in user:", username); // Debugging
        console.log("Orders data:", data.orders);

        // Filter orders where Column H (index 7) matches the logged-in courier's username
        const orders = data.orders.filter(order => order[7].trim() === username);

        let html = '';
        let totalCashOnHand = 0; // To track total cash amount
        let netCashOnHand = 0;   // To track net cash amount (after deducting 6 AZN per delivered order)
        let deliveredOrdersCount = 0; // Track how many orders were delivered with cash

        orders.forEach(order => {
          let cardColor = '';
          if (order[6] === 'Delivered') {
            cardColor = 'soft-green';
          } else if (order[6] === 'Out for Delivery') {
            cardColor = 'soft-yellow';
          } else if (order[6] === 'Canceled') {
            cardColor = 'soft-red';
          }

          // Calculate cash on hand (exclude orders paid via Card)
          if (order[9] === 'Cash' && order[6] === 'Delivered') {  // Assuming Column J (index 9) holds payment method
            const orderAmount = parseFloat(order[10]) || 0; // Assuming Column K (index 10) holds order amount
            totalCashOnHand += orderAmount; // Add to total cash
            deliveredOrdersCount++; // Increment the delivered cash order count
          }

          // Build the order card with additional information
          html += `
            <div class="order-card ${cardColor}" id="order-${order[0]}">
              <div class="order-info" onclick="toggleOrderDetails(${order[0]})">
                <h3>Sifariş ID: ${order[0]}</h3>
                <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
                <p><strong>Telefon:</strong> <a href="tel:${order[2]}">${order[2]}</a></p>  <!-- Column C for Phone Number -->
                <p><strong>Status:</strong> <span id="status-${order[0]}">${order[6]}</span></p>
                <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
                <p><strong>Qiymət:</strong> ${order[10]} AZN</p>
                <p><strong>Sifariş Təfərrüatları:</strong> ${order[4]}</p>  <!-- Column E for Order Details -->
                <p><strong>Xüsusi Təlimatlar:</strong> ${order[5]}</p>  <!-- Column F for Special Instructions -->
              </div>
              <div id="orderDetails-${order[0]}" class="order-details">
                <label for="status-${order[0]}">Sifariş Statusu:</label>
                <select id="statusSelect-${order[0]}" class="form-control" onchange="changeStatus(${order[0]}, '${order[8]}')">
                  <option value="Out for Delivery" ${order[6] === 'Out for Delivery' ? 'selected' : ''}>Çatdırılır</option>
                  <option value="Delivered" ${order[6] === 'Delivered' ? 'selected' : ''}>Çatdırılıb</option>
                </select>

                <label for="payment-${order[0]}">Ödəniş Metodu:</label>
                <select id="paymentSelect-${order[0]}" class="form-control" onchange="changePaymentMethod(${order[0]})">
                  <option value="Cash" ${order[9] === 'Cash' ? 'selected' : ''}>Nağd</option>
                  <option value="Card" ${order[9] === 'Card' ? 'selected' : ''}>Karta</option>
                </select>

                <button class="btn btn-primary" onclick="updateOrder(${order[0]})">Yenilə</button>
              </div>
            </div>
          `;
        });

        // Calculate Net Nağd Məbləğ: Deduct 6 AZN per delivered order
        netCashOnHand = totalCashOnHand - (deliveredOrdersCount * 6);

        // Display the total and net cash amounts
        document.getElementById('orderList').innerHTML = html;
        document.getElementById('totalDelivered').innerText = `Nağd Məbləğ: ${totalCashOnHand.toFixed(2)} AZN`;
        document.getElementById('netCashOnHand').innerText = `Net Nağd Məbləğ: ${netCashOnHand.toFixed(2)} AZN`; // Display net cash on hand
      } else {
        document.getElementById('orderList').innerHTML = 'Bugünkü sifarişlər tapılmadı.';
      }
    });
}

// Update the order status and ensure no other fields (like the date) are cleared
function changeStatus(orderId, orderDate) {
  const status = document.getElementById(`statusSelect-${orderId}`).value;

  fetch('https://script.google.com/macros/s/YOUR_SCRIPT_URL/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updateOrderStatusAndPayment',
      orderId: orderId,
      status: status,
      orderDate: orderDate // Ensure the order date is not cleared
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

// Toggle visibility of order details
function toggleOrderDetails(orderId) {
  const details = document.getElementById(`orderDetails-${orderId}`);
  if (details.style.display === 'none' || details.style.display === '') {
    details.style.display = 'block'; // Show details
  } else {
    details.style.display = 'none'; // Hide details
  }
}

// Add an event listener to date picker to reload orders on date change
document.getElementById('orderDateFilter').addEventListener('change', function() {
  const selectedDate = this.value;
  loadOrdersByDate(selectedDate); // Reload orders when the date is changed, the username is fetched inside
});

