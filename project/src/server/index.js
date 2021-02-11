require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const { Z_FIXED } = require('zlib')
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
// Call for latest photos from nasa api which will return 
// an array of customized objects.
app.get('/latest_photos', async (req, res) => {
    try {
        let response = await fetch(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.query.Rover}/latest_photos?page=1&api_key=${process.env.API_KEY}`)
            .then(res => { 
                return res.json()
            })
        if (!response.error && response.latest_photos.length) {
            // Higher order function map()
            let rover_info = response.latest_photos.map(item => {
                return {
                    name: item.rover.name,
                    launch_date: item.rover.launch_date,
                    landing_date: item.rover.landing_date,
                    status: item.rover.status,
                    most_recent_photo_url: item.img_src,
                    photo_date_taken: item.earth_date,
                    mars_days_active: item.sol,
                    camera: item.camera.name,
                    camera_full_name: item.camera.full_name
                }
            })
            //http://expressjs.com/en/5x/api.html#res.send
            res.send(rover_info)
        } else {
            res.send(response)
        }
    } catch (error) {
        res.send({error})
    }
})

app.get('/photos', async (req, res) => {
    try {
        let response = await fetch(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.query.Rover}/photos?sol=1&page=1&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        if (!response.error && response.photos.length) {
            let rover_photo = {
                rover_name : response.photos[0].rover.name,
                photo_url : response.photos[0].img_src
            }
            res.send(rover_photo)
        } else {
            res.send({})
        }
    } catch (err) {
        console.log('error:', err);
    }
})

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))