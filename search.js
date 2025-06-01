const API_ENDPOINTS = [
    'https://efb4625be74f9a88.mokky.dev/tel',
    'https://efb4625be74f9a88.mokky.dev/texnika',
    'https://efb4625be74f9a88.mokky.dev/audio'
];

let allProducts = [];

async function fetchAllProducts() {
    try {
        const responses = await Promise.all(API_ENDPOINTS.map(url => fetch(url)));
        const dataArrays = await Promise.all(responses.map(res => res.json()));
        allProducts = dataArrays.flat();
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function getCategoryClass(category) {
    switch (category.toLowerCase()) {
        case 'telefon va boshqa qurilmalar':
            return 'tel-category';
        case 'maishiy texnikalar':
            return 'texnika-category';
        case 'audio kalonkalar':
            return 'audio-category';
        default:
            return '';
    }
}

function renderProducts(products) {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        document.getElementById('resultCount').textContent = 'We couldn’t find anything.';
        return;
    }

    document.getElementById('resultCount').textContent = `Found ${products.length} result(s).`;

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.classList.add(getCategoryClass(product.mainCategory));
        row.innerHTML = `
      <td>${index + 1}</td>
      <td>${product.name}</td>
      <td>${product.mainCategory}</td>
      <td>${product.subCategory}</td>
      <td>${product.pcs}</td>
      <td>${product.price}</td>
      <td>${product.transaction}</td>
      <td>${product.date}</td>
      <td>${product.overall}</td>
    `;
        tbody.appendChild(row);
    });
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value.toLowerCase();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    const filtered = allProducts.filter(product => {
        const matchesCategory = categoryFilter ? product.mainCategory.toLowerCase() === categoryFilter : true;
        const matchesStartDate = startDate ? new Date(product.date) >= new Date(startDate) : true;
        const matchesEndDate = endDate ? new Date(product.date) <= new Date(endDate) : true;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesStartDate && matchesEndDate && matchesSearch;
    });

    renderProducts(filtered);
}

document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.getElementById('startDate').addEventListener('change', applyFilters);
document.getElementById('endDate').addEventListener('change', applyFilters);
document.getElementById('searchInput').addEventListener('input', applyFilters);

document.addEventListener('DOMContentLoaded', fetchAllProducts);