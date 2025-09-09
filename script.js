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
    
    // Elementos do DOM para redimensionamento
    const resizeCard = document.querySelector('.resize-card');
    const resizeSlider = document.getElementById('resize-slider');
    const sizeValue = document.getElementById('size-value');
    const applyResizeBtn = document.getElementById('apply-resize');

    // Variáveis de estado
    let activeElement = null;
    let isBold = false;
    let isItalic = false;
    let isDragging = false;
    let isResizing = false;
    let currentResizeHandle = null;
    let startWidth, startHeight, startX, startY;
    
    // Variáveis para controle de redimensionamento
    let originalWidth = 0;
    let resizeTimeout = null;

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

    // Atualizar o card de redimensionamento quando uma imagem é selecionada
    function updateResizeCard() {
        if (activeElement && activeElement.classList.contains('draggable-image')) {
            resizeCard.style.display = 'block';
            originalWidth = parseInt(activeElement.style.width) || 150;
            resizeSlider.value = 100;
            sizeValue.textContent = '100%';
            applyResizeBtn.disabled = false;
        } else {
            resizeCard.style.display = 'none';
            applyResizeBtn.disabled = true;
        }
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

    // Upload de imagem - CORREÇÃO PARA MOBILE
    uploadButton.addEventListener('click', (e) => {
        // Prevenir comportamento padrão em mobile
        e.preventDefault();
        e.stopPropagation();
        imageUpload.click();
    });

    // Adicionar evento de toque para mobile
    uploadButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        imageUpload.click();
    }, { passive: false });

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
                
                // Ocultar card de redimensionamento
                resizeCard.style.display = 'none';
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

    // Event listener para o slider de redimensionamento
    resizeSlider.addEventListener('input', function() {
        sizeValue.textContent = `${this.value}%`;
        
        // Atualizar visualmente em tempo real (com debounce para performance)
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (activeElement && activeElement.classList.contains('draggable-image')) {
                const newWidth = (originalWidth * this.value) / 100;
                activeElement.style.width = `${newWidth}px`;
            }
        }, 100);
    });

    // Event listener para o botão de aplicar redimensionamento
    applyResizeBtn.addEventListener('click', function() {
        if (activeElement && activeElement.classList.contains('draggable-image')) {
            // Atualizar a largura original para futuros redimensionamentos
            originalWidth = parseInt(activeElement.style.width) || 150;
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

        // Criar elementos de redimensionamento
        const resizeHandles = [
            { position: 'top-left', cursor: 'nwse-resize' },
            { position: 'top-right', cursor: 'nesw-resize' },
            { position: 'bottom-left', cursor: 'nesw-resize' },
            { position: 'bottom-right', cursor: 'nwse-resize' }
        ];
        
        shirtDisplay.appendChild(newImage);
        
        // Adicionar handles de redimensionamento
        resizeHandles.forEach(handle => {
            const resizeHandle = document.createElement('div');
            resizeHandle.classList.add('resize-handle', handle.position);
            resizeHandle.style.cursor = handle.cursor;
            newImage.appendChild(resizeHandle);
        });
        
        makeDraggable(newImage);
        makeResizable(newImage);
        
        // Selecionar automaticamente a nova imagem
        selectElement(newImage);
        
        // Inicializar o card de redimensionamento
        updateResizeCard();
    }

    // Criar texto arrastável (MODIFICADO para não aplicar realce)
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
        // REMOVIDO: background-color e border-radius
        textElement.style.backgroundColor = 'transparent';
        textElement.style.borderRadius = '0';
        
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
        
        // Prevenir que estilos indesejados sejam aplicados durante a edição
        textElement.addEventListener('blur', function() {
            this.style.backgroundColor = 'transparent';
            this.style.borderRadius = '0';
        });
    }

    // Selecionar elemento (MODIFICADO para garantir que o texto não tenha realce)
    function selectElement(element) {
        document.querySelectorAll('.draggable').forEach(el => {
            el.classList.remove('active');
            el.style.zIndex = '10';
            // Garantir que o texto mantenha o estilo correto mesmo quando não selecionado
            if (el.classList.contains('draggable-text')) {
                el.style.backgroundColor = 'transparent';
                el.style.borderRadius = '0';
            }
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
            
            // Garantir que o texto selecionado mantenha o estilo correto
            element.style.backgroundColor = 'transparent';
            element.style.borderRadius = '0';
            
            // Ocultar card de redimensionamento
            resizeCard.style.display = 'none';
        }
        
        // Atualizar controles para elementos de imagem
        if (element.classList.contains('draggable-image')) {
            // Mostrar card de redimensionamento
            updateResizeCard();
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
        const resizeHandles = element.querySelectorAll('.resize-handle');
        if (!resizeHandles.length) return;

        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', initResize);
            handle.addEventListener('touchstart', initResizeTouch, { passive: false });
        });

        function initResize(e) {
            e.stopPropagation();
            e.preventDefault();
            
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(element.offsetWidth);
            startHeight = parseInt(element.offsetHeight);
            
            document.body.style.overflow = 'hidden';
            selectElement(element);
            currentResizeHandle = e.target;
            
            // Adicionar classe para feedback visual
            element.classList.add('resizing');
            resizeHandles.forEach(h => h.classList.add('resizing'));
            
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        }

        function initResizeTouch(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const touch = e.touches[0];
            isResizing = true;
            startX = touch.clientX;
            startY = touch.clientY;
            startWidth = parseInt(element.offsetWidth);
            startHeight = parseInt(element.offsetHeight);
            
            document.body.style.overflow = 'hidden';
            selectElement(element);
            currentResizeHandle = e.target;
            
            // Adicionar classe para feedback visual
            element.classList.add('resizing');
            resizeHandles.forEach(h => h.classList.add('resizing'));
            
            document.addEventListener('touchmove', resizeTouch, { passive: false });
            document.addEventListener('touchend', stopResize);
        }

        function resize(e) {
            if (!isResizing) return;
            
            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);
            
            // Definir tamanho mínimo
            const minSize = 50;
            const newWidth = Math.max(minSize, width);
            const newHeight = Math.max(minSize, height);
            
            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
        }

        function resizeTouch(e) {
            if (!isResizing) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const width = startWidth + (touch.clientX - startX);
            const height = startHeight + (touch.clientY - startY);
            
            // Definir tamanho mínimo
            const minSize = 50;
            const newWidth = Math.max(minSize, width);
            const newHeight = Math.max(minSize, height);
            
            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
        }

        function stopResize() {
            isResizing = false;
            document.body.style.overflow = '';
            currentResizeHandle = null;
            
            // Remover classe de feedback visual
            element.classList.remove('resizing');
            resizeHandles.forEach(h => h.classList.remove('resizing'));
            
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchmove', resizeTouch);
            document.removeEventListener('touchend', stopResize);
        }
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
                // Garantir que o texto mantenha o estilo correto
                if (el.classList.contains('draggable-text')) {
                    el.style.backgroundColor = 'transparent';
                    el.style.borderRadius = '0';
                }
            });
            activeElement = null;
            
            // Ocultar card de redimensionamento
            resizeCard.style.display = 'none';
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