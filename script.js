document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const connectWalletBtn = document.getElementById('connect-wallet');
    const userInfo = document.getElementById('user-info');
    const betModal = document.getElementById('bet-modal');
    const closeBtn = document.querySelector('.close-btn');
    const predictionCards = document.querySelectorAll('.prediction-card');
    const betButtons = document.querySelectorAll('.bet-btn');
    const navItems = document.querySelectorAll('.nav-item');
    const subNavItems = document.querySelectorAll('.sub-nav-item');
    
    // Инициализация Telegram WebApp
    const tg = window.Telegram?.WebApp;
    
    // Текущее состояние
    let currentSection = 'market';
    let currentCategory = 'all';

    // Загрузка данных пользователя из Telegram (ИСПРАВЛЕННАЯ ФУНКЦИЯ)
    function initUser() {
        // Проверяем, что находимся в Telegram WebApp и есть данные пользователя
        if (tg?.initDataUnsafe?.user) {
            const user = tg.initDataUnsafe.user;
            let userName = "Гость"; // значение по умолчанию
            
            // Приоритет: username (если есть)
            if (user.username) {
                userName = `@${user.username}`;
            } 
            // Запасной вариант: first_name + last_name
            else if (user.first_name) {
                userName = user.first_name;
                if (user.last_name) {
                    userName += ` ${user.last_name}`;
                }
            }
            
            // Обновляем интерфейс (только текст, без аватара)
            userInfo.innerHTML = `<span class="username">${userName}</span>`;
            return;
        }
        
        // Fallback (если не в Telegram WebView или нет данных)
        userInfo.innerHTML = '<span class="username">Гость</span>';
    }

    // Фильтрация карточек
    function filterByCategory(category) {
        predictionCards.forEach(card => {
            const coin = card.getAttribute('data-coin');
            const isVisible = checkCardVisibility(coin, currentSection, category);
            card.style.display = isVisible ? 'flex' : 'none';
        });
    }

    // Проверка видимости карточки
    function checkCardVisibility(coin, section, category) {
        if (category === 'blum') return coin === 'VIO' && section === 'pm';
        if (category === 'dex') {
            if (section === 'fpibank') return coin === 'FPIBANK';
            if (section === 'gram') return coin === 'GRAM';
            return coin === 'FPIBANK' || coin === 'GRAM';
        }
        if (category === 'all') {
            return true;
        }
        return false;
    }

    // Подключение кошелька (заглушка)
    connectWalletBtn.addEventListener('click', function() {
        userInfo.innerHTML = '<div class="loading-spinner"></div>';
        connectWalletBtn.disabled = true;
        connectWalletBtn.textContent = "Connecting...";
        
        // Имитация бесконечной загрузки
        setTimeout(() => {
            connectWalletBtn.textContent = "Ошибка подключения";
            setTimeout(() => {
                connectWalletBtn.textContent = "Connect Wallet";
                connectWalletBtn.disabled = false;
                initUser(); // Восстанавливаем аватар
            }, 2000);
        }, 3000);
    });

    // Открытие модального окна ставки
    predictionCards.forEach(card => {
        card.addEventListener('click', function() {
            document.getElementById('bet-coin').textContent = this.getAttribute('data-coin');
            document.getElementById('bet-target').textContent = `${this.getAttribute('data-target')}$`;
            document.getElementById('bet-date').textContent = this.getAttribute('data-date');
            betModal.style.display = 'flex';
        });
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', () => betModal.style.display = 'none');
    window.addEventListener('click', (e) => e.target === betModal && (betModal.style.display = 'none'));

    // Клик по кнопкам ставок
    betButtons.forEach(btn => btn.addEventListener('click', () => {
        alert('Пополните баланс через подключенный кошелёк');
    }));

    // Навигация
    subNavItems.forEach(item => item.addEventListener('click', function() {
        subNavItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.getAttribute('data-category');
        filterByCategory(currentCategory);
    }));

    navItems.forEach(item => item.addEventListener('click', function() {
        navItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        currentSection = this.getAttribute('data-section');
        filterByCategory(currentCategory);
    }));

    // Инициализация
    initUser();
    filterByCategory(currentCategory);
});
