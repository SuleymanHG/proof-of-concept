import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import { Liquid } from 'liquidjs';
import fetch from 'node-fetch';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const engine = new Liquid();
app.engine('liquid', engine.express());
app.set('views', './views');


const BASE_URL  = process.env.BASE_URL;    
const KEY       = process.env.KEY;         
const GROUP_ID  = process.env.GROUP_ID;   


if (!BASE_URL || !KEY || !GROUP_ID) {
  
  process.exit(1);
}


async function fetchJSON(url) {
  
  const res  = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${KEY}`,
      "Accept":        "application/json"
    }
  });

  const text = await res.text();
  if (!res.ok) {
    
    throw new Error(`HTTP ${res.status} bij ${url}`);
  }
  return JSON.parse(text);
}

// ROUTES
app.get('/', (req, res) => {
  res.render('index.liquid');
});

app.get('/login', (req, res) => {
  res.render('login.liquid');
});

app.get('/game', async (req, res) => {
  try {
   
    const membersData = await fetchJSON(
      `${BASE_URL}/model/maxclass_membership/get/class/${GROUP_ID}/member`
    );
    const memberIds = membersData.result;

    const memberDetails = await Promise.all(
      memberIds.map(async id => {
        const data = await fetchJSON(
          `${BASE_URL}/model/rsc_export/get/${id}`
        );
        return {
          id,
          name:  data.result?.resource?.title   || "Onbekend",
          image: data.result?.depiction_url      || "/default.jpg"
        };
      })
    );

    res.render("game.liquid", { members: memberDetails });

  } catch (error) {
    console.error("Fout bij ophalen:", error);
    res.status(500).send("Er ging iets mis bij het ophalen van de leden");
  }
});

app.post('/', (req, res) => {
  res.redirect(303, '/');
});

app.set('port', process.env.PORT || 8000);
app.listen(app.get('port'), () => {
  console.log(`Application started on http://localhost:${app.get('port')}`);
});

