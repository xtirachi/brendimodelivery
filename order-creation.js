document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const customerName = document.getElementById('customerName').value;
  const contactInfo = document.getElementById('contactInfo').value;
  const deliveryAddress = document.getElementById('deliveryAddress').value;
  const orderDetails = document.getElementById('orderDetails').value;
  const specialInstructions = document.getElementById('specialInstructions').value;

  // Send the data to Google Apps Script to create the order
  fetch('https://script.google.com/macros/s/AKfycbwXFf2Ot4trb60iRLLIQVC2GnbGZC4N02-8ahdzpQ6E9O_cgJG6l6z6lrby9k2J2jXB/exec', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'createOrder',
      customerName: customerName,
      contactInfo: contactInfo,
      deliveryAddress: deliveryAddress,
      orderDetails: orderDetails,
      specialInstructions: specialInstructions
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
