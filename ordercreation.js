// Google Apps Script URL
const YOUR_GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyn5BfUc8omighythziGDM75AoodHNG3JcwcFTxwP8KR6VP3fvaJ1ZZFAfINT4QVSrt/exec';

// Form submission
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const contactInfo = document.getElementById('contactInfo').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    const specialInstructions = document.getElementById('specialInstructions').value;
    const orderDate = document.getElementById('orderDate').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const salesSource = document.getElementById('salesSource').value;

    if (selectedProducts.length === 0) {
        alert('Zəhmət olmasa ən azı bir məhsul əlavə edin.');
        return;
    }

    // Send the data to Google Apps Script
    fetch('https://script.google.com/macros/s/AKfycbzfopl5vMgZ87ZKMFWsxAdsWlU6CiR8BS5MQ9y3MDBBPebgDkNXECQQw_UnGFddy8Go/exec', {
        method: 'POST',
        body: new URLSearchParams({
            action: 'createOrder',
            customerName: customerName,
            contactInfo: contactInfo,
            deliveryAddress: deliveryAddress,
            orderDate: orderDate,
            specialInstructions: specialInstructions,
            paymentMethod: paymentMethod,
            salesSource: salesSource,
            products: JSON.stringify(selectedProducts)  // Send selected products as a JSON string
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('orderSuccess').style.display = 'block';
            document.getElementById('orderError').style.display = 'none';
            document.getElementById('orderForm').reset();
            selectedProducts.length = 0;  // Clear the selected products array
            updateSelectedProductsUI();  // Clear the UI
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

const selectedProducts = [];  // Array to store selected products and their quantities

document.getElementById('addProductButton').addEventListener('click', function() {
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantity');

    const selectedProduct = productSelect.value;
    const quantity = parseInt(quantityInput.value);

    if (selectedProduct && quantity > 0) {
        // Add selected product and quantity to the list
        selectedProducts.push({ productName: selectedProduct, quantity: quantity });
        updateSelectedProductsUI();

        // Reset the product select and quantity input
        productSelect.value = '';
        quantityInput.value = 1;
    } else {
        alert('Zəhmət olmasa məhsul seçin və miqdarı daxil edin.');
    }
});

// Function to update the selected products list UI
function updateSelectedProductsUI() {
    const selectedProductsList = document.getElementById('selectedProductsList');
    selectedProductsList.innerHTML = '';  // Clear the list

    selectedProducts.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.productName} - Miqdar: ${item.quantity}`;
        
        // Remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Sil';
        removeButton.onclick = function() {
            selectedProducts.splice(index, 1);  // Remove the product from the list
            updateSelectedProductsUI();  // Update the UI
        };

        listItem.appendChild(removeButton);
        selectedProductsList.appendChild(listItem);
    });
});
