let allRecipes = [];
let filteredRecipes = [];
let activeFilters = {
    search: '',
    type: 'all',
    category: 'all',
    carbohydrate: 'all'
};

// Laden der Rezepte
async function loadRecipes() {
    try {
        const response = await fetch('recipes.json');
        const data = await response.json();
        allRecipes = data.recipes;
        filteredRecipes = [...allRecipes];

        populateCategoryFilter();
        populateCarbFilter();
        displayRecipes(filteredRecipes);
        updateFilterIndicator();
    } catch (error) {
        console.error('Fehler beim Laden der Rezepte:', error);
        document.getElementById('recipeGrid').innerHTML =
            '<p>Fehler beim Laden der Rezepte.</p>';
    }
}

// Kategorien-Filter befüllen
function populateCategoryFilter() {
    const categories = [...new Set(allRecipes.map(recipe => recipe.category))];
    const categoryFilter = document.getElementById('categoryFilter');

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Kohlenhydrat-Filter befüllen
function populateCarbFilter() {
    const carbs = [...new Set(allRecipes
        .filter(recipe => recipe.carbohydrateSource)
        .map(recipe => recipe.carbohydrateSource))];

    const carbFilter = document.getElementById('carbFilter');

    carbs.sort().forEach(carb => {
        const option = document.createElement('option');
        option.value = carb;
        option.textContent = carb;
        carbFilter.appendChild(option);
    });
}

// Alle Filter anwenden
function applyAllFilters() {
    let filtered = [...allRecipes];

    // Suchfilter
    if (activeFilters.search) {
        const searchTerm = activeFilters.search.toLowerCase();
        filtered = filtered.filter(recipe =>
            recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.some(ingredient =>
                ingredient.toLowerCase().includes(searchTerm)
            ) ||
            recipe.category.toLowerCase().includes(searchTerm)
        );
    }

    // Vegetarisch/Fleisch Filter
    if (activeFilters.type === 'vegetarian') {
        filtered = filtered.filter(recipe => recipe.vegetarian === true);
    } else if (activeFilters.type === 'meat') {
        filtered = filtered.filter(recipe => recipe.vegetarian === false);
    }

    // Kategorien-Filter
    if (activeFilters.category !== 'all') {
        filtered = filtered.filter(recipe => recipe.category === activeFilters.category);
    }

    // Kohlenhydrat-Filter
    if (activeFilters.carbohydrate !== 'all') {
        filtered = filtered.filter(recipe =>
            recipe.carbohydrateSource === activeFilters.carbohydrate
        );
    }

    filteredRecipes = filtered;
    displayRecipes(filtered);
    updateFilterIndicator();
}

// Filter-Anzeige aktualisieren
function updateFilterIndicator() {
    const totalRecipes = allRecipes.length;
    const visibleRecipes = filteredRecipes.length;

    // Entferne alte Indikatoren
    const oldIndicator = document.querySelector('.filter-indicator');
    if (oldIndicator) oldIndicator.remove();

    // Nur anzeigen wenn gefiltert wird
    if (visibleRecipes !== totalRecipes) {
        const indicator = document.createElement('span');
        indicator.className = 'filter-indicator';
        indicator.textContent = `${visibleRecipes} von ${totalRecipes}`;
        document.querySelector('.filters').appendChild(indicator);
    }
}

// Alle Filter zurücksetzen
function clearAllFilters() {
    activeFilters = {
        search: '',
        type: 'all',
        category: 'all'
    };

    // UI zurücksetzen
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('carbFilter').value = 'all'; // Neu hinzufügen
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        }
    });

    applyAllFilters();
}

// Rezepte anzeigen
function displayRecipes(recipes) {
    const grid = document.getElementById('recipeGrid');

    if (recipes.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p style="font-size: 1.2rem; color: #666;">
                    🍳 Keine Rezepte gefunden.<br>
                    <small>Versuche andere Suchbegriffe oder setze die Filter zurück.</small>
                </p>
            </div>
        `;
        return;
    }

    grid.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" onclick="openRecipeModal(${recipe.id})">
            <div class="recipe-image">
                ${recipe.image ?
        `<img src="${recipe.image}" alt="${recipe.name}">` :
        '📷 Kein Bild'}
            </div>
            <div class="recipe-content">
                <div class="recipe-title">${recipe.name}</div>
                <div class="recipe-meta">
                    <span class="category-tag">${recipe.category}</span>
                    <span class="veggie-tag">
                        ${recipe.vegetarian ? '🌱 Vegetarisch' : '🥩 Mit Fleisch'}
                    </span>
                </div>
                <p>${recipe.ingredients.length} Zutaten 
                   ${recipe.prepTime ? `• ${recipe.prepTime}` : ''}
                   ${recipe.carbohydrateSource ? `• ${recipe.carbohydrateSource}` : ''}
                </p>
            </div>
        </div>
    `).join('');
}

// Rezept-Modal öffnen
function openRecipeModal(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>${recipe.name}</h2>
            <div class="recipe-meta">
                <span class="category-tag">${recipe.category}</span>
                <span class="veggie-tag">
                    ${recipe.vegetarian ? '🌱 Vegetarisch' : '🥩 Mit Fleisch'}
                </span>
<span class="carbohydrate-tag"">
            🌾 ${recipe.carbohydrateSource}
        </span>
            </div>
        </div>
        <div class="modal-body">
            ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" class="modal-image">` : ''}
            
            ${recipe.youtube ? `<a href="${recipe.youtube}" target="_blank" class="youtube-link">📺 YouTube Video ansehen</a>` : ''}
            
            <div class="ingredients-list">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h3>🥘 Zutaten:</h3>
                <button onclick="copyIngredients(${recipe.id})" class="copy-btn" style="padding: 0.3rem 0.8rem; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 15px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s ease;">
            📋 Kopieren
                </button>
    </div>
    <ul>
        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
    </ul>
</div>
            
            <div>
                <h3>👩‍🍳 Zubereitung:</h3>
                <p style="white-space: pre-line;">${recipe.instructions}</p>
            </div>
            
            ${recipe.notes && recipe.notes.length > 0 ? `
                <div class="notes">
                    <h3>💡 Tipps & Hinweise:</h3>
                    <ul>
                        ${recipe.notes.map(note => `<li>${note}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${recipe.prepTime || recipe.cookTime ? `
                <div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
                    ⏰ <strong>Zeiten:</strong><br>
                    ${recipe.prepTime ? `Vorbereitung: ${recipe.prepTime}<br>` : ''}
                    ${recipe.cookTime ? `Kochzeit: ${recipe.cookTime}` : ''}
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('recipeModal').style.display = 'block';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();

    // Suchfunktion
    document.getElementById('searchInput').addEventListener('input', (e) => {
        activeFilters.search = e.target.value;
        applyAllFilters();
    });

    // Filter-Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeFilters.type = e.target.dataset.filter;
            applyAllFilters();
        });
    });

    // Kategorien-Filter
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        activeFilters.category = e.target.value;
        applyAllFilters();
    });

    // Kohlenhydrat-Filter
    document.getElementById('carbFilter').addEventListener('change', (e) => {
        activeFilters.carbohydrate = e.target.value;
        applyAllFilters();
    });


    // Modal schließen
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('recipeModal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('recipeModal')) {
            document.getElementById('recipeModal').style.display = 'none';
        }
    });
});

// Zutaten kopieren Funktion
function copyIngredients(recipeId) {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const ingredientsText = recipe.ingredients.join('\n');

    navigator.clipboard.writeText(ingredientsText).then(() => {
        // Visuelles Feedback
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Kopiert!';
        btn.style.background = '#28a745';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Fehler beim Kopieren:', err);
        alert('Kopieren fehlgeschlagen');
    });
}
