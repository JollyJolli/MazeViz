// Este script genera tonos de audio simples para usar como efectos de sonido
// Ejecutar con: node create-sounds.js

const fs = require('fs');
const { exec } = require('child_process');

// Función para generar un tono simple usando SoX (Sound eXchange)
// Nota: SoX debe estar instalado en el sistema
function generateTone(filename, frequency, duration, type = 'sine', volume = 0.5) {
    const command = `sox -n -r 44100 -c 1 ${filename} synth ${duration} ${type} ${frequency} vol ${volume}`;
    
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error generando ${filename}: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn(`Advertencia generando ${filename}: ${stderr}`);
            }
            console.log(`Generado: ${filename}`);
            resolve();
        });
    });
}

// Crear directorio de sonidos si no existe
if (!fs.existsSync('sounds')) {
    fs.mkdirSync('sounds');
}

// Generar todos los sonidos necesarios
async function generateAllSounds() {
    try {
        // Sonidos para la generación de laberintos
        await generateTone('sounds/generate.mp3', 440, 0.3, 'sine', 0.5);
        await generateTone('sounds/clear.mp3', 330, 0.2, 'sine', 0.4);
        
        // Sonidos para la resolución de laberintos
        await generateTone('sounds/solve_start.mp3', 523, 0.4, 'sine', 0.6);
        await generateTone('sounds/solve_complete.mp3', 660, 0.5, 'sine', 0.7);
        await generateTone('sounds/solve_step.mp3', 880, 0.05, 'sine', 0.1);
        await generateTone('sounds/path_found.mp3', 784, 0.4, 'sine', 0.5);
        
        // Sonidos para la interacción con el laberinto
        await generateTone('sounds/wall_place.mp3', 220, 0.1, 'square', 0.3);
        await generateTone('sounds/wall_remove.mp3', 110, 0.1, 'square', 0.3);
        await generateTone('sounds/start_place.mp3', 587, 0.2, 'sine', 0.4);
        await generateTone('sounds/end_place.mp3', 698, 0.2, 'sine', 0.4);
        
        // Sonidos para la interfaz
        await generateTone('sounds/button_click.mp3', 440, 0.1, 'square', 0.4);
        await generateTone('sounds/toggle.mp3', 392, 0.15, 'sine', 0.4);
        await generateTone('sounds/error.mp3', 220, 0.3, 'sawtooth', 0.5);
        
        console.log('Todos los sonidos han sido generados correctamente.');
    } catch (error) {
        console.error('Error generando sonidos:', error);
    }
}

generateAllSounds();
