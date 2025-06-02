const API_ENDPOINTS = {
    'telefon va boshqa qurilmalar': 'https://efb4625be74f9a88.mokky.dev/tel',
    'maishiy texnikalar': 'https://efb4625be74f9a88.mokky.dev/texnika',
    'audio kalonkalar': 'https://efb4625be74f9a88.mokky.dev/audio',
    'cameralar': 'https://efb4625be74f9a88.mokky.dev/camera',
    'avto akssessuar': 'https://efb4625be74f9a88.mokky.dev/avto',
    'baraka bozor': 'https://efb4625be74f9a88.mokky.dev/baraka'
};

// Format number with comma and space every three digits
function formatNumberWithCommaSpace(x) {
    if (x === undefined || x === null || x === "") return "";
    let num = String(x).replace(/[^\d]/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
}

let allProducts = [];

async function fetchAllProducts() {
    try {
        const responses = await Promise.all(Object.values(API_ENDPOINTS).map(url => fetch(url)));
        const dataArrays = await Promise.all(responses.map(res => res.json()));
        allProducts = dataArrays.flat();
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function getCategoryClass(category) {
    if (!category) return "";
    switch (category.toLowerCase()) {
        case "telefon va boshqa qurilmalar":
            return "tel-category";
        case "maishiy texnikalar":
            return "texnika-category";
        case "audio kalonkalar":
            return "audio-category";
        case "cameralar":
            return "camera-category";
        case "avto akssessuar":
            return "avto-category";
        case "baraka bozor":
            return "baraka-category";
        default:
            return "";
    }
}

function renderProducts(products) {
    const tbody = document.querySelector("#productTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!products || products.length === 0) {
        document.getElementById("resultCount").textContent = "We couldn’t find anything.";
        return;
    }

    document.getElementById("resultCount").textContent = `Found ${products.length} result(s).`;

    products.forEach((product, index) => {
        const row = document.createElement("tr");
        row.classList.add(getCategoryClass(product.mainCategory || ""));
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name || ""}</td>
            <td>${product.mainCategory || ""}</td>
            <td>${product.subCategory || ""}</td>
            <td>${formatNumberWithCommaSpace(product.pcs)}</td>
            <td>${formatNumberWithCommaSpace(product.price)}</td>
            <td>${product.kprice !== undefined && product.kprice !== null ? formatNumberWithCommaSpace(product.kprice) : ""}</td>
            <td>${product.transaction || ""}</td>
            <td>${product.date || ""}</td>
            <td>${formatNumberWithCommaSpace(product.overall)}</td>
        `;
        tbody.appendChild(row);
    });
}

function applyFilters() {
    const categoryFilter = (document.getElementById("categoryFilter").value || "").toLowerCase();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const searchQuery = (document.getElementById("searchInput").value || "").toLowerCase();

    const filtered = allProducts.filter(product => {
        const mainCategory = (product.mainCategory || "").toLowerCase();
        const matchesCategory = categoryFilter ? mainCategory === categoryFilter : true;
        const matchesStartDate = startDate ? new Date(product.date) >= new Date(startDate) : true;
        const matchesEndDate = endDate ? new Date(product.date) <= new Date(endDate) : true;
        const matchesSearch = (product.name || "").toLowerCase().includes(searchQuery);
        return matchesCategory && matchesStartDate && matchesEndDate && matchesSearch;
    });

    renderProducts(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchAllProducts();
    document.getElementById("categoryFilter").addEventListener("change", applyFilters);
    document.getElementById("startDate").addEventListener("change", applyFilters);
    document.getElementById("endDate").addEventListener("change", applyFilters);
    document.getElementById("searchInput").addEventListener("input", applyFilters);
});
