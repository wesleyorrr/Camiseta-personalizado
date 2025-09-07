document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const colorOptions = document.querySelectorAll('.color-option');
    const shirtDisplay = document.getElementById('shirt-display');
    const shirtSvg = shirtDisplay.querySelector('svg');
    const currentColorDisplay = document.getElementById('current-color');
    const colorPreview = document.getElementById('color-preview');
    const uploadButton = document.getElementById('upload-button');
    const imageUpload = document.getElementById('image-upload');
    const deleteButton = document.getElementById('delete-image');
    const helpButton = document.getElementById('help-button');
    const modal = document.getElementById('instructions-modal');
    const closeModal = document.querySelector('.close-modal');
    const understandBtn = document.getElementById('understand-btn');
    const textInput = document.getElementById('text-input');
    const fontFamilySelect = document.getElementById('font-family');
    const fontSizeSelect = document.getElementById('font-size');
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const textColorInput = document.getElementById('text-color');
    const addTextBtn = document.getElementById('add-text-btn');
    const deleteTextBtn = document.getElementById('delete-text');
    const saveBtn = document.getElementById('save-design');

    // Variáveis de estado
    let activeElement = null;
    let isBold = false;
    let isItalic = false;

    // Função para aplicar cor à camisa
    function applyColorToShirt(color) {
        // Seleciona todos os paths do SVG
        const allPaths = shirtSvg.querySelectorAll('path');
        
        allPaths.forEach(path => {
            // Aplica a cor a todos os paths
            path.style.fill = color;
        });

        currentColorDisplay.textContent = color;
        colorPreview.style.backgroundColor = color;
    }

    // Event listeners para seleção de cores
    colorOptions.forEach(option => {
        option.addEventListener('click', function () {
            const selectedColor = this.getAttribute('data-color');
            applyColorToShirt(selectedColor);

            // Destacar a cor selecionada
            colorOptions.forEach(opt => opt.style.border = '2px solid #eee');
            this.style.border = '2px solid #2c3e50';
        });
    });

    // Cor padrão
    applyColorToShirt('#FFFFFF');
    if (colorOptions[0]) {
        colorOptions[0].style.border = '2px solid #2c3e50';
    }

    // Upload de imagem
    uploadButton.addEventListener('click', () => imageUpload.click());

    imageUpload.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function (event) {
                createDraggableImage(event.target.result);
                deleteButton.disabled = false;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Remover imagem selecionada
    deleteButton.addEventListener('click', function() {
        if (activeElement && activeElement.classList.contains('draggable-image')) {
            activeElement.remove();
            activeElement = null;
            if (document.querySelectorAll('.draggable-image').length === 0) {
                deleteButton.disabled = true;
            }
        }
    });

    // Controles de texto
    boldBtn.addEventListener('click', function() {
        isBold = !isBold;
        this.classList.toggle('active', isBold);
    });

    italicBtn.addEventListener('click', function() {
        isItalic = !isItalic;
        this.classList.toggle('active', isItalic);
    });

    addTextBtn.addEventListener('click', function() {
        const text = textInput.value.trim();
        if (text) {
            createDraggableText(text);
            deleteTextBtn.disabled = false;
            textInput.value = '';
        }
    });

    deleteTextBtn.addEventListener('click', function() {
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.remove();
            activeElement = null;
            if (document.querySelectorAll('.draggable-text').length === 0) {
                deleteTextBtn.disabled = true;
            }
        }
    });

    function createDraggableImage(src) {
        const newImage = document.createElement('img');
        newImage.src = src;
        newImage.classList.add('draggable', 'draggable-image');

        newImage.style.position = 'absolute';
        newImage.style.left = '50%';
        newImage.style.top = '50%';
        newImage.style.transform = 'translate(-50%, -50%)';
        newImage.style.maxWidth = '150px';
        newImage.style.maxHeight = '150px';
        newImage.style.zIndex = '10';

        shirtDisplay.appendChild(newImage);
        makeDraggable(newImage, true);
        
        // Selecionar automaticamente a nova imagem
        document.querySelectorAll('.draggable').forEach(el => el.classList.remove('active'));
        newImage.classList.add('active');
        activeElement = newImage;
    }

    // Criar texto arrastável
    function createDraggableText(text) {
        const textElement = document.createElement('div');
        textElement.classList.add('draggable', 'draggable-text');
        textElement.textContent = text;
        textElement.style.fontFamily = fontFamilySelect.value;
        textElement.style.fontSize = fontSizeSelect.value;
        textElement.style.color = textColorInput.value;
        textElement.style.fontWeight = isBold ? 'bold' : 'normal';
        textElement.style.fontStyle = isItalic ? 'italic' : 'normal';
        textElement.style.position = 'absolute';
        textElement.style.left = '50%';
        textElement.style.top = '50%';
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.style.zIndex = '10';
        textElement.style.cursor = 'move';
        textElement.style.padding = '5px';
        
        shirtDisplay.appendChild(textElement);
        makeDraggable(textElement, false);
        
        // Selecionar automaticamente o novo texto
        document.querySelectorAll('.draggable').forEach(el => el.classList.remove('active'));
        textElement.classList.add('active');
        activeElement = textElement;
    }

    // Tornar elementos arrastáveis
    function makeDraggable(element, isImage) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        element.addEventListener('mousedown', function(e) {
            e.preventDefault();
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = element.offsetLeft;
            startTop = element.offsetTop;

            // Destacar elemento selecionado
            document.querySelectorAll('.draggable').forEach(el => {
                el.classList.remove('active');
                el.style.zIndex = '10';
            });
            element.classList.add('active');
            element.style.zIndex = '11';
            activeElement = element;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (!isDragging) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            element.style.left = `${startLeft + dx}px`;
            element.style.top = `${startTop + dy}px`;
            element.style.transform = 'none';
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    // Modal de ajuda - ESTA É A PARTE QUE ESTAVA COM PROBLEMAS
    helpButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    understandBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Salvar design
    saveBtn.addEventListener('click', function() {
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Gerando imagem...';

        html2canvas(shirtDisplay, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'minha_camisa_personalizada.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }).catch(error => {
            console.error('Erro ao gerar imagem:', error);
            alert('Ocorreu um erro ao gerar a imagem. Tente novamente.');
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        });
    });

    // Clique fora dos elementos para deselecionar
    shirtDisplay.addEventListener('click', function(e) {
        if (e.target === this) {
            document.querySelectorAll('.draggable').forEach(el => {
                el.classList.remove('active');
            });
            activeElement = null;
        }
    });
});