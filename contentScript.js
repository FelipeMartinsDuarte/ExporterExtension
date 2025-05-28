// contentScript.js

console.log("Content script carregado na página do Ifood. Aguardando comando para raspar...");

// Função para extrair os dados do produto
function extractProductData() {
    console.log("Iniciando extração de dados do produto...");

    let productName = '';
    let productPrice = '';
    let productDescription = '';
    let productImage = '';
    let productOriginalPrice = ''; // Não usado, mas mantido para consistência
    let productVariations = [];

    // --- SELETORES CORRIGIDOS ---

    // URL da imagem do produto
    const imageElement = document.querySelector('img.dish-content__img');
    if (imageElement) {
        productImage = imageElement.src;
        productName = imageElement.alt ? imageElement.alt.trim() : '';
        console.log("URL da imagem extraída:", productImage);
        console.log("Nome do produto extraído (do alt da imagem):", productName);
    } else {
        console.warn("Elemento da imagem do produto NÃO ENCONTRADO.");
        const nameElementFallback = document.querySelector('div.nav-header__title');
        if (nameElementFallback) {
             productName = nameElementFallback.textContent.trim();
             console.warn("Nome do produto extraído (fallback do cabeçalho):", productName);
        } else {
             console.warn("Elemento do nome do produto NÃO ENCONTRADO.");
        }
    }

    // Preço do produto
    const priceElement = document.querySelector('div.dish-price span');
    if (priceElement) {
        productPrice = priceElement.textContent.replace('R$', '').replace(/\s/g, '').replace(',', '.').trim();
        console.log("Preço extraído:", productPrice);
    } else {
        console.warn("Elemento do preço do produto NÃO ENCONTRADO.");
    }

    // Descrição do produto
    const descriptionElement = document.querySelector('p[data-test-id="dish-content__details"]');
    if (descriptionElement) {
        productDescription = descriptionElement.textContent.trim();
        console.log("Descrição extraída:", productDescription);
    } else {
        console.warn("Elemento da descrição do produto NÃO ENCONTRADO.");
    }

    // --- SELETORES DE VARIAÇÕES (AGORA COM parentTitle INCLUÍDO E COM LÓGICA DE LIMPEZA) ---
    const variationSections = document.querySelectorAll('section.garnish-choices__list');
    if (variationSections.length > 0) {
        console.log(`Encontradas ${variationSections.length} seções de variação.`);
        variationSections.forEach(section => {
            const sectionTitleElement = section.querySelector('p.garnish-choices__title');
            let sectionTitle = 'Opção Desconhecida';

            if (sectionTitleElement) {
                // Modificação aqui: Usar .firstChild.textContent para pegar apenas o texto antes do <span>
                // Ou usar .cloneNode(true) e remover o span, depois pegar o textContent
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = sectionTitleElement.innerHTML;
                const subtitleSpan = tempDiv.querySelector('span.garnish-choices__subtitle');
                if (subtitleSpan) {
                    subtitleSpan.remove(); // Remove o span com a instrução
                }
                sectionTitle = tempDiv.textContent.trim();
            }

            // A lógica de limpeza de regex original pode ser mantida para casos futuros, mas pode não ser mais necessária aqui
            // const instructionRegex = /\s*(Escolha até \d+ opção\.?|Adicione de \d+ a \d+ itens|Selecione \d+ opções\.?)/i;
            // const match = sectionTitle.match(instructionRegex);
            // if (match) {
            //     sectionTitle = sectionTitle.substring(0, match.index).trim();
            // }
            // if (!sectionTitle && sectionTitleElement) {
            //     sectionTitle = sectionTitleElement.textContent.trim();
            // }

            console.log(`  Seção de variação (limpa): ${sectionTitle}`); // Log para verificar o título limpo
            let options = [];
            const optionLabels = section.querySelectorAll('label.garnish-choices__label');
            optionLabels.forEach(label => {
                const optionDescElement = label.querySelector('p.garnish-choices__option-desc');
                const optionDesc = optionDescElement ? optionDescElement.textContent.trim() : '';
                const optionPriceElement = label.querySelector('span.garnish-choices__option-price');
                let optionPrice = '0';
                if (optionPriceElement) {
                    optionPrice = optionPriceElement.textContent.trim().replace('+ R$', '').replace(/\s/g, '').replace(',', '.');
                }
                const optionImageElement = label.querySelector('figure.garnish-choices__content-img img');
                const optionImage = optionImageElement ? optionImageElement.src : '';

                options.push({
                    description: optionDesc,
                    price_adjustment: parseFloat(optionPrice),
                    image: optionImage,
                    parentTitle: sectionTitle // <--- ESSA LINHA É CRUCIAL PARA O CSV (agora com sectionTitle limpo)
                });
                console.log(`    Opção: ${optionDesc}, Preço: ${optionPrice}, Imagem: ${optionImage}, ParentTitle: ${sectionTitle}`); // Log detalhado
            });

            if (options.length > 0) {
                productVariations.push({
                    title: sectionTitle,
                    options: options
                });
            }
        });
    } else {
        console.log("Nenhuma seção de variação encontrada.");
    }

    // --- VERIFICAÇÃO FINAL E RETORNO ---
    if (productName && productPrice && productImage && productDescription) {
        const product = {
            name: productName,
            description: productDescription,
            price: parseFloat(productPrice),
            originalPrice: productOriginalPrice ? parseFloat(productOriginalPrice) : null,
            image: productImage,
            variations: productVariations
        };
        console.log("Todos os dados essenciais do produto foram encontrados:");
        console.log(product);
        return { success: true, data: product };
    } else {
        console.warn("Não foi possível extrair todos os dados essenciais. Faltando:");
        if (!productName) console.warn("- Nome");
        if (!productPrice) console.warn("- Preço");
        if (!productImage) console.warn("- Imagem");
        if (!productDescription) console.warn("- Descrição");
        return { success: false, message: "Não foi possível extrair todos os dados. Verifique a página." };
    }
}

// --- LÓGICA DO MUTATION OBSERVER PARA DETECTAR O MODAL ---
let observer = null;

function setupMutationObserver() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }

    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    observer = new MutationObserver(function(mutationsList, observer) {
        const modalImageElement = document.querySelector('img.dish-content__img');
        if (modalImageElement) {
            console.log("Modal do produto detectado via MutationObserver!");
            // Não desconecta o observer imediatamente aqui, pois o modal pode carregar dinamicamente o conteúdo.
            // A extração será acionada pelo popup.
        }
    });

    observer.observe(targetNode, config);
    console.log("MutationObserver configurado para detectar o modal do produto.");
}

// Chame setupMutationObserver apenas uma vez ao carregar o script
setupMutationObserver();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeProduct") {
        console.log("Comando 'scrapeProduct' recebido pelo contentScript.");
        const result = extractProductData();
        sendResponse(result);
        return true;
    }
});