import React, { useState, useRef, useEffect } from 'react';
import { validateWordleGuess } from '../services/wordleService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../static/style/customStyle.css';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';

const WordleGame = () => {
  const [guesses, setGuesses] = useState(['', '', '', '', '']);
  const [isValidWord, setIsValidWord] = useState(null);
  const [score, setScore] = useState([]);
  const [inputHistory, setInputHistory] = useState([]);
  const [remainingGuesses, setRemainingGuesses] = useState(6);
  const [focusedInput, setFocusedInput] = useState(0);
  const [wholeWordGuessedCorrectly, setWholeWordGuessedCorrectly] = useState(false);
  const { width, height } = useWindowSize();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const keyboardLetters = [
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM',
  ];

  const toggleHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  };

  const inputRefs = useRef(Array.from({ length: 5 }, () => React.createRef()));

  const handleCommonLogic = (index, event) => {
    const allowedKeys = /^[a-zA-Z]$/;
    const allowedSpecialKeys = ['Backspace', 'Delete', 'Shift', 'Tab', 'Enter'];

    if (
      event.key &&
      !event.key.match(allowedKeys) &&
      !allowedSpecialKeys.includes(event.key) &&
      index === focusedInput
    ) {
      event.preventDefault();
      return;
    }

    if (event.key === 'Backspace' && index === focusedInput) {
      if (guesses[index] && guesses[index].trim() !== '') {
        setFocusedInput(index);
      } else {
        setFocusedInput((prev) => (index > 0 ? index - 1 : prev));
      }
    } else if (event.key === 'Enter' && index === focusedInput) {
      event.preventDefault(); // Prevent the default behavior of Enter (e.g., new line in textarea)
      handleGuessSubmit(event); // Handle form submission
    }
  };

  const handleGuessChange = (index, event) => {
    handleCommonLogic(index, event);

    const newGuesses = [...guesses];
    newGuesses[index] = event.target.value.toUpperCase();
    setGuesses(newGuesses);

    if (event.key === 'Backspace') {
      if (guesses[index] && guesses[index].trim() !== '') {
        setFocusedInput(index);
      } else {
        setFocusedInput((prev) => (index > 0 ? index - 1 : prev));
      }
    } else if (event.target.value !== '') {
      setFocusedInput((prev) => (index < 4 ? index + 1 : prev));
    }
  };

  const handleKeyboardClick = (letter) => {
    if (focusedInput < guesses.length) {
      const newGuesses = [...guesses];
      newGuesses[focusedInput] = letter;
      setGuesses(newGuesses);

      if (focusedInput < guesses.length - 1) {
        setFocusedInput(focusedInput + 1);
      }
    }
  };

  useEffect(() => {
    if (focusedInput === -1) {
      inputRefs.current[4].current.focus();
    } else {
      inputRefs.current[focusedInput].current.focus();
    }
  }, [focusedInput]);

  const isGuessValid = () => {
    for (const guess of guesses) {
      if (guess.trim() === '' || guess.length !== 1) {
        return false;
      }
    }

    const combinedGuess = guesses.join('');
    if (inputHistory.some((inputData) => inputData.input.toUpperCase() === combinedGuess)) {
      console.error('You already guessed this word.');
      return false;
    }

    return true;
  };

  const handleGuessSubmit = async (event) => {
    event.preventDefault();

    if (!isGuessValid()) {
      return;
    }

    try {
      const { is_valid_word, score } = await validateWordleGuess(guesses.join(''));

      if (is_valid_word) {
        setIsValidWord(true);
        setScore(score);
        setGuesses(['', '', '', '', '']);
        setInputHistory((prev) => [...prev, { input: guesses.join(''), score }]);
        setRemainingGuesses((prev) => prev - 1);
        setFocusedInput(0);
        setWholeWordGuessedCorrectly(score.every((s) => s === 2));
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  const resetGame = () => {
    setRemainingGuesses(6);
    setScore([]);
    setInputHistory([]);
    setWholeWordGuessedCorrectly(false);
    setGuesses(['', '', '', '', '']);
    setFocusedInput(0);
  };

  const renderInputHistory = () => {
    return (
      <div className="wordle-container mt-3">
        <div className="d-flex flex-column align-items-center">
          {[...Array(6).keys()].map((rowIndex) => {
            const inputData = inputHistory[rowIndex];

            return (
              <div key={rowIndex} className="wordle-word d-flex">
                {[...Array(5).keys()].map((charIndex) => {
                  const char = inputData?.input?.charAt(charIndex) || '';
                  const score = inputData?.score?.[charIndex] || 0;
                  const backgroundColor = char === '' ? '' : getColorBasedOnScore(score);

                  return (
                    <input
                      key={charIndex}
                      type="text"
                      value={char}
                      disabled
                      className={`wordle-character`}
                      style={{
                        width: '50px',
                        height: '45px',
                        textAlign: 'center',
                        backgroundColor,
                        border: `1px solid #000000`,
                        borderRadius: `2px`
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper function to get color based on score
  const getColorBasedOnScore = (score) => {
    switch (score) {
      case 0:
        return '#808080';
      case 1:
        return '#c9b458';
      case 2:
        return '#008000';
      default:
        return 'black';
    }
  };

  return (
    <div className="container mt-3 text-center custom-container">
      <Confetti
        key={wholeWordGuessedCorrectly ? 'confetti-key-1' : 'confetti-key-2'}
        width={width}
        height={height}
        gravity={0.2}
        run={wholeWordGuessedCorrectly}
        recycle={false}
        numberOfPieces={1800}
      />
      <div className='header-container'>
        <h1 className="heading mx-auto">WORDLE</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <form
          onSubmit={handleGuessSubmit}
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
        >
          {guesses.map((guess, index) => (
            <React.Fragment key={index}>
              <input
                type="text"
                disabled={remainingGuesses === 0 || wholeWordGuessedCorrectly}
                value={guess}
                onChange={(event) => handleGuessChange(index, event)}
                onKeyDown={(event) => handleCommonLogic(index, event)}
                maxLength="1"
                ref={inputRefs.current[index]}
                tabIndex={index === focusedInput ? 0 : -1}
                className={`form-control wordle-character }`}
                style={{
                  width: '50px',
                  height: '45px',
                  textAlign: 'center',
                  border: `2px solid lightgrey`,
                  borderRadius: `2px`,
                  color: 'black'
                }}
              />
            </React.Fragment>
          ))}
        </form>
      </div>

      {/* Second Row: Input History */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        {renderInputHistory()}
      </div>

      {/* Third Row: Keyboard */}          
      <div className="keyboard">
        {keyboardLetters.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.split('').map((letter) => (
              <button key={letter} onClick={() => handleKeyboardClick(letter)} className="keyboard-button"
                style={{
                  fontWeight: 'bold',
                  padding: '2px',
                  fontSize: '1em',
                  width: '40px',
                  height: '50px',
                  borderRadius: '3px',
                  border: '1px solid #000000',
                  backgroundColor: '#ffffff',
                  margin: '2px',
                  cursor: 'pointer'
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Forth Row: Submit/Restart Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {remainingGuesses === 0 || wholeWordGuessedCorrectly ? (
          <div>
            <div className={`message-container ${wholeWordGuessedCorrectly ? 'success' : 'failure'}`}>
              <p>{wholeWordGuessedCorrectly ? 'Winner winner, Wordle master! 🎉✨' : 'Oops! Out of attempts!'}</p>
            </div>
            <button id="restart" onClick={resetGame} className="btn btn-danger">
              Restart
            </button>
          </div>
        ) : (
          <form onSubmit={handleGuessSubmit}>
            <button
              id="enter"
              type="Submit"
              disabled={!isGuessValid() || remainingGuesses === 0 || wholeWordGuessedCorrectly}
              className="btn btn-success"
              title={!isGuessValid() ? 'Type a single character in each box to Submit' : ''}
              tabIndex={focusedInput === -1 ? 0 : -1}
            >
              {wholeWordGuessedCorrectly ? 'You guessed the correct word!' : 'Submit'}
            </button>
          </form>
        )}
      </div>

      {/* Help/Instructions Button */}
      <div style={{ display: 'flex', justifyContent: 'right' }}>
        <button
          id="help"
          type="button"
          className="btn btn-primary position-fixed top-0 end-0 m-3"
          onClick={toggleHelpModal}
        >
          How to Play
        </button>
      </div>

      {showHelpModal && (
        <div className="modal-backdrop" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: '1040' }}></div>
      )}

      {/* Bootstrap Modal for Help/Instructions */}
      <div
        className={`modal fade ${showHelpModal ? 'show' : ''}`}
        id="helpModal"
        tabIndex="-1"
        aria-labelledby="helpModalLabel"
        aria-hidden="true"
        style={{ display: showHelpModal ? 'block' : 'none' }}
      >
        <div className="modal-dialog">
          <div className="modal-content" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white' }}>
            <div className="modal-header">
              <h5 className="modal-title" id="wordleModalLabel">How To Play</h5>
              <button type="button" onClick={toggleHelpModal} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p><strong>Guess the Wordle in 6 tries.</strong></p>
              <ul>
                <li>Each guess must be a valid 5-letter word.</li>
                <li>The color of the tiles will change to show how close your guess was to the word.</li>
              </ul>

              <h5>Examples</h5>

              <div className="d-flex flex-column">
                {/* Example 1: PIANO */}
                <div className="wordle-word d-flex">
                  {'PIANO'.split('').map((char, charIndex) => (
                    <div
                      key={charIndex}
                      className={`wordle-character wordle-character-${getColorBasedOnScore(charIndex)}`}
                      style={{
                        backgroundColor: charIndex === 0 ? '#008000' : 'transparent',
                        border: '1px solid grey',
                        padding: '3px',
                        borderRadius: '3px',
                        color: 'black'
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <p>P is in the word and in the correct spot.</p>

                {/* Example 2: CABIN */}
                <div className="wordle-word d-flex">
                  {'CABIN'.split('').map((char, charIndex) => (
                    <div
                      key={charIndex}
                      className={`wordle-character wordle-character-${getColorBasedOnScore(charIndex + 1)}`}
                      style={{
                        backgroundColor: charIndex === 1 ? '#c9b458' : 'transparent',
                        border: '1px solid grey',
                        padding: '3px',
                        borderRadius: '3px',
                        color: 'black'
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>

                <p>A is in the word but in the wrong spot.</p>

                {/* Example 3: BLAZE */}
                <div className="wordle-word d-flex">
                  {'BLAZE'.split('').map((char, charIndex) => (
                    <div
                      key={charIndex}
                      className={`wordle-character wordle-character-${getColorBasedOnScore(charIndex + 3)}`}
                      style={{
                        backgroundColor: charIndex === 0 ? '#808080' : 'transparent',
                        border: '1px solid grey',
                        padding: '3px',
                        borderRadius: '3px',
                        color: 'black'
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <p>B is not in the word in any spot.</p>
              </div>
              <p><strong>Additional Rules:</strong></p>
              <ul>
                <li>You cannot enter the same word more than once.</li>
                <li>If you enter an incorrect word, the system will not allow you to submit that word.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordleGame;