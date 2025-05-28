# 📦 Ifood Product Importer - Extensão Chrome

![Ifood Product Importer - Extensão Chrome](https://img.shields.io/badge/Status-Ativo-brightgreen)
[![Licença MIT](https://img.shields.io/badge/Licença-MIT-blue.svg)](LICENSE)
![Compatibilidade](https://img.shields.io/badge/Navegador-Chrome-orange)

## 📝 Descrição

Esta é uma extensão para Google Chrome projetada para simplificar a extração de dados de produtos do Ifood. Com apenas um clique, a extensão coleta informações detalhadas de produtos (incluindo variações e preços) diretamente do modal de detalhes do produto no Ifood e as formata em um arquivo CSV pronto para uso, ideal para importação em plataformas de e-commerce ou análise de dados.

O objetivo principal é agilizar o processo de catalogação de produtos, eliminando a necessidade de copiar e colar informações manualmente, o que economiza tempo e reduz erros.

## ✨ Recursos

* **Extração de Dados Abrangente:** Coleta Nome, URL, Preço, e Variações do produto.
* **Gerenciamento de Variações Inteligente:** Identifica e separa corretamente o nome da variação (ex: "Mensagem", "É presente?") das instruções de escolha (ex: "Escolha 1 opção.", "Escolha até 1 opção.").
* **Geração de CSV:** Exporta todos os dados coletados para um arquivo CSV estruturado.
* **Cálculo de Preço por Variação:** Ajusta o preço do produto com base nos adicionais de preço das variações.
* **Formato Padrão:** CSV com colunas pré-definidas para fácil integração.

## 🚀 Como Usar (Instalação)

Siga os passos abaixo para instalar e começar a usar a extensão no seu Google Chrome:

1.  **Clone ou Baixe o Repositório:**
    * Via Git: `git clone [LINK_DO_SEU_REPOSITORIO]`
    * Ou baixe o arquivo ZIP do repositório e descompacte-o em uma pasta de sua preferência.

2.  **Abra o Gerenciador de Extensões do Chrome:**
    * Abra o Google Chrome.
    * Digite `chrome://extensions` na barra de endereço e pressione Enter.

3.  **Habilite o Modo Desenvolvedor:**
    * No canto superior direito da página do Gerenciador de Extensões, ative a chave "Modo desenvolvedor" (Developer mode).

4.  **Carregue a Extensão:**
    * Clique no botão "Carregar sem compactação" (Load unpacked).
    * Navegue até a pasta onde você descompactou (ou clonou) o repositório do projeto (`Ifood-Product-Importer-main` ou o nome que você deu à pasta).
    * Selecione essa pasta e clique em "Selecionar Pasta".

5.  **Extensão Instalada:**
    * A extensão "Ifood Product Importer" aparecerá na sua lista de extensões. Recomenda-se fixá-la na barra de ferramentas do Chrome para acesso rápido.

## 🧑‍💻 Utilização

Para extrair os dados de um produto no Ifood:

1.  **Navegue até o Ifood:** Acesse o site do Ifood (web ou desktop app).
2.  **Abra o Modal do Produto:** Clique em qualquer produto para abrir o pop-up com seus detalhes e opções de variação. É crucial que este modal esteja aberto.
3.  **Clique no Ícone da Extensão:** Clique no ícone da extensão "Ifood Product Importer" (o que você fixou na barra de ferramentas do Chrome).
4.  **Download do CSV:** Um arquivo CSV contendo os dados do produto será automaticamente baixado para o seu computador.

## 📊 Estrutura do CSV Gerado

O arquivo CSV gerado seguirá a seguinte estrutura de colunas:
Pronto para NuvemShop

AEste README foi projetado para ser informativo, fácil de usar e profissional, seguindo as melhores práticas do GitHub. Ele cobre desde a descrição do projeto até a estrutura do CSV gerado, além de uma seção de contribuição e licença.

## 📸 Screenshots (Opcional, mas Altamente Recomendado)

Para tornar este `README` ainda mais claro e visualmente atraente, considere adicionar algumas capturas de tela nas seções abaixo:

* Uma imagem da extensão instalada na barra do Chrome.
* Uma imagem do modal do produto no Ifood.
* Uma imagem do pop-up da extensão em ação.
* Uma imagem de um trecho do arquivo CSV gerado.

Você pode adicioná-las na pasta `assets/images` (crie se não existir) e referenciá-las assim:

`![Descrição da Imagem](assets/images/nome_da_sua_imagem.png)`

---

## 🛠️ Desenvolvimento e Contribuição

Este projeto está aberto a contribuições! Se você encontrou um bug, tem uma sugestão de melhoria ou gostaria de adicionar um novo recurso, sinta-se à vontade para:

1.  **Fazer um Fork** do repositório.
2.  **Criar uma branch** para sua feature (`git checkout -b feature/NomeDaSuaFeature`).
3.  **Realizar suas alterações** e fazer commits claros e descritivos.
4.  **Enviar suas alterações** (`git push origin feature/NomeDaSuaFeature`).
5.  **Abrir um Pull Request** detalhando as mudanças e o problema/melhoria que ele resolve.

## ⚖️ Licença

Este projeto está licenciado sob a Lic
