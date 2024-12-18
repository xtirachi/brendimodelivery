
// Set today's date as default in the date picker and show today's orders automatically
window.onload = function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('orderDateFilter').value = today;

  loadOrdersByDate(today); // Load today's orders on page load
};

// Load orders for the selected date
function loadOrdersByDate(date) {
  const selectedDate = date || document.getElementById('orderDateFilter').value;
  
  fetch(`https://script.google.com/macros/s/AKfycbxTqcTJ1WVzDqqHsYeq2HqWU9sFJcx2SjnMEZ-g4IYvRmksEDLbPCPvSC980Vtx5xSq/exec?action=getOrdersByDate&date=${selectedDate}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const orders = data.orders;
        let html = '';
        let totalAmount = 0;
        let courierAmounts = {}; // Object to store total money to be returned by each courier
        let netCashPerCourier = {}; // Object to store Net Məbləğ for each courier

        orders.forEach(order => {
          const courier = order[7]; // Column H is Assigned Delivery Person

  // Skip orders assigned to "Taxi" or "Ilham"
  if (courier === 'taxi' || courier === 'ilham') {
    return; // Skip this iteration
  }
          const orderAmount = parseFloat(order[10]) || 0;  // Assuming Column K is Order Amount
          const status = order[6];  // Column G is Status
          const paymentMethod = order[9];  // Column J is Payment Method
          const orderDetails = order[4];  // Assuming Column E contains Order Details (Məhsullar, Miqdar)

          // Only count the order in the total amount if it is not canceled
          if (status !== 'Canceled' || status === 'Deleted') {
            totalAmount += orderAmount;
          }

if (status === 'Delivered' || status === 'Canceled') {
  // Initialize courier's amount if not set yet
  if (!netCashPerCourier[courier]) {
    netCashPerCourier[courier] = 0;  // Initialize to 0 if undefined
  }

  // Deduct 6 AZN for each delivered or canceled order
  netCashPerCourier[courier] -= 6;

  // Only add the order amount to netCashPerCourier for cash payments and if the order is delivered
  if (status === 'Delivered' && paymentMethod.toLowerCase() === 'cash') {
    netCashPerCourier[courier] += orderAmount;
  }
}


         // Add the order to the HTML
let cardColor = '';

if (courier === 'emil' && status === 'Delivered') {
  cardColor = 'soft-blue'; // Soft blue for Emil's delivered orders
} else if (courier === 'emil') {
  cardColor = 'soft-purple'; // Soft purple for Emil's other orders
} else if (status === 'Delivered') {
  cardColor = 'soft-green'; // Soft green for delivered orders
} else if (status === 'Out for Delivery') {
  cardColor = 'soft-yellow'; // Soft yellow for out-for-delivery orders
} else if (status === 'Canceled' || status === 'Deleted') {
  cardColor = 'soft-red'; // Soft red for canceled/deleted orders
}

         html += `
  <div class="order-card ${cardColor}" id="order-${order[0]}">
    <div class="order-info">
      <h3>Sifariş ID: ${order[0]}</h3>
      <p><strong>Satıcı Adı:</strong> ${order[16]}</p>
     <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
                <p><strong>Telefon:</strong> <a href="tel:${order[2]}">${order[2]}</a></p>
                <p><strong>Status:</strong> <span id="status-${order[0]}">${order[6]}</span></p>
                <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
                <p><strong>Qiymət:</strong> ${salesPrice}</p>
                <p><strong>Sifariş Təfərrüatları:</strong> ${order[4]}</p>
                <p><strong>Xüsusi Təlimatlar:</strong> ${order[5]}</p>
                <p><strong>Ödəniş Metodu:</strong> ${order[9]}</p>
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
 </div>
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
  fetch('https://script.google.com/macros/s/AKfycbxTqcTJ1WVzDqqHsYeq2HqWU9sFJcx2SjnMEZ-g4IYvRmksEDLbPCPvSC980Vtx5xSq/exec', {
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

// Assign courier to the order
function assignCourier(orderId) {
  const courier = document.getElementById(`courierSelect-${orderId}`).value;

  fetch('https://script.google.com/macros/s/AKfycbxTqcTJ1WVzDqqHsYeq2HqWU9sFJcx2SjnMEZ-g4IYvRmksEDLbPCPvSC980Vtx5xSq/exec', {
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
  fetch('https://script.google.com/macros/s/AKfycbxTqcTJ1WVzDqqHsYeq2HqWU9sFJcx2SjnMEZ-g4IYvRmksEDLbPCPvSC980Vtx5xSq/exec?action=getDeliveryUsers')
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

  fetch('https://script.google.com/macros/s/AKfycbxTqcTJ1WVzDqqHsYeq2HqWU9sFJcx2SjnMEZ-g4IYvRmksEDLbPCPvSC980Vtx5xSq/exec', {
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

// Function to update the delivery address, price, and payment method
function updateOrderDetails(orderId) {
  const deliveryAddress = document.getElementById(`deliveryAddress-${orderId}`).value;
  const orderPrice = document.getElementById(`orderPrice-${orderId}`).value;
  const paymentMethod = document.getElementById(`paymentSelect-${orderId}`).value;

  // Make a POST request to update the order details
  fetch('https://script.google.com/macros/s/AKfycbxfx5QM1Ibupxq_4TXIdzAi2tlaJhCZe5gWzLm1JIoTIjtUMjpwfKCdKH2oRgqCrKJ8/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'updateOrderDetails',
      orderId: orderId,
      deliveryAddress: deliveryAddress,
      orderPrice: orderPrice,
      paymentMethod: paymentMethod
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Məlumatlar dəyişdirildi');
    } else {
      alert('Failed to update order details');
    }
  })
  .catch(error => {
    console.error('Error updating order:', error);
  });
}

// Function to display the filtered orders
function displayOrders(filteredOrders) {
  const orderList = document.getElementById("orderList");
  orderList.innerHTML = ""; // Clear previous results

  filteredOrders.forEach(order => {
    const orderItem = document.createElement("div");
    orderItem.textContent = `Order ID: ${order.id}, Courier: ${order.courier}, Date: ${order.date}`;
    orderList.appendChild(orderItem);
  });
}

// Function to calculate and display the order count for each courier
function calculateOrdersCount(filteredOrders) {
  const couriers = {};
  filteredOrders.forEach(order => {
    couriers[order.courier] = (couriers[order.courier] || 0) + 1;
  });

  const totalPerCourier = document.getElementById("totalPerCourier");
  totalPerCourier.innerHTML = "<h3>Net Məbləğ (hər bir çatdırıcıya):</h3>";

  for (const [courier, count] of Object.entries(couriers)) {
    const courierInfo = document.createElement("div");
    courierInfo.textContent = `${courier}: ${count} orders`;
    totalPerCourier.appendChild(courierInfo);
  }
}


// Function to delete an order from the UI and log it as 'Deleted' in the status column
function deleteOrder(orderId) {
  // Show a confirmation dialog to the user
  const isConfirmed = confirm("Sifarişi silmək istədiyinizə əminsiniz?");

  // If the user confirms, proceed with the deletion
  if (isConfirmed) {
    // Remove the order container from the UI
    const orderCard = document.getElementById(`order-${orderId}`);
    if (orderCard) {
      orderCard.remove();
    }

    // Send a request to log the deletion in the Google Sheets (set status to 'Deleted')
    fetch('https://script.google.com/macros/s/AKfycbxfx5QM1Ibupxq_4TXIdzAi2tlaJhCZe5gWzLm1JIoTIjtUMjpwfKCdKH2oRgqCrKJ8/exec', {
      method: 'POST',
      body: new URLSearchParams({
        action: 'deleteOrder',
        orderId: orderId
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Sifariş uğurla silindi.');
      } else {
        alert('Sifarişi silmək alınmadı.');
      }
    })
    .catch(error => {
      console.error('Sifarişi silmək zamanı xəta baş verdi:', error);
    });
  }
}
