/**
 * sound.js - Gestión de efectos de sonido para MazeViz
 */

class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.context = null;
        
        // Intentar crear un contexto de audio
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API no soportada en este navegador');
        }
        
        // Cargar sonidos
        this.loadSounds();
        
        // Configurar controles de sonido
        this.setupControls();
    }
    
    /**
     * Carga todos los sonidos utilizados en la aplicación
     */
    loadSounds() {
        // Usar datos de audio base64 desde sound-data.js
        if (typeof SOUND_DATA !== 'undefined') {
            for (const [name, dataUrl] of Object.entries(SOUND_DATA)) {
                this.loadSoundFromDataUrl(name, dataUrl);
            }
        } else {
            console.warn('SOUND_DATA no está definido. Los sonidos no se cargarán.');
        }
        
        // Crear osciladores para generar sonidos dinámicamente
        this.setupOscillators();
    }
    
    /**
     * Carga un sonido desde una URL de datos base64
     * @param {string} name - Nombre del sonido
     * @param {string} dataUrl - URL de datos en formato base64
     */
    loadSoundFromDataUrl(name, dataUrl) {
        this.sounds[name] = new Audio(dataUrl);
        
        // Manejar errores de carga silenciosamente
        this.sounds[name].addEventListener('error', (e) => {
            console.warn(`No se pudo cargar el sonido: ${name}`);
            // Crear un audio vacío para evitar errores
            this.sounds[name] = new Audio();
        });
    }
    
    /**
     * Configura osciladores para generar sonidos dinámicamente
     */
    setupOscillators() {
        if (!this.context) return;
        
        // Función para crear un tono con oscilador
        this.createTone = (frequency, duration, type = 'sine', volume = 0.5) => {
            if (!this.context || this.muted) return;
            
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
            
            gainNode.gain.setValueAtTime(volume, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.start();
            oscillator.stop(this.context.currentTime + duration);
        };
    }
    
    /**
     * Reproduce un sonido
     * @param {string} name - Nombre del sonido a reproducir
     * @param {number} volume - Volumen (0.0 a 1.0)
     */
    play(name, volume = 0.5) {
        if (this.muted) return;
        
        // Si tenemos un sonido precargado, reproducirlo
        if (this.sounds[name]) {
            try {
                // Clonar el audio para permitir reproducciones superpuestas
                const sound = this.sounds[name].cloneNode();
                sound.volume = volume;
                sound.play().catch(e => {
                    // Intentar con oscilador si falla la reproducción
                    this.playWithOscillator(name, volume);
                });
            } catch (e) {
                // Intentar con oscilador si hay error
                this.playWithOscillator(name, volume);
            }
        } else {
            // Si no hay sonido precargado, usar oscilador
            this.playWithOscillator(name, volume);
        }
    }
    
    /**
     * Reproduce un sonido usando osciladores
     * @param {string} name - Nombre del sonido a reproducir
     * @param {number} volume - Volumen (0.0 a 1.0)
     */
    playWithOscillator(name, volume = 0.5) {
        if (!this.context || !this.createTone) return;
        
        // Reactivar contexto si está suspendido
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        
        // Mapeo de nombres a frecuencias y duraciones
        const soundMap = {
            'click': { freq: 440, duration: 0.1, type: 'sine' },
            'generate': { freq: 523, duration: 0.3, type: 'sine' },
            'clear': { freq: 330, duration: 0.2, type: 'sine' },
            'solve_start': { freq: 660, duration: 0.4, type: 'sine' },
            'solve_complete': { freq: 880, duration: 0.5, type: 'sine' },
            'solve_step': { freq: 220, duration: 0.05, type: 'sine' },
            'wall_place': { freq: 220, duration: 0.1, type: 'square' },
            'wall_remove': { freq: 110, duration: 0.1, type: 'square' },
            'start_place': { freq: 587, duration: 0.2, type: 'sine' },
            'end_place': { freq: 698, duration: 0.2, type: 'sine' },
            'button_click': { freq: 440, duration: 0.1, type: 'square' },
            'toggle': { freq: 392, duration: 0.15, type: 'sine' },
            'error': { freq: 220, duration: 0.3, type: 'sawtooth' },
            'path_found': { freq: 784, duration: 0.4, type: 'sine' }
        };
        
        // Reproducir el sonido si está definido
        if (soundMap[name]) {
            const sound = soundMap[name];
            this.createTone(sound.freq, sound.duration, sound.type, volume);
        }
    }
    
    /**
     * Configura los controles de sonido en la interfaz
     */
    setupControls() {
        // Añadir toggle de sonido a la interfaz
        const header = document.querySelector('header');
        const soundToggle = document.createElement('div');
        soundToggle.className = 'sound-toggle';
        soundToggle.innerHTML = `
            <label for="sound-switch">Sonido</label>
            <input type="checkbox" id="sound-switch" checked>
        `;
        header.appendChild(soundToggle);
        
        // Configurar evento para el toggle
        const soundSwitch = document.getElementById('sound-switch');
        soundSwitch.addEventListener('change', () => {
            this.muted = !soundSwitch.checked;
            this.play('toggle');
        });
    }
}

// Crear instancia global del gestor de sonidos
const soundManager = new SoundManager();

/**
 * Funciones de ayuda para reproducir sonidos en diferentes eventos
 */

// Sonidos para interacciones con el laberinto
function playWallPlaceSound() {
    soundManager.play('wall_place', 0.3);
}

function playWallRemoveSound() {
    soundManager.play('wall_remove', 0.3);
}

function playStartPlaceSound() {
    soundManager.play('start_place', 0.4);
}

function playEndPlaceSound() {
    soundManager.play('end_place', 0.4);
}

// Sonidos para acciones principales
function playGenerateSound() {
    soundManager.play('generate', 0.6);
}

function playClearSound() {
    soundManager.play('clear', 0.5);
}

function playSolveStartSound() {
    soundManager.play('solve_start', 0.6);
}

function playSolveCompleteSound() {
    soundManager.play('solve_complete', 0.7);
}

function playSolveStepSound() {
    soundManager.play('solve_step', 0.1);
}

function playPathFoundSound() {
    soundManager.play('path_found', 0.5);
}

// Sonidos para la interfaz
function playButtonClickSound() {
    soundManager.play('button_click', 0.4);
}

function playToggleSound() {
    soundManager.play('toggle', 0.4);
}

function playErrorSound() {
    soundManager.play('error', 0.5);
}
