import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Inicializa el estado leyendo de localStorage si existe
const [value, setValue] = useState<T>(() => {
const stored = localStorage.getItem(key);
return stored ? JSON.parse(stored) : initialValue;
});


// Guarda automáticamente el estado en localStorage cuando cambia
useEffect(() => {
localStorage.setItem(key, JSON.stringify(value));
}, [key, value]);


// Devuelve el valor y la función para actualizarlo
return [value, setValue] as const;
}
