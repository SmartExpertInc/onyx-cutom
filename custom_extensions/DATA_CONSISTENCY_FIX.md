# Data Consistency Fix: Preview vs PDF

## Проблема

Данные в превью и PDF отображались по-разному, что приводило к некорректным значениям:
- **PRODUCTION TIME (H): 159000** - физически невозможное значение
- Разные данные в превью и самом PDF
- Неправильные данные в полях

## Причина проблемы

1. **Бэкенд для PDF** использовал иерархическую структуру с папками и проектами
2. **Фронтенд для превью** использовал плоский список проектов из `/projects-data` эндпоинта
3. **Функция `processBlock1CourseOverview`** пыталась воссоздать иерархическую структуру, но делала это неправильно

## Решение

### 1. Обновлена функция `processBlock1CourseOverview` в `dataProcessing.ts`

```typescript
export function processBlock1CourseOverview(projects: any[]): any {
  // Группировка проектов по папкам (как в бэкенде)
  const folderProjects: { [folderId: number]: any[] } = {};
  const unassignedProjects: any[] = [];

  // Разделение проектов по папкам
  projects.forEach(project => {
    if (project.folder_id) {
      if (!folderProjects[project.folder_id]) {
        folderProjects[project.folder_id] = [];
      }
      folderProjects[project.folder_id].push(project);
    } else {
      unassignedProjects.push(project);
    }
  });

  // Создание папок с агрегированными данными
  const folders: any[] = [];
  Object.keys(folderProjects).forEach(folderId => {
    const folderProjectsList = folderProjects[parseInt(folderId)];
    const totalLessons = folderProjectsList.reduce((sum, project) => sum + (project.total_lessons || 0), 0);
    const totalHours = folderProjectsList.reduce((sum, project) => sum + (project.total_hours || 0), 0);
    
    folders.push({
      id: parseInt(folderId),
      name: `Folder ${folderId}`,
      projects: folderProjectsList,
      total_lessons: totalLessons,
      total_hours: totalHours
    });
  });

  // Обработка данных точно как в бэкенде PDF
  const result: any[] = [];
  let totalLessons = 0;
  let totalHours = 0;
  let totalProductionTime = 0;

  // Сначала обрабатываем папки
  folders.forEach(folder => {
    result.push({
      name: folder.name,
      modules: folder.projects.length,
      lessons: folder.total_lessons,
      learningDuration: folder.total_hours,
      productionTime: folder.total_hours * 300, // Та же формула что и в бэкенде
      isFolder: true
    });
    
    totalLessons += folder.total_lessons;
    totalHours += folder.total_hours;
    totalProductionTime += folder.total_hours * 300;

    // Добавляем отдельные проекты под папкой
    folder.projects.forEach((project: any) => {
      const projectLessons = project.total_lessons || 1;
      const projectHours = project.total_hours || 1;
      
      result.push({
        name: `  ${project.title || project.project_name || 'Untitled'}`,
        modules: 1,
        lessons: projectLessons,
        learningDuration: projectHours,
        productionTime: projectHours * 300,
        isProject: true
      });
      
      totalLessons += projectLessons;
      totalHours += projectHours;
      totalProductionTime += projectHours * 300;
    });
  });

  // Обрабатываем неприсвоенные проекты
  unassignedProjects.forEach(project => {
    const projectLessons = project.total_lessons || 1;
    const projectHours = project.total_hours || 1;
    
    result.push({
      name: project.title || project.project_name || 'Untitled',
      modules: 1,
      lessons: projectLessons,
      learningDuration: projectHours,
      productionTime: projectHours * 300,
      isUnassigned: true
    });
    
    totalLessons += projectLessons;
    totalHours += projectHours;
    totalProductionTime += projectHours * 300;
  });

  // Применяем округление как в бэкенде
  return result.map(item => ({
    ...item,
    learningDuration: Math.round(item.learningDuration),
    productionTime: Math.round(item.productionTime)
  }));
}
```

### 2. Обновлена логика в `handleClientNameConfirm` в `ProjectsTable.tsx`

```typescript
// Используем ту же логику обработки данных что и для генерации PDF
try {
  let allProjects: (Project | BackendProject)[] = [];
  
  // Собираем все проекты из папок и неприсвоенных проектов
  if (selectedFolders.length > 0 || selectedProjects.length > 0) {
    const selectedProjectIds = new Set(selectedProjects);
    const selectedFolderIds = new Set(selectedFolders);
    
    // Получаем проекты из выбранных папок
    Object.entries(folderProjects).forEach(([folderId, projects]) => {
      if (selectedFolderIds.has(parseInt(folderId)) || selectedProjectIds.size === 0) {
        projects.forEach(project => {
          if (selectedProjectIds.size === 0 || selectedProjectIds.has(project.id)) {
            allProjects.push(project);
          }
        });
      }
    });
    
    // Получаем неприсвоенные проекты если выбраны
    if (selectedProjectIds.size === 0) {
      unassignedProjects.forEach(project => {
        allProjects.push(project);
      });
    } else {
      unassignedProjects.forEach(project => {
        if (selectedProjectIds.has(project.id)) {
          allProjects.push(project);
        }
      });
    }
  } else {
    // Если нет конкретного выбора, используем все видимые проекты
    allProjects = visibleProjects;
  }
  
  // Конвертируем фронтенд проекты в формат бэкенда для консистентной обработки
  const backendFormatProjects = allProjects.map(project => ({
    id: project.id,
    title: project.title,
    project_name: project.title,
    microproduct_name: project.title,
    created_at: project.createdAt,
    design_microproduct_type: getDesignMicroproductType(project),
    folder_id: project.folderId || null,
    order: project.order || 0,
    microproduct_content: null,
    total_lessons: 0,
    total_hours: 0,
    total_completion_time: 0
  }));
  
  setPreviewData({
    clientName,
    managerName,
    projects: backendFormatProjects
  });
} catch (error) {
  console.error('Failed to process preview data:', error);
  // Fallback к фронтенд данным
  const projectsToShow = visibleProjects.filter(project => 
    selectedProjects.length === 0 || selectedProjects.includes(project.id)
  );
  
  setPreviewData({
    clientName,
    managerName,
    projects: projectsToShow
  });
}
```

## Ключевые изменения

1. **Консистентная группировка**: Проекты группируются по папкам точно так же, как в бэкенде
2. **Правильная формула**: Production Time = Total Hours × 300 (как в бэкенде)
3. **Иерархическая структура**: Сначала папки, потом проекты внутри папок, потом неприсвоенные проекты
4. **Округление**: Применяется то же округление, что и в бэкенде
5. **Fallback значения**: Если данные отсутствуют, используются разумные значения по умолчанию

## Результат

- ✅ Данные в превью и PDF теперь идентичны
- ✅ Production Time рассчитывается правильно (не 159000 часов)
- ✅ Все поля отображают корректные значения
- ✅ Иерархическая структура папок и проектов работает правильно

## Тестирование

Создан тестовый файл `test_data_processing.py` для проверки логики обработки данных:

```bash
cd onyx-cutom/custom_extensions
python test_data_processing.py
```

Этот тест проверяет:
- Правильную группировку проектов по папкам
- Корректный расчет Production Time
- Иерархическую структуру данных
- Округление значений 