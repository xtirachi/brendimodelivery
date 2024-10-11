// Google Apps Script URL
const YOUR_GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyn5BfUc8omighythziGDM75AoodHNG3JcwcFTxwP8KR6VP3fvaJ1ZZFAfINT4QVSrt/exec';

// Form submission logic
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const customerName = document.getElementById('customerName').value;
    const contactInfo = document.getElementById('contactInfo').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    const productSelected = document.getElementById('productSelect').value;
    const quantity = document.getElementById('quantity').value;
    const specialInstructions = document.getElementById('specialInstructions').value || '';
    const orderDate = document.getElementById('orderDate').value;
    const salesPrice = parseFloat(document.getElementById('adjustSalesPrice').value) || parseFloat(document.getElementById('productSalesPrice').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const salesSource = document.getElementById('salesSource').value;

    // Ensure a product is selected
    if (!productSelected) {
      alert('Zəhmət olmasa məhsul seçin.');
      return;
    }

    // Send the data to Google Apps Script to create the order
    fetch('https://script.google.com/macros/s/AKfycbyfSagTapcmcV0y01RaiotWJVYyAhW_573m9EFXCiGBxM0UqGjYKopKRNWEyVeSDzOX/exec', {
        method: 'POST',
        body: new URLSearchParams({
            action: 'createOrder',
            customerName: customerName,
            contactInfo: contactInfo,
            deliveryAddress: deliveryAddress,
            productSelected: productSelected,
            quantity: quantity,
            specialInstructions: specialInstructions,
            orderDate: orderDate,
            salesPrice: salesPrice,
            paymentMethod: paymentMethod,
            salesSource: salesSource
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            document.getElementById('orderSuccess').style.display = 'block';
            document.getElementById('orderError').style.display = 'none';
            document.getElementById('orderForm').reset();
        } else {
            throw new Error('Server returned an error: ' + data.message);
        }
    })
    .catch(err => {
        document.getElementById('orderError').style.display = 'block';
        document.getElementById('orderSuccess').style.display = 'none';
        console.error('Order creation error:', err);
    });
});

// Set default order date to tomorrow
const orderDateInput = document.getElementById('orderDate');
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);  // Add one day to today's date
orderDateInput.value = tomorrow.toISOString().split('T')[0];  // Set the default value to tomorrow's date

// Product search and selection logic
document.getElementById('productSearch').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    fetch(`https://script.google.com/macros/s/AKfycbyNyQvjS0M3_x7vuYVjEgiWisxfPJKaslCmxFD_LIB5-tZGeoH8xxwgC2gFKjbswyAB/exec?action=getProducts&searchTerm=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            const productSelect = document.getElementById('productSelect');
            productSelect.innerHTML = '<option value="">Məhsul seçin</option>';  // Clear and add default option
            data.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.productName;
                option.text = product.productName;
                productSelect.appendChild(option);
            });
        });
});

// Update sales price when a product is selected
document.getElementById('productSelect').addEventListener('change', function() {
    const selectedProduct = this.value;
    fetch(`https://script.google.com/macros/s/AKfycbyNyQvjS0M3_x7vuYVjEgiWisxfPJKaslCmxFD_LIB5-tZGeoH8xxwgC2gFKjbswyAB/exec?action=getProductDetails&productName=${encodeURIComponent(selectedProduct)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('productSalesPrice').value = data.product.salesPrice;  // Display sales price
            }
        });
});
