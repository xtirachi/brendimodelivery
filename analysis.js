const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqcCnLMB14bO--KadaHxdtN-uoDffJ30hO4AmF5COxk3ZiATsJ4-buouI0TkQZAx8v8A/exec';

function loadSummaryMetrics() {
  fetch(SCRIPT_URL + '?action=getSummaryMetrics')
    .then(response => response.json())
    .then(data => {
      document.getElementById('totalRevenue').querySelector('p').textContent = `${data.totalRevenue.toFixed(2)} AZN`;
      document.getElementById('totalOrders').querySelector('p').textContent = data.totalOrders;
      document.getElementById('totalCost').querySelector('p').textContent = `${data.totalCost.toFixed(2)} AZN`;
      document.getElementById('profit').querySelector('p').textContent = `${data.profit.toFixed(2)} AZN`;
    });
}

function loadSalesBySource() {
  fetch(SCRIPT_URL + '?action=getSalesBySource')
    .then(response => response.json())
    .then(data => {
      const ctx = document.getElementById('salesBySourceChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: ['#007bff', '#ffc107', '#28a745', '#dc3545', '#6c757d']
          }]
        }
      });
    });
}

function loadPaymentMethodBreakdown() {
  fetch(SCRIPT_URL + '?action=getPaymentMethodBreakdown')
    .then(response => response.json())
    .then(data => {
      const ctx = document.getElementById('paymentMethodChart').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Nağd', 'Karta'],
          datasets: [{
            data: [data.cash, data.card],
            backgroundColor: ['#28a745', '#ffc107']
          }]
        }
      });
    });
}

function loadTopCustomers() {
  fetch(SCRIPT_URL + '?action=getTopCustomers')
    .then(response => response.json())
    .then(data => {
      const customerList = document.getElementById('topCustomers');
      customerList.innerHTML = ''; // Clear existing content

      data.forEach(([name, sales]) => {
        const listItem = document.createElement('div');
        listItem.classList.add('customer-item');
        listItem.textContent = `${name}: ${sales.toFixed(2)} AZN`;
        customerList.appendChild(listItem);
      });
    });
}

function loadOrderStatusBreakdown() {
  fetch(SCRIPT_URL + '?action=getOrderStatusBreakdown')
    .then(response => response.json())
    .then(data => {
      const ctx = document.getElementById('orderStatusChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: 'Sifarişlər',
            data: Object.values(data),
            backgroundColor: '#007bff'
          }]
        }
      });
    });
}

function loadSalesTrends() {
  fetch(SCRIPT_URL + '?action=getSalesTrends')
    .then(response => response.json())
    .then(data => {
      const ctx = document.getElementById('salesTrendsChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: 'Satışlar (AZN)',
            data: Object.values(data),
            borderColor: '#007bff',
            fill: false
          }]
        }
      });
    });
}

// Load all the data on page load
window.onload = function() {
  loadSummaryMetrics();
  loadSalesBySource();
  loadPaymentMethodBreakdown();
  loadTopCustomers();
  loadOrderStatusBreakdown();
  loadSalesTrends();
};
