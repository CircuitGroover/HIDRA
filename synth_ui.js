document.addEventListener("DOMContentLoaded", function() {
    // Create an audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Oscillator and gain nodes for each oscillator
    const oscillators = [];
    const gains = [];
    let reverb = audioContext.createConvolver();

    // Analyser Node for waveform visualization
    let analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Set FFT size (affects resolution and performance)
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength); // Array to store audio data for visualization

    // Connect analyser to audio context
    analyser.connect(audioContext.destination);

    // Default settings for oscillators and volume
    const settings = {
        oscillator1Waveform: 'sine',
        oscillator2Waveform: 'sine',
        oscillator3Waveform: 'sine',
        frequency: 440,
        volume: 0.5,
        reverbAmount: 0.5
    };

    // Ensure event listeners are attached after DOM is loaded
    const oscillator1Waveform = document.getElementById("oscillator1Waveform");
    const oscillator2Waveform = document.getElementById("oscillator2Waveform");
    const oscillator3Waveform = document.getElementById("oscillator3Waveform");
    const oscillator1Frequency = document.getElementById("oscillator1Frequency");
    const oscillator2Frequency = document.getElementById("oscillator2Frequency");
    const oscillator3Frequency = document.getElementById("oscillator3Frequency");
    const oscillator1Volume = document.getElementById("oscillator1Volume");
    const oscillator2Volume = document.getElementById("oscillator2Volume");
    const oscillator3Volume = document.getElementById("oscillator3Volume");
    const reverbButton = document.getElementById("reverbButton");
    const playButton = document.getElementById("playButton");

    if (oscillator1Waveform && oscillator2Waveform && oscillator3Waveform && 
        oscillator1Frequency && oscillator2Frequency && oscillator3Frequency && 
        oscillator1Volume && oscillator2Volume && oscillator3Volume && 
        reverbButton && playButton) {

        // Set up event listeners
        oscillator1Waveform.addEventListener("change", (e) => {
            settings.oscillator1Waveform = e.target.value;
            updateOscillators();
        });
        oscillator2Waveform.addEventListener("change", (e) => {
            settings.oscillator2Waveform = e.target.value;
            updateOscillators();
        });
        oscillator3Waveform.addEventListener("change", (e) => {
            settings.oscillator3Waveform = e.target.value;
            updateOscillators();
        });
        oscillator1Frequency.addEventListener("input", (e) => {
            settings.frequency = e.target.value;
            updateOscillators();
        });
        oscillator2Frequency.addEventListener("input", (e) => {
            settings.frequency = e.target.value;
            updateOscillators();
        });
        oscillator3Frequency.addEventListener("input", (e) => {
            settings.frequency = e.target.value;
            updateOscillators();
        });
        oscillator1Volume.addEventListener("input", (e) => {
            settings.volume = e.target.value;
            updateGains();
        });
        oscillator2Volume.addEventListener("input", (e) => {
            settings.volume = e.target.value;
            updateGains();
        });
        oscillator3Volume.addEventListener("input", (e) => {
            settings.volume = e.target.value;
            updateGains();
        });

        // Reverb button
        reverbButton.addEventListener("click", () => {
            settings.reverbAmount = 0.39;  // Set reverb to 39% on button click
            updateReverb();
        });

        // Create and start oscillators
        function createOscillator(waveform, frequency) {
            let oscillator = audioContext.createOscillator();
            oscillator.type = waveform;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            return oscillator;
        }

        // Update oscillators with current settings
        function updateOscillators() {
            // Stop any existing oscillators
            oscillators.forEach(osc => osc.stop());
            oscillators.length = 0;

            // Create new oscillators based on current settings
            let osc1 = createOscillator(settings.oscillator1Waveform, settings.frequency);
            let osc2 = createOscillator(settings.oscillator2Waveform, settings.frequency);
            let osc3 = createOscillator(settings.oscillator3Waveform, settings.frequency);

            // Connect oscillators to gain nodes
            osc1.connect(gains[0]);
            osc2.connect(gains[1]);
            osc3.connect(gains[2]);

            // Start oscillators
            osc1.start();
            osc2.start();
            osc3.start();

            // Store oscillators
            oscillators.push(osc1, osc2, osc3);
        }

        // Update the gains (volume)
        function updateGains() {
            gains.forEach(g => g.gain.setValueAtTime(settings.volume, audioContext.currentTime));
        }

        // Set up initial gain nodes
        function createGainNode() {
            let gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime);
            gainNode.connect(analyser); // Connect directly to analyser
            return gainNode;
        }

        for (let i = 0; i < 3; i++) {
            gains.push(createGainNode());
        }

        // Set up reverb (using a default impulse response)
        function updateReverb() {
            fetch('path_to_impulse_response.wav')  // Update path as needed
                .then(response => response.arrayBuffer())
                .then(buffer => audioContext.decodeAudioData(buffer))
                .then(decodedData => {
                    reverb.buffer = decodedData;
                    reverb.connect(analyser);  // Connect reverb to analyser
                });
        }

        // Set up the play button event listener
        playButton.addEventListener('click', function() {
            audioContext.resume().then(() => {
                updateOscillators(); // Create and start oscillators
            });
        });

        // Waveform Visualizer
        function drawVisualizer() {
            requestAnimationFrame(drawVisualizer);

            analyser.getByteTimeDomainData(dataArray);

            const canvas = document.getElementById("waveformCanvas");
            const canvasCtx = canvas.getContext("2d");
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(255, 99, 132)';
            canvasCtx.beginPath();

            let sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                let v = dataArray[i] / 128.0; // Normalize the data to [0, 1]
                let y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        }

        // Start visualizer loop
        drawVisualizer();
    } else {
        console.error("One or more elements not found in HTML.");
    }
});
