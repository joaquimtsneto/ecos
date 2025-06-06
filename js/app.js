
let hymns = [];
let currentHymn = null;

// Load hymns data
fetch('data/hymns-data.json')
  .then(res => res.json())
  .then(data => {
    hymns = data;
    renderHymnList(hymns);
  });

// Utility to show toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 2000);
}

// Render list of hymns
function renderHymnList(list) {
  const parent = document.getElementById('hymns-list');
  parent.innerHTML = '';
  if (list.length === 0) {
    parent.innerHTML = '<p>Nenhum hino encontrado.</p>';
    return;
  }
  list.forEach(h => {
    const card = document.createElement('div');
    card.className = 'hymn-card';
    card.innerHTML = `
      <h2>${h.number}. ${h.title}</h2>
      <p><em>${h.hymnal} | ${h.category}</em></p>
      <div class="hymn-actions">
        <button class="btn-fav">${h.isFavorite ? '❤️' : '🤍'}</button>
        <button class="btn-share">🔗</button>
        <button class="btn-view">Ver Letra</button>
      </div>
    `;
    parent.appendChild(card);
    const favBtn = card.querySelector('.btn-fav');
    favBtn.addEventListener('click', () => {
      h.isFavorite = !h.isFavorite;
      favBtn.textContent = h.isFavorite ? '❤️' : '🤍';
      saveHymnsData();
    });
    const shareBtn = card.querySelector('.btn-share');
    shareBtn.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}?hino=${h.number}`;
      navigator.clipboard.writeText(url)
        .then(() => showToast('Link copiado!'))
        .catch(() => showToast('Erro ao copiar.'));
    });
    const viewBtn = card.querySelector('.btn-view');
    viewBtn.addEventListener('click', () => {
      showHymnModal(h);
    });
  });
}

// Save hymns data to localStorage
function saveHymnsData() {
  localStorage.setItem('hymns', JSON.stringify(hymns));
}

// Show hymn modal
function showHymnModal(h) {
  currentHymn = h;
  const modal = document.getElementById('hymn-modal');
  document.getElementById('modal-title').textContent = `${h.number}. ${h.title}`;
  document.getElementById('modal-lyrics').textContent = h.lyrics;
  const chordBox = document.getElementById('modal-chords');
  if (h.chords && h.chords.trim() !== '') {
    chordBox.textContent = h.chords;
    document.getElementById('btn-toggle-chords').style.display = 'inline-block';
  } else {
    chordBox.textContent = '';
    document.getElementById('btn-toggle-chords').style.display = 'none';
  }
  document.getElementById('btn-toggle-chords').onclick = () => {
    chordBox.style.display = chordBox.style.display === 'block' ? 'none' : 'block';
  };
  modal.style.display = 'flex';
}

// Close hymn modal
document.getElementById('hymn-close')?.addEventListener('click', () => {
  document.getElementById('hymn-modal').style.display = 'none';
});

// Search functionality
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = hymns.filter(h => 
    h.number.toString().startsWith(q) ||
    h.title.toLowerCase().includes(q) ||
    h.category.toLowerCase().includes(q)
  );
  renderHymnList(filtered);
});

// Filter functionality
document.getElementById('btn-favorites')?.addEventListener('click', () => {
  const favs = hymns.filter(h => h.isFavorite);
  renderHymnList(favs);
});
document.getElementById('btn-chords')?.addEventListener('click', () => {
  const withChords = hymns.filter(h => h.chords && h.chords.trim() !== '');
  renderHymnList(withChords);
});
document.getElementById('btn-all')?.addEventListener('click', () => {
  renderHymnList(hymns);
});

// Donation modal
document.getElementById('btn-open-donations')?.addEventListener('click', () => {
  document.getElementById('donations-modal').style.display = 'flex';
});
document.getElementById('donations-close')?.addEventListener('click', () => {
  document.getElementById('donations-modal').style.display = 'none';
});
document.querySelectorAll('.btn-copy')?.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const txt = e.currentTarget.dataset.copy;
    navigator.clipboard.writeText(txt)
      .then(() => showToast('Copiado!'))
      .catch(() => showToast('Erro'));
  });
});

// Admin modal
document.getElementById('btn-open-admin')?.addEventListener('click', () => {
  document.getElementById('admin-modal').style.display = 'flex';
});
document.getElementById('admin-close')?.addEventListener('click', () => {
  document.getElementById('admin-modal').style.display = 'none';
});
