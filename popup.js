// popup.js

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    const statusMessage = document.getElementById('statusMessage');
    const downloadLink = document.getElementById('downloadLink');

    // Inicializa o downloadLink como escondido ao carregar o popup
    downloadLink.style.display = 'none';

    startButton.addEventListener('click', function() {
        statusMessage.textContent = 'Enviando comando de importação...';
        statusMessage.className = ''; // Remove classes de status anteriores
        downloadLink.style.display = 'none'; // Garante que o link está escondido ao iniciar nova raspagem

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                statusMessage.textContent = 'Nenhuma aba ativa encontrada.';
                statusMessage.className = 'status-error';
                return;
            }

            const activeTab = tabs[0];
            if (!activeTab.url || (!activeTab.url.includes('ifood.com.br/delivery') && !activeTab.url.includes('ifood.com.br/restaurante'))) {
                statusMessage.textContent = 'Erro: Por favor, navegue para uma página de restaurante ou produto do Ifood.';
                statusMessage.className = 'status-error';
                return;
            }

            chrome.tabs.sendMessage(activeTab.id, { action: "scrapeProduct" }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Erro ao se comunicar com o content script:', chrome.runtime.lastError.message);
                    statusMessage.textContent = 'Erro ao raspar: Verifique o console para mais detalhes. (Content Script não injetado ou erro de comunicação)';
                    statusMessage.className = 'status-error';
                    return;
                }

                if (response && response.success) {
                    statusMessage.textContent = 'Dados do produto raspados com sucesso! Gerando CSV...';
                    statusMessage.className = 'status-success';
                    console.log('Dados recebidos do content script:', response.data);

                    const productData = response.data;
                    const nuvemshopCSV = generateNuvemshopCSV(productData);
                    console.log("CSV para Nuvemshop gerado:\n", nuvemshopCSV);

                    // Habilitar download do CSV (com BOM para caracteres especiais)
                    const blob = new Blob([nuvemshopCSV], { type: 'text/csv;charset=utf-8,\ufeff' });
                    const url = URL.createObjectURL(blob);
                    downloadLink.href = url;
                    const fileName = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '') + '.csv';
                    downloadLink.download = fileName;
                    downloadLink.textContent = `Download CSV: ${fileName}`;
                    downloadLink.style.display = 'block'; // <--- AGORA O LINK É MOSTRADO APENAS AQUI
                    statusMessage.textContent = 'CSV gerado! Clique no link para baixar.';
                    statusMessage.className = 'status-success';


                } else if (response && response.message) {
                    statusMessage.textContent = 'Erro ao raspar: ' + response.message;
                    statusMessage.className = 'status-error';
                    console.warn("Falha no scraping:", response);
                } else {
                    statusMessage.textContent = 'Erro desconhecido na resposta do content script.';
                    statusMessage.className = 'status-error';
                    console.warn("Resposta desconhecida:", response);
                }
            });
        });
    });

    // --- FUNÇÃO AUXILIAR PARA GERAR TODAS AS COMBINAÇÕES DE VARIAÇÕES (PRODUTO CARTESIANO) ---
    function generateCombinations(variationGroups) {
        if (!variationGroups || variationGroups.length === 0) {
            return [[]];
        }

        const combinations = [];
        const firstGroupOptions = variationGroups[0].options;
        const remainingCombinations = generateCombinations(variationGroups.slice(1));

        for (const firstOption of firstGroupOptions) {
            for (const remainingCombination of remainingCombinations) {
                combinations.push([firstOption, ...remainingCombination]);
            }
        }
        return combinations;
    }

    // --- FUNÇÃO PRINCIPAL PARA GERAR O CSV NO FORMATO DA NUVEMSHOP ---
    function generateNuvemshopCSV(productData) {
        const DELIMITER = ';';
        const MAX_VARIATIONS_COLUMNS = 6; // Suporta até 3 pares (Nome/Valor)

        let headers = [
            "Identificador URL", "Nome", "Categorias"
        ];

        for (let i = 1; i <= MAX_VARIATIONS_COLUMNS / 2; i++) {
            headers.push(`Nome da variação ${i}`);
            headers.push(`Valor da variação ${i}`);
        }

        headers.push("Preço", "Preço promocional", "Peso (kg)", "Altura (cm)", "Largura (cm)", "Comprimento (cm)",
            "Estoque", "SKU", "Código de barras", "Exibir na loja", "Frete gratis", "Descrição", "Tags",
            "Título para SEO", "Descrição para SEO", "Marca", "Produto Físico", "MPN (Cód. Exclusivo, Modelo Fabricante)",
            "Sexo", "Faixa etária", "Custo", "Imagens"); // Coluna Imagens adicionada para Nuvemshop

        let csvRows = [];
        csvRows.push(headers.join(DELIMITER));

        const productSlug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
        const basePrice = productData.price;
        const defaultCategory = "Sem Categoria"; // Pode ser alterado se você raspar categorias

        // --- Linha do Produto Principal (Mãe) ---
        let mainProductRow = new Array(headers.length).fill('');
        mainProductRow[headers.indexOf("Identificador URL")] = productSlug;
        mainProductRow[headers.indexOf("Nome")] = productData.name;
        mainProductRow[headers.indexOf("Categorias")] = defaultCategory;
        mainProductRow[headers.indexOf("Preço")] = basePrice.toFixed(2);

        mainProductRow[headers.indexOf("Preço promocional")] = '';
        mainProductRow[headers.indexOf("Peso (kg)")] = '0.10'; // Valores padrão para evitar 0.00 que pode dar erro em sistemas
        mainProductRow[headers.indexOf("Altura (cm)")] = '10.00';
        mainProductRow[headers.indexOf("Largura (cm)")] = '10.00';
        mainProductRow[headers.indexOf("Comprimento (cm)")] = '10.00';
        mainProductRow[headers.indexOf("Estoque")] = '100'; // Valor padrão
        mainProductRow[headers.indexOf("SKU")] = productSlug.toUpperCase();
        mainProductRow[headers.indexOf("Código de barras")] = '';
        mainProductRow[headers.indexOf("Exibir na loja")] = 'SIM';
        mainProductRow[headers.indexOf("Frete gratis")] = 'NÃO';
        mainProductRow[headers.indexOf("Descrição")] = productData.description;
        mainProductRow[headers.indexOf("Tags")] = productData.name;
        mainProductRow[headers.indexOf("Título para SEO")] = productData.name;
        mainProductRow[headers.indexOf("Descrição para SEO")] = productData.description.substring(0, 160);
        mainProductRow[headers.indexOf("Marca")] = '';
        mainProductRow[headers.indexOf("Produto Físico")] = 'SIM';
        mainProductRow[headers.indexOf("MPN (Cód. Exclusivo, Modelo Fabricante)")] = '';
        mainProductRow[headers.indexOf("Sexo")] = '';
        mainProductRow[headers.indexOf("Faixa etária")] = '';
        mainProductRow[headers.indexOf("Custo")] = '';
        mainProductRow[headers.indexOf("Imagens")] = productData.image; // Imagem do produto principal

        csvRows.push(mainProductRow.join(DELIMITER));

        // --- Linhas de Variações (Filhas) ---
        if (productData.variations && productData.variations.length > 0) {
            const allCombinations = generateCombinations(productData.variations);

            allCombinations.forEach(combination => {
                let variationRow = new Array(headers.length).fill('');
                variationRow[headers.indexOf("Identificador URL")] = productSlug; // Mesma URL do pai

                let currentPrice = basePrice;
                let variationColIndex = headers.indexOf("Nome da variação 1");
                let variationImages = [];

                if (productData.image) {
                    variationImages.push(productData.image); // Inclui a imagem principal nas variações
                }

                combination.forEach(option => {
                    // Garante que não ultrapassa as colunas de variação e que parentTitle existe
                    if (variationColIndex < headers.indexOf("Preço") && (variationColIndex + 1) < headers.indexOf("Preço")) {
                        // Verifica se 'parentTitle' existe no objeto 'option'
                        if (option.hasOwnProperty('parentTitle')) {
                            variationRow[variationColIndex] = option.parentTitle; // Usa o parentTitle do content script
                        } else {
                            console.warn("parentTitle não encontrado para a opção:", option.description);
                            variationRow[variationColIndex] = `Variação ${Math.floor(variationColIndex / 2) + 1}`; // Fallback
                        }
                        variationRow[variationColIndex + 1] = option.description;

                        currentPrice += option.price_adjustment;

                        if (option.image && !variationImages.includes(option.image)) {
                            variationImages.push(option.image);
                        }
                        variationColIndex += 2;
                    }
                });

                variationRow[headers.indexOf("Preço")] = currentPrice.toFixed(2);
                variationRow[headers.indexOf("Estoque")] = '100'; // Variações filhas também com estoque padrão
                variationRow[headers.indexOf("Exibir na loja")] = 'SIM'; // Variações filhas também exibidas
                variationRow[headers.indexOf("Produto Físico")] = 'SIM'; // Variações filhas também físicas
                variationRow[headers.indexOf("Peso (kg)")] = '0.10'; // Variações filhas com peso padrão
                variationRow[headers.indexOf("Altura (cm)")] = '10.00';
                variationRow[headers.indexOf("Largura (cm)")] = '10.00';
                variationRow[headers.indexOf("Comprimento (cm)")] = '10.00';


                if (variationImages.length > 0) {
                    variationRow[headers.indexOf("Imagens")] = variationImages.join(',');
                }

                csvRows.push(variationRow.join(DELIMITER));
            });
        }

        return csvRows.join('\n');
    }
});