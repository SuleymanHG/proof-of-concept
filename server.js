import express from 'express'

import { Liquid } from 'liquidjs';



console.log('Hieronder moet je waarschijnlijk nog wat veranderen')
const app = express()

app.use(express.urlencoded({extended: true}))

app.use(express.static('public'))

const engine = new Liquid();
app.engine('liquid', engine.express()); 

app.set('views', './views')

app.get('/', async function (request, response) {
   response.render('index.liquid')
})

app.get('/login', async function (request, response) {
   response.render('login.liquid')
})

app.get('/game', async function (request, response) {
   response.render('game.liquid')
})

app.post('/', async function (request, response) {
  response.redirect(303, '/')
})

app.set('port', process.env.PORT || 8000)

app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`)
})

