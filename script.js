const keyboard = document.querySelector('.keyboard');
    const recordButton = document.getElementById('recordButton');
    const playButton = document.getElementById('playButton');
    const downloadButton = document.getElementById('downloadButton');
    const uploadButton = document.getElementById('uploadButton');
    const notes = {
      "C4": 261.63,
      "C#4": 277.18,
      "D4": 293.66,
      "D#4": 311.13,
      "E4": 329.63,
      "F4": 349.23,
      "F#4": 369.99,
      "G4": 392.00,
      "G#4": 415.30,
      "A4": 440.00,
      "A#4": 466.16,
      "B4": 493.88,
      "C5": 523.25
    };

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let recording = false;
    let recordedNotes = [];
    let startTime = 0;

    keyboard.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('key')) {
        const note = e.target.dataset.note;
        playSound(note);
        if (recording) {
          recordedNotes.push({ note: note, time: audioContext.currentTime - startTime });
        }
      }
    });

    recordButton.addEventListener('click', () => {
      recording = !recording;
      if (recording) {
        recordedNotes = [];
        startTime = audioContext.currentTime;
        recordButton.textContent = 'Stop Recording';
        playButton.disabled = true;
        downloadButton.disabled = true;
      } else {
        recordButton.textContent = 'Record';
        playButton.disabled = false;
        downloadButton.disabled = false;
      }
    });

    playButton.addEventListener('click', () => {
      playRecording(recordedNotes);
    });

    downloadButton.addEventListener('click', () => {
      downloadRecording(recordedNotes);
    });

    uploadButton.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const uploadedNotes = JSON.parse(event.target.result);
            playRecording(uploadedNotes);
          } catch (error) {
            console.error('Error parsing uploaded file:', error);
          }
        };
        reader.readAsText(file);
      }
    });

    function playSound(note) {
      const frequency = notes[note];
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1);
    }

    function playRecording(notes) {
      if (!notes || notes.length === 0) {
        return;
      }
      notes.forEach(recordedNote => {
        setTimeout(() => {
          playSound(recordedNote.note);
        }, recordedNote.time * 1000);
      });
    }

    function downloadRecording(notes) {
      const json = JSON.stringify(notes);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.json';
      a.click();
      URL.revokeObjectURL(url);
    }
