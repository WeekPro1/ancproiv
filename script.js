const API_ENDPOINTS = {
    'telefon va boshqa qurilmalar': 'https://efb4625be74f9a88.mokky.dev/tel',
    'maishiy texnikalar': 'https://efb4625be74f9a88.mokky.dev/texnika',
    'audio kalonkalar': 'https://efb4625be74f9a88.mokky.dev/audio',
    'cameralar': 'https://efb4625be74f9a88.mokky.dev/camera',
    'avto akssessuar': 'https://efb4625be74f9a88.mokky.dev/avto',
    'baraka bozor': 'https://efb4625be74f9a88.mokky.dev/baraka'
};

const SUBCATEGORIES = {
    'telefon va boshqa qurilmalar': ['Telefon', 'Planshet', 'Noutbuk'],
    'maishiy texnikalar': ['Muzlatgich', 'Konditsioner', 'Televizor'],
    'audio kalonkalar': ['Simli', 'Bluetooth', 'Portativ'],
    'cameralar': ['Kuzatuv'],
    'avto akssessuar': [''],
    'baraka bozor': ['Ovqat', 'Ichimliklar', 'Boshqa']
};

let allProducts = [];
let editingProductId = null;

document.getElementById('mainCategory').addEventListener('change', function() {
    const subSelect = document.getElementById('subCategory');
    const selectedCategory = this.value;

    subSelect.innerHTML = '<option value="">Select Subcategory</option>';

    if (SUBCATEGORIES[selectedCategory]) {
        SUBCATEGORIES[selectedCategory].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subSelect.appendChild(option);
        });
    }
});

document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    function collectFormData() {
        const name = document.getElementById('name').value;
        const mainCategory = document.getElementById('mainCategory').value;
        const subCategory = document.getElementById('subCategory').value;
        const pcs = parseInt(document.getElementById('pcs').value);
        const price = parseFloat(document.getElementById('price').value);
        const transaction = document.getElementById('transaction').value;
        const date = document.getElementById('date').value;
        const overall = pcs * price;

        const product = {
            name,
            mainCategory,
            subCategory,
            pcs,
            price,
            transaction,
            date,
            overall
        };

        // Do not add id field for editing (most APIs don't want it in PATCH/PUT body)
        if (editingProductId) {
            product.id = editingProductId;
        }

        return product;
    }

    const product = collectFormData();
    const url = API_ENDPOINTS[product.mainCategory];

    try {
        const isEditing = !!editingProductId;
        const method = isEditing ? 'PATCH' : 'POST'; // PATCH is often safer for mock/test APIs
        const endpoint = isEditing ? `${url}/${editingProductId}` : url;

        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            alert(isEditing ? 'Product updated!' : 'Product added!');
            this.reset();
            editingProductId = null;
            fetchAllProducts();
        } else {
            const errorText = await response.text();
            alert('Failed to save product. ' + errorText);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    }
});

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
    switch (category.toLowerCase()) {
        case 'telefon va boshqa qurilmalar':
            return 'tel-category';
        case 'maishiy texnikalar':
            return 'texnika-category';
        case 'audio kalonkalar':
            return 'audio-category';
        case 'cameralar':
            return 'camera-category';
        case 'avto akssessuar':
            return 'avto-category';
        case 'baraka bozor':
            return "baraka-category";
        default:
            return '';
    }
}

function getSubCategoryClass(subCategory) {
    const sub = subCategory.toLowerCase();
    if (sub.includes('ts')) return 'ts';
    if (sub.includes('kitchen')) return 'kitchen';
    if (sub.includes('speaker')) return 'speaker';
    return '';
}

function renderProducts(products) {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.classList.add(getCategoryClass(product.mainCategory));

        row.innerHTML = `
      <td>${index + 1}</td>
      <td>${product.name}</td>
      <td>${product.mainCategory}</td>
      <td class="subcategory ${getSubCategoryClass(product.subCategory)}">${product.subCategory}</td>
      <td>${product.pcs}</td>
      <td>${product.price}</td>
      <td class="transaction ${product.transaction.toLowerCase()}">${product.transaction}</td>
      <td>${product.date}</td>
      <td>${product.overall}</td>
      <td>
        <button onclick="editProduct('${product.id}', '${product.mainCategory}')">✏️</button>
        <button onclick="deleteProduct('${product.id}', '${product.mainCategory}')">🗑️</button>
        <button onclick="duplicateProduct('${product.id}', '${product.mainCategory}')">📄</button>
      </td>
    `;
        tbody.appendChild(row);
    });
}

function fillForm(product) {
    document.getElementById('name').value = product.name;
    document.getElementById('mainCategory').value = product.mainCategory;
    document.getElementById('mainCategory').dispatchEvent(new Event('change'));
    document.getElementById('subCategory').value = product.subCategory;
    document.getElementById('pcs').value = product.pcs;
    document.getElementById('price').value = product.price;
    document.getElementById('transaction').value = product.transaction;
    document.getElementById('date').value = product.date;
}

async function editProduct(id, mainCategory) {
    const product = allProducts.find(p => String(p.id) === String(id));
    if (!product) return alert("Product not found!");
    editingProductId = product.id;
    fillForm(product);
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

async function deleteProduct(id, category) {
    const url = API_ENDPOINTS[category];
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const response = await fetch(`${url}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Product deleted.');
            fetchAllProducts();
        } else {
            alert('Delete failed.');
        }
    } catch (error) {
        console.error(error);
        alert('Error during delete.');
    }
}

async function duplicateProduct(id, category) {
    const product = allProducts.find(p => String(p.id) === String(id));
    if (!product) return;
    const copy = {
        ...product
    };
    delete copy.id;

    try {
        const response = await fetch(API_ENDPOINTS[category], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(copy)
        });

        if (response.ok) {
            alert('Product duplicated.');
            fetchAllProducts();
        } else {
            alert('Duplicate failed.');
        }
    } catch (err) {
        console.error(err);
        alert('Error duplicating product.');
    }
}

document.addEventListener('DOMContentLoaded', fetchAllProducts);
