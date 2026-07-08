import { Activity } from '../types/drawing';
import { Colors } from './Colors';

export const ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'follow_line',
    title: 'Sigue el camino',
    description: 'Sigue la línea punteada sin salirte.',
    color: Colors.primary.sage,
    difficulty: 1,
  },
  {
    id: '2',
    type: 'stay_inside',
    title: 'Dentro del carril',
    description: 'Traza por el medio del túnel mágico.',
    color: Colors.primary.sky,
    difficulty: 2,
  },
  {
    id: '3',
    type: 'connect_dots',
    title: 'Une los puntos',
    description: 'Descubre qué forma se esconde aquí.',
    color: Colors.primary.coral,
    difficulty: 1,
  },
  {
    id: '4',
    type: 'copy_shape',
    title: 'Copia la forma',
    description: 'Intenta dibujar el mismo dibujo.',
    color: Colors.primary.peach,
    difficulty: 3,
  },
  {
    id: '5',
    type: 'follow_line',
    title: 'Montaña rusa',
    description: 'Un camino con muchas curvas divertidas.',
    color: Colors.primary.lilac,
    difficulty: 2,
  },
  {
    id: '6',
    type: 'stay_inside',
    title: 'El laberinto',
    description: 'Llega al final sin tocar las paredes.',
    color: Colors.primary.mustard,
    difficulty: 3,
  }
];
