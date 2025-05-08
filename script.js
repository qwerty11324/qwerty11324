document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
     const connectWalletBtn = document.getElementById('connect-wallet');
    const userInfo = document.getElementById('user-info')
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
    // 1. Проверяем, что мы точно в Telegram WebApp
    if (!window.Telegram?.WebApp) {
        console.log("Not in Telegram WebApp");
        userInfo.innerHTML = '<span class="username">Гость</span>';
        return;
    }

    const tg = window.Telegram.WebApp;
    
    // 2. Включаем расширенную информацию о пользователе
    tg.expand();
    tg.enableClosingConfirmation();
    
    // 3. Пробуем все возможные способы получить username
    let username = null;
    
    // Способ 1: Через initDataUnsafe
    if (tg.initDataUnsafe?.user?.username) {
        username = tg.initDataUnsafe.user.username;
    } 
    // Способ 2: Через parseInitData (для старых версий)
    else if (tg.initData) {
        const initData = new URLSearchParams(tg.initData);
        const userStr = initData.get('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.username) username = user.username;
            } catch (e) {
                console.error("Parse error:", e);
            }
        }
    }
    
    // 4. Если username нашли
    if (username) {
        userInfo.innerHTML = `<span class="username">@${username}</span>`;
        console.log("User found:", username);
        return;
    }
    
    // 5. Если username нет, но есть first_name
    if (tg.initDataUnsafe?.user?.first_name) {
        const user = tg.initDataUnsafe.user;
        const name = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
        userInfo.innerHTML = `<span class="username">${name}</span>`;
        console.log("User has no username, but has name:", name);
        return;
    }
    
    // 6. Если ничего не нашли
    console.log("No user data found in:", {
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        WebAppUser: tg.WebAppUser
    });
    
    userInfo.innerHTML = '<span class="username">Гость</span>';
    
    // 7. Дополнительная проверка через 1 секунду (на случай поздней инициализации)
    setTimeout(() => {
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            const lateUser = window.Telegram.WebApp.initDataUnsafe.user;
            if (lateUser.username) {
                userInfo.innerHTML = `<span class="username">@${lateUser.username}</span>`;
                console.log("Late user data loaded:", lateUser.username);
            }
        }
    }, 1000);
}
        
        // 4. Если ничего не сработало
        userInfo.innerHTML = '<span class="username">Гость</span>';
        
        // 5. Для отладки (можно удалить в продакшене)
        console.log('Telegram WebApp data:', window.Telegram?.WebApp);
        console.log('InitDataUnsafe:', window.Telegram?.WebApp?.initDataUnsafe);
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
