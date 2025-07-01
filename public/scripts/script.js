(() => {
  const board = document.getElementById('game-board');
  const triesEl = document.getElementById('tries');
  const restartBtn = document.getElementById('restart');
  let cards = [];
  let first = null;
  let second = null;
  let lock = false;
  let tries = 0;

  // Fisher–Yates shuffle
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Reset selection state
  function resetSelection() {
    first = null;
    second = null;
    lock = false;
  }

  // Initialize or restart the game
  function init() {
    cards = Array.from(board.querySelectorAll('.card'));
    shuffle(cards);

    board.innerHTML = '';
    cards.forEach(card => {
      card.classList.remove('flipped', 'matched');
      board.appendChild(card);
    });

    resetSelection();
    tries = 0;
    triesEl.textContent = tries;
  }

  // Handle a card click
  function onCardClick(e) {
    const card = e.currentTarget;
    if (lock || card.classList.contains('flipped')) return;

    card.classList.add('flipped');

    if (!first) {
      first = card;
    } else {
      second = card;
      lock = true;
      tries++;
      triesEl.textContent = tries;

      // Check for match: same id but different type
      const match =
        first.dataset.id === second.dataset.id &&
        first.dataset.type !== second.dataset.type;

      if (match) {
        // Mark both cards as permanently matched (turns them green via CSS)
        first.classList.add('matched');
        second.classList.add('matched');

        resetSelection();

        // If all cards are flipped, the game is won
        if (cards.every(c => c.classList.contains('flipped'))) {
          setTimeout(() => {
            alert(`Gefeliciteerd! Klaar in ${tries} pogingen.`);
          }, 200);
        }
      } else {
        // Not a match: flip them back over after a delay
        setTimeout(() => {
          first.classList.remove('flipped');
          second.classList.remove('flipped');
          resetSelection();
        }, 1000);
      }
    }
  }

  // Attach event listeners
  restartBtn.addEventListener('click', init);
  board.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', onCardClick);
  });

  // Kick off the first game
  init();
})();



// HAMBURGER MENU
const btn = document.querySelector('.nav-toggle');
const nav = document.querySelector('nav');

btn?.addEventListener('click', () => {
  nav.classList.toggle('is-open');
});

