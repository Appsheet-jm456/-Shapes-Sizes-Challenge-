/**
 * Kinetic English Games – Audio Module
 * Web Audio API sound generation for game feedback
 * 
 * @module AudioManager
 */

const AudioManager = (function() {
    'use strict';

    /** @type {AudioContext|null} */
    let audioContext = null;

    /**
     * Initialize the audio context
     * Must be called after user interaction due to browser policies
     */
    function init() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume context if suspended (required by some browsers)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    /**
     * Play a frequency for a specified duration
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {number} startTime - Start time relative to now
     * @param {string} type - Oscillator type (sine, square, triangle, sawtooth)
     * @param {number} volume - Volume (0-1)
     */
    function playTone(frequency, duration, startTime = 0, type = 'sine', volume = 0.3) {
        if (!audioContext) init();

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);

        // Envelope for smoother sound
        const now = audioContext.currentTime + startTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Play correct answer sound - ascending melody (Do-Mi-Sol)
     * Creates a happy, triumphant sound
     */
    function playCorrect() {
        init();
        
        // C major chord arpeggio (C4 - E4 - G4)
        const frequencies = [261.63, 329.63, 392.00];
        const duration = 0.15;
        
        frequencies.forEach((freq, index) => {
            playTone(freq, duration + 0.1, index * 0.1, 'triangle', 0.25);
        });
        
        // Add a sparkle effect
        setTimeout(() => {
            playTone(523.25, 0.2, 0, 'sine', 0.15); // C5 for sparkle
        }, 300);
    }

    /**
     * Play incorrect answer sound - descending tone
     * Creates a gentle, non-discouraging sound
     */
    function playIncorrect() {
        init();
        
        // Gentle descending notes
        playTone(293.66, 0.2, 0, 'triangle', 0.2);    // D4
        playTone(246.94, 0.3, 0.15, 'triangle', 0.15); // B3
    }

    /**
     * Play timeout sound
     * Similar to incorrect but with a different character
     */
    function playTimeout() {
        init();
        
        // Soft descending whoosh
        playTone(392.00, 0.15, 0, 'sine', 0.15);    // G4
        playTone(329.63, 0.15, 0.1, 'sine', 0.12);  // E4
        playTone(261.63, 0.2, 0.2, 'sine', 0.1);    // C4
    }

    /**
     * Play button click sound
     */
    function playClick() {
        init();
        playTone(600, 0.05, 0, 'sine', 0.15);
    }

    /**
     * Play game start fanfare
     */
    function playStart() {
        init();
        
        // Exciting ascending fanfare
        const notes = [
            { freq: 261.63, time: 0 },      // C4
            { freq: 329.63, time: 0.1 },    // E4
            { freq: 392.00, time: 0.2 },    // G4
            { freq: 523.25, time: 0.3 },    // C5
        ];
        
        notes.forEach(note => {
            playTone(note.freq, 0.2, note.time, 'triangle', 0.2);
        });
    }

    /**
     * Play victory celebration sound
     */
    function playVictory() {
        init();
        
        // Triumphant fanfare
        const melody = [
            { freq: 392.00, time: 0, dur: 0.15 },      // G4
            { freq: 392.00, time: 0.15, dur: 0.15 },   // G4
            { freq: 392.00, time: 0.3, dur: 0.15 },    // G4
            { freq: 311.13, time: 0.45, dur: 0.4 },    // Eb4
            { freq: 349.23, time: 0.85, dur: 0.1 },    // F4
            { freq: 392.00, time: 0.95, dur: 0.15 },   // G4
            { freq: 311.13, time: 1.1, dur: 0.2 },     // Eb4
            { freq: 523.25, time: 1.3, dur: 0.5 },     // C5
        ];
        
        melody.forEach(note => {
            playTone(note.freq, note.dur, note.time, 'triangle', 0.2);
        });
    }

    /**
     * Play streak bonus sound
     */
    function playStreak() {
        init();
        
        // Quick ascending sparkle
        playTone(523.25, 0.1, 0, 'sine', 0.2);       // C5
        playTone(659.25, 0.1, 0.08, 'sine', 0.2);    // E5
        playTone(783.99, 0.15, 0.16, 'sine', 0.2);   // G5
    }

    /**
     * Play timer warning sound
     */
    function playTimerWarning() {
        init();
        playTone(440, 0.08, 0, 'square', 0.1);
    }

    /**
     * Speak text using Web Speech API
     * @param {string} text - Text to speak
     * @param {number} rate - Speech rate (0.1-10)
     */
    function speak(text, rate = 1) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = rate;
            utterance.pitch = 1.1;
            utterance.lang = 'en-US';
            
            // Try to use a friendly voice
            const voices = window.speechSynthesis.getVoices();
            const friendlyVoice = voices.find(voice => 
                voice.lang.startsWith('en') && 
                (voice.name.includes('Female') || voice.name.includes('Samantha'))
            );
            if (friendlyVoice) {
                utterance.voice = friendlyVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    }

    // Public API
    return {
        init,
        playCorrect,
        playIncorrect,
        playTimeout,
        playClick,
        playStart,
        playVictory,
        playStreak,
        playTimerWarning,
        speak
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
