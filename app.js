if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express")
const app = express()
const axios = require("axios")
const bodyParser = require("body-parser")
const AppError = require("./appError")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

async function getData(ap) {
    const token = process.env.API_TOKEN
    const tafUrl = `https://avwx.rest/api/taf/${ap}`
    const metarUrl = `https://avwx.rest/api/metar/${ap}`
    const tafData = await axios.get(tafUrl, {
        headers: {
            Authorization: "BEARER " + token
        }
    })
    const metarData = await axios.get(metarUrl, {
        headers: {
            Authorization: "BEARER " + token
        }
    })
    const weather = [metarData.data.raw, tafData.data.raw]
    return weather
}

app.post("/", async (req, res, next) => {
    if (req.headers.auth === process.env.AUTH_CODE) {
        const airport = req.body.airport
        const weather = await getData(airport)
        res.send(weather)
    } else {
        next(new AppError("You do not have acces", 403))
    }
})

app.use((err, req, res, next) => {
    const { status, msg, body } = err
    res.status(status).send(msg)
})


const port = process.env.PORT || 4000
app.listen(port)
