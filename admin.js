// Declaring button elements
const addOrderBtn = document.getElementById('add-order');
const manageOrdersBtn = document.getElementById('manage-orders');
const addEditProductBtn = document.getElementById('add-edit-product');
const dailyPurchasesBtn = document.getElementById('daily-purchases');
const dailyFinanceBtn = document.getElementById('daily-finance');
const warehouseBtn = document.getElementById('warehouse');
const analysisBtn = document.getElementById('analysis');

// Add event listeners for button clicks
addOrderBtn.addEventListener('click', () => {
    window.location.href = 'https://xtirachi.github.io/brendimodelivery/ordercreation.html';  // Replace '#' with the actual URL
});

manageOrdersBtn.addEventListener('click', () => {
    window.location.href = 'https://xtirachi.github.io/brendimodelivery/admin-dashboard.html';  // Replace '#' with the actual URL
});

addEditProductBtn.addEventListener('click', () => {
    window.location.href = 'https://xtirachi.github.io/brendimo/product.html';  // Replace '#' with the actual URL
});

dailyPurchasesBtn.addEventListener('click', () => {
    window.location.href = '#';  // Replace '#' with the actual URL
});

dailyFinanceBtn.addEventListener('click', () => {
    window.location.href = 'https://xtirachi.github.io/brendimo/finance.html';  // Replace '#' with the actual URL
});

warehouseBtn.addEventListener('click', () => {
    window.location.href = 'https://xtirachi.github.io/brendimo/inventory.html';  // Replace '#' with the actual URL
});

analysisBtn.addEventListener('click', () => {
    window.location.href = 'https://xtirachi.github.io/brendimodelivery/analysis.html';  // Replace '#' with the actual URL
});
