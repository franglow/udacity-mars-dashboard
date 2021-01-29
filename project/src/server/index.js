require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const { Z_FIXED } = require('zlib')
const { response } = require('express')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.get('/latest_photos', async (req, res) => {
    try {
        let response = await fetch(
            // `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.query.Rover}/latest_photos?camera=${req.query.Camera}&api_key=${process.env.API_KEY}`)
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.query.Rover}/latest_photos?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        if (!response.error && response.latest_photos.length) {
            let rover_info = {
                name : response.latest_photos[0].rover.name,
                launch_date : response.latest_photos[0].rover.launch_date,
                landing_date : response.latest_photos[0].rover.landing_date,
                status : response.latest_photos[0].rover.status,
                most_recent_photo_url : response.latest_photos[0].img_src,
                photo_taken_date : response.latest_photos[0].earth_date,
                camera : response.latest_photos[0].camera.name
            }
            //http://expressjs.com/en/5x/api.html#res.send
            // res.send(rover_info)
        } else {
            res.send({})
        }
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/photos', async (req, res) => {
    // deberia devolber los 3 thumbs
    console.log('Rover: ',req.query.Rover);
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