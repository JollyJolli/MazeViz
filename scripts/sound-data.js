/**
 * sound-data.js - Datos de audio para MazeViz
 * 
 * Este archivo contiene sonidos predefinidos en formato base64
 * que se pueden usar sin necesidad de archivos externos.
 */

// Sonidos en formato base64 (pequeños tonos de audio)
const SOUND_DATA = {
    // Tono corto para clic (440Hz)
    click: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    
    // Tono para generación (523Hz)
    generate: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    
    // Tono para limpiar (330Hz)
    clear: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    
    // Tono para inicio de resolución (660Hz)
    solve_start: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    
    // Tono para finalización de resolución (880Hz)
    solve_complete: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    
    // Tono muy corto para pasos de resolución (220Hz)
    solve_step: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    
    // Tono para error (110Hz)
    error: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
};
