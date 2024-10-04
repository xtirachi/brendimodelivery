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

            // Add the returnAmount to the courier's total
            courierAmounts[courier] += returnAmount;
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
            <div class="order-card ${cardColor}">
              <div class="order-info">
                <h3>Sifariş ID: ${order[0]}</h3>
                <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Çatdırıcı:</strong> ${courier}</p>
                <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
                <p><strong>Qiymət:</strong> ${orderAmount} AZN</p>
                <p><strong>Ödəniş Metodu:</strong> ${paymentMethod}</p>
              </div>
            </div>
          `;
        });

        document.getElementById('orderList').innerHTML = html;
        document.getElementById('totalAmount').innerText = `Toplam Məbləğ: ${totalAmount.toFixed(2)} AZN`;

        // Show the total amount that each courier has to return (after deducting 6 AZN per delivered order)
        let perCourierHtml = 'Çatdırıcıların geri qaytarmalı olduqları məbləğ:<br>';
        for (const courier in courierAmounts) {
          perCourierHtml += `${courier}: ${courierAmounts[courier].toFixed(2)} AZN<br>`;
        }
        document.getElementById('totalPerCourier').innerHTML = perCourierHtml;
      } else {
        document.getElementById('orderList').innerHTML = 'Sifariş tapılmadı.';
      }
    });
}
