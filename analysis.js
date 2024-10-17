// Define the constant for the Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYOSOgg8w_Sv-T56qfxfyCE3ZU3oRqqETRG1-QQ8VO8ok9eebXINlZQChjE26fXziFaA/exec';

// Set default date to today for both the main and comparison date ranges
function setDefaultDates() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  document.getElementById('startDate').value = formatDate(today);
  document.getElementById('endDate').value = formatDate(today);
  document.getElementById('compareStartDate').value = formatDate(yesterday);
  document.getElementById('compareEndDate').value = formatDate(yesterday);
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Load all metrics when "Tətbiq et" button is clicked
document.getElementById('filterBtn').addEventListener('click', () => {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const compareStartDate = document.getElementById('compareStartDate').value;
  const compareEndDate = document.getElementById('compareEndDate').value;

  loadAllMetrics(startDate, endDate, compareStartDate, compareEndDate);
});

// Load all metrics with one call
function loadAllMetrics(startDate, endDate, compareStartDate, compareEndDate) {
  loadTotalSales(startDate, endDate, compareStartDate, compareEndDate);
  loadSalesBySource(startDate, endDate, compareStartDate, compareEndDate);
  loadTotalOrders(startDate, endDate, compareStartDate, compareEndDate);
  loadAvgOrderValue(startDate, endDate, compareStartDate, compareEndDate);
  loadTopProducts(startDate, endDate, compareStartDate, compareEndDate);
  loadReturningCustomerRate(startDate, endDate, compareStartDate, compareEndDate);
  loadCustomersOverTime(startDate, endDate, compareStartDate, compareEndDate);
}

// Fetch data from Google Apps Script
function fetchData(action, startDate, endDate, compareStartDate, compareEndDate) {
  return fetch(`${SCRIPT_URL}?action=${action}&startDate=${startDate}&endDate=${endDate}&compareStartDate=${compareStartDate}&compareEndDate=${compareEndDate}`)
    .then(response => response.json())
    .catch(error => console.error('Error fetching data:', error));
}

// Helper function to check if the order status is "Delivered" or blank
function isDelivered(status) {
  return status === '' || status === 'Delivered';
}

// Load Total Sales data
function loadTotalSales(startDate, endDate, compareStartDate, compareEndDate) {
  fetchData('getTotalSales', startDate, endDate, compareStartDate, compareEndDate)
    .then(data => {
      document.getElementById('totalSalesAmount').textContent = `${data.totalSales.toFixed(2)} AZN`;
      document.getElementById('compareTotalSalesAmount').textContent = `${data.compareTotalSales.toFixed(2)} AZN`;
      renderDailySalesChart(data.dailySales);
    });
}

// Render daily sales chart
function renderDailySalesChart(dailySales) {
  console.log('Daily Sales Data:', dailySales); // Log the data to check

  if (dailySales.length === 0) {
    console.error('No sales data available for rendering the chart.');
    return;
  }

  const ctx = document.getElementById('dailySalesChart').getContext('2d');
  const labels = dailySales.map(sale => sale.date);
  const salesData = dailySales.map(sale => sale.amount);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Günlük Satışlar',
        data: salesData,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: true
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM D'
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value + ' AZN';
            }
          }
        }
      }
    }
  });
}


// Load Sales by Source data (including order quantities)
function loadSalesBySource(startDate, endDate, compareStartDate, compareEndDate) {
  fetchData('getSalesBySource', startDate, endDate, compareStartDate, compareEndDate)
    .then(data => {
      console.log('Sales by Source Data:', data); // For debugging
      
      const labels = Object.keys(data.salesBySource); // Store names
      const salesAmounts = labels.map(source => data.salesBySource[source].totalSales); // Sales amounts
      const orderCounts = labels.map(source => data.salesBySource[source].orderCount); // Order quantities
      
      // Display sales and order quantities as a pie chart
      const ctx = document.getElementById('salesBySourceChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels, // Store names as labels
          datasets: [{
            label: 'Total Sales (AZN)',
            data: salesAmounts, // Sales amounts for the stores
            backgroundColor: ['#007bff', '#ffc107', '#28a745', '#dc3545'] // Colors for each store
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Satış Mənbələrinə Görə Satışlar (Stores)'
            }
          }
        }
      });

      // Add order quantities to the display (below the chart or in a table)
      const orderCountList = document.createElement('ul');
      labels.forEach((source, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${source}: ${orderCounts[index]} sifarişlər`;
        orderCountList.appendChild(listItem);
      });
      document.getElementById('salesBySource').appendChild(orderCountList); // Append order count list to the card
    })
    .catch(error => console.error('Error fetching sales by source:', error));
}



// Load Total Orders data
function loadTotalOrders(startDate, endDate, compareStartDate, compareEndDate) {
  fetchData('getTotalOrders', startDate, endDate, compareStartDate, compareEndDate)
    .then(data => {
      document.getElementById('totalOrdersAmount').textContent = data.totalOrders;
      document.getElementById('compareTotalOrdersAmount').textContent = data.compareTotalOrders;
    });
}

// Load Average Order Value data
function loadAvgOrderValue(startDate, endDate, compareStartDate, compareEndDate) {
  fetchData('getAvgOrderValue', startDate, endDate, compareStartDate, compareEndDate)
    .then(data => {
      document.getElementById('avgOrderValueAmount').textContent = `${data.avgOrderValue.toFixed(2)} AZN`;
      document.getElementById('compareAvgOrderValueAmount').textContent = `${data.compareAvgOrderValue.toFixed(2)} AZN`;
    });
}

// Load Top Products data
function loadTopProducts(startDate, endDate, compareStartDate, compareEndDate) {
  fetchData('getTopProducts', startDate, endDate, compareStartDate, compareEndDate)
    .then(data => {
      console.log('Top Products Data:', data); // Debugging log

      const productList = document.getElementById('topProductsList');
      productList.innerHTML = ''; // Clear existing products

      // Check if topProducts data exists and is valid
      if (data.topProducts && data.topProducts.length > 0) {
        data.topProducts.forEach(product => {
          const item = document.createElement('p');
          item.textContent = `${product.name} - ${product.unitsSold} satılan ədəd`;
          productList.appendChild(item);
        });
      } else {
        productList.textContent = 'No products found for the selected range.';
      }
    })
    .catch(error => {
      console.error('Error fetching top products:', error);
      document.getElementById('topProductsList').textContent = 'Error loading top products.';
    });
}


// Load Returning Customer Rate data
function loadReturningCustomerRate(startDate, endDate, compareStartDate, compareEndDate) {
  fetchData('getReturningCustomerRate', startDate, endDate, compareStartDate, compareEndDate)
    .then(data => {
      document.getElementById('returningCustomerRateAmount').textContent = `${(data.returningRate * 100).toFixed(2)}%`;
      document.getElementById('compareReturningCustomerRateAmount').textContent = `${(data.compareReturningRate * 100).toFixed(2)}%`;
    });
}

// Load Customers Over Time data
function loadCustomersOverTime(startDate, endDate, compareStartDate, compareEndDate) {
  fetchData('getCustomersOverTime', startDate, endDate, compareStartDate, compareEndDate)
    .then(data => {
      const ctx = document.getElementById('customersOverTimeChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['İlk dəfə', 'Qayıdan'],
          datasets: [{
            data: [data.firstTimeCustomers, data.returningCustomers],
            backgroundColor: ['#007bff', '#ffc107']
          }]
        }
      });
    });
}

