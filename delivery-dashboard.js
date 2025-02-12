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

  fetch(`https://script.google.com/macros/s/AKfycbyvUbJFhbCPbGY13gZw7XnuzT4eAkXhT3x4adxSSScJXApsCSN_zkQQwOkR-HiuWkZZ/exec?action=getOrdersByDate&date=${selectedDate}&role=Delivery&username=${username}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const orders = data.orders.filter(order => order[7].trim() === username);

        let html = '';
        let totalCashOnHand = 0; // To track cash for "Cash" orders
        let deliveredOrdersCount = 0;
        let canceledOrdersCount = 0;

        orders.forEach(order => {
          let cardColor = '';
          if (order[6] === 'Delivered') {
            cardColor = 'soft-green';
            deliveredOrdersCount++;
          } else if (order[6] === 'Out for Delivery') {
            cardColor = 'soft-yellow';
          } else if (order[6] === 'Deleted') {
            cardColor = 'soft-red';
          } else if (order[6] === 'Canceled') {
            cardColor = 'soft-red';
            canceledOrdersCount++;
          }

          // Calculate cash on hand (only for Cash and Delivered or Canceled orders)
         // Calculate cash on hand (only for Cash and Delivered or Canceled orders)
if (order[9].toLowerCase() === 'cash' && order[6] === 'Delivered') {
  const orderAmount = parseFloat(order[10]) || 0;
  totalCashOnHand += orderAmount;
}

          // Hide the sales price if payment is via Card
          const salesPrice = order[9].toLowerCase() === 'card' ? '0 AZN (Kartla ödəniş)' : `${order[10]} AZN`;

          // Build the order card with all necessary details, including correct payment method fetching
          html += `
            <div class="order-card ${cardColor}" id="order-${order[0]}">
              <div class="order-info" onclick="toggleOrderDetails(${order[0]})">
                <h3>Sifariş ID: ${order[0]}</h3>
                <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
                <p><strong>Telefon:</strong> <a href="tel:${order[2]}">${order[2]}</a></p>
                <p><strong>Status:</strong> <span id="status-${order[0]}">${order[6]}</span></p>
                <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
                <p><strong>Qiymət:</strong> ${salesPrice}</p>
                <p><strong>Sifariş Təfərrüatları:</strong> ${order[4]}</p>
                <p><strong>Xüsusi Təlimatlar:</strong> ${order[5]}</p>
                <p><strong>Ödəniş Metodu:</strong> ${order[9]}</p>
              </div>
              <div id="orderDetails-${order[0]}" class="order-details">
              <label for="statusSelect-${order[0]}">Sifariş Statusu:</label>
<select id="statusSelect-${order[0]}" class="form-control" onchange="changeStatus(${order[0]}, '${order[8]}')">
  <option value="Out for Delivery" ${order[6] === 'Out for Delivery' ? 'selected' : ''}>Çatdırılır</option>
  <option value="Delivered" ${order[6] === 'Delivered' ? 'selected' : ''}>Çatdırılıb</option>
 <option value="Canceled" ${order[6] === 'Canceled' ? 'selected' : ''}>Ləğv edildi</option>
</select>
          

                <button class="btn btn-primary" onclick="updateOrder(${order[0]})">Yenilə</button>
              </div>
            </div>
          `;
        });

        // Display the amount to be returned after deduction
        const returnAmount = totalCashOnHand - (deliveredOrdersCount * 5);
        document.getElementById('orderList').innerHTML = html;
        document.getElementById('returnAmount').innerText = `Qaytarılacaq məbləğ: ${returnAmount.toFixed(2)} AZN`; // Display the return amount
      } else {
        document.getElementById('orderList').innerHTML = 'Bugünkü sifarişlər tapılmadı.';
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

function updateOrder(orderId) {
  const status = document.getElementById(`statusSelect-${orderId}`).value;

  console.log('Updating order:', orderId, 'with status:', status); // Log order and status

  // Send the updated status to the server using fetch
  fetch('https://script.google.com/macros/s/AKfycbyvUbJFhbCPbGY13gZw7XnuzT4eAkXhT3x4adxSSScJXApsCSN_zkQQwOkR-HiuWkZZ/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updateOrderStatusAndPayment',
      orderId: orderId,
      status: status
    })
  })
  .then(response => {
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Server response:', data); // Log server response
    if (data.success) {
      alert('Sifariş Statusu dəyişildi!');
    } else {
      alert('Failed to update the order status. Please try again.');
    }
  });
}
