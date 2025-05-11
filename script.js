// Verifica e inicializa os dados no localStorage
if (!localStorage.getItem('consoles')) {
    const consoles = [
        { id: 'ps5', name: 'PlayStation 5', price: 299, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80' },
        { id: 'xbox', name: 'Xbox Series X', price: 279, image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80' },
        { id: 'switch', name: 'Nintendo Switch', price: 199, image: 'https://images.unsplash.com/photo-1612036781124-847f8939b154?q=80' }
    ];
    localStorage.setItem('consoles', JSON.stringify(consoles));
}

if (!localStorage.getItem('games')) {
    const games = [
        { id: 'fifa23', name: 'FIFA 23', price: 29, console: 'all', image: 'https://fifauteam.com/images/covers/fifa23/standard-cg.webp' },
        { id: 'gow', name: 'God of War Ragnarök', price: 39, console: 'ps5', image: 'https://imgs.casasbahia.com.br/1561916785/1xg.jpg' },
        { id: 'zelda', name: 'Zelda: Tears of the Kingdom', price: 39, console: 'switch', image: 'https://m.media-amazon.com/images/I/81eHh0BNU0L.jpg' },
        { id: 'spiderman', name: 'Spider-Man 2', price: 39, console: 'ps5', image: 'https://images.kabum.com.br/produtos/fotos/sync_mirakl/503115/Jogo-Marvels-Spider-Man-2-Standard-Edition-Playstation-5_1724244091_g.jpg' },
        { id: 'mario', name: 'Mario Kart 8 Deluxe', price: 39, console: 'switch', image: 'https://cdn.awsli.com.br/600x1000/53/53761/produto/16001652/75a8d64f0f.jpg' }
    ];
    localStorage.setItem('games', JSON.stringify(games));
}

if (!localStorage.getItem('accessories')) {
    const accessories = [
        { id: 'extra-controller', name: 'Controle Extra', price: 29, image: 'https://images.unsplash.com/photo-1659700785595-cf5907e6146f?q=80' },
        { id: 'vr-glasses', name: 'Óculos VR', price: 49, image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80' },
        { id: 'headset', name: 'Headset Gamer', price: 39, image: 'https://images.unsplash.com/photo-1629429407756-4a7703614972?q=80' }
    ];
    localStorage.setItem('accessories', JSON.stringify(accessories));
}

// Lógica só é executada quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", function () {

    // Navegação entre seções
    function showSection(sectionId) {
        const sections = ["home", "rent", "games", "accessories", "login", "admin"];
        sections.forEach(id => {
            document.getElementById(id + "-content").classList.add("hidden");
        });
        document.getElementById(sectionId + "-content").classList.remove("hidden");
    }

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (targetId === 'admin' && !localStorage.getItem('loggedIn')) {
                showSection('login');
            } else {
                showSection(targetId);
                if (targetId === 'rent') {
                    loadRentalGames();
                    loadRentalAccessories();
                }
                if (targetId === 'games') {
                    loadGames();
                }
            }
            document.getElementById('sidebar').classList.remove('active');
        });
    });

    // Abre seção certa ao recarregar página com hash na URL
    const initial = location.hash.replace("#", "") || "home";
    showSection(initial);

    // Sidebar Mobile
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('active');
    });
    document.getElementById('close-menu')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });

    // Login
    document.getElementById('login-form')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (username === "admin" && password === "1234") {
            localStorage.setItem('loggedIn', 'true');
            document.getElementById('login-error').classList.add('hidden');
            showSection('admin');
            loadClients();
            loadRentals();
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    });

    // Logout
    window.logout = function () {
        localStorage.removeItem('loggedIn');
        location.href = "#home";
        location.reload();
    };

    // Dados de aluguel
    let selectedConsole = null;
    let selectedPlan = null;
    let selectedGames = [];
    let selectedAccessories = [];
    let purchaseOption = false;

    window.selectConsole = function (consoleId) {
        selectedConsole = consoleId;
        updateSummary();
    };

    window.selectRentalOption = function (planId) {
        selectedPlan = planId;
        updateSummary();
    };

    window.deselectConsole = function () {
        selectedConsole = null;
        updateSummary();
    };

    window.deselectRentalOption = function () {
        selectedPlan = null;
        updateSummary();
    };

    window.toggleGame = function (gameId) {
        if (selectedGames.includes(gameId)) {
            selectedGames = selectedGames.filter(id => id !== gameId);
        } else {
            selectedGames.push(gameId);
        }
        updateSummary();
    };

    window.toggleAccessory = function (accessoryId) {
        if (selectedAccessories.includes(accessoryId)) {
            selectedAccessories = selectedAccessories.filter(id => id !== accessoryId);
        } else {
            selectedAccessories.push(accessoryId);
        }
        updateSummary();
    };

    document.getElementById('purchase-option')?.addEventListener('change', function () {
        purchaseOption = this.checked;
        updateSummary();
    });

    function updateSummary() {
        document.getElementById('summary-console').innerText = selectedConsole || '-';
        document.getElementById('summary-period').innerText = selectedPlan || '-';
        document.getElementById('summary-games').innerText = selectedGames.length;
        document.getElementById('summary-accessories').innerText = selectedAccessories.length;

        let total = 0;
        if (selectedConsole === 'ps5') total += 299;
        if (selectedConsole === 'xbox') total += 279;
        if (selectedConsole === 'switch') total += 199;
        if (selectedConsole === 'ps4') total += 179;

        if (selectedPlan === 'Semanal') total += 99;
        if (selectedPlan === 'Mensal') total += 299;
        if (selectedPlan === 'Anual') total += 2999;

        total += selectedGames.length * 39;
        total += selectedAccessories.length * 29;
        if (purchaseOption) total += 500;

        document.getElementById('summary-total').innerText = `R$ ${total},00`;
        document.getElementById('checkout-btn').disabled = !(selectedConsole && selectedPlan);
    }

    document.getElementById('checkout-btn')?.addEventListener('click', function () {
        const form = document.getElementById('client-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const cliente = {
            nome: document.getElementById('client-name').value,
            cpf: document.getElementById('client-cpf').value,
            email: document.getElementById('client-email').value,
            telefone: document.getElementById('client-phone').value,
        };

        const aluguel = {
            cliente: cliente,
            console: selectedConsole,
            plano: selectedPlan,
            jogos: selectedGames,
            acessorios: selectedAccessories,
            compraFinal: purchaseOption,
            dataPedido: new Date().toISOString()
        };

        let alugueis = JSON.parse(localStorage.getItem('alugueis')) || [];
        alugueis.push(aluguel);
        localStorage.setItem('alugueis', JSON.stringify(alugueis));

        alert('Aluguel registrado com sucesso!');
        location.reload();
    });

    // Funções de carregamento
    window.loadGames = function () {
        const games = JSON.parse(localStorage.getItem('games')) || [];
        const grid = document.getElementById('games-grid');
        grid.innerHTML = '';
        games.forEach(g => {
            const div = document.createElement('div');
            div.className = 'bg-white rounded-xl shadow-md overflow-hidden';
            div.innerHTML = `
                <img src="${g.image}" alt="${g.name}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-2">${g.name}</h3>
                    <p class="text-gray-600 mb-4">Preço: R$ ${g.price}/mês</p>
                </div>
            `;
            grid.appendChild(div);
        });
    };

    window.loadRentalGames = function () {
        const games = JSON.parse(localStorage.getItem('games')) || [];
        const container = document.getElementById('games-list');
        container.innerHTML = '';
        games.forEach(g => {
            const div = document.createElement('div');
            div.className = 'border rounded-lg p-4 hover:border-blue-500 cursor-pointer';
            div.innerHTML = `
                <img src="${g.image}" alt="${g.name}" class="w-full h-24 object-cover mb-2 rounded">
                <h3 class="text-center font-bold text-sm">${g.name}</h3>
                <p class="text-center text-gray-600 text-sm mb-2">R$ ${g.price}/mês</p>
            `;
            div.onclick = function () {
                toggleGame(g.id);
                div.classList.toggle('border-blue-500');
                div.classList.toggle('bg-blue-50');
            };
            container.appendChild(div);
        });
    };

    window.loadRentalAccessories = function () {
        const accessories = JSON.parse(localStorage.getItem('accessories')) || [];
        const container = document.getElementById('accessories-list');
        container.innerHTML = '';
        accessories.forEach(a => {
            const div = document.createElement('div');
            div.className = 'border rounded-lg p-4 hover:border-green-500 cursor-pointer';
            div.innerHTML = `
                <img src="${a.image}" alt="${a.name}" class="w-full h-24 object-cover mb-2 rounded">
                <h3 class="text-center font-bold text-sm">${a.name}</h3>
                <p class="text-center text-gray-600 text-sm mb-2">R$ ${a.price}/mês</p>
            `;
            div.onclick = function () {
                toggleAccessory(a.id);
                div.classList.toggle('border-green-500');
                div.classList.toggle('bg-green-50');
            };
            container.appendChild(div);
        });
    };

    window.loadClients = function () {
        const alugueis = JSON.parse(localStorage.getItem('alugueis')) || [];
        const container = document.getElementById('clients-list');
        container.innerHTML = '';
        const clientes = [];
        alugueis.forEach(a => {
            if (!clientes.some(c => c.cpf === a.cliente.cpf)) {
                clientes.push(a.cliente);
            }
        });
        clientes.forEach(c => {
            const div = document.createElement('div');
            div.className = 'p-4 bg-gray-100 rounded-lg';
            div.innerText = `${c.nome} | ${c.email} | ${c.telefone} | CPF: ${c.cpf}`;
            container.appendChild(div);
        });
    };

    window.loadRentals = function () {
        const alugueis = JSON.parse(localStorage.getItem('alugueis')) || [];
        const container = document.getElementById('rentals-list');
        container.innerHTML = '';
        alugueis.forEach(a => {
            const div = document.createElement('div');
            div.className = 'p-4 bg-gray-100 rounded-lg';
            div.innerHTML = `<strong>${a.cliente.nome}</strong> alugou <b>${a.console}</b> (${a.plano}) em ${new Date(a.dataPedido).toLocaleDateString()}`;
            container.appendChild(div);
        });
    };

    // Formulários de cadastro de jogo e acessório
    document.getElementById('add-game-form')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const game = {
            id: document.getElementById('game-name').value.toLowerCase().replace(/\s/g, '-'),
            name: document.getElementById('game-name').value,
            price: Number(document.getElementById('game-price').value),
            image: document.getElementById('game-image').value
        };
        const games = JSON.parse(localStorage.getItem('games')) || [];
        games.push(game);
        localStorage.setItem('games', JSON.stringify(games));
        alert('Jogo cadastrado com sucesso!');
        this.reset();
        loadGames();
        loadRentalGames();
    });

    document.getElementById('add-accessory-form')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const accessory = {
            id: document.getElementById('accessory-name').value.toLowerCase().replace(/\s/g, '-'),
            name: document.getElementById('accessory-name').value,
            price: Number(document.getElementById('accessory-price').value),
            image: document.getElementById('accessory-image').value
        };
        const accessories = JSON.parse(localStorage.getItem('accessories')) || [];
        accessories.push(accessory);
        localStorage.setItem('accessories', JSON.stringify(accessories));
        alert('Acessório cadastrado com sucesso!');
        this.reset();
        loadRentalAccessories();
    });

});
