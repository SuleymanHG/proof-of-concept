(() => {
  const board = document.getElementById('game-board');
  const triesEl = document.getElementById('tries');
  const restartBtn = document.getElementById('restart');
  let cards = [];
  let first = null;
  let second = null;
  let lock = false;
  let tries = 0;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function resetSelection() {
    first = null;
    second = null;
    lock = false;
  }

  function init() {
    cards = Array.from(board.querySelectorAll('.card'));
    shuffle(cards);

    board.innerHTML = '';
    cards.forEach(card => {
      card.classList.remove('flipped');
      board.appendChild(card);
    });

    resetSelection();
    tries = 0;
    triesEl.textContent = tries;
  }

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

      const match =
        first.dataset.id === second.dataset.id &&
        first.dataset.type !== second.dataset.type;

      if (match) {
        resetSelection();
        if (cards.every(c => c.classList.contains('flipped'))) {
          setTimeout(() => alert(`Gefeliciteerd! Klaar in ${tries} pogingen.`), 200);
        }
      } else {
        setTimeout(() => {
          first.classList.remove('flipped');
          second.classList.remove('flipped');
          resetSelection();
        }, 1000);
      }
    }
  }

  restartBtn.addEventListener('click', init);
  board.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', onCardClick);
  });

  init();
})();
