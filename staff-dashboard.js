// Google Apps Script URLs
const ORDER_CREATION_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvaODD6itK5HGsOa3KNpLx6kXs1WXZwmuedL2xRfwYMTRoXH42PDicNm7GrpGirGRw/exec';  
const PRODUCT_FETCH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4epS0yxkG51pVRq0GAZs_GcWyHjUHq8CFDcNk16XQjNVdFbuBoeGgOZWLTzL_uKMe/exec';  

let selectedProducts = [];  // Array to store selected products and their quantities
let totalSalesPrice = 0;  // Track total sales price
let isPriceManuallyChanged = false;  // Flag to check if the user manually changed the total price

// Form submission for creating the order
document.getElementById('orderForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const contactInfo = document.getElementById('contactInfo').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    const specialInstructions = document.getElementById('specialInstructions').value;
    const orderDate = document.getElementById('orderDate').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const salesSource = document.getElementById('salesSource').value;
    const staffUsername = document.getElementById('staffUsername').value; // Get the staff username from "Satıcı" field

    if (selectedProducts.length === 0) {
        alert('Zəhmət olmasa ən azı bir məhsul əlavə edin.');
        return;
    }

    // Use the manually entered sales price if changed, otherwise use the calculated total sales price
    let finalSalesPrice = isPriceManuallyChanged
        ? parseFloat(document.getElementById('totalSalesPriceInput').value)
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
            totalSalesPrice: finalSalesPrice.toFixed(2),  // Send total sales price (calculated or overridden)
            staffUsername: staffUsername // Add staff username from the "Satıcı" field
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('orderSuccess').style.display = 'block';
            document.getElementById('orderError').style.display = 'none';
            resetOrderForm();  // Reset the form after successful order creation
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

// Set default order date to tomorrow for order creation
const orderDateInput = document.getElementById('orderDate');
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
orderDateInput.value = tomorrow.toISOString().split('T')[0]; // Set the default value to tomorrow's date

// Product search and selection logic
document.getElementById('productSearch').addEventListener('input', function () {
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
document.getElementById('addProductButton').addEventListener('click', function () {
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
            totalSalesPrice -= item.salesPrice * item.quantity;
            selectedProducts.splice(index, 1);
            updateSelectedProductsUI();
            updateTotalSalesPriceUI();
        };

        listItem.appendChild(removeButton);
        selectedProductsList.appendChild(listItem);
    });
}

// Function to update the total sales price display
function updateTotalSalesPriceUI() {
    const totalSalesPriceDisplay = document.getElementById('totalSalesPriceDisplay');
    totalSalesPriceDisplay.textContent = `Ümumi Satış Qiyməti: ${totalSalesPrice.toFixed(2)} AZN`;

    if (!isPriceManuallyChanged) {
        document.getElementById('totalSalesPriceInput').value = totalSalesPrice.toFixed(2);
    }
}

// Manual sales price adjustment
document.getElementById('totalSalesPriceInput').addEventListener('input', function () {
    isPriceManuallyChanged = true;
});

// Reset the form and variables after a successful order
// Reset the form and variables after a successful order
function resetOrderForm() {
    document.getElementById('orderForm').reset(); // Reset the form fields
    selectedProducts = [];
    totalSalesPrice = 0;
    isPriceManuallyChanged = false;
    updateSelectedProductsUI();
    updateTotalSalesPriceUI();

    // Re-populate the staff username field from localStorage after reset
    const staffUsername = localStorage.getItem('staff_username');
    if (staffUsername) {
        document.getElementById('staffUsername').value = staffUsername;
    }

    // Set orderDate to tomorrow’s date again after reset
    const orderDateInput = document.getElementById('orderDate');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    orderDateInput.value = tomorrow.toISOString().split('T')[0];
}

// Function to update stock after order creation
function updateStock() {
    selectedProducts.forEach(product => {
        fetch(`${PRODUCT_FETCH_SCRIPT_URL}?action=getProductDetails&productName=${encodeURIComponent(product.productName)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const productStock = data.product.stock;
                    const newStock = productStock - product.quantity;

                    if (newStock < 0) {
                        throw new Error(`Not enough stock for product: ${product.productName}`);
                    }

                    updateProductStock(product.productName, newStock);

                    if (data.product.components.length > 0) {
                        data.product.components.forEach(component => {
                            const componentNewStock = component.stock - (component.quantity * product.quantity);
                            if (componentNewStock < 0) {
                                throw new Error(`Not enough stock for component: ${component.productName}`);
                            }
                            updateProductStock(component.productName, componentNewStock);
                        });
                    }
                }
            })
            .catch(err => {
                console.error('Stock update error:', err);
            });
    });
}

// Helper function to update stock for a product
function updateProductStock(productName, newStock) {
    fetch(`${PRODUCT_FETCH_SCRIPT_URL}?action=updateStock`, {
        method: 'POST',
        body: new URLSearchParams({
            productName: productName,
            newStock: newStock
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(`Failed to update stock for product: ${productName}`);
        }
    })
    .catch(err => {
        console.error('Error updating product stock:', err);
    });
}

// Set orderDate and orderDateFilter to the current date on page load
window.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    
    const orderDateFilter = document.getElementById('orderDateFilter');
    if (orderDateFilter) orderDateFilter.value = today;
    
    const staffUsername = localStorage.getItem('staff_username');
    if (staffUsername) {
        document.getElementById('staffUsername').value = staffUsername;
    } else {
        console.warn('Staff username not found in localStorage');
    }
    
    fetchOrdersForStaff(staffUsername, today);
    
    if (orderDateFilter) {
        orderDateFilter.addEventListener('change', () => {
            fetchOrdersForStaff(staffUsername, orderDateFilter.value);
        });
    }
});

// Fetch orders by staff and date
function fetchOrdersForStaff(staffUsername, date) {
    fetch(`${ORDER_CREATION_SCRIPT_URL}?action=getOrdersByStaffAndDate&staffUsername=${encodeURIComponent(staffUsername)}&date=${encodeURIComponent(date)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayOrders(data.orders);
            } else {
                console.error("Failed to fetch orders:", data.message);
            }
        })
        .catch(error => console.error("Error fetching orders:", error));
}

// Function to display fetched orders
function displayOrders(orders) {
    const container = document.getElementById('orderCardsContainer');
    container.innerHTML = '';  // Clear container

    orders.forEach(order => {
        const cardColor = order[6] === 'Delivered' ? 'delivered' : 'pending';
        const status = order[6];
        const courier = order[7] || 'Təyin edilməyib';
        const orderAmount = parseFloat(order[10]).toFixed(2);

        const orderCard = `
            <div class="order-card ${cardColor}" id="order-${order[0]}">
                <div class="order-info">
                    <h3>Sifariş ID: ${order[0]}</h3>
                    <p><strong>Satıcı Adı:</strong> ${order[16]}</p>
                    <p><strong>Müştəri Adı:</strong> ${order[1]}</p>
                    <p><strong>Status:</strong> <span>${status}</span></p>
                    <p><strong>Çatdırıcı:</strong> <span>${courier}</span></p>
                    <p><strong>Çatdırılma Ünvanı:</strong> ${order[3]}</p>
                    <p><strong>Qiymət:</strong> ${orderAmount} AZN</p>
                    <p><strong>Ödəniş Metodu:</strong> ${order[9]}</p>
                    <p><strong>Səhifə Adı:</strong> ${order[11]}</p>
                    <p><strong>Sifariş Təfərrüatları (Məhsullar, Miqdar):</strong> ${order[4] || 'Məlumat yoxdur'}</p>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', orderCard);
    });
}


