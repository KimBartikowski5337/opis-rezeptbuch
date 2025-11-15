// Lade Rezepte aus JSON
let allRecipes = [];

// DOM Elemente
const recipeGrid = document.getElementById('recipeGrid');
const modal = document.getElementById('recipeModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const categoryFilter = document.getElementById('categoryFilter');

// Rezepte laden
async function loadRecipes() {
    try {
        const response = await fetch('recipes.json');
        allRecipes = await response.json();
        populateCategoryFilter();
        displayRecipes(allRecipes);
    } catch (error) {
        console.error('Fehler beim Laden der Rezepte:', error);
        recipeGrid.innerHTML = '<p>Fehler beim Laden der Rezepte.</p>';
    }
}

// Kategorien in Filter einfügen
function populateCategoryFilter() {
    const categories = [...new Set(allRecipes.map(recipe => recipe.category))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Rezepte anzeigen
function displayRecipes(recipes) {
    recipeGrid.innerHTML = '';

    if (recipes.length === 0) {
        recipeGrid.innerHTML = '<p>Keine Rezepte gefunden.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        recipeGrid.appendChild(card);
    });
}

// Rezept-Karte erstellen
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => showRecipeDetails(recipe);

    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}">
        <div class="recipe-info">
            <h3>${recipe.name}</h3>
            <p class="category">${recipe.category}</p>
            <p class="prep-time">⏱️ ${recipe.prepTime}</p>
            ${recipe.vegetarian ? '<span class="badge">🌱 Vegetarisch</span>' : ''}
        </div>
    `;

    return card;
}

// Rezeptdetails im Modal anzeigen
function showRecipeDetails(recipe) {
    modalBody.innerHTML = `
        <h2>${recipe.name}</h2>
        <img src="${recipe.image}" alt="${recipe.name}" style="width: 100%; max-width: 500px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Kategorie:</strong> ${recipe.category}</p>
        <p><strong>Zubereitungszeit:</strong> ${recipe.prepTime}</p>
        ${recipe.vegetarian ? '<p><span class="badge">🌱 Vegetarisch</span></p>' : ''}
        
        <h3>Zutaten:</h3>
        <ul>
            ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        
        <h3>Zubereitung:</h3>
        <ol>
            ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>
    `;

    modal.style.display = 'block';
}

// Modal schließen - X Button
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Modal schließen - Klick außerhalb
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Modal schließen - ESC Taste
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

// Suche
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.category.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
    );
    displayRecipes(filtered);
});

// Filter Buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        let filtered = allRecipes;

        if (filter === 'vegetarian') {
            filtered = allRecipes.filter(recipe => recipe.vegetarian);
        }

        displayRecipes(filtered);
    });
});

// Kategorie Filter
categoryFilter.addEventListener('change', (e) => {
    const category = e.target.value;
    const filtered = category === 'all'
        ? allRecipes
        : allRecipes.filter(recipe => recipe.category === category);
    displayRecipes(filtered);
});

