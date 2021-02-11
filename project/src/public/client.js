const { Map, List } = Immutable

let store = Map({
    user: { name: 'Student' },
    apod: '',
    rovers: List(['Curiosity', 'Opportunity', 'Spirit']),
    rover_active: '',
    rover_album_thumbs: List([]),
    rover_album: List([]),
    error_message: ''
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = store.mergeDeep(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// Add onclick event to closes modal on clicking anywhere
// and adds overflow back
const displayBody = (body, element) => {
    document.addEventListener('click', () => {
        body.style.overflow = 'auto'
        element.style.display = 'none'
    })
}

// Overflow body in order to display modal
const overflowBody = (body, element) => {
    body.style.overflow = 'hidden'
    element.style.display = 'block'
}

const displayModal = (e) => {
    const modal_popup = document.querySelector('.image-modal-popup')
    const body = document.querySelector('body')
    displayBody(body, modal_popup)
    // dynamically selects all elements inside modal popup to
    // populate it from targeted dataset 
    const modal_element = item => document.querySelector(`.image-modal-popup ${item}`);
    e.stopPropagation()
    overflowBody(body, modal_popup)
    modal_element('h1').innerHTML = e.target.dataset.camera_full_name
    modal_element('p').innerHTML = e.target.dataset.date_taken
    modal_element('img').src = e.target.src
}

// Main icons event handler, event to call for gallery api request and
// also resetState method handler for back button event.
const headerButtonsHandler = (e) => {
    const element_selected = e.target.dataset.name

    if (element_selected === 'previous-page') {
        // Back Button handler
        resetState()
    } else if (store.get('rovers').includes(element_selected)) {
        // call to populate store with latest photos 
        // also update which rover was selected
        requestForRoverPhotos(store, element_selected)
    } else if(element_selected === 'gallery-image') {
        displayModal(e)
    }
} 

const requestForRoverPhotos = (state, rover_selected) => {
    // to avoid fetch loop!
    if (!state.get('rover_selected')) getRoverLatestPhotos(state, rover_selected)
}

// Reset state means for the UI display rovers icon list
const resetState = () => {
    updateStore(store, {
        rover_active: '',
        rover_album: List([])
    })
}

// create content with Higher order functions

const home_page_constructor = state =>{ 
    return HomePageHeader(state) +
        HomePageMain(state)
}

const rover_page_constructor = (state) => {
    return RoverPageHeader(state) + 
    RoverPageMain(state.get('rover_album'))
}

const ViewsHandler = (state) => {
    if (state.get('rover_active')) {
        return rover_page_constructor(state)
    } else {
        return home_page_constructor(state)
    }
}

const App = (state) => {
    const rover_icon = document.querySelector('#root')
    rover_icon.addEventListener('click', headerButtonsHandler )
    return ViewsHandler(state)
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// grid-col with icon image component 
const GridColumns = item => 
    `
    <div class="grid-col">
        <img 
            class="container-thumb" 
            data-name="${item}"
            src="./assets/images/icons/curiosity.svg" >
        </img>
        <p class="thumb-title">${item}</p>
    </div>
    ` 

// Home page header component
const HomePageHeader = (state) => {
    const rovers = state.get('rovers')    
    // Higher-order function map()
    return `
        <header>
            ${rovers.map(GridColumns).join('')}
        </header>
    `
}

// Home page main content component
const HomePageMain = (state) =>
    `
    <main>
        <div class='error-handler'>
            <p>${state.get('error_message') 
               ? state.get('error_message') : ''}</p>
        </div>
    </main>
    <footer></footer>
    `

// grid-frame with image component
const GridFrame = item =>
    `
    <figure class="grid-frame">
        <img 
            class="grid-img" 
            src="${item.get('most_recent_photo_url')}"
            data-name = "gallery-image"
            data-camera_full_name="${item.get('camera_full_name')}" 
            data-date_taken="${item.get('photo_date_taken')}">
        <figcaption>${item.get('camera')}</figcaption>
    </figure>
    `
// modal-popup component
const ModalPopup = () => 
    `
    <div class="image-modal-popup">
        <div class="wrapper">
            <span>&times;</span>
            <img src="" alt="Image Modal">
            <div class="description">
                <h1>This is placeholder content</h1>
                <p>This content will be overwritten when the modal opens</p>
            </div>
        </div>
    </div>
    `
// Rover page header component
const RoverPageHeader = (state) => {
    return `
    <header class="secondary">
        <div class="grid-col secondary">
            <p class="container-thumb thumb-title secondary back" data-name="previous-page">
                Back
            </p>
        </div>
        <div class="grid-col secondary">
            <p class="thumb-title secondary">${state.get('rover_album').first().get('name')}</p>
            <p class="thumb-desc">
                launch date: ${state.get('rover_album').first().get('launch_date')}</br>
                landing date: ${state.get('rover_album').first().get('landing_date')}</br>
                mars days active: ${state.get('rover_album').first().get('mars_days_active')} </br>
                current status: ${state.get('rover_album').first().get('status')}</br>
            </p>
        </div>
    </header>
    `
}

// Rover page gallery component
const RoverPageMain = (rover_album) => {
    // Higher-order function map()
    return `
    <main>
        <section>
            <div class="grid-container"> 
                ${rover_album.map(GridFrame).join('')}
            </div>
            ${ModalPopup()}
        </section>
    </main>
    <footer></footer>
    `
}

// ------------------------------------------------------  API CALLS

const getRoverLatestPhotos = (state, rover_selected) => {
    fetch(`http://localhost:3000/latest_photos?Rover=${rover_selected}`)
        .then(res => {
            if (res.status === 200) return res.json()        
        })
        .then(rover_info => {
            if (!rover_info.error) 
                updateStore(store, {
                    rover_active: rover_selected,
                    rover_album: rover_info 
                })
            else {
                updateStore(store, {
                    error_message: rover_info.error.message
                })
            }
        })
        .catch(error => console.log(error))
}
