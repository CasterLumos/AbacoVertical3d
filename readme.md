# 🧮 Ábaco 3D Interativo e Educacional

Um ábaco virtual interativo construído em 3D para navegadores web. Este projeto foi desenhado com foco pedagógico, simulando a lógica matemática real de um ábaco e permitindo a manipulação visual de argolas para o ensino do sistema de numeração decimal e operações matemáticas.

## ✨ Funcionalidades

* **Visualização 3D:** Renderizado em tempo real no navegador, permitindo girar e explorar o ábaco de qualquer ângulo.
* **Lógica Matemática Real:** * **Expansão dinâmica (Vai um):** Se você estourar o limite de uma haste (passar de 9), o sistema automaticamente converte e cria uma nova haste à esquerda.
  * **Empréstimo:** Ao subtrair de uma haste vazia, o sistema busca na haste vizinha e faz a conversão correta (tira 1 de lá, adiciona 9 no meio e 10 na atual).
  * **Tamanho Físico Exato:** As hastes comportam exatamente 9 argolas, forçando a compreensão visual da necessidade de passar para a próxima casa decimal.
* 🎨 **Temas e Personalização:**
  * Modo Claro (Light Mode) e Escuro (Dark Mode).
  * Painel de ajustes com seletor de cores em acordeão para customizar cada casa decimal.
* 🎯 **Modo Foco (Monocromático):** Um botão nas configurações que torna todas as argolas cinzas, removendo o estímulo visual das cores para que a criança foque exclusivamente na quantidade e no valor posicional.
* 📱 **Suporte a Touch e Celulares:** O sistema detecta automaticamente se você está em um celular/tablet e substitui o menu de ajuda por um botão flutuante inteligente de "Adicionar ➕" ou "Remover ➖".
* 🗑️ **Botão Limpar:** Zera o cálculo e limpa todas as hastes com um único clique.

## 🛠️ Tecnologias Utilizadas

* **HTML5 & CSS3:** Estrutura e estilização da interface 2D sobreposta (com menus modais estilizados).
* **JavaScript (ES6+):** Lógica matemática, controle de estado, detecção de dispositivos touch e manipulação de variáveis CSS.
* **[Three.js](https://threejs.org/):** Biblioteca principal para renderização 3D, iluminação, geometrias e controles de câmera (`OrbitControls`).
* **CSS2DRenderer:** Módulo do Three.js utilizado para renderizar os rótulos de texto HTML grudados nas hastes 3D.

## 📂 Estrutura de Arquivos

```text
meu-abaco/
│
├── index.html        # Estrutura da página, Modais, importmap.
├── README.md         # Documentação do projeto.
├── style/
│   └── style.css     # Variáveis de temas, responsividade e UI.
└── js/               
    ├── script.js     # Lógica do Three.js, cenas 3D e interação.
    ├── three.module.js (Dependência Local)
    └── addons/         (Dependências Locais)
```

## 🚀 Como Executar o Projeto

Como o projeto utiliza Módulos ES6 (`<script type="module">`), os navegadores modernos bloqueiam a execução direta do arquivo por questões de segurança (CORS). 

Para rodar o projeto corretamente, você precisa servir a pasta através de um **Servidor Local**.

### Opção 1: VS Code (Recomendado)
1. Abra a pasta do projeto no [Visual Studio Code](https://code.visualstudio.com/).
2. Instale a extensão **Live Server**.
3. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.

### Opção 2: Usando Python
1. Abra o terminal na pasta do projeto.
2. Digite o comando: `python -m http.server 8000` (ou `python3` no Mac/Linux).
3. Abra o navegador e acesse: `http://localhost:8000`

## 🎮 Como Usar

A interface se adapta ao seu dispositivo automaticamente:

### No Computador (Mouse)
* **Adicionar:** Clique com o **Botão Esquerdo** na haste (ou na área ao redor dela) para adicionar uma argola.
* **Remover:** Clique com o **Botão Direito** na haste para remover uma argola.
* **Câmera:** Clique e arraste no fundo escuro da tela para girar o ábaco. Use o *scroll* do mouse para dar zoom.

### No Celular / Tablet (Touch)
* Utilize o botão flutuante **Verde (➕)** ou **Vermelho (➖)** no canto inferior direito para escolher o seu modo de ação.
* Feito isso, basta **tocar nas hastes** do ábaco na tela para que as argolas entrem ou saiam de acordo com o modo escolhido.
* Use um dedo no fundo da tela para girar a câmera, e o movimento de "pinça" com dois dedos para o zoom.
