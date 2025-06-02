const API_URL = "https://efb4625be74f9a88.mokky.dev/subcategories";
const MAIN_CATEGORIES = [
    'telefon va boshqa qurilmalar',
    'maishiy texnikalar',
    'audio kalonkalar',
    'cameralar',
    'avto akssessuar',
    'baraka bozor'
];

const mainCategorySelect = document.getElementById('mainCategorySelect');
const subcategoryList = document.getElementById('subcategoryList');
const newSubcategoryInput = document.getElementById('newSubcategory');
const addSubcategoryBtn = document.getElementById('addSubcategoryBtn');
const subcatMsg = document.getElementById('subcatMsg');

function showMsg(msg, success = false) {
    subcatMsg.textContent = msg;
    subcatMsg.className = success ? "success-message" : "error-message";
    setTimeout(() => {
        subcatMsg.textContent = "";
    }, 2000);
}

function renderMainCategories() {
    mainCategorySelect.innerHTML = '';
    MAIN_CATEGORIES.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        mainCategorySelect.appendChild(option);
    });
}

async function fetchSubcategoriesFor(cat) {
    // API returns [{ id, mainCategory, name }]
    const res = await fetch(`${API_URL}?mainCategory=${encodeURIComponent(cat)}`);
    if (!res.ok) return [];
    return await res.json();
}

async function renderSubcategories() {
    const selectedMain = mainCategorySelect.value;
    subcategoryList.innerHTML = '<li>Loading...</li>';
    const subs = await fetchSubcategoriesFor(selectedMain);
    subcategoryList.innerHTML = '';
    if (!subs.length) {
        subcategoryList.innerHTML = '<li style="color:#888;">No subcategories yet.</li>';
    } else {
        subs.forEach(sub => {
            const li = document.createElement('li');
            li.className = 'flex-row';
            li.textContent = sub.name;
            const delBtn = document.createElement('button');
            delBtn.textContent = '❌';
            delBtn.title = 'Remove subcategory';
            delBtn.onclick = async () => {
                if (confirm(`Delete subcategory "${sub.name}"?`)) {
                    await fetch(`${API_URL}/${sub.id}`, {
                        method: 'DELETE'
                    });
                    await renderSubcategories();
                    showMsg("Subcategory deleted.", true);
                }
            };
            li.appendChild(delBtn);
            subcategoryList.appendChild(li);
        });
    }
}

mainCategorySelect.onchange = renderSubcategories;

addSubcategoryBtn.onclick = async () => {
    const mainCat = mainCategorySelect.value;
    const newSub = newSubcategoryInput.value.trim();
    if (!newSub) {
        showMsg('Please enter a subcategory name.');
        return;
    }
    // Check for duplicates
    const existing = await fetchSubcategoriesFor(mainCat);
    if (existing.find(s => s.name.toLowerCase() === newSub.toLowerCase())) {
        showMsg('This subcategory already exists.');
        return;
    }
    // Add via API
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: newSub,
            mainCategory: mainCat
        })
    });
    if (res.ok) {
        showMsg("Subcategory added!", true);
        newSubcategoryInput.value = '';
        await renderSubcategories();
    } else {
        showMsg("Failed to add subcategory.");
    }
};

// Initialize UI
renderMainCategories();
mainCategorySelect.selectedIndex = 0;
renderSubcategories();
