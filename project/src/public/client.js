let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    rover_album_thumbs: [],
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    console.log('updating store:',newState);
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const Appes = (state) => {
//FIXME
// This function used to be called App, 
// const App = (state) => {
    let { rovers, apod } = state

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `
}

// My App function
const App = (state) => {
    let { rovers, rover_album_thumbs } = state

    //FIXME
    console.log('state', state);
    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
            <div id = "grid-container">
		
                <div class="flex-grid-3">
                    ${RoverIconList(rovers)}
                </div>
                
                
                <div class="flex-grid-3">
                    ${RoverGalleryAlbumThumbs(rover_album_thumbs)}
                </div>
                
                
            </div>
          
                
            </section>
        </main>
        <footer></footer>
    `
}


// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    console.log('en apod:',apod);
console.log('en store:',store);

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }
    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// My Pure function
const RoverPhoto = (photo) => {
console.log('en photo:',photo);
console.log('en store:',store);
    // to avoid fetch loop!
    if (!photo)  getRoverLatestPhotos(store)
}

const RoverIconList = (rovers) => {
    //Deberia llamar ala function que muestra
    // los en una lista horizontal en iconitos
    // los rovers disponibles.
    
    // rovers.forEach(item => 
    //     main-rover-icon.style.setProperty('--main-rover-icon',"./assets/images/icons/" + item.toLowerCase() + ".svg")
    // );

    // looping template strings
    // https://wesbos.com/template-strings-html
/**
 * esto iba en el return
 * <li>
                    <div class="main-rover-icon">
                        <img src="./assets/images/icons/${item.toLowerCase()}.svg" />
                    <div>${item}</div>
                </li>
*/
    return `
        ${rovers.map(item => {
            return `
                <div class="grid-col">
                    <img class = "container-thumb" src="./assets/images/icons/${item.toLowerCase()}.svg" ></img>
                    <p class = "thumb-title">${item}</p>
                </div>
            `
        }).join('')}
    `
}

const RoverGalleryAlbumThumbs = (rover_album_thumbs) => {
    //LLammada ala fncion que lista horizontal//
    // los botones para ir a ver las galerias
    // de las latest fotos de los rovers
    // Los botones seran miniaturas de la primera
    // foto de cada latest.
    // rovers.forEach(item => {
    // });
    RoverAlbumThumbs(rover_album_thumbs)
    return `
        ${rover_album_thumbs.map(item => {
            return `
                <div class="grid-col">
                    <img class = "container-thumb" src="${item.photo_url}" ></img>
                </div>
            `
            }).join('')}
    `

}

const RoverAlbumThumbs = (rover_album_thumbs) => {
    console.log('en store:',store);
    console.log('en rover_album_thumbs:',rover_album_thumbs);
    if (!rover_album_thumbs.length) getRoverAlbumThumbs(store)
} 

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        // apod is that image object created as res.send({image})
        .then(apod => updateStore(store, { apod })) 

    // return data
}

// My API calls
const getRoverLatestPhotos = (state) => {
    let { photos } = state
    let rover = 'curiosity'
    let camera = 'fhaz'
    fetch(`http://localhost:3000/latest_photos?Rover=${rover}&Camera=${camera}`)
        .then(res => {
            console.log('res',res);
            return res.json()})
        .then(rover_info => {
            console.log(state);
            // check rover info
            console.log('rover_info: ',rover_info);

            if (!Object.entries(rover_info).length) {
                //FIXME
                console.log('Here I could suggest available cameras');
            }

            updateStore(store, { rover_info })
        })
}

const getRoverAlbumThumbs = (state) => {
    const { rover_album_thumbs, rovers } = state
    //este metodo debe solicitar los 3 thumbs
    let res_arr = []
    rovers.forEach((item,i) => {
        fetch(`http://localhost:3000/photos?Rover=${item}`)
        .then(res => res.json())
        .then(rover_photo => {
            rover_album_thumbs.push(rover_photo)
            // Workaround due to updateStore object assign()
            // Make sure all rovers were reached
            if ( rovers.length - 1 === i ) {
                return updateStore(store, { rover_album_thumbs })
            }
        }) 
    })

}

// Call for Rover photos for pictures page
const getRoverPhotos = (state) => {

}
