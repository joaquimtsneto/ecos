const PASSWORD_HASH = 'a1b2c3d4e5f6:9a8b7c6d5e4f'; // Substitua pelo seu hash real

const PBKDF2_ITER = 100000;
const PBKDF2_HASH = "SHA-256";

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  return bytes.buffer;
}

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function deriveKeyFromPassword(password, saltHex) {
  const salt = hexToBuffer(saltHex);
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", 
    enc.encode(password), 
    { name: "PBKDF2" }, 
    false, 
    ["deriveBits"]
  );
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITER,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    256
  );
  return bufferToHex(derivedBits);
}

function setAdminSession() {
  const now = Date.now();
  const expiresAt = now + 30 * 60 * 1000;
  localStorage.setItem('isAdmin', 'true');
  localStorage.setItem('adminExpires', expiresAt);
}

function clearAdminSession() {
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('adminExpires');
}

function checkAdminSession() {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const expiresAt = parseInt(localStorage.getItem('adminExpires') || '0', 10);
  if (isAdmin && Date.now() < expiresAt) {
    return true;
  }
  clearAdminSession();
  return false;
}

function showAdminLoginModal() {
  document.getElementById("admin-login-modal").classList.remove("hidden");
  document.getElementById("login-error-msg").classList.add("hidden");
  document.getElementById("admin-password-input").value = "";
  clearInterval(window.adminSessionTimerInterval);
}

function hideAdminLoginModal() {
  document.getElementById("admin-login-modal").classList.add("hidden");
}

async function validateAdminPassword() {
  const password = document.getElementById("admin-password-input").value;
  if (!password) return false;
  const [saltHex, derivedKeyHex] = PASSWORD_HASH.split(":");
  const derivedTry = await deriveKeyFromPassword(password, saltHex);
  return derivedTry === derivedKeyHex;
}

function activateAdminMode() {
  localStorage.setItem("isAdmin", "true");
  setSessionTimer(30 * 60);
  document.getElementById("session-timer").classList.remove("hidden");
  updateAdminUI(true);
}

function deactivateAdminMode() {
  clearAdminSession();
  document.getElementById("session-timer").classList.add("hidden");
  clearInterval(window.adminSessionTimerInterval);
  updateAdminUI(false);
}

function updateAdminUI(isAdmin) {
  const adminOnlyButtons = document.querySelectorAll(".admin-only");
  adminOnlyButtons.forEach(btn => {
    if (isAdmin) btn.classList.remove("hidden");
    else btn.classList.add("hidden");
  });
  const adminBtn = document.getElementById("btn-open-admin-modal");
  if (isAdmin) {
    adminBtn.classList.add("admin-active");
    adminBtn.textContent = "Logout";
  } else {
    adminBtn.classList.remove("admin-active");
    adminBtn.textContent = "Admin";
  }
}

function setSessionTimer(totalSeconds) {
  let remaining = totalSeconds;
  const timerElem = document.getElementById("timer-count");
  function tick() {
    const min = Math.floor(remaining / 60).toString().padStart(2, "0");
    const sec = (remaining % 60).toString().padStart(2, "0");
    timerElem.textContent = `${min}:${sec}`;
    if (remaining <= 0) {
      deactivateAdminMode();
      hideAdminLoginModal();
      alert("Sessão de administrador expirada.");
    }
    remaining--;
  }
  tick();
  window.adminSessionTimerInterval = setInterval(tick, 1000);
}

document.getElementById("btn-admin-login")?.addEventListener("click", async () => {
  const valid = await validateAdminPassword();
  if (valid) {
    hideAdminLoginModal();
    activateAdminMode();
  } else {
    document.getElementById("login-error-msg").classList.remove("hidden");
  }
});

document.getElementById("btn-admin-cancel")?.addEventListener("click", () => {
  hideAdminLoginModal();
});

document.getElementById("btn-open-admin-modal")?.addEventListener("click", () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (isAdmin) {
    deactivateAdminMode();
  } else {
    showAdminLoginModal();
  }
});

window.addEventListener("load", () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  updateAdminUI(isAdmin);
  if (isAdmin) {
    setSessionTimer(30 * 60);
    document.getElementById("session-timer").classList.remove("hidden");
  }
});
