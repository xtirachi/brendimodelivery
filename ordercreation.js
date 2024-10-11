// Ensure the script runs after the DOM is fully loaded
window.onload = function () {
    // Google Apps Script URLs
    const ORDER_CREATION_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdw2I1koU3nVD-ciG3qWBoNNIKtbnPRmjYYAnqUbg12iUoHbFW8qd5N-TuEtK71Pk7/exec';  
    const PRODUCT_FETCH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNyQvjS0M3_x7vuYVjEgiWisxfPJKaslCmxFD_LIB5-tZGeoH8xxwgC2gFKjbswyAB/exec';  

    let selectedProducts = [];  // Array to store selected products and their quantities
    let totalSalesPrice = 0;  // Track total sales price
    let isPriceManuallyChanged = false;  // Flag to check if the user manually changed the total price

    // Check if the elements exist before adding event listeners
    const orderForm = document.getElementById('orderForm');
    const productSearch = document.getElementById('productSearch');
    const addProductButton = document.getElementById('addProductButton');
    const totalSalesPriceInput = document.getElementById('totalSalesPriceInput');
    const totalSalesPriceDisplay = document.getElementById('totalSalesPriceDisplay');

    if (!orderForm || !productSearch || !addProductButton || !totalSalesPriceInput || !totalSalesPriceDisplay) {
        console.error("Required form elements not found in the DOM");
        return;
    }

    // Form submission for creating the order
    orderForm.addEventListener('submit', function (e) {
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

        // Get the user-entered total sales price (if manually overridden) or use the calculated price
        let finalSalesPrice = isPriceManuallyChanged
            ? parseFloat(totalSalesPriceInput.value)
            : totalSalesPrice;

        // Send the order data to Google Apps Script
        fetch(ORDER_CREATION_SCRIPT_URL, {
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
                products: JSON.stringify(selectedProducts),  // Send selected products as a JSON string
                totalSalesPrice: finalSalesPrice.toFixed(2)  // Send total sales price (calculated or overridden)
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('orderSuccess').style.display = 'block';
                document.getElementById('orderError').style.display = 'none';
                orderForm.reset();
                selectedProducts = [];  // Clear the selected products array
                totalSalesPrice = 0;  // Reset total sales price
                updateSelectedProductsUI();  // Clear the UI
                updateTotalSalesPriceUI();  // Clear the total sales price display
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
    productSearch.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        fetch(`${PRODUCT_FETCH_SCRIPT_URL}?action=getProducts&searchTerm=${encodeURIComponent(searchTerm)}`)
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
            })
            .catch(err => {
                console.error('Error fetching products:', err);
            });
    });

    // Add selected product and calculate total sales price
    addProductButton.addEventListener('click', function () {
        const productSelect = document.getElementById('productSelect');
        const quantityInput = document.getElementById('quantity');
        const selectedProduct = productSelect.value;
        const quantity = parseInt(quantityInput.value);

        if (selectedProduct && quantity > 0) {
            // Fetch product details (like sales price) from the backend
            fetch(`${PRODUCT_FETCH_SCRIPT_URL}?action=getProductDetails&productName=${encodeURIComponent(selectedProduct)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const salesPrice = parseFloat(data.product.salesPrice) || 0;

                        // Add selected product and quantity to the list
                        selectedProducts.push({
                            productName: selectedProduct,
                            quantity: quantity,
                            salesPrice: salesPrice
                        });

                        // Update total sales price
                        totalSalesPrice += salesPrice * quantity;
                        updateSelectedProductsUI();  // Update the selected products list
                        updateTotalSalesPriceUI();  // Update the total sales price display
                    } else {
                        alert('Məhsul tapılmadı.');
                    }
                })
                .catch(err => {
                    console.error('Error fetching product details:', err);
                });

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
            listItem.textContent = `${item.productName} - Miqdar: ${item.quantity} - Qiymət: ${(item.salesPrice * item.quantity).toFixed(2)} AZN`;

            // Remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Sil';
            removeButton.onclick = function () {
                // Adjust total sales price when a product is removed
                totalSalesPrice -= item.salesPrice * item.quantity;
                selectedProducts.splice(index, 1);  // Remove the product from the list
                updateSelectedProductsUI();  // Update the UI
                updateTotalSalesPriceUI();  // Update the total sales price display
            };

            listItem.appendChild(removeButton);
            selectedProductsList.appendChild(listItem);
        });
    }

    // Function to update the total sales price display
    function updateTotalSalesPriceUI() {
        totalSalesPriceDisplay.textContent = `Ümumi Satış Qiyməti: ${totalSalesPrice.toFixed(2)} AZN`;

        // Update the total sales price input field (only if it hasn't been manually changed)
        if (!isPriceManuallyChanged) {
            totalSalesPriceInput.value = totalSalesPrice.toFixed(2);
        }
    }

    // Manual sales price adjustment
    totalSalesPriceInput.addEventListener('input', function () {
        isPriceManuallyChanged = true;  // User manually changed the total price
    });
};
