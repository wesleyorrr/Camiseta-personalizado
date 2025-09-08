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
    let isDragging = false;
    let isResizing = false;
    let currentResizeHandle = null;

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
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.fontWeight = isBold ? 'bold' : 'normal';
        }
    });

    italicBtn.addEventListener('click', function() {
        isItalic = !isItalic;
        this.classList.toggle('active', isItalic);
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.fontStyle = isItalic ? 'italic' : 'normal';
        }
    });

    textColorInput.addEventListener('input', function() {
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.color = this.value;
        }
    });

    fontFamilySelect.addEventListener('change', function() {
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.fontFamily = this.value;
        }
    });

    fontSizeSelect.addEventListener('change', function() {
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.fontSize = this.value;
        }
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
        newImage.draggable = false; // Impedir comportamento padrão de arrastar

        newImage.style.position = 'absolute';
        newImage.style.left = '50%';
        newImage.style.top = '50%';
        newImage.style.transform = 'translate(-50%, -50%)';
        newImage.style.maxWidth = '200px';
        newImage.style.maxHeight = '200px';
        newImage.style.width = '150px';
        newImage.style.zIndex = '10';

        // Criar elemento de redimensionamento
        const resizeHandle = document.createElement('div');
        resizeHandle.classList.add('resize-handle');
        
        shirtDisplay.appendChild(newImage);
        newImage.appendChild(resizeHandle);
        
        makeDraggable(newImage);
        makeResizable(newImage);
        
        // Selecionar automaticamente a nova imagem
        selectElement(newImage);
    }

    // Criar texto arrastável
    function createDraggableText(text) {
        const textElement = document.createElement('div');
        textElement.classList.add('draggable', 'draggable-text');
        textElement.textContent = text;
        textElement.contentEditable = true; // Permitir edição direta
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
        textElement.style.minWidth = '50px';
        textElement.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        textElement.style.borderRadius = '3px';
        
        shirtDisplay.appendChild(textElement);
        makeDraggable(textElement);
        
        // Selecionar automaticamente o novo texto
        selectElement(textElement);
        
        // Atualizar controles quando o texto for editado
        textElement.addEventListener('input', function() {
            if (activeElement === this) {
                textInput.value = this.textContent;
            }
        });
    }

    // Selecionar elemento
    function selectElement(element) {
        document.querySelectorAll('.draggable').forEach(el => {
            el.classList.remove('active');
            el.style.zIndex = '10';
        });
        element.classList.add('active');
        element.style.zIndex = '11';
        activeElement = element;
        
        // Atualizar controles para elementos de texto
        if (element.classList.contains('draggable-text')) {
            textInput.value = element.textContent;
            fontFamilySelect.value = element.style.fontFamily;
            fontSizeSelect.value = element.style.fontSize;
            textColorInput.value = rgbToHex(element.style.color);
            isBold = element.style.fontWeight === 'bold';
            isItalic = element.style.fontStyle === 'italic';
            boldBtn.classList.toggle('active', isBold);
            italicBtn.classList.toggle('active', isItalic);
        }
    }

    // Converter RGB para Hex
    function rgbToHex(rgb) {
        if (!rgb || rgb === '') return '#000000';
        
        if (rgb.startsWith('#')) return rgb;
        
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return '#000000';
        
        return '#' + rgbValues.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // Tornar elementos arrastáveis
    function makeDraggable(element) {
        let startX, startY, startLeft, startTop;

        function startDrag(clientX, clientY) {
            if (isResizing) return;
            
            isDragging = true;
            startX = clientX;
            startY = clientY;
            
            const computedStyle = window.getComputedStyle(element);
            startLeft = parseInt(computedStyle.left) || 0;
            startTop = parseInt(computedStyle.top) || 0;

            selectElement(element);
            document.body.style.overflow = 'hidden';
        }

        function duringDrag(clientX, clientY) {
            if (!isDragging) return;
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            element.style.left = `${startLeft + dx}px`;
            element.style.top = `${startTop + dy}px`;
            element.style.transform = 'none';
        }

        function endDrag() {
            isDragging = false;
            document.body.style.overflow = '';
        }

        // Event handlers para mouse
        function onMouseDown(e) {
            if (e.target.classList.contains('resize-handle')) return;
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(e) {
            duringDrag(e.clientX, e.clientY);
        }

        function onMouseUp() {
            endDrag();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        // Event handlers para touch
        function onTouchStart(e) {
            if (e.target.classList.contains('resize-handle')) return;
            e.preventDefault();
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }

        function onTouchMove(e) {
            e.preventDefault();
            const touch = e.touches[0];
            duringDrag(touch.clientX, touch.clientY);
        }

        function onTouchEnd() {
            endDrag();
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        }

        // Adicionar listeners para ambos mouse e touch
        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('touchstart', onTouchStart, { passive: false });
    }

    // Tornar elementos redimensionáveis (apenas para imagens)
    function makeResizable(element) {
        const resizeHandle = element.querySelector('.resize-handle');
        if (!resizeHandle) return;

        let startX, startY, startWidth, startHeight;

        function startResize(clientX, clientY) {
            isResizing = true;
            startX = clientX;
            startY = clientY;
            startWidth = parseInt(element.offsetWidth);
            startHeight = parseInt(element.offsetHeight);
            
            document.body.style.overflow = 'hidden';
            selectElement(element);
            currentResizeHandle = resizeHandle;
            
            // Adicionar classe para feedback visual
            resizeHandle.classList.add('resizing');
            element.classList.add('resizing');
        }

        function duringResize(clientX, clientY) {
            if (!isResizing) return;
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            // Calcular novas dimensões mantendo a proporção
            const scale = 1 + (dx / startWidth);
            const newWidth = Math.max(50, startWidth * scale);
            const newHeight = Math.max(50, startHeight * scale);
            
            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
        }

        function endResize() {
            isResizing = false;
            document.body.style.overflow = '';
            currentResizeHandle = null;
            
            // Remover classe de feedback visual
            if (resizeHandle) {
                resizeHandle.classList.remove('resizing');
            }
            element.classList.remove('resizing');
        }

        // Event handlers para mouse
        function onMouseDown(e) {
            e.stopPropagation();
            e.preventDefault();
            startResize(e.clientX, e.clientY);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(e) {
            duringResize(e.clientX, e.clientY);
        }

        function onMouseUp() {
            endResize();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        // Event handlers para touch
        function onTouchStart(e) {
            e.stopPropagation();
            e.preventDefault();
            const touch = e.touches[0];
            startResize(touch.clientX, touch.clientY);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }

        function onTouchMove(e) {
            e.preventDefault();
            const touch = e.touches[0];
            duringResize(touch.clientX, touch.clientY);
        }

        function onTouchEnd() {
            endResize();
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        }

        // Adicionar listeners para o handle de redimensionamento
        resizeHandle.addEventListener('mousedown', onMouseDown);
        resizeHandle.addEventListener('touchstart', onTouchStart, { passive: false });
    }

    // Modal de ajuda
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

        // Ocultar handles de redimensionamento temporariamente
        document.querySelectorAll('.resize-handle').forEach(handle => {
            handle.style.display = 'none';
        });

        html2canvas(shirtDisplay, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'minha_camisa_personalizada.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

            // Restaurar handles de redimensionamento
            document.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = 'block';
            });

            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }).catch(error => {
            console.error('Erro ao gerar imagem:', error);
            alert('Ocorreu um erro ao gerar a imagem. Tente novamente.');
            
            // Restaurar handles de redimensionamento em caso de erro
            document.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = 'block';
            });
            
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

    // Duplo clique em texto para editar
    shirtDisplay.addEventListener('dblclick', function(e) {
        if (e.target.classList.contains('draggable-text')) {
            e.target.focus();
            // Colocar cursor no final do texto
            const range = document.createRange();
            range.selectNodeContents(e.target);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });

    // Prevenir comportamento padrão de toque em todo o documento
    document.addEventListener('touchmove', function(e) {
        if (isDragging || isResizing) {
            e.preventDefault();
        }
    }, { passive: false });
});