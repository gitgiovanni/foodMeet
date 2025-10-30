document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos (Expandido) ---
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const toggleCartSidebarBtn = document.getElementById('toggle-cart-sidebar');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const cartEmptyMsg = document.getElementById('cart-empty-msg');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Modais de Login/Cadastro
    const loginModal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');
    const modalSteps = loginModal.querySelectorAll('.form-step');
    const nextStepButtons = loginModal.querySelectorAll('[data-next-step]');
    const prevStepButtons = loginModal.querySelectorAll('[data-prev-step]');
    const finishRegisterBtn = document.getElementById('finish-register-btn');
    const registerFormPrefs = document.getElementById('register-form-prefs');
    const loginForm = document.getElementById('login-form');

    // Modal de Parceiro
    const partnerBtn = document.getElementById('partner-btn');
    const partnerModal = document.getElementById('partner-modal');
    const partnerForm = document.getElementById('partner-form');

    // Modal de Alerta de Alergia
    const allergyAlertModal = document.getElementById('allergy-alert-modal');
    const allergyAlertText = document.getElementById('allergy-alert-text');
    const confirmAddBtn = document.getElementById('confirm-add-btn');
    const cancelAddBtn = document.getElementById('cancel-add-btn');

    // Seletores de fechamento (genéricos)
    const closeButtons = document.querySelectorAll('.modal .close-btn');

    // Outros seletores necessários (adicionados da V2)
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const pagamentoSelect = document.getElementById('pagamento');
    const trocoField = document.querySelector('.troco-field');
    const trocoInput = document.getElementById('troco');
    const checkoutTotalElement = document.getElementById('checkout-total');

    // --- Estado da Aplicação ---
    let cart = [];
    let userPreferences = {
        allergies: [], // Ex: ['frutos do mar', 'gluten']
        objetivos: []
    };
    let productPendingAddition = null; // Guarda o produto durante o alerta de alergia

    // --- Funções de Estado (localStorage) ---

    /**
     * Carrega as preferências do usuário do localStorage.
     */
    function loadPrefs() {
        const savedPrefs = localStorage.getItem('foodMeetUserPrefs');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
            console.log('Preferências carregadas:', userPreferences);
        }
    }

    /**
     * Salva as preferências atuais no localStorage.
     */
    function savePrefs() {
        localStorage.setItem('foodMeetUserPrefs', JSON.stringify(userPreferences));
        console.log('Preferências salvas:', userPreferences);
    }

    // --- Funções do Carrinho (Modificadas) ---

    /**
     * 1. Ponto de Entrada: Verifica alergias antes de adicionar.
     */
    function addToCart(product) {
        // Se o usuário não tiver alergias registradas, ou o produto não tiver tags,
        // ou se o usuário não estiver "logado" (simulado), adiciona direto.
        if (userPreferences.allergies.length === 0 || !product.tags) {
            proceedToAddToCart(product);
            return;
        }
        
        // Verifica se há correspondência
        const productTags = product.tags.split(',').map(tag => tag.trim().toLowerCase());
        const foundAllergy = userPreferences.allergies.find(allergy => productTags.includes(allergy.toLowerCase()));

        if (foundAllergy) {
            // ALERTA!
            productPendingAddition = product; // Salva o produto
            openAllergyAlert(foundAllergy);
        } else {
            // Sem alergia, adiciona direto
            proceedToAddToCart(product);
        }
    }

    /**
     * 2. Lógica Real: Adiciona o item ao carrinho e atualiza a UI.
     */
    function proceedToAddToCart(product) {
        const { id, name, price } = product;
        const existingItemIndex = cart.findIndex(item => item.id === id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        
        updateCartDisplay();
        openCartSidebar();
        productPendingAddition = null; // Limpa o produto pendente
    }

    /**
     * Funções do Carrinho (Remover, Atualizar, Calcular)
     */
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartDisplay();
    }
    
    function updateCartDisplay() {
        cartItemsList.innerHTML = '';
        let totalQuantity = 0;

        if (cart.length === 0) {
            cartItemsList.appendChild(cartEmptyMsg);
            checkoutBtn.disabled = true;
        } else {
            if (cartItemsList.contains(cartEmptyMsg)) {
                cartItemsList.removeChild(cartEmptyMsg);
            }
            cart.forEach(item => {
                const itemElement = document.createElement('li');
                itemElement.classList.add('cart-item');
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
            checkoutBtn.disabled = false;
        }
        calculateTotal();
        cartCountElement.textContent = totalQuantity;
    }

    function calculateTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalBRL = `R$ ${total.toFixed(2).replace('.', ',')}`;
        cartTotalElement.textContent = totalBRL;
        checkoutTotalElement.textContent = totalBRL; // Atualiza total no modal de checkout
    }

    // --- Funções de Modal (Genéricas e Alerta) ---

    function openModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    function openAllergyAlert(allergy) {
        allergyAlertText.textContent = `Este produto contém "${allergy}", um item que você marcou como alergia. Deseja continuar?`;
        openModal(allergyAlertModal);
    }

    // --- Funções de Navegação (Carrinho, Menu Mobile) ---
    
    function openCartSidebar() {
        cartSidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCartSidebar() {
        cartSidebar.classList.remove('open');
        // Só restaura o scroll se nenhum outro modal estiver aberto
        if (!document.querySelector('.modal.show')) {
            document.body.style.overflow = '';
        }
    }

    // --- Funções de Cadastro (Novas) ---

    /**
     * Mostra a etapa correta do formulário de login/cadastro.
     */
    function showFormStep(stepId) {
        modalSteps.forEach(step => {
            step.style.display = (step.id === stepId) ? 'block' : 'none';
        });
    }
    
    /**
     * Coleta dados do questionário e finaliza o cadastro.
     */
    function handleRegistration() {
        // Coleta de alergias
        const alergiasInputs = registerFormPrefs.querySelectorAll('input[name="alergia"]:checked');
        const alergias = Array.from(alergiasInputs).map(input => input.value.toLowerCase());
        
        // Adiciona alergias do campo "outros"
        const outrosAlergias = document.getElementById('alergia-outros').value.trim();
        if (outrosAlergias) {
            // Separa por vírgula e limpa espaços
            outrosAlergias.split(',')
                .map(a => a.trim().toLowerCase())
                .filter(a => a) // Remove vazios
                .forEach(a => {
                    if (!alergias.includes(a)) alergias.push(a);
                });
        }
        
        // Coleta de objetivos
        const objetivosInputs = registerFormPrefs.querySelectorAll('input[name="objetivo"]:checked');
        const objetivos = Array.from(objetivosInputs).map(input => input.value);

        // Atualiza o estado global
        userPreferences.allergies = alergias;
        userPreferences.objetivos = objetivos;

        // Salva no localStorage
        savePrefs();

        // Simulação de finalização
        alert('Cadastro finalizado com sucesso! Suas preferências foram salvas.');
        closeModal(loginModal);
        registerFormPrefs.reset();
        document.getElementById('register-form-basic').reset(); // Limpa form básico
        document.getElementById('alergia-outros').value = ''; // Limpa campo outros
        showFormStep('step-1'); // Reseta para a tela de login
    }


    // --- Event Listeners ---

    // 1. Adicionar ao Carrinho (Modificado)
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Coleta todos os dados do produto, incluindo as tags
            const productData = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: parseFloat(button.dataset.price),
                tags: button.dataset.tags || ''
            };
            addToCart(productData);
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

    // Fechar carrinho ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (cartSidebar.classList.contains('open') && 
            !cartSidebar.contains(e.target) && 
            !toggleCartSidebarBtn.contains(e.target) &&
            !e.target.closest('.add-to-cart-btn')) { // Ignora cliques nos botões de adicionar
            closeCartSidebar();
        }
    });

    // 4. Navegação do Modal de Login/Cadastro
    nextStepButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Simples validação (poderia ser mais robusta)
            const form = button.closest('form');
            if (form && typeof form.checkValidity === 'function' && !form.checkValidity()) {
                form.reportValidity();
                return;
            }
            // Navega para a próxima etapa
            const nextStepId = button.dataset.nextStep;
            if(nextStepId) {
                showFormStep(nextStepId);
            } else if (button.classList.contains('register-link')) { // Link "Crie uma conta"
                 showFormStep('step-2');
            }
        });
    });

    prevStepButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            showFormStep(button.dataset.prevStep);
        });
    });
    
    // Link "Já tenho conta"
    loginModal.querySelector('.login-link').addEventListener('click', (e) => {
        e.preventDefault();
        showFormStep('step-1');
    });
    
    // 5. Finalizar Cadastro
    finishRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleRegistration();
    });
    
    // 6. Simulação de Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Login realizado! (Simulação). Suas preferências de alergia estão ativas.');
        closeModal(loginModal);
        loginForm.reset();
    });

    // 7. Abrir Modal de Login
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showFormStep('step-1'); // Garante que comece na etapa 1
        openModal(loginModal);
    });

    // 8. Abrir Modal de Parceiro
    partnerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(partnerModal);
    });

    // 9. Envio Fictício do Cadastro de Parceiro
    partnerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Cadastro de parceiro enviado para análise! (Simulação)');
        closeModal(partnerModal);
        partnerForm.reset();
    });
    
    // 10. Abrir Modal de Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            closeCartSidebar(); // Fecha o carrinho antes de abrir o checkout
            openModal(checkoutModal);
        }
    });

    // 11. Simulação de envio do Pedido (Checkout)
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

    // 12. Botões do Modal de Alerta de Alergia
    confirmAddBtn.addEventListener('click', () => {
        if (productPendingAddition) {
            proceedToAddToCart(productPendingAddition);
        }
        closeModal(allergyAlertModal);
    });

    cancelAddBtn.addEventListener('click', () => {
        productPendingAddition = null; // Limpa o produto pendente
        closeModal(allergyAlertModal);
    });

    // 13. Fechamento Genérico de Modais (Botão 'X')
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // 14. Lógica do Campo de Troco (do Checkout)
    if (pagamentoSelect) {
        pagamentoSelect.addEventListener('change', () => {
            if (pagamentoSelect.value === 'dinheiro') {
                trocoField.style.display = 'block';
                trocoInput.setAttribute('required', 'required');
            } else {
                trocoField.style.display = 'none';
                trocoInput.removeAttribute('required');
            }
        });
    }

    // 15. Menu Mobile Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Fechar menu mobile ao clicar em um link
    if (mainNav) {
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                }
            });
        });
    }


    // --- Inicialização ---
    loadPrefs(); // Carrega preferências ao iniciar a página
    updateCartDisplay(); // Atualiza o carrinho (mostra "vazio" e desabilita checkout)
    closeCartSidebar(); // Garante que o carrinho está fechado

});
