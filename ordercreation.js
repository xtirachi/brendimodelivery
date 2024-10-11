const YOUR_GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKfo0Mxu5iScYHkM9CT69TmuoetcezDDPocQ3RV5Y7qpiNIkF1xGPWA7ph35Bwz3-T/exec';


document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const customerName = document.getElementById('customerName').value;
    const contactInfo = document.getElementById('contactInfo').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    const productSelected = document.getElementById('productSelect').value;
    const quantity = document.getElementById('quantity').value;
    const specialInstructions = document.getElementById('specialInstructions').value;
    const orderDate = document.getElementById('orderDate').value;
    const salesPrice = parseFloat(document.getElementById('adjustSalesPrice').value) || parseFloat(document.getElementById('productSalesPrice').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const salesSource = document.getElementById('salesSource').value;

    fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
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
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('orderSuccess').style.display = 'block';
            document.getElementById('orderError').style.display = 'none';
            document.getElementById('orderForm').reset();
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

// Product search and selection logic
document.getElementById('productSearch').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    // Fetch products from Google Apps Script
    fetch(`YOUR_GOOGLE_APPS_SCRIPT_URL?action=getProducts&searchTerm=${encodeURIComponent(searchTerm)}`)
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
    fetch(`YOUR_GOOGLE_APPS_SCRIPT_URL?action=getProductDetails&productName=${encodeURIComponent(selectedProduct)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('productSalesPrice').value = data.product.salesPrice;  // Display sales price
            }
        });
});
