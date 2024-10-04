document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const customerName = document.getElementById('customerName').value;
  const contactInfo = document.getElementById('contactInfo').value;
  const deliveryAddress = document.getElementById('deliveryAddress').value;
  const orderDetails = document.getElementById('orderDetails').value;
  const specialInstructions = document.getElementById('specialInstructions').value;
  const orderDate = document.getElementById('orderDate').value;
  const productSalesPrice = parseFloat(document.getElementById('productSalesPrice').value);

  // Send the data to Google Apps Script to create the order
  fetch('https://script.google.com/macros/s/AKfycbzqjSSQ-BDRTLY9rkdSwyQ6ZWR9-iTTvWcERyTDF0gNFrJ6d6JJ79wVYasgNlJAsJsJ/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'createOrder',
      customerName: customerName,
      contactInfo: contactInfo,
      deliveryAddress: deliveryAddress,
      orderDetails: orderDetails,
      specialInstructions: specialInstructions,
      orderDate: orderDate,
      productSalesPrice: productSalesPrice
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      document.getElementById('orderSuccess').style.display = 'block';
      document.getElementById('orderError').style.display = 'none';
      document.getElementById('orderForm').reset(); // Reset the form after successful submission
    } else {
      document.getElementById('orderError').style.display = 'block';
      document.getElementById('orderSuccess').style.display = 'none';
    }
  })
  .catch(err => {
    document.getElementById('orderError').style.display = 'block';
    document.getElementById('orderSuccess').style.display = 'none';
    console.error('Order creation error:', err);
  });
});

// Set tomorrow as the default order date
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
document.getElementById('orderDate').value = tomorrow.toISOString().split('T')[0];
