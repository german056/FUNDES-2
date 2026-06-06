export interface Course {
  id: string;
  name: string;
  url: string;
  progress: number; // percentage (0 - 100)
  status: 'green' | 'yellow' | 'red'; // verde, amarillo, rojo
  category: string; // categoría, área temática o programa
  responsible: string; // docente, tutor o diseñador curricular
  notes: string; // observaciones
  imageUrl?: string; // banner o imagen representativa
}

export type CourseStatus = 'green' | 'yellow' | 'red';
