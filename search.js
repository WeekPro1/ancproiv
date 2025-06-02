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

// Format number with comma and space every three digits, e.g. "1, 234, 567"
function formatNumberWithCommaSpace(x) {
    if (x === undefined || x === null || x === "") return "";
    let num = String(x).replace(/[^\d]/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
}

function parseNumberFromCommaSpace(str) {
    if (!str) return undefined;
    return parseFloat(String(str).replace(/[^\d.]/g, ""));
}

document.addEventListener('DOMContentLoaded', () => {
    // Subcategory select
    const mainCategorySelect = document.getElementById('mainCategory');
    const subCategorySelect = document.getElementById('subCategory');
    const productForm = document.getElementById('productForm');
    const kpriceInput = document.getElementById('kprice');
    const priceInput = document.getElementById('price');
    const pcsInput = document.getElementById('pcs');

    if (mainCategorySelect && subCategorySelect) {
        mainCategorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            subCategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
            if (SUBCATEGORIES[selectedCategory]) {
                SUBCATEGORIES[selectedCategory].forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub;
                    option.textContent = sub;
                    subCategorySelect.appendChild(option);
                });
            }
        });
    }

    // Format kprice input live
    if (kpriceInput) {
        kpriceInput.addEventListener('input', function(e) {
            let val = kpriceInput.value.replace(/[^\d]/g, "");
            if (val) {
                kpriceInput.value = formatNumberWithCommaSpace(val);
            } else {
                kpriceInput.value = "";
            }
            let newLength = kpriceInput.value.length;
            kpriceInput.setSelectionRange(newLength, newLength);
        });
    }

    // Format price input live
    if (priceInput) {
        priceInput.addEventListener('input', function(e) {
            let val = priceInput.value.replace(/[^\d]/g, "");
            if (val) {
                priceInput.value = formatNumberWithCommaSpace(val);
            } else {
                priceInput.value = "";
            }
            let newLength = priceInput.value.length;
            priceInput.setSelectionRange(newLength, newLength);
        });
    }

    // Format pcs input live
    if (pcsInput) {
        pcsInput.addEventListener('input', function(e) {
            let val = pcsInput.value.replace(/[^\d]/g, "");
            if (val) {
                pcsInput.value = formatNumberWithCommaSpace(val);
            } else {
                pcsInput.value = "";
            }
            let newLength = pcsInput.value.length;
            pcsInput.setSelectionRange(newLength, newLength);
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const product = collectFormData();
            const url = API_ENDPOINTS[product.mainCategory];
            if (!url) {
                alert('Invalid main category selected.');
                return;
            }
            try {
                const isEditing = !!editingProductId;
                const method = isEditing ? 'PATCH' : 'POST';
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
    }

    fetchAllProducts();
});

function collectFormData() {
    const name = document.getElementById('name').value;
    const mainCategory = document.getElementById('mainCategory').value;
    const subCategory = document.getElementById('subCategory').value;
    const pcsInput = document.getElementById('pcs').value;
    const pcs = parseNumberFromCommaSpace(pcsInput);
    const priceInput = document.getElementById('price').value;
    const price = parseNumberFromCommaSpace(priceInput);
    const kpriceInput = document.getElementById('kprice').value;
    const transaction = document.getElementById('transaction').value;
    const date = document.getElementById('date').value;
    const overall = pcs * price;

    let kprice = undefined;
    if (kpriceInput !== "") {
        const parsedKPrice = parseNumberFromCommaSpace(kpriceInput);
        if (!isNaN(parsedKPrice)) {
            kprice = parsedKPrice;
        }
    }

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

    if (kprice !== undefined) {
        product.kprice = kprice;
    }

    if (editingProductId) {
        product.id = editingProductId;
    }

    return product;
}

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
    switch ((category || '').toLowerCase()) {
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
    const sub = (subCategory || '').toLowerCase();
    if (sub.includes('ts')) return 'ts';
    if (sub.includes('kitchen')) return 'kitchen';
    if (sub.includes('speaker')) return 'speaker';
    return '';
}

function renderProducts(products) {
    const tbody = document.querySelector('#productTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.classList.add(getCategoryClass(product.mainCategory));

        row.innerHTML = `
      <td>${index + 1}</td>
      <td>${product.name || ''}</td>
      <td>${product.mainCategory || ''}</td>
      <td class="subcategory ${getSubCategoryClass(product.subCategory)}">${product.subCategory || ''}</td>
      <td>${formatNumberWithCommaSpace(product.pcs)}</td>
      <td>${formatNumberWithCommaSpace(product.price)}</td>
      <td>${product.kprice !== undefined && product.kprice !== null ? formatNumberWithCommaSpace(product.kprice) : ""}</td>
      <td class="transaction ${product.transaction ? product.transaction.toLowerCase() : ''}">${product.transaction || ''}</td>
      <td>${product.date || ''}</td>
      <td>${formatNumberWithCommaSpace(product.overall)}</td>
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
    document.getElementById('name').value = product.name || '';
    document.getElementById('mainCategory').value = product.mainCategory || '';
    document.getElementById('mainCategory').dispatchEvent(new Event('change'));
    document.getElementById('subCategory').value = product.subCategory || '';
    document.getElementById('pcs').value = product.pcs !== undefined && product.pcs !== null ? formatNumberWithCommaSpace(product.pcs) : '';
    document.getElementById('price').value = product.price !== undefined && product.price !== null ? formatNumberWithCommaSpace(product.price) : '';
    document.getElementById('kprice').value = product.kprice !== undefined && product.kprice !== null ? formatNumberWithCommaSpace(product.kprice) : '';
    document.getElementById('transaction').value = product.transaction || '';
    document.getElementById('date').value = product.date || '';
}

window.editProduct = function(id, mainCategory) {
    const product = allProducts.find(p => String(p.id) === String(id));
    if (!product) return alert("Product not found!");
    editingProductId = product.id;
    fillForm(product);
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

window.deleteProduct = async function(id, category) {
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
};

window.duplicateProduct = async function(id, category) {
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
};
