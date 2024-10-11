const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzesppAS91x5TG2YyLOEDXnNJr6ttJoCwxNjvj22SFNR4L5n1TSUchimd-7JBDawlPLtg/exec';

// Load summary metrics and filter by date range
function loadSummaryMetrics(startDate, endDate) {
  fetch(`${SCRIPT_URL}?action=getSummaryMetrics&startDate=${startDate}&endDate=${endDate}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('totalRevenue').querySelector('p').textContent = `${data.totalRevenue.toFixed(2)} AZN`;
      document.getElementById('totalOrders').querySelector('p').textContent = data.totalOrders;
      document.getElementById('totalCost').querySelector('p').textContent = `${data.totalCost.toFixed(2)} AZN`;
      document.getElementById('profit').querySelector('p').textContent = `${data.profit.toFixed(2)} AZN`;
    });
}

// Load sales breakdown by source and filter by date range
function loadSalesBySource(startDate, endDate) {
  fetch(`${SCRIPT_URL}?action=getSalesBySource&startDate=${startDate}&endDate=${endDate}`)
    .then(response => response.json())
    .then(data => {
      const ctx = document.getElementById('salesBySourceChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: ['#007bff', '#ffc107', '#28a745', '#dc3545']
          }]
        }
      });
    });
}

// Load payment method breakdown and filter by date range
function loadPaymentMethodBreakdown(startDate, endDate) {
  fetch(`${SCRIPT_URL}?action=getPaymentMethodBreakdown&startDate=${startDate}&endDate=${endDate}`)
    .then(response => response.json())
    .then(data => {
      const ctx = document.getElementById('paymentMethodChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Nağd', 'Karta'],
          datasets: [{
            data: [data.cash, data.card],
            backgroundColor: ['#28a745', '#17a2b8']
          }]
        }
      });
    });
}

// Load order status breakdown and filter by date range
function loadOrderStatusBreakdown(startDate, endDate) {
  fetch(`${SCRIPT_URL}?action=getOrderStatusBreakdown&startDate=${startDate}&endDate=${endDate}`)
    .then(response => response.json())
    .then(data => {
      const ctx = document.getElementById('orderStatusChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: ['#007bff', '#ffc107', '#28a745', '#dc3545']
          }]
        }
      });
    });
}

// Load sales trends over time and filter by date range
function loadSalesTrends(startDate, endDate) {
  fetch(`${SCRIPT_URL}?action=getSalesTrends&startDate=${startDate}&endDate=${endDate}`)
    .then(response => response.json())
    .then(data => {
      const ctx = document.getElementById('salesTrendsChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            borderColor: '#007bff',
            fill: true
          }]
        }
      });
    });
}

// Fetch and update all charts and metrics based on
