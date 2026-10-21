/**
 * ==========================================================================
 * WEBSITE KELAS M - TEKNOLOGI INFORMASI UNY
 * SCRIPT ENGINE:
 * 1. Interactive Cursor Animation (Canvas Mesh & 3D Tilt)
 * 2. Client Database System (IndexedDB + BroadcastChannel Realtime Sync)
 * 3. Dual-Tone Theme Manager (Light & Dark Mode)
 * 4. Responsive Mobile Navigation
 * 5. Interactive Gallery Lightbox
 * 6. Tic-Tac-Toe Mini Game
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initHeroCursorAnimation();
    initCommentDatabase();
    initGalleryLightbox();
    initTicTacToe();
    initScrollEffects();
});

/* ==========================================================================
   1. THEME MANAGER (DUAL TONE: LIGHT & DARK MODE)
   ========================================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('kelasm_theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '☀️';
        themeToggle.setAttribute('aria-label', 'Ganti ke Mode Terang');
    } else {
        themeToggle.innerHTML = '🌙';
        themeToggle.setAttribute('aria-label', 'Ganti ke Mode Gelap');
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        if (isDark) {
            localStorage.setItem('kelasm_theme', 'dark');
            themeToggle.innerHTML = '☀️';
            themeToggle.setAttribute('aria-label', 'Ganti ke Mode Terang');
        } else {
            localStorage.setItem('kelasm_theme', 'light');
            themeToggle.innerHTML = '🌙';
            themeToggle.setAttribute('aria-label', 'Ganti ke Mode Gelap');
        }

        // Trigger update color untuk canvas partikel
        if (window.updateHeroCanvasColors) {
            window.updateHeroCanvasColors(isDark);
        }
    });
}

/* ==========================================================================
   2. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    const navAnchors = navLinks ? navLinks.querySelectorAll('a') : [];

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
    });

    navAnchors.forEach(anchor => {
        anchor.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ==========================================================================
   3. ANIMASI DI HALAMAN AWAL KETIKA KURSOR DIGERAKKAN
      - Interactive Canvas Constellation Mesh
      - Dynamic Cursor Spotlight Follower
      - 3D Parallax Tilt pada Hero Box
   ========================================================================== */
function initHeroCursorAnimation() {
    const heroSection = document.getElementById('hero');
    const canvas = document.getElementById('hero-canvas');
    const spotlight = document.getElementById('hero-spotlight');
    const heroInner = document.querySelector('.hero-inner');

    if (!heroSection || !canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Mouse tracking
    const mouse = {
        x: null,
        y: null,
        radius: 140
    };

    function resize() {
        width = canvas.width = heroSection.offsetWidth;
        height = canvas.height = heroSection.offsetHeight;
        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2.5 + 1.2;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 20) + 5;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
        }

        draw(color) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        update() {
            // Bergerak perlahan
            this.x += this.vx;
            this.y += this.vy;

            // Bounce boundary
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Interaksi kursor
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const maxDistance = mouse.radius;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;

                    this.x -= directionX * 0.6;
                    this.y -= directionY * 0.6;
                }
            }
        }
    }

    function initParticles() {
        particles = [];
        // Kerapatan partikel berdasarkan ukuran layar
        const particleCount = Math.floor((width * height) / 12000);
        const count = Math.min(Math.max(particleCount, 35), 90);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles(color) {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 110) {
                    const opacity = 1 - (distance / 110);
                    ctx.strokeStyle = color.replace('ALPHA', (opacity * 0.25).toFixed(2));
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    let isDark = document.body.classList.contains('dark-mode');
    window.updateHeroCanvasColors = (dark) => {
        isDark = dark;
    };

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const particleColor = isDark ? 'rgba(45, 161, 137, 0.7)' : 'rgba(20, 83, 70, 0.65)';
        const lineColor = isDark ? 'rgba(45, 161, 137, ALPHA)' : 'rgba(20, 83, 70, ALPHA)';

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw(particleColor);
        }

        connectParticles(lineColor);
        requestAnimationFrame(animate);
    }

    // Event listener kursor pada hero section
    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;

        // Gerakkan spotlight
        if (spotlight) {
            spotlight.style.left = `${mouse.x}px`;
            spotlight.style.top = `${mouse.y}px`;
            spotlight.style.opacity = '1';
        }

        // 3D Parallax tilt halus pada teks hero
        if (heroInner) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((mouse.y - centerY) / centerY) * -5;
            const rotateY = ((mouse.x - centerX) / centerX) * 5;
            heroInner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    });

    // Touch support untuk HP
    heroSection.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;

            if (spotlight) {
                spotlight.style.left = `${mouse.x}px`;
                spotlight.style.top = `${mouse.y}px`;
            }
        }
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
        if (spotlight) {
            spotlight.style.opacity = '0.3';
        }
        if (heroInner) {
            heroInner.style.transform = 'rotateX(0deg) rotateY(0deg)';
            heroInner.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                heroInner.style.transition = '';
            }, 500);
        }
    });

    window.addEventListener('resize', resize);
    resize();
    animate();
}

/* ==========================================================================
   4. DATABASE KOLOM KOMENTAR & CHAT
      - Menggunakan IndexedDB Database Asli di Browser
      - BroadcastChannel untuk Realtime Multi-tab Sync
      - Dilengkapi Fallback LocalStorage jika IndexedDB dibatasi
   ========================================================================== */
function initCommentDatabase() {
    const DB_NAME = 'KelasM_Community_DB';
    const DB_VERSION = 1;
    const STORE_NAME = 'comments';
    
    let dbInstance = null;
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('kelasm_comments_channel') : null;

    // Seed data default jika database masih kosong
    const defaultComments = [
        {
            id: 1,
            name: "Faiza Ismail",
            role: "Koordinator Kelas",
            category: "diskusi",
            message: "Halo teman-teman TI Kelas M! Website kelas kita sudah diperbarui dengan nuansa elegan #145346 dan responsive di smartphone. Jangan lupa aktif berdiskusi dan cek info kuliah di sini ya! 🚀",
            likes: 12,
            timestamp: Date.now() - (1000 * 60 * 60 * 2) // 2 jam lalu
        },
        {
            id: 2,
            name: "Muhammad Maftuh",
            role: "PJ Pemrograman",
            category: "diskusi",
            message: "Semangat praktikum coding minggu ini! Kalau ada kendala tugas atau materi logika pemrograman, silakan diskusikan di forum ini.",
            likes: 8,
            timestamp: Date.now() - (1000 * 60 * 45) // 45 menit lalu
        },
        {
            id: 3,
            name: "Kirana Azhar",
            role: "Mahasiswa",
            category: "pendapat",
            message: "Tampilan website barunya clean banget, transisi warnanya adem dan animasinya smooth saat kursor digerakkan! Keren!",
            likes: 15,
            timestamp: Date.now() - (1000 * 60 * 15) // 15 menit lalu
        }
    ];

    // Inisialisasi Database IndexedDB
    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.warn('IndexedDB tidak didukung di browser ini, beralih ke LocalStorage.');
                return resolve(null);
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                    
                    // Masukkan seed data default
                    defaultComments.forEach(item => store.add(item));
                }
            };

            request.onsuccess = (e) => {
                dbInstance = e.target.result;
                resolve(dbInstance);
            };

            request.onerror = (e) => {
                console.error('IndexedDB Error:', e.target.error);
                resolve(null);
            };
        });
    }

    // CRUD Operasi
    async function getAllComments() {
        if (!dbInstance) {
            // Fallback LocalStorage
            const stored = localStorage.getItem('kelasm_comments_fallback');
            return stored ? JSON.parse(stored) : defaultComments;
        }

        return new Promise((resolve) => {
            const tx = dbInstance.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result || [];
                // Sort descending (terbaru di atas)
                results.sort((a, b) => b.timestamp - a.timestamp);
                resolve(results);
            };

            request.onerror = () => {
                resolve([]);
            };
        });
    }

    async function saveComment(commentObj) {
        if (!dbInstance) {
            const comments = await getAllComments();
            commentObj.id = Date.now();
            comments.unshift(commentObj);
            localStorage.setItem('kelasm_comments_fallback', JSON.stringify(comments));
            notifySync();
            return;
        }

        return new Promise((resolve) => {
            const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.add(commentObj);

            request.onsuccess = () => {
                notifySync();
                resolve();
            };
            request.onerror = () => resolve();
        });
    }

    async function toggleLike(id) {
        if (!dbInstance) {
            const comments = await getAllComments();
            const target = comments.find(c => c.id === id);
            if (target) {
                target.likes = (target.likes || 0) + 1;
                localStorage.setItem('kelasm_comments_fallback', JSON.stringify(comments));
                notifySync();
            }
            return;
        }

        const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
            const data = getReq.result;
            if (data) {
                data.likes = (data.likes || 0) + 1;
                store.put(data);
                notifySync();
            }
        };
    }

    async function removeComment(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

        if (!dbInstance) {
            let comments = await getAllComments();
            comments = comments.filter(c => c.id !== id);
            localStorage.setItem('kelasm_comments_fallback', JSON.stringify(comments));
            notifySync();
            return;
        }

        const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        notifySync();
    }

    async function clearAllComments() {
        if (!confirm('Apakah Anda yakin ingin menghapus SEMUA komentar dari database? Tindakan ini tidak dapat dibatalkan.')) return;

        if (!dbInstance) {
            localStorage.setItem('kelasm_comments_fallback', JSON.stringify([]));
            notifySync();
            return;
        }

        const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        notifySync();
    }

    function notifySync() {
        if (channel) {
            channel.postMessage({ type: 'UPDATE_COMMENTS' });
        }
        renderComments();
    }

    if (channel) {
        channel.onmessage = (e) => {
            if (e.data && e.data.type === 'UPDATE_COMMENTS') {
                renderComments();
            }
        };
    }

    // Format waktu ramah
    function formatTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return 'Baru saja';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} menit lalu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} jam lalu`;
        const days = Math.floor(hours / 24);
        return `${days} hari lalu`;
    }

    // UI Render
    let currentFilter = 'all';
    const commentsList = document.getElementById('comments-list');
    const commentCountBadge = document.getElementById('comment-count');
    const commentForm = document.getElementById('comment-form');
    const filterButtons = document.querySelectorAll('.filter-btn');

    async function renderComments() {
        if (!commentsList) return;

        const allComments = await getAllComments();
        let filtered = allComments;

        if (currentFilter !== 'all') {
            filtered = allComments.filter(c => c.category === currentFilter);
        }

        if (commentCountBadge) {
            commentCountBadge.textContent = `${allComments.length} Pesan`;
        }

        if (filtered.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments-placeholder">
                    <div class="no-comments-icon">💬</div>
                    <p>Belum ada komentar untuk kategori ini. Jadilah yang pertama memberikan pendapat!</p>
                </div>
            `;
            return;
        }

        commentsList.innerHTML = filtered.map(item => {
            const initials = item.name ? item.name.substring(0, 2).toUpperCase() : 'KM';
            return `
                <div class="comment-item" data-id="${item.id}">
                    <div class="comment-header">
                        <div class="comment-user-info">
                            <div class="comment-avatar">${initials}</div>
                            <div class="comment-author-wrap">
                                <h4>${escapeHtml(item.name)}</h4>
                                <span class="comment-role-tag">${escapeHtml(item.role || 'Mahasiswa')}</span>
                            </div>
                        </div>
                        <span class="comment-time">${formatTimeAgo(item.timestamp)}</span>
                    </div>
                    <div class="comment-body">
                        ${escapeHtml(item.message)}
                    </div>
                    <div class="comment-actions">
                        <button class="btn-like" onclick="window.likeCommentAction(${item.id})">
                            ❤️ <span>${item.likes || 0} Suka</span>
                        </button>
                        <button class="btn-delete-comment" onclick="window.deleteCommentAction(${item.id})">
                            Hapus
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function escapeHtml(string) {
        if (!string) return '';
        return string
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Expose action handlers to global window
    window.likeCommentAction = (id) => {
        toggleLike(id);
    };

    window.deleteCommentAction = (id) => {
        removeComment(id);
    };

    window.clearAllCommentsAction = () => {
        clearAllComments();
    };

    // Filter Button Handler
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter') || 'all';
            renderComments();
        });
    });

    // Form Submission
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('comment-name');
            const roleSelect = document.getElementById('comment-role');
            const categorySelect = document.getElementById('comment-category');
            const messageInput = document.getElementById('comment-message');

            const name = nameInput ? nameInput.value.trim() : '';
            const role = roleSelect ? roleSelect.value : 'Mahasiswa';
            const category = categorySelect ? categorySelect.value : 'diskusi';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!name || !message) {
                alert('Silakan masukkan nama dan pesan komentar Anda.');
                return;
            }

            const newComment = {
                name,
                role,
                category,
                message,
                likes: 0,
                timestamp: Date.now()
            };

            await saveComment(newComment);

            if (messageInput) messageInput.value = '';
            // Jangan reset nama agar user tidak perlu mengetik nama berulang kali
        });
    }

    // Buka database saat script jalan
    openDatabase().then(() => {
        renderComments();
    });
}

/* ==========================================================================
   5. GALLERY LIGHTBOX MODAL
   ========================================================================== */
function initGalleryLightbox() {
    const galleryCards = document.querySelectorAll('.gallery-card');
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');

    if (!modal || !modalImg) return;

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            if (img) {
                modalImg.src = img.src;
                modal.classList.add('active');
            }
        });
    });

    function closeModal() {
        modal.classList.remove('active');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   6. GAME TIC-TAC-TOE (2-TONE THEME)
   ========================================================================== */
function initTicTacToe() {
    const cells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('game-status');
    const resetBtn = document.getElementById('reset-game-btn');

    if (!cells.length || !statusText) return;

    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let running = true;

    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    cells.forEach(cell => {
        cell.addEventListener('click', function () {
            const cellIndex = this.getAttribute('data-index');
            if (board[cellIndex] !== "" || !running) return;

            board[cellIndex] = currentPlayer;
            this.textContent = currentPlayer;
            this.classList.add(currentPlayer.toLowerCase());

            checkWinner();
        });
    });

    function checkWinner() {
        let roundWon = false;

        for (let i = 0; i < winConditions.length; i++) {
            const condition = winConditions[i];
            const cellA = board[condition[0]];
            const cellB = board[condition[1]];
            const cellC = board[condition[2]];

            if (cellA === "" || cellB === "" || cellC === "") continue;

            if (cellA === cellB && cellB === cellC) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusText.textContent = `🎉 Pemenang: Pemain ${currentPlayer}!`;
            running = false;
        } else if (!board.includes("")) {
            statusText.textContent = `🤝 Permainan Seri!`;
            running = false;
        } else {
            currentPlayer = (currentPlayer === "X") ? "O" : "X";
            statusText.textContent = `Giliran: Pemain ${currentPlayer}`;
        }
    }

    function resetGame() {
        currentPlayer = "X";
        board = ["", "", "", "", "", "", "", "", ""];
        statusText.textContent = `Giliran: Pemain ${currentPlayer}`;
        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove('x', 'o');
        });
        running = true;
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }
}

/* ==========================================================================
   7. SCROLL EFFECTS & NAVBAR ACTIVE STATE
   ========================================================================== */
function initScrollEffects() {
    const header = document.querySelector('header');
    const backToTopBtn = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links li a');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        // Navbar shadow on scroll
        if (header) {
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Active Link Highlight
        sections.forEach(sec => {
            const sectionHeight = sec.offsetHeight;
            const sectionTop = sec.offsetTop - 120;
            const sectionId = sec.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}