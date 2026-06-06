import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import * as xlsx from 'xlsx';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'courses_db.json');

app.use(express.json());

// Structure of a course
interface Course {
  id: string;
  name: string;
  url: string;
  progress: number; // 0 - 100
  status: 'green' | 'yellow' | 'red'; // verde, amarillo, rojo
  category: string; // categorí­a / área temática / programa
  responsible: string; // responsable
  notes: string; // observaciones
  imageUrl?: string;
}

// Default backup data in case spreadsheet fetch fails or is blank
const BACKUP_COURSES: Course[] = [
  {
    id: '1',
    name: 'Especialidad en Big Data y Analítica',
    url: 'https://virtual.fundes.edu.co/course/view.php?id=101',
    progress: 100,
    status: 'green',
    category: 'Especializaciones',
    responsible: 'Dr. Fernando Gómez',
    notes: 'Curso completamente ajustado y operacional',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    name: 'Introducción al Desarrollo Frontend con React',
    url: 'https://virtual.fundes.edu.co/course/view.php?id=102',
    progress: 75,
    status: 'yellow',
    category: 'Ingeniería de Software',
    responsible: 'MSc. Elena Rostova',
    notes: 'Faltan subir algunos recursos del módulo 4, pero es funcional',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    name: 'Gestión de Proyectos E-Learning con Moodle',
    url: 'https://virtual.fundes.edu.co/course/view.php?id=103',
    progress: 30,
    status: 'red',
    category: 'Educación Virtual',
    responsible: 'Ing. Carlos Mendoza',
    notes: 'Enlaces rotos en exámenes finales y recursos de bienvenida inactivos',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '4',
    name: 'Especialidad en Gerencia Social',
    url: 'https://virtual.fundes.edu.co/course/view.php?id=104',
    progress: 95,
    status: 'yellow',
    category: 'Administración',
    responsible: 'Dra. Patricia Ortiz',
    notes: 'Ajustes menores de diseño en el banner principal',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '5',
    name: 'Diseño Curricular para Entornos Virtuales',
    url: 'https://virtual.fundes.edu.co/course/view.php?id=105',
    progress: 100,
    status: 'green',
    category: 'Educación Virtual',
    responsible: 'Dra. Laura Marín',
    notes: 'Aprobado al 100% por coordinación académica',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80'
  }
];

// Helper to fetch and parse external excel
async function initializeFromGoogleSheets(): Promise<Course[]> {
  try {
    const url = "https://docs.google.com/spreadsheets/d/1L5jBs1ChPJ8NGbTE8OC1AbvKFZ_qMdYH/export?format=xlsx";
    console.log("Fetching Google Sheets template from:", url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const workbook = xlsx.read(new Uint8Array(buffer), { type: 'array' });
    
    console.log("Workbook sheets found:", workbook.SheetNames);
    
    // Let's inspect the sheets. We will try to read the sheet that has courses.
    // If there is a sheet, we read its contents.
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    
    console.log(`First sheet "${firstSheetName}" loaded. Total rows: ${jsonData.length}`);
    
    // Google Sheets exported xlsx sheets might have courses data. Let's inspect the structure.
    // We will parse all sheets to look for course-like structures or table headers.
    const coursesLoaded: Course[] = [];
    let idCounter = 1;

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json<any>(sheet);
      console.log(`Sheet "${sheetName}" object-based rows:`, rows.slice(0, 5));
      
      // Let's check sheet_to_json header extraction
      const rawRows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
      if (rawRows.length === 0) continue;

      // Let's identify columns based on typical excel structures or just extract content
      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.length < 2) continue;

        // Skip rows that look like labels, title cards or notes
        const rowStr = row.join(' ').toLowerCase();
        if (rowStr.includes('estandar') && rowStr.includes('no funciona') && rowStr.includes('funcional')) {
          console.log(`Skipping header legend row in sheet "${sheetName}":`, row);
          continue;
        }

        // Try to identify course rows: they usually have a name, a URL, a responsible and a status
        // Let's search for a cell containing "http" or "php?id=" (Moodle link) or looking like a link
        const urlIndex = row.findIndex((cell: any) => typeof cell === 'string' && (cell.includes('http://') || cell.includes('https://')));
        
        if (urlIndex !== -1) {
          const courseUrl = row[urlIndex];
          // Try to guess Name, Category, Responsible, Status
          // Usually name is before the URL or in column 0 or 1
          let courseName = '';
          let courseCategory = sheetName; // Default category is sheet name
          let courseResponsible = '';
          let courseStatus: 'green' | 'yellow' | 'red' = 'green';
          let courseProgress = 100;
          let courseNotes = '';

          // Let's search row elements for potential status: "FUNCIONAL", "ESTANDAR", "NO FUNCIONA", or green color or status strings
          for (let j = 0; j < row.length; j++) {
            const cellVal = String(row[j] || '').toUpperCase().trim();
            if (cellVal === 'ESTANDAR' || cellVal === 'FUNCIONAL COMPLETO' || cellVal === 'ESTÁNDAR') {
              courseStatus = 'green';
              courseProgress = 100;
            } else if (cellVal === 'FUNCIONAL' || cellVal === 'FUNCIONAL CON MEJORAS' || cellVal === 'CON MEJORAS' || cellVal === 'MEJORAR') {
              courseStatus = 'yellow';
              courseProgress = 75;
            } else if (cellVal === 'NO FUNCIONA' || cellVal === 'CRÍTICO' || cellVal === 'CRITICO' || cellVal === 'MALO' || cellVal === 'FALLA') {
              courseStatus = 'red';
              courseProgress = 20;
            }
          }

          // Search non-URL string fields for properties
          const textCellIndices = row
            .map((cell: any, idx: number) => ({val: cell, idx}))
            .filter((item: any) => typeof item.val === 'string' && item.val.trim().length > 3 && item.idx !== urlIndex);

          if (textCellIndices.length > 0) {
            // First long text is probably the course name
            courseName = textCellIndices[0].val;
            // Second text could be the responsible or category
            if (textCellIndices.length > 1) {
              const secondVal = textCellIndices[1].val;
              if (secondVal.includes(',') || secondVal.split(' ').length >= 2) {
                courseResponsible = secondVal;
              } else {
                courseCategory = secondVal;
              }
            }
            if (textCellIndices.length > 2) {
              const thirdVal = textCellIndices[2].val;
              if (!courseResponsible) {
                courseResponsible = thirdVal;
              } else {
                courseNotes = thirdVal;
              }
            }
          }

          if (!courseName) {
            courseName = `Curso Virtual #${idCounter}`;
          }

          // Determine banner image based on course title or category keywords
          const textToAnalyze = `${courseName} ${courseCategory}`.toLowerCase();
          let parsedImageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'; // general education fallback
          if (textToAnalyze.includes('data') || textToAnalyze.includes('analítica') || textToAnalyze.includes('big data') || textToAnalyze.includes('software') || textToAnalyze.includes('react') || textToAnalyze.includes('frontend')) {
            parsedImageUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'; // tech stats
          } else if (textToAnalyze.includes('gerencia') || textToAnalyze.includes('proyecto') || textToAnalyze.includes('administración')) {
            parsedImageUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'; // team business
          } else if (textToAnalyze.includes('pedagogía') || textToAnalyze.includes('diseño curricular') || textToAnalyze.includes('docencia') || textToAnalyze.includes('virtual')) {
            parsedImageUrl = 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80'; // learning whiteboard
          }

          coursesLoaded.push({
            id: String(idCounter++),
            name: courseName.trim(),
            url: courseUrl,
            progress: courseProgress,
            status: courseStatus,
            category: courseCategory.trim(),
            responsible: courseResponsible.trim() || 'Coordinación Virtual',
            notes: courseNotes.trim() || 'Cargado desde plantilla',
            imageUrl: parsedImageUrl
          });
        }
      }
    }

    if (coursesLoaded.length > 0) {
      console.log(`Successfully parsed ${coursesLoaded.length} courses from spreadsheet!`);
      return coursesLoaded;
    } else {
      console.log("No courses with URLs could be parsed. Fallback to backup database.");
      return parseSpreadsheetGenericFallback(jsonData) || BACKUP_COURSES;
    }
  } catch (error) {
    console.error("Error loading spreadsheet from Google Sheets:", error);
    return BACKUP_COURSES;
  }
}

// Helper to try parsing grid-based tabular sheet if URL cell search was too specific
function parseSpreadsheetGenericFallback(grid: any[][]): Course[] | null {
  if (!grid || grid.length < 2) return null;
  // Let's look for rows with 3+ columns that have values
  const list: Course[] = [];
  let id = 100;
  
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    if (!row || row.length < 3) continue;
    
    // Look for a cell that is a string and has at least some content like "Curso" or moodle structure
    const nameCandidate = row.find(c => typeof c === 'string' && c.length > 6 && !c.includes('http') && !c.includes('@'));
    const urlCandidate = row.find(c => typeof c === 'string' && c.startsWith('http'));
    
    if (nameCandidate && urlCandidate) {
      // Find category, or default to academic area
      let category = 'Virtualización';
      const categoryCandidate = row.find(c => typeof c === 'string' && c.length > 3 && c !== nameCandidate && c !== urlCandidate && !c.includes('@'));
      if (categoryCandidate) category = categoryCandidate;
      
      const responsibleCandidate = row.find(c => typeof c === 'string' && c.includes('@')) || 'Docente Asignado';
      
      let status: 'green' | 'yellow' | 'red' = 'green';
      let progress = 100;
      const progressCandidate = row.find(c => typeof c === 'number');
      if (progressCandidate) {
        progress = Math.min(100, Math.max(0, progressCandidate));
        status = progress === 100 ? 'green' : progress >= 60 ? 'yellow' : 'red';
      }

      const fallbackAnalyze = `${nameCandidate} ${category}`.toLowerCase();
      let fallbackImageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
      if (fallbackAnalyze.includes('data') || fallbackAnalyze.includes('analítica') || fallbackAnalyze.includes('software') || fallbackAnalyze.includes('react')) {
        fallbackImageUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
      } else if (fallbackAnalyze.includes('gerencia') || fallbackAnalyze.includes('proyecto') || fallbackAnalyze.includes('administración')) {
        fallbackImageUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80';
      }

      list.push({
        id: String(id++),
        name: nameCandidate,
        url: urlCandidate,
        progress,
        status,
        category,
        responsible: responsibleCandidate,
        notes: 'Importado de plantilla',
        imageUrl: fallbackImageUrl
      });
    }
  }
  return list.length > 0 ? list : null;
}

// Load current db from disk or init
function getCoursesDB(): Course[] {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error reading database file, using backup:", e);
      return BACKUP_COURSES;
    }
  } else {
    // If DB file does not exist, initialize it with backup.
    // We will attempt sheet sync concurrently or write backups first.
    fs.writeFileSync(DB_FILE, JSON.stringify(BACKUP_COURSES, null, 2), 'utf-8');
    return BACKUP_COURSES;
  }
}

function saveCoursesDB(courses: Course[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(courses, null, 2), 'utf-8');
}

// Background sync from Google Sheets to merge/enrich data if empty or requested
async function syncFromGoogleSheets() {
  const current = getCoursesDB();
  // Only auto-sync from sheets if db matches backups (mostly unedited)
  if (current.length === BACKUP_COURSES.length && current.every((c, i) => c.name === BACKUP_COURSES[i].name)) {
    console.log("Database matches backup. Attempting to seed from Google Sheets...");
    const sheetData = await initializeFromGoogleSheets();
    if (sheetData && sheetData.length > 0) {
      saveCoursesDB(sheetData);
      console.log("Database seeded from Google Sheets successfully.");
    }
  }
}

// Trigger background sheet load
syncFromGoogleSheets();

// API Endpoints

// GET /api/courses
app.get('/api/courses', (req, res) => {
  const courses = getCoursesDB();
  res.json({ courses });
});

// GET /api/courses/sync (Force spreadsheet reload)
app.get('/api/courses/sync', async (req, res) => {
  try {
    const sheetData = await initializeFromGoogleSheets();
    if (sheetData && sheetData.length > 0) {
      saveCoursesDB(sheetData);
      res.json({ success: true, count: sheetData.length, courses: sheetData });
    } else {
      res.status(500).json({ error: "No courses parsed from spreadsheet" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/courses
app.post('/api/courses', (req, res) => {
  const courses = getCoursesDB();
  const newCourse: Course = {
    id: String(Date.now()),
    name: req.body.name || 'Nuevo Curso',
    url: req.body.url || '',
    progress: Number(req.body.progress) || 0,
    status: req.body.status || 'red',
    category: req.body.category || 'Varios',
    responsible: req.body.responsible || 'Responsable',
    notes: req.body.notes || '',
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
  };
  courses.push(newCourse);
  saveCoursesDB(courses);
  res.json({ success: true, course: newCourse });
});

// PUT /api/courses/:id
app.put('/api/courses/:id', (req, res) => {
  const courses = getCoursesDB();
  const id = req.params.id;
  const idx = courses.findIndex(c => c.id === id);
  if (idx !== -1) {
    courses[idx] = {
      ...courses[idx],
      name: req.body.name !== undefined ? req.body.name : courses[idx].name,
      url: req.body.url !== undefined ? req.body.url : courses[idx].url,
      progress: req.body.progress !== undefined ? Number(req.body.progress) : courses[idx].progress,
      status: req.body.status !== undefined ? req.body.status : courses[idx].status,
      category: req.body.category !== undefined ? req.body.category : courses[idx].category,
      responsible: req.body.responsible !== undefined ? req.body.responsible : courses[idx].responsible,
      notes: req.body.notes !== undefined ? req.body.notes : courses[idx].notes,
      imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : courses[idx].imageUrl,
    };
    saveCoursesDB(courses);
    res.json({ success: true, course: courses[idx] });
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

// DELETE /api/courses/:id
app.delete('/api/courses/:id', (req, res) => {
  let courses = getCoursesDB();
  const id = req.params.id;
  const initialLen = courses.length;
  courses = courses.filter(c => c.id !== id);
  if (courses.length < initialLen) {
    saveCoursesDB(courses);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
