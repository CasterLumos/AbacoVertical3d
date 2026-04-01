
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ==========================================
// 1. A MÁQUINA DE ESTADO (LÓGICA MATEMÁTICA PURA)
// ==========================================
let estadoAbaco = [0, 0, 0, 0, 0]; // U, D, C, UM, DM

function adicionarArgola(index) {
    estadoAbaco[index]++;
    if (estadoAbaco[index] >= 10) {
        estadoAbaco[index] = 0;
        if (index + 1 >= estadoAbaco.length) {
            estadoAbaco.push(0); // Expansão dinâmica
        }
        adicionarArgola(index + 1); // Vai um (recursivo)
    }
}

function removerArgola(index) {
    if (estadoAbaco[index] > 0) {
        estadoAbaco[index]--;
    } else {
        let indiceEmprestimo = -1;
        // Busca quem pode emprestar à esquerda
        for (let i = index + 1; i < estadoAbaco.length; i++) {
            if (estadoAbaco[i] > 0) {
                indiceEmprestimo = i;
                break;
            }
        }
        if (indiceEmprestimo !== -1) {
            estadoAbaco[indiceEmprestimo]--; // Tira 1
            for (let i = indiceEmprestimo - 1; i >= index; i--) {
                estadoAbaco[i] = 9; // Preenche os do meio com 9
            }
        }
    }
}

// ==========================================
// 2. CONFIGURAÇÃO DA CENA 3D
// ==========================================
const scene = new THREE.Scene();
// Fundo Dark Mode suave
scene.background = new THREE.Color(0x1a1a1e);
scene.fog = new THREE.Fog(0x1a1a1e, 10, 50);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 12, 22); // Câmera um pouco mais distante e alta

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Renderizador de HTML 2D (Para as letras na base)
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none'; // Não bloqueia os cliques 3D
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// Foca a câmera mais para o alto (eixo Y = 5), o que joga o ábaco visualmente mais para baixo na tela
controls.target.set(0, 5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false; // Desativa pan para o botão direito não conflitar
controls.maxPolarAngle = Math.PI / 2 + 0.1; // Impede de olhar totalmente por baixo
controls.update();

// Iluminação
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 15, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// ==========================================
// 3. CONSTRUÇÃO DOS OBJETOS 3D
// ==========================================
const distanciaHastes = 2.5;
const coresArgolas = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf1c40f, 0x9b59b6, 0xe67e22, 0x1abc9c];
const rotulosTextos = ['U', 'D', 'C', 'UM', 'DM', 'CM', 'UMI', 'DMI'];

// Geometrias reutilizáveis
const hasteGeo = new THREE.CylinderGeometry(0.15, 0.15, 8, 16);
const hasteMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });
const argolaGeo = new THREE.TorusGeometry(0.6, 0.25, 16, 32);

// Hitbox invisível para facilitar o clique
const hitboxGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 8);
const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });

const baseGroup = new THREE.Group();
scene.add(baseGroup);

const baseGeo = new THREE.BoxGeometry(1, 1, 3);
const baseMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
const baseMesh = new THREE.Mesh(baseGeo, baseMat);
baseMesh.receiveShadow = true;
baseMesh.position.y = -0.5;
baseGroup.add(baseMesh);

const hastesGroup = new THREE.Group();
baseGroup.add(hastesGroup);

const argolasGroup = new THREE.Group();
baseGroup.add(argolasGroup);

const hitboxes = [];

// ==========================================
// 4. O "DESENHISTA" DA CENA
// ==========================================
function atualizarCena3D() {
    const totalHastes = estadoAbaco.length;

    // Centraliza todo o conjunto
    const centroX = ((totalHastes - 1) * distanciaHastes) / 2;
    baseGroup.position.x = -centroX; // Move o grupo para centralizar

    // Expande a base física
    baseMesh.scale.x = (totalHastes * distanciaHastes) + 1;
    baseMesh.position.x = centroX;

    // Instancia hastes e rótulos faltantes
    while (hastesGroup.children.length < totalHastes) {
        const i = hastesGroup.children.length;

        // Cria a haste
        const haste = new THREE.Mesh(hasteGeo, hasteMat);
        haste.castShadow = true;

        // Cria o Hitbox e vincula o índice a ele
        const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
        hitbox.userData.index = i;
        haste.add(hitbox);
        hitboxes.push(hitbox);

        // Cria o rótulo HTML (CSS2DObject)
        const div = document.createElement('div');
        div.className = 'abaco-label';
        div.textContent = rotulosTextos[i] || `E${i}`;
        const labelObj = new CSS2DObject(div);
        labelObj.position.set(0, -4, 1.6); // Posiciona na frente da base
        haste.add(labelObj);

        hastesGroup.add(haste);
    }

    // Posiciona hastes e limpa argolas
    argolasGroup.clear();

    let valorTotal = 0;
    let multiplicador = 1;

    for (let i = 0; i < totalHastes; i++) {
        // Matemátca do valor
        valorTotal += estadoAbaco[i] * multiplicador;
        multiplicador *= 10;

        // Posiciona a haste (A da direita é o index 0)
        const posX = (totalHastes - 1 - i) * distanciaHastes;
        hastesGroup.children[i].position.set(posX, 4, 0);

        // Desenha as argolas desta haste
        const matArgola = new THREE.MeshStandardMaterial({
            color: coresArgolas[i % coresArgolas.length],
            roughness: 0.3,
            metalness: 0.1
        });

        for (let j = 0; j < estadoAbaco[i]; j++) {
            const argola = new THREE.Mesh(argolaGeo, matArgola);
            argola.castShadow = true;
            argola.rotation.x = Math.PI / 2;
            // Empilha de baixo para cima
            argola.position.set(posX, j * 0.65 + 0.5, 0);
            argolasGroup.add(argola);
        }
    }

    // Atualiza o HTML superior
    document.getElementById('total-display').innerText = valorTotal.toLocaleString('pt-BR');
}

// ==========================================
// 5. INTERAÇÃO DO USUÁRIO (EVENTOS)
// ==========================================
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
    // Calcula posição do mouse (-1 a +1)
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(hitboxes);

    if (intersects.length > 0) {
        const indexClidado = intersects[0].object.userData.index;

        if (event.button === 0) { // Clique Esquerdo
            adicionarArgola(indexClidado);
        } else if (event.button === 2) { // Clique Direito
            removerArgola(indexClidado);
        }

        atualizarCena3D();
    }
});

// Responsividade
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Loop de Animação
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// Inicialização
atualizarCena3D();
animate();

