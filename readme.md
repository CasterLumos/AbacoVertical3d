# 🧮 Ábaco 3D Interativo

Um ábaco virtual interativo construído em 3D para navegadores web. Este projeto simula a lógica matemática real de um ábaco, permitindo adicionar e remover argolas fisicamente enquanto calcula o valor total na tela.

## ✨ Funcionalidades

* **Visualização 3D:** Renderizado em tempo real no navegador, permitindo girar, dar zoom e explorar o ábaco de qualquer ângulo.
* **Lógica Matemática Real:** * Expansão dinâmica: Se você estourar o limite de uma haste (passar de 9), o sistema automaticamente faz o "vai um" e cria uma nova haste à esquerda, se necessário.
  * Empréstimo: Ao subtrair de uma haste vazia, o sistema busca na haste vizinha e faz a conversão correta (tira 1 de lá, adiciona 9 no meio e 10 na atual).
* **Interface Moderna:** Tema "Dark Mode" suave, focado em conforto visual.
* **UI Informativa:** Painel com o valor total atualizado em tempo real, tooltip interativo de ajuda e uma legenda explicando as siglas das casas decimais (U, D, C, UM, etc.).

## 🛠️ Tecnologias Utilizadas

* **HTML5 & CSS3:** Estrutura e estilização da interface 2D sobreposta.
* **JavaScript (ES6+):** Lógica matemática e controle de estado do ábaco.
* **[Three.js](https://threejs.org/):** Biblioteca principal para renderização 3D, iluminação, geometrias e controles de câmera (`OrbitControls`).
* **CSS2DRenderer:** Módulo do Three.js utilizado para renderizar os rótulos de texto HTML grudados nos objetos 3D.

## 📂 Estrutura de Arquivos

```text
meu-abaco/
│
├── index.html        # Estrutura da página, UI, importmap e CSS
├── main.js           # Lógica do Three.js, cena 3D e interação
├── README.md         # Documentação do projeto
└── js/               # Dependências locais (Opcional, caso rode 100% offline)
    ├── three.module.js
    └── addons/
```

## 🚀 Como Executar o Projeto

Como o projeto utiliza Módulos ES6 (`<script type="module">`), os navegadores modernos bloqueiam a execução direta do arquivo (abrindo com duplo clique no `index.html`) por questões de segurança (CORS). 

Para rodar o projeto corretamente, você precisa servir a pasta através de um **Servidor Local**. Escolha uma das opções abaixo:

### Opção 1: VS Code (Recomendado)
1. Abra a pasta do projeto no [Visual Studio Code](https://code.visualstudio.com/).
2. Instale a extensão **Live Server**.
3. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.

### Opção 2: Usando Python (Se já tiver instalado)
1. Abra o terminal na pasta do projeto.
2. Digite o comando: `python -m http.server 8000` (ou `python3` no Mac/Linux).
3. Abra o navegador e acesse: `http://localhost:8000`

### Opção 3: Usando Node.js
1. Abra o terminal na pasta do projeto.
2. Digite o comando: `npx http-server`
3. Acesse o endereço local fornecido no terminal (geralmente `http://127.0.0.1:8080`).

## 🎮 Como Usar

Com o projeto aberto no navegador, use o mouse para interagir:

* **Adicionar:** Clique com o **Botão Esquerdo** na haste (ou na área ao redor dela) para adicionar uma argola.
* **Remover:** Clique com o **Botão Direito** na haste para remover uma argola.
* **Câmera:** Clique e arraste no fundo escuro da tela para girar o ábaco. Use o *scroll* do mouse para aproximar ou afastar.
