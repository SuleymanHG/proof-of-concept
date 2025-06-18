import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import { Liquid } from 'liquidjs';
import fetch from 'node-fetch';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/proxy-image', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Missing "url" parameter');
  }
  try {
   
    const upstream = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Accept': 'image/*'
      }
    });
    if (!upstream.ok) {
      return res.status(upstream.status).send(`Upstream error: ${upstream.statusText}`);
    }
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', contentType);
    upstream.body.pipe(res);
  } catch (err) {
    console.error('Proxy-image error:', err);
    res.status(500).send('Kon afbeelding niet ophalen');
  }
});

const engine = new Liquid();
app.engine('liquid', engine.express());
app.set('views', './views');

const BASE_URL = process.env.BASE_URL;    
const KEY      = process.env.KEY;
const GROUP_ID = process.env.GROUP_ID;
if (!BASE_URL || !KEY || !GROUP_ID) process.exit(1);

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${KEY}`,
      "Accept":        "application/json"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} bij ${url}`);
  return res.json();
}

async function getImageUrl(resourceId) {
  const exportRes = await fetchJSON(
    `${BASE_URL}/model/rsc_export/get/${resourceId}`
  );
  const { depiction_url, edges } = exportRes.result;
  if (depiction_url) return depiction_url;

  const mediaObj = edges?.depiction?.objects?.[0]?.object_id;
  if (mediaObj?.id) {
    const mediaRes = await fetchJSON(
      `${BASE_URL}/model/rsc_export/get/${mediaObj.id}`
    );
    return (
      mediaRes.result.medium_url ||
      mediaRes.result.preview_url ||
      mediaRes.result.depiction_url ||
      null
    );
  }
  return null;
}

// Routes
app.get('/', (req, res) => res.render('index.liquid'));
app.get('/prikbord', (req, res) => res.render('prikbord.liquid'));

app.get('/game', async (req, res) => {
  try {
    const membersData = await fetchJSON(
      `${BASE_URL}/model/maxclass_membership/get/class/${GROUP_ID}/member`
    );
    const memberIds = membersData.result;

    const members = await Promise.all(
      memberIds.map(async id => {
        const titleRes = await fetchJSON(
          `${BASE_URL}/model/rsc/get/${id}/title`
        );
        const name = titleRes.result || 'Onbekend';

        let image = await getImageUrl(id);
        if (!image) image = '/default.jpg';

        return { id, name, image };
      })
    );

    res.render('game.liquid', { members });
  } catch (err) {
    console.error('Fout bij ophalen leden:', err);
    res.status(500).send('Er ging iets mis bij het ophalen van de leden');
  }
});

app.post('/', (req, res) => res.redirect(303, '/'));
app.set('port', process.env.PORT || 8000);
app.listen(app.get('port'), () => console.log(`Server gestart op http://localhost:${app.get('port')}`));
