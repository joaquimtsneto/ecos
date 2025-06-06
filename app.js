document.addEventListener('DOMContentLoaded', () => {

    // --- REGISTO DO SERVICE WORKER ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('Service Worker registado com sucesso:', registration))
            .catch(error => console.log('Falha no registo do Service Worker:', error));
    }

    // --- DADOS DE EXEMPLO (devem ser substituídos por uma base de dados) ---
    const allHymns = [
        { id: 1, hymnal: 'CC', number: 15, title: 'Oh, Que Amigo em Cristo Temos', lyrics: 'Estrofe 1...\nCoro...\nEstrofe 2...', category: 'Oração', isFavorite: false },
        { id: 2, hymnal: 'HCC', number: 200, title: 'Firme nas Promessas', lyrics: 'Estrofe 1...\nCoro...\nEstrofe 2...', category: 'Fé', isFavorite: true },
        { id: 3, hymnal: 'Cânticos', number: 50, title: 'Vem, Espírito Divino', lyrics: 'Estrofe 1...\nCoro...\nEstrofe 2...', category: 'Comunhão', isFavorite: false }
    ];
    let currentHymnList = [...allHymns];
    let currentHymnIndex = -1;
    
    // --- SELETORES DO DOM ---
    const mainScreen = document.getElementById('main-screen');
    const hymnViewScreen = document.getElementById('hymn-view-screen');
    const hymnListContainer = document.getElementById('hymn-list-container');
    const searchBar = document.getElementById('search-bar');
    
    const donationsModal = document.getElementById('donations-modal');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminControls = document.querySelector('.admin-only-controls');
    
    // --- FUNÇÕES PRINCIPAIS ---
    
    /** Renderiza a lista de hinos no ecrã principal */
    function renderHymnList(hymnsToRender) {
        hymnListContainer.innerHTML = '';
        if (hymnsToRender.length === 0) {
            hymnListContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum hino encontrado.</p>';
            return;
        }
        hymnsToRender.forEach((hymn, index) => {
            const item = document.createElement('div');
            item.className = 'hymn-item';
            item.dataset.hymnId = hymn.id;
            item.innerHTML = `
                <span class="hymn-number">${hymn.number}</span>
                <span class="hymn-title">${hymn.title}</span>
                <i class="fas fa-star" style="margin-left: auto; color: ${hymn.isFavorite ? '#FFD700' : 'grey'};"></i>
            `;
            item.addEventListener('click', () => showHymnView(hymn.id));
            hymnListContainer.appendChild(item);
        });
    }

    /** Mostra o ecrã de um hino específico */
    function showHymnView(hymnId) {
        currentHymnIndex = currentHymnList.findIndex(h => h.id === hymnId);
        if (currentHymnIndex === -1) return;
        
        const hymn = currentHymnList[currentHymnIndex];
        
        document.getElementById('hymn-title-header').innerText = `${hymn.number} - ${hymn.title}`;
        document.getElementById('hymn-content').innerText = hymn.lyrics;
        
        mainScreen.classList.remove('active');
        hymnViewScreen.classList.add('active');
        
        updateNavButtons();
    }
    
    /** Mostra um modal */
    function showModal(modal) {
        modal.classList.add('active');
    }
    
    /** Esconde um modal */
    function hideModal(modal) {
        modal.classList.remove('active');
    }
    
    /** Filtra os hinos com base na pesquisa */
    function filterHymns() {
        const query = searchBar.value.toLowerCase();
        const filtered = allHymns.filter(hymn => 
            hymn.title.toLowerCase().includes(query) ||
            String(hymn.number).includes(query) ||
            hymn.category.toLowerCase().includes(query)
        );
        currentHymnList = filtered;
        renderHymnList(currentHymnList);
    }
    
    /** Atualiza o estado dos botões de navegação de hinos */
    function updateNavButtons() {
        document.getElementById('prev-hymn-btn').disabled = currentHymnIndex <= 0;
        document.getElementById('next-hymn-btn').disabled = currentHymnIndex >= currentHymnList.length - 1;
    }

    // --- EVENT LISTENERS ---

    // Tema e Fonte
    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = document.querySelector('#theme-toggle-btn i');
        icon.className = document.body.classList.contains('dark-theme') ? 'fas fa-sun' : 'fas fa-moon';
    });

    // Pesquisa
    searchBar.addEventListener('input', filterHymns);

    // Navegação entre ecrãs
    document.getElementById('back-to-main-btn').addEventListener('click', () => {
        hymnViewScreen.classList.remove('active');
        mainScreen.classList.add('active');
    });

    document.getElementById('prev-hymn-btn').addEventListener('click', () => {
        if (currentHymnIndex > 0) {
            showHymnView(currentHymnList[currentHymnIndex - 1].id);
        }
    });

    document.getElementById('next-hymn-btn').addEventListener('click', () => {
        if (currentHymnIndex < currentHymnList.length - 1) {
            showHymnView(currentHymnList[currentHymnIndex + 1].id);
        }
    });

    // Modais
    document.getElementById('donations-btn').addEventListener('click', () => showModal(donationsModal));
    document.getElementById('admin-btn').addEventListener('click', () => showModal(adminLoginModal));
    
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => hideModal(e.target.closest('.modal')));
    });

    // Funcionalidade de Copiar
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const keyId = e.currentTarget.dataset.key;
            const keyText = document.getElementById(keyId).innerText;
            navigator.clipboard.writeText(keyText).then(() => {
                alert(`'${keyText}' copiado com sucesso!`);
            });
        });
    });

    // Lógica de Admin (Simulada)
    document.getElementById('admin-login-submit').addEventListener('click', () => {
        const password = document.getElementById('admin-password-input').value;
        // !! ESTA É UMA SIMULAÇÃO. A SENHA NUNCA DEVE SER GUARDADA NO CÓDIGO DO CLIENTE !!
        if (password === 'admin123') { 
            hideModal(adminLoginModal);
            adminControls.style.display = 'flex';
            document.getElementById('admin-password-input').value = '';
            document.getElementById('admin-login-error').innerText = '';
        } else {
            document.getElementById('admin-login-error').innerText = 'Palavra-passe incorreta.';
        }
    });
    
    document.getElementById('import-csv-btn').addEventListener('click', () => {
       alert("Funcionalidade de Importar CSV: Requer implementação de backend.");
    });


    // --- INICIALIZAÇÃO ---
    renderHymnList(allHymns);
});

/* Atualizado v11b */
