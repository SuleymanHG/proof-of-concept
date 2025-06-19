# 💻 Tech Stack:
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)

# Beschrijving
Ik heb een interactieve Matching Game ontworpen voor gebruik binnen LearningStone-cursussen, met als doel dat trainers deze volledig kunnen configureren naar eigen wens. De trainer kan instellen hoeveel deelnemers meedoen (standaard tot 50), koppels van termen of afbeeldingen invoeren (handmatig of via CSV), een tijdslimiet toevoegen en bepalen of deelnemers na afloop hun score en oplossingen mogen zien. Ook kan er optioneel een prikbord-bericht geplaatst worden met de behaalde resultaten. De game wordt als apart blok toegevoegd aan de cursus en voldoet aan eisen op het gebied van toegankelijkheid (WCAG 2.1 AA), responsive design en gegevensbeveiliging. Het project is schaalbaar en klaar voor toekomstige uitbreidingen zoals voortgangsrapportage en groepsscores.

![Ontwerp zonder titel(4)](https://github.com/user-attachments/assets/42241c2d-f9f3-4ca0-85d9-b2bd7fc8eb95)

# Features
Dit project bevat 2 hoofd funtionaliteiten, dat is de prikbord functie(of chat functie) en de memory game waar je namen met profiel foto's matched.

## Memory game 
![Schermafbeelding 2025-06-19 om 08 03 01](https://github.com/user-attachments/assets/36910e48-fef5-4b87-aad8-4da8abc59182)

### 🔧 Uitleg Matching Game Logica (JavaScript)

De game maakt gebruik van JavaScript om een eenvoudige matching game te realiseren. Hieronder de belangrijkste onderdelen:

- 🔄 **Shuffelen van kaarten**  
  Bij het opstarten worden alle `.card`-elementen willekeurig geordend met een `shuffle()`-functie.

- 🃏 **Kaartselectie en match-controle**  
  Elke kaart heeft een `data-id` en een `data-type`. Als een speler twee kaarten selecteert met hetzelfde `data-id` maar een verschillend `data-type`, worden deze als een correcte match beschouwd.

- 🔒 **Vergrendeling tijdens poging**  
  Zodra twee kaarten zijn geselecteerd, wordt de interactie tijdelijk vergrendeld tot de vergelijking is voltooid.

- ✅ **Correcte match**  
  Bij een juiste combinatie blijven beide kaarten zichtbaar. Als alle kaarten zijn gematcht, verschijnt er een felicitatiebericht met het aantal pogingen.

- ❌ **Foutieve match**  
  Bij een fout worden beide kaarten na 1 seconde automatisch weer omgedraaid.

- 🔢 **Pogingenteller**  
  Het script houdt het aantal pogingen bij en toont dit live in het interface.

- 🔁 **Opnieuw starten**  
  Via de knop “Opnieuw starten” worden de kaarten opnieuw geschud en het spel gereset.

https://github.com/SuleymanHG/proof-of-concept/blob/b72dbe48b93b8462c10d179f8050a9847775a235/public/scripts/script.js#L1-L74
---
## Chat functie
### 🗒️ Uitleg Prikbordfunctionaliteit (Liquid + HTML)

Deze pagina toont een eenvoudig maar effectief **prikbord** waar deelnemers berichten kunnen plaatsen en elkaars bijdragen kunnen zien. De logica werkt als volgt:

- 📄 **Berichten weergeven**  
  Met een `for`-loop worden alle items in `notes` weergegeven als losse `<div class="message">`-elementen. Elk bericht bevat de inhoud (`note.message`) en een `data-id`.

- 🕳️ **Lege status**  
  Als er nog geen berichten zijn (`notes.size == 0`), verschijnt een lege toestand met de boodschap:  
  _\"Er zijn nog geen berichten op het prikbord. Typ hieronder je eerste bericht!\"_

- 📨 **Nieuw bericht plaatsen**  
  Onder de berichtenlijst staat een formulier (`<form>`), waarmee gebruikers via een POST-verzoek een nieuw bericht naar `/notice-board` kunnen sturen.  
  - Het invoerveld is verplicht (`required`)  
  - `autocomplete` is uitgeschakeld om onbedoelde suggesties te vermijden  
  - De knop `Verzenden` stuurt het bericht

- 🧱 **Structuur**  
  Alles zit binnen een `<main>` met de klasse `prikbord-pagina`, opgesplitst in twee delen:  
  - `.chat-container` → alle bestaande berichten of de leegmelding  
  - `.message-form` → het invoerveld + knop
    
https://github.com/SuleymanHG/proof-of-concept/blob/b72dbe48b93b8462c10d179f8050a9847775a235/views/prikbord.liquid#L1-L30

# 🔌 API- en Database-integraties

In dit project is gebruikgemaakt van externe diensten voor data-integratie en opslag:

- 🔗 **LearningStone API**  
  De LearningStone API is gebruikt om dynamisch **profielgegevens van deelnemers** op te halen, waaronder:
  - Voornaam + achternaam
  - Profielfoto’s  
  Deze data is geïntegreerd in de game-ervaring en/of prikbordweergave, zodat deelnemers herkend worden aan hun profielinformatie binnen de cursusomgeving.

- 🗃️ **Supabase (PostgreSQL + REST API)**  
  Supabase is gebruikt als backend-database om berichten op het prikbord op te slaan.  
  - Berichten worden via een formulier gepost naar een Supabase-endpoint  
  - Nieuwe berichten worden realtime weergegeven op de prikbordpagina  
  - De setup maakt gebruik van Supabase's ingebouwde API voor veilige, snelle data-opslag en -retrieval


🚀 [Bekijk de live demo](https://proof-of-concept-x9u5.onrender.com/)
