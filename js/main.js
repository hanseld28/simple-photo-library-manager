const $ = (selector) => document.querySelector(selector);
const createElement = (tagName) => document.createElement(tagName);

let photos = [];

(async () => {
    const API_URL = 'https://picsum.photos/v2/list';

    const fetchPhotos = async (page = 1, limit = 30) => {
        const responseAsStream = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
        const response = await responseAsStream.json();
        return response;
    };

    const loadPhotosButton = $('#load-photos-button-js');
    
    loadPhotosButton.addEventListener('click', async (event) => {
        event.stopPropagation();        

        const results = await fetchPhotos();

        if (results.length > 0) {
            photos = Adapter.adapt(
                Photo.name, 
                (model) => results.map(photo => model.adapt(photo))
            );
        }

        loadPhotosButton.remove();

        render();
    });
})();


const render = () => {
    const root = $('#root');
    root.innerHTML = '';

    if (photos.length > 0) {
        
        const {
            DIV,
            IMAGE,
            LINK,
            TEXTAREA,
        } = PhotoLibraryManagerElement;
    
        const {
            ID,
            SRC,
            ALT,
            HREF,
            NAME,
            COLS,
            ROWS,
            READ_ONLY,
        } = PhotoLibraryManagerAttribute;

        const FIXED_IMAGE_HEIGHT = 250;
        const FIXED_IMAGE_WIDTH = 350;

        const FIXED_TEXTAREA_COLS = 40;
        const FIXED_TEXTAREA_ROWS = 3;
        
        for (const photo of photos) {

            const {
                id,
                author,
                url,
                downloadUrl,
                width,
                height,
                isFavorite,
                note, 
                hasNote
            } = photo;

            const photoControlPanelId = `photo-control-panel-js-${id}`;
            const photoControlPanelElement = createElement(DIV);
            photoControlPanelElement.setAttribute(ID, photoControlPanelId);
            photoControlPanelElement.addEventListener('click', remove);

            const photoControlId = `photo-control-js-${id}`;
            const photoControlElement = createElement(DIV);
            photoControlElement.setAttribute(ID, photoControlId);

            const photoId = `photo-js-${id}`;
            const photoElement = createElement(IMAGE);
            photoElement.setAttribute(ID, photoId);
            photoElement.setAttribute(SRC, downloadUrl);
            photoElement.setAttribute(HEIGHT, FIXED_IMAGE_HEIGHT);
            photoElement.setAttribute(WIDTH, FIXED_IMAGE_WIDTH);
            photoElement.setAttribute(ALT, author);

            const controlsId = `controls-js-${id}`;
            const controlsElement = createElement(DIV);
            controlsElement.setAttribute(ID, controlsId);
            
            const controlsLeftId = `left-control-js-${id}`;
            const controlsLeftElement = createElement(DIV);
            controlsLeftElement.setAttribute(ID, controlsLeftId);
            
            const favoriteButtonId = `favorite-button-js-${id}`;
            const favoriteButtonElement = createElement(LINK);
            favoriteButtonElement.setAttribute(ID, favoriteButtonId);
            favoriteButtonElement.setAttribute(HREF, '#');
            favoriteButtonElement.setAttribute('data-photo-id', id);
            favoriteButtonElement.setAttribute('data-favorite', isFavorite);
            favoriteButtonElement.innerText = isFavorite ? 'Desfavoritar' : 'Favoritar';
            favoriteButtonElement.addEventListener('click', handlerFavorite);

            const controlsRightId = `right-control-js-${id}`;
            const controlsRightElement = createElement(DIV);
            controlsRightElement.setAttribute(ID, controlsRightId);
            
            const annotateButtonId = `annotate-button-js-${id}`;
            const annotateButtonElement = createElement(LINK);
            annotateButtonElement.setAttribute(ID, annotateButtonId);
            annotateButtonElement.setAttribute(HREF, `#${photoId}`);
            annotateButtonElement.setAttribute('data-photo-id', id);
            annotateButtonElement.setAttribute('data-mode', 'new');
            annotateButtonElement.innerText = 'Anotar';
            annotateButtonElement.addEventListener('click', handleAnnotation);
            
            const removeButtonId = `remove-button-js-${id}`;
            const removeButtonElement = createElement(LINK);
            removeButtonElement.setAttribute(ID, removeButtonId);
            removeButtonElement.setAttribute(HREF, '#');
            removeButtonElement.setAttribute('data-photo-id', id);
            removeButtonElement.innerText = 'Remover';

            const photoNoteControlId = `photo-note-control-js-${id}`;
            const photoNoteControlElement = createElement(DIV);
            photoNoteControlElement.setAttribute(ID, photoNoteControlId);

            const photoNoteId = `photo-note-js-${id}`;
            const photoNoteElement = createElement(TEXTAREA);
            photoNoteElement.setAttribute(ID, photoNoteId);
            photoNoteElement.setAttribute(NAME, 'photo-note');
            photoNoteElement.setAttribute(COLS, FIXED_TEXTAREA_COLS);
            photoNoteElement.setAttribute(ROWS, FIXED_TEXTAREA_ROWS);
            photoNoteElement.setAttribute(READ_ONLY, true);
            photoNoteElement.innerText = note;

            photoControlElement.appendChild(photoElement);
        
            controlsLeftElement.appendChild(favoriteButtonElement);
            
            controlsRightElement.appendChild(annotateButtonElement);
            controlsRightElement.appendChild(removeButtonElement);

            controlsElement.appendChild(controlsLeftElement);
            controlsElement.appendChild(controlsRightElement);

            photoNoteControlElement.appendChild(photoNoteElement);

            photoControlPanelElement.appendChild(photoControlElement);
            photoControlPanelElement.appendChild(controlsElement);
            photoControlPanelElement.appendChild(photoNoteControlElement);
    
            root.appendChild(photoControlPanelElement);
        }
    }
};

const handlerFavorite = (event) => {
    event.stopPropagation();
    
    const button = event.target;

    const { photoId } = button.dataset;
            
    photos = photos.map(photo => {

        const { id } = photo;

        let isFavorite = photo.isFavorite;

        if (id === Number(photoId)) {
            isFavorite = !isFavorite;
        }

        return new Photo({
            ...photo,
            isFavorite
        });

    });
        
    render();
};

const handleAnnotation = (event) => {
    event.stopPropagation();
    
    const button = event.target;

    const { 
        photoId,
        mode
    } = button.dataset;
    
    const photoNoteIdSelector = `#photo-note-js-${photoId}`;
    const photoNoteAreaElement = $(photoNoteIdSelector);

    const textNote = photoNoteAreaElement.value;
    const hasNoteOnTextArea = textNote.length > 0;

    if (!hasNoteOnTextArea || mode === 'edit') {

        photoNoteAreaElement.readOnly = false;
        button.innerText = 'Salvar';
        button.setAttribute('data-mode', 'draft');

    } else {

        photos = photos.map(photo => {

            const { id } = photo;

            let note = photo.note;

            if (id === Number(photoId)) {
                note = textNote;
            }
    
            return new Photo({
                ...photo,
                note
            });
        });

        photoNoteAreaElement.readOnly = true;
        button.setAttribute('data-mode', 'edit');
        button.innerText = 'Anotar';
    }
};

const remove = (event) => {
    event.stopPropagation();
    
    const targetElement = event.target;

    if (targetElement.getAttribute('id').startsWith('remove-button-js')) {
        
        if (confirm('Tem certeza que deseja excluir essa foto da sua biblioteca?')) {
    
            const { photoId } = targetElement.dataset;
            
            photos = photos.filter(photo => photo.id !== Number(photoId));

            render();
        }
    }
};