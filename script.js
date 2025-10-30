// Aguarda o DOM (estrutura do site) carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos ---
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const cartEmptyMsg = document.getElementById('cart-empty-msg');
    
    // Modais
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutTotalElement = document.getElementById('checkout-total');
    const checkoutForm = document.getElementById('checkout-form');
    const closeButtons = document.querySelectorAll('.close-btn');

    // --- Estado do Carrinho ---
    let cart = []; // Array para armazenar os produtos

    // --- Funções Principais ---

    /**
     * Adiciona um item ao carrinho ou atualiza a quantidade.
     */
    function addToCart(id, name, price) {
        // Verifica se o item já existe no carrinho
        const existingItemIndex = cart.findIndex(item => item.id === id);

        if (existingItemIndex > -1) {
            // Se existe, apenas aumenta a quantidade
            cart[existingItemIndex].quantity += 1;
        } else {
            // Se não existe, adiciona o novo item
            cart.push({ id, name, price, quantity: 1 });
        }

        // Atualiza a exibição do carrinho
        updateCartDisplay();
    }

    /**
     * Remove um item do carrinho.
     */
    function removeFromCart(id) {
        // Filtra o array, mantendo todos os itens EXCETO o que tem o 'id' clicado
        cart = cart.filter(item => item.id !== id);

        // Atualiza a exibição do carrinho
        updateCartDisplay();
    }

    /**
     * Atualiza o HTML do carrinho (a lista de itens, o total e o contador).
     */
    function updateCartDisplay() {
        // Limpa o contêiner de itens
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            // Mostra a mensagem de carrinho vazio
            cartItemsContainer.appendChild(cartEmptyMsg);
        } else {
            // Oculta a mensagem de carrinho vazio (caso ela esteja lá)
            if (cartItemsContainer.contains(cartEmptyMsg)) {
                cartItemsContainer.removeChild(cartEmptyMsg);
            }

            // Adiciona cada item do carrinho ao HTML
            cart.forEach(item => {
                const itemElement = document.createElement('li');
                itemElement.innerHTML = `
                    <div class="item-info">
                        <span>${item.name}</span>
                        <span class="item-qty">Qtd: ${item.quantity}</span>
                    </div>
                    <span class="item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-from-cart-btn" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }

        // Calcula e exibe o total
        calculateTotal();
    }

    /**
     * Calcula o preço total e atualiza os elementos na tela.
     */
    function calculateTotal() {
        // 'reduce' soma o (preço * quantidade) de cada item
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        cartTotalElement.textContent = `R$ ${total.toFixed(2)}`;
        checkoutTotalElement.textContent = `R$ ${total.toFixed(2)}`; // Atualiza total no modal de checkout
        cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0); // Soma a quantidade de itens
    }

    /**
     * Funções para abrir e fechar Modais.
     */
    function openModal(modal) {
        modal.classList.add('show');
    }

    function closeModal(modal) {
        modal.classList.remove('show');
    }


    // --- Event Listeners (Ouvintes de Eventos) ---

    // 1. Cliques nos botões "Adicionar"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Pega os dados do produto a partir dos atributos 'data-*'
            const id = button.dataset.id;
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);

            addToCart(id, name, price);
        });
    });

    // 2. Cliques no contêiner de itens (para o botão "Remover")
    cartItemsContainer.addEventListener('click', (event) => {
        // Verifica se o clique foi em um botão de remover
        if (event.target.classList.contains('remove-from-cart-btn')) {
            const id = event.target.dataset.id;
            removeFromCart(id);
        }
    });

    // 3. Abrir Modal de Login
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Impede que o link '#' mude a URL
        openModal(loginModal);
    });

    // 4. Abrir Modal de Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            openModal(checkoutModal);
        } else {
            alert("Seu carrinho está vazio!");
        }
    });

    // 5. Fechar Modais (qualquer botão 'X')
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Encontra o modal "pai" do botão que foi clicado
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // 6. Simulação de envio do Pedido
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio real do formulário
        
        alert("Pedido enviado com sucesso! (Esta é uma simulação)");
        
        // Limpa o carrinho e fecha o modal
        cart = [];
        updateCartDisplay();
        closeModal(checkoutModal);
    });

    // --- Inicialização ---
    updateCartDisplay(); // Chama a função uma vez no início para exibir "Carrinho vazio"

});
