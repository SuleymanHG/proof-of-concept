import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import { Liquid } from 'liquidjs';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialiseren
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL of Key ontbreekt');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Voor JSON-parsing als je JSON payloads verwacht
app.use(express.json());

// Proxy-image route
app.get('/proxy-image', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Missing "url" parameter');
  }
  try {
    const upstream = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.KEY}`,
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

// Liquid templating engine instellen
const engine = new Liquid();
app.engine('liquid', engine.express());
app.set('views', './views');

const BASE_URL = process.env.BASE_URL;
const GROUP_ID = process.env.GROUP_ID;
if (!BASE_URL || !GROUP_ID) process.exit(1);

// Helper voor externe JSON fetches
async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${process.env.KEY}`,
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
app.get('/prikbord', async (req, res) => {
  // Haal notities op uit Supabase
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Fout bij ophalen notes:', error);
    return res.status(500).send('Database-fout');
  }
  res.render('prikbord.liquid', { notes });
});

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

// Nieuw: POST route om berichten naar Supabase te sturen
app.post('/notice-board', async (req, res) => {
  try {
    const { textArea } = req.body;
    const { error } = await supabase
      .from('notes')
      .insert([{ message: textArea, created_at: new Date().toISOString() }]);
    if (error) {
      console.error('Fout bij INSERT note:', error);
      return res.status(500).send('Database-fout bij opslaan bericht');
    }
    res.redirect(303, '/prikbord');
  } catch (err) {
    console.error('Error in POST /notice-board:', err);
    res.status(500).send('Serverfout');
  }
});

app.set('port', process.env.PORT || 8000);
app.listen(app.get('port'), () => console.log(`Server gestart op http://localhost:${app.get('port')}`));
