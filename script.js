document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos ---
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const toggleCartSidebarBtn = document.getElementById('toggle-cart-sidebar');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartItemsList = document.getElementById('cart-items'); // Alterado para lista ul
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const cartEmptyMsg = document.getElementById('cart-empty-msg');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Modais de Login/Checkout
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutTotalElement = document.getElementById('checkout-total');
    const checkoutForm = document.getElementById('checkout-form');
    const closeButtons = document.querySelectorAll('.modal .close-btn'); // Botões de fechar dos modais

    // Formulários Login/Registro
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const registerLink = document.querySelector('.register-link');
    const loginLink = document.querySelector('.login-link');

    // Campo de Troco
    const pagamentoSelect = document.getElementById('pagamento');
    const trocoField = document.querySelector('.troco-field');
    const trocoInput = document.getElementById('troco');

    // Menu Mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    // --- Estado do Carrinho ---
    let cart = [];

    // --- Funções Principais ---

    function addToCart(id, name, price) {
        const existingItemIndex = cart.findIndex(item => item.id === id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        updateCartDisplay();
        openCartSidebar(); // Abre o carrinho ao adicionar
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartDisplay();
    }

    function updateCartDisplay() {
        cartItemsList.innerHTML = ''; // Limpa a lista
        let totalQuantity = 0;

        if (cart.length === 0) {
            cartItemsList.appendChild(cartEmptyMsg);
            checkoutBtn.disabled = true; // Desabilita o botão se o carrinho está vazio
        } else {
            // Remove a mensagem de vazio se ela estiver presente
            if (cartEmptyMsg.parentNode === cartItemsList) {
                cartItemsList.removeChild(cartEmptyMsg);
            }

            cart.forEach(item => {
                const itemElement = document.createElement('li');
                itemElement.classList.add('cart-item'); // Adiciona classe para estilização
                itemElement.innerHTML = `
                    <div class="item-info">
                        <span>${item.name}</span>
                        <span class="item-qty">Qtd: ${item.quantity}</span>
                    </div>
                    <span class="item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-from-cart-btn" data-id="${item.id}">&times;</button>
                `;
                cartItemsList.appendChild(itemElement);
                totalQuantity += item.quantity;
            });
            checkoutBtn.disabled = false; // Habilita o botão se há itens
        }

        calculateTotal();
        cartCountElement.textContent = totalQuantity;
    }

    function calculateTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`; // Formato BR
        checkoutTotalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`; // Formato BR
    }

    function openModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Evita scroll no body
    }

    function closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restaura scroll
    }

    function openCartSidebar() {
        cartSidebar.classList.add('open');
        document.body.style.overflow = 'hidden'; // Evita scroll no body
    }

    function closeCartSidebar() {
        cartSidebar.classList.remove('open');
        document.body.style.overflow = ''; // Restaura scroll
    }

    // --- Event Listeners ---

    // 1. Adicionar ao Carrinho
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            addToCart(id, name, price);
        });
    });

    // 2. Remover do Carrinho (usando delegação de eventos)
    cartItemsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-from-cart-btn')) {
            const id = event.target.dataset.id;
            removeFromCart(id);
        }
    });

    // 3. Abrir/Fechar Carrinho Sidebar
    toggleCartSidebarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cartSidebar.classList.contains('open') ? closeCartSidebar() : openCartSidebar();
    });
    closeCartBtn.addEventListener('click', closeCartSidebar);

    // Fechar carrinho ao clicar fora dele (MAS NÃO em modais ou no próprio carrinho)
    document.addEventListener('click', (e) => {
        if (cartSidebar.classList.contains('open') && 
            !cartSidebar.contains(e.target) && 
            !toggleCartSidebarBtn.contains(e.target) &&
            !e.target.closest('.product-card')) { // Ignora cliques nos cards de produto
            closeCartSidebar();
        }
    });


    // 4. Abrir Modal de Login
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
        // Garante que o formulário de login esteja visível ao abrir
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    // 5. Abrir Modal de Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            closeCartSidebar(); // Fecha o carrinho antes de abrir o checkout
            openModal(checkoutModal);
        } else {
            alert("Seu carrinho está vazio!"); // Isto não deveria acontecer se o botão estiver desabilitado
        }
    });

    // 6. Fechar Modais (botões 'X')
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // 7. Simulação de envio do Pedido (Checkout)
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Pedido Food Meet enviado com sucesso! Em breve, entregaremos seu pedido saudável. (Esta é uma simulação)");
        
        cart = []; // Limpa o carrinho
        updateCartDisplay();
        closeModal(checkoutModal);
        checkoutForm.reset(); // Limpa o formulário de checkout
        trocoField.style.display = 'none'; // Esconde o campo de troco
        trocoInput.removeAttribute('required'); // Remove o required
    });

    // 8. Lógica de Login/Cadastro
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Login realizado com sucesso! (Simulação)");
        closeModal(loginModal);
        loginForm.reset();
    });
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Cadastro realizado com sucesso! (Simulação)");
        closeModal(loginModal);
        registerForm.reset();
        // Opcional: Voltar para a tela de login após o cadastro
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    // 9. Lógica do Campo de Troco
    pagamentoSelect.addEventListener('change', () => {
        if (pagamentoSelect.value === 'dinheiro') {
            trocoField.style.display = 'block';
            trocoInput.setAttribute('required', 'required');
        } else {
            trocoField.style.display = 'none';
            trocoInput.removeAttribute('required');
        }
    });

    // 10. Menu Mobile Toggle
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // Fechar menu mobile ao clicar em um link
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        });
    });


    // --- Inicialização ---
    updateCartDisplay(); // Carrega o carrinho na inicialização
    closeCartSidebar(); // Garante que o carrinho está fechado
});
