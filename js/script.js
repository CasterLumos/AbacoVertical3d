import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ==========================================
// 1. LÓGICA E ESTADO GLOBAL
// ==========================================
let estadoAbaco = [0, 0, 0, 0, 0];
let isMonochrome = false;
let isAddMode = true;

function adicionarArgola(index) {
    estadoAbaco[index]++;
    if (estadoAbaco[index] >= 10) {
        estadoAbaco[index] = 0;
        if (index + 1 >= estadoAbaco.length) {
            if (estadoAbaco.length < 20) {
                estadoAbaco.push(0);
                const rodInput = document.getElementById('rod-count-input');
                if (rodInput) rodInput.value = estadoAbaco.length;
            } else { return; }
        }
        adicionarArgola(index + 1);
    }
}

function removerArgola(index) {
    if (estadoAbaco[index] > 0) {
        estadoAbaco[index]--;
    } else {
        let indiceEmprestimo = -1;
        for (let i = index + 1; i < estadoAbaco.length; i++) {
            if (estadoAbaco[i] > 0) {
                indiceEmprestimo = i;
                break;
            }
        }
        if (indiceEmprestimo !== -1) {
            estadoAbaco[indiceEmprestimo]--;
            for (let i = indiceEmprestimo - 1; i >= index; i--) {
                estadoAbaco[i] = 9;
            }
        }
    }
}

// ==========================================
// 2. CONFIGURAÇÃO DA CENA 3D E CORES
// ==========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 12, 22);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2 + 0.1;
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 15, 10);
dirLight.castShadow = true;
scene.add(dirLight);

const nomesVariaveisArgolas = [
    '--ring-u', '--ring-d', '--ring-c', '--ring-um',
    '--ring-dm', '--ring-cm', '--ring-umi', '--ring-dmi'
];
const rotulosTextos = ['U', 'D', 'C', 'UM', 'DM', 'CM', 'UMI', 'DMI'];
const nomesExtensos = ['Unidade', 'Dezena', 'Centena', 'Un. Milhar', 'Dez. Milhar', 'Cen. Milhar', 'Un. Milhão', 'Dez. Milhão'];
const paletaDeCores = [
    '#ff4757', '#ffa502', '#eccc68', '#7bed9f', '#2ed573',
    '#70a1ff', '#1e90ff', '#5352ed', '#ff6b81', '#a4b0be'
];

function getCorDoCSS(nomeVariavel) {
    const estiloBody = getComputedStyle(document.body);
    let corHex = estiloBody.getPropertyValue(nomeVariavel).trim();
    if (!corHex) corHex = '#ffffff';
    return new THREE.Color(corHex);
}

// ==========================================
// 3. CONSTRUÇÃO DOS OBJETOS 3D
// ==========================================
const distanciaHastes = 2.5;
const hasteGeo = new THREE.CylinderGeometry(0.15, 0.15, 6, 16);
const hasteMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });
const argolaGeo = new THREE.TorusGeometry(0.6, 0.25, 16, 32);
const hitboxGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 8);
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
let hitboxes = [];

function atualizarCena3D() {
    const totalHastes = estadoAbaco.length;
    const centroX = ((totalHastes - 1) * distanciaHastes) / 2;

    baseGroup.position.x = -centroX;
    baseMesh.scale.x = (totalHastes * distanciaHastes) + 1;
    baseMesh.position.x = centroX;

    while (hastesGroup.children.length < totalHastes) {
        const i = hastesGroup.children.length;

        const haste = new THREE.Mesh(hasteGeo, hasteMat);
        haste.castShadow = true;

        const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
        hitbox.userData.index = i;
        haste.add(hitbox);
        hitboxes.push(hitbox);

        const div = document.createElement('div');
        div.className = 'abaco-label';
        div.textContent = rotulosTextos[i] || '';

        const labelObj = new CSS2DObject(div);
        labelObj.position.set(0, -4, 1.6);
        labelObj.isCSS2DObject = true;
        haste.add(labelObj);

        hastesGroup.add(haste);
    }

    while (hastesGroup.children.length > totalHastes) {
        const hasteRemovida = hastesGroup.children[hastesGroup.children.length - 1];
        const labelObj = hasteRemovida.children.find(child => child.isCSS2DObject);
        if (labelObj && labelObj.element.parentNode) labelObj.element.parentNode.removeChild(labelObj.element);
        hastesGroup.remove(hasteRemovida);
        hitboxes.pop();
    }

    argolasGroup.clear();
    let valorTotal = 0;
    let multiplicador = 1;

    for (let i = 0; i < totalHastes; i++) {
        valorTotal += estadoAbaco[i] * multiplicador;
        multiplicador *= 10;

        const posX = (totalHastes - 1 - i) * distanciaHastes;
        hastesGroup.children[i].position.set(posX, 3, 0);

        let corTema;
        if (isMonochrome) {
            corTema = new THREE.Color('#7f8c8d');
        } else if (i < nomesVariaveisArgolas.length) {
            corTema = getCorDoCSS(nomesVariaveisArgolas[i]);
        } else {
            corTema = new THREE.Color('#7f8c8d');
        }

        const matArgola = new THREE.MeshStandardMaterial({ color: corTema, roughness: 0.3, metalness: 0.1 });

        for (let j = 0; j < estadoAbaco[i]; j++) {
            const argola = new THREE.Mesh(argolaGeo, matArgola);
            argola.castShadow = true;
            argola.rotation.x = Math.PI / 2;
            argola.position.set(posX, j * 0.65 + 0.5, 0);
            argolasGroup.add(argola);
        }
    }
    document.getElementById('total-display').innerText = valorTotal.toLocaleString('pt-BR');
}

// ==========================================
// 4. INTERAÇÃO 3D (RAYCASTER)
// ==========================================
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button') || event.target.closest('.modal-content') || event.target.closest('#legend-box') || event.target.closest('#help-btn') || event.target.closest('#mobile-mode-btn')) return;

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(hitboxes);

    if (intersects.length > 0) {
        const indexClidado = intersects[0].object.userData.index;

        // Clique botão direito (Sempre remover)
        if (event.button === 2) {
            removerArgola(indexClidado);
        }
        // Clique esquerdo ou Toque na tela (Obedece o botão de modo no touch)
        else if (event.button === 0) {
            // Se for touch (ou simulação de touch) ele obedece a variável isAddMode
            if (event.pointerType === 'touch' || isTouchDevice) {
                if (isAddMode) adicionarArgola(indexClidado);
                else removerArgola(indexClidado);
            } else {
                // Se for mouse de computador convencional, botão esquerdo sempre adiciona
                adicionarArgola(indexClidado);
            }
        }
        atualizarCena3D();
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 5. INTERFACE UI E EVENTOS
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const settingsToggleBtn = document.getElementById('settings-toggle');
const resetAbacusBtn = document.getElementById('reset-abacus-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const rodCountInput = document.getElementById('rod-count-input');
const colorPickersContainer = document.getElementById('color-pickers-container');
const resetSettingsBtn = document.getElementById('reset-settings');
const monochromeToggle = document.getElementById('monochrome-toggle');

// DETECÇÃO DE TOUCH SCREEN
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const helpBtn = document.getElementById('help-btn');
const mobileModeBtn = document.getElementById('mobile-mode-btn');
const mobileModeIcon = document.getElementById('mobile-mode-icon');

// Oculta ou mostra os botões corretos do canto inferior direito
if (isTouchDevice) {
    if (helpBtn) helpBtn.style.display = 'none'; // Some com o Dúvida
    if (mobileModeBtn) mobileModeBtn.classList.remove('hidden'); // Mostra o Toggle
} else {
    if (helpBtn) helpBtn.style.display = 'flex';
    if (mobileModeBtn) mobileModeBtn.classList.add('hidden');
}

// Ação do novo Botão Discreto de Modo
if (mobileModeBtn) {
    mobileModeBtn.addEventListener('click', () => {
        isAddMode = !isAddMode;
        if (isAddMode) {
            mobileModeIcon.textContent = '➕';
            mobileModeBtn.classList.remove('mode-remove');
        } else {
            mobileModeIcon.textContent = '➖';
            mobileModeBtn.classList.add('mode-remove');
        }
    });
}

function updateThreeJSColors() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const corFundoCSS = getCorDoCSS('--bg-color');
    scene.background = corFundoCSS;
    scene.fog = new THREE.Fog(corFundoCSS, 10, 50);
    ambientLight.intensity = isDark ? 0.6 : 0.8;
    dirLight.intensity = isDark ? 1 : 0.7;
}

themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        themeToggleBtn.innerHTML = '🌙 Dark Mode';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '☀️ Light Mode';
    }
    updateThreeJSColors();
    atualizarCena3D();
    atualizarInputsDeCor();
});

settingsToggleBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });

resetAbacusBtn.addEventListener('click', () => {
    estadoAbaco.fill(0);
    atualizarCena3D();
});

if (monochromeToggle) {
    monochromeToggle.addEventListener('change', (e) => {
        isMonochrome = e.target.checked;
        atualizarCena3D();
    });
}

rodCountInput.addEventListener('change', (e) => {
    let newCount = parseInt(e.target.value);
    if (newCount < 1) newCount = 1;
    if (newCount > 20) newCount = 20;
    e.target.value = newCount;
    if (newCount > estadoAbaco.length) {
        while (estadoAbaco.length < newCount) estadoAbaco.push(0);
    } else if (newCount < estadoAbaco.length) {
        estadoAbaco = estadoAbaco.slice(0, newCount);
    }
    atualizarCena3D();
});

nomesVariaveisArgolas.forEach((varName, index) => {
    const details = document.createElement('details');
    details.className = 'color-accordion';
    const summary = document.createElement('summary');
    summary.className = 'color-summary';
    const labelSpan = document.createElement('span');
    labelSpan.innerHTML = `<b>${rotulosTextos[index]}:</b> ${nomesExtensos[index]}`;
    const previewColor = document.createElement('div');
    previewColor.className = 'current-color-preview';
    summary.appendChild(labelSpan);
    summary.appendChild(previewColor);
    details.appendChild(summary);

    const pickerDiv = document.createElement('div');
    pickerDiv.className = 'custom-color-picker';
    paletaDeCores.forEach(corHex => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = corHex;
        swatch.dataset.cor = corHex;
        swatch.addEventListener('click', () => {
            document.body.style.setProperty(varName, corHex);
            atualizarInputsDeCor();
            atualizarCena3D();
            details.removeAttribute('open');
        });
        pickerDiv.appendChild(swatch);
    });
    details.appendChild(pickerDiv);
    colorPickersContainer.appendChild(details);
});

function atualizarInputsDeCor() {
    const accordions = colorPickersContainer.querySelectorAll('.color-accordion');
    accordions.forEach((accordion, index) => {
        const varName = nomesVariaveisArgolas[index];
        const currentHex = `#${getCorDoCSS(varName).getHexString()}`;
        const preview = accordion.querySelector('.current-color-preview');
        if (preview) preview.style.backgroundColor = currentHex;

        const swatches = accordion.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
            if (swatch.dataset.cor.toLowerCase() === currentHex.toLowerCase()) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });
    });
}

resetSettingsBtn.addEventListener('click', () => {
    nomesVariaveisArgolas.forEach(varName => { document.body.style.removeProperty(varName); });
    atualizarInputsDeCor();
    atualizarCena3D();
});

// ==========================================
// 6. INICIALIZAÇÃO
// ==========================================
updateThreeJSColors();
atualizarInputsDeCor();
atualizarCena3D();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}
animate();