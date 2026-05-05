const SearchRepository = require('../repositories/searchRepository');
const Todo = require('../repositories/todoRepository');
const Notebook = require('../repositories/notebookRepository');
const BHPSLogic = require('../controllers/bhpsLogic');

const EMPTY_RESULTS = {
  workspace: [],
  tasks: [],
  notes: [],
  chapters: [],
  resources: [],
  recommendations: [],
};

function excerpt(value, query, maxLength = 140) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  const start = index > 36 ? index - 36 : 0;
  const slice = text.slice(start, start + maxLength);
  return `${start > 0 ? '...' : ''}${slice}${start + maxLength < text.length ? '...' : ''}`;
}

function uniqueIds(values) {
  return new Set(values.filter(Boolean).map((value) => String(value)));
}

function buildContext(results) {
  const folderIds = uniqueIds([
    ...results.workspace.filter((item) => item.type === 'folder').map((item) => item.id),
    ...results.workspace.filter((item) => item.type === 'notebook').map((item) => item.folder_id),
    ...results.tasks.map((item) => item.folder_id),
    ...results.notes.map((item) => item.folder_id),
  ]);

  const notebookIds = uniqueIds([
    ...results.workspace.filter((item) => item.type === 'notebook').map((item) => item.id),
    ...results.tasks.map((item) => item.notebook_id),
    ...results.notes.map((item) => item.notebook_id),
    ...results.chapters.map((item) => item.notebook_id),
    ...results.resources.map((item) => item.notebook_id || item.chapter_notebook_id),
  ]);

  return { folderIds, notebookIds };
}

function relatedTodos(userId, results) {
  const todos = Todo.findAllByUser(userId).filter((todo) => todo.is_completed === 0);
  const notebooks = Notebook.findAllByUser(userId);
  const notebookFolderIds = new Map(notebooks.map((notebook) => [String(notebook.id), notebook.folder_id]));
  const { folderIds, notebookIds } = buildContext(results);

  let related = todos.filter((todo) => {
    const todoNotebookId = todo.notebook_id ? String(todo.notebook_id) : null;
    const todoFolderId = todo.folder_id || notebookFolderIds.get(String(todo.notebook_id));

    return (todoNotebookId && notebookIds.has(todoNotebookId))
      || (todoFolderId && folderIds.has(String(todoFolderId)));
  });

  if (related.length === 0) related = todos;

  return BHPSLogic.rankTodos(related).slice(0, 5);
}

function normalizeWorkspace(folders, notebooks) {
  return [
    ...folders.map((folder) => ({
      ...folder,
      type: 'folder',
      subtitle: 'Folder',
    })),
    ...notebooks.map((notebook) => ({
      ...notebook,
      type: 'notebook',
      subtitle: 'Notebook',
    })),
  ];
}

class SearchService {
  static search(userId, query = '') {
    const q = String(query || '').trim();
    if (!q) return { status: 200, body: { query: q, ...EMPTY_RESULTS } };

    const folders = SearchRepository.searchFolders(userId, q);
    const notebooks = SearchRepository.searchNotebooks(userId, q);
    const tasks = BHPSLogic.rankTodos(SearchRepository.searchTodos(userId, q));
    const notes = SearchRepository.searchNotes(userId, q).map((note) => ({
      ...note,
      excerpt: excerpt(`${note.title} ${note.content}`, q),
    }));
    const chapters = SearchRepository.searchChapters(userId, q).map((chapter) => ({
      ...chapter,
      excerpt: excerpt(`${chapter.title} ${chapter.content}`, q),
    }));
    const resources = SearchRepository.searchResources(userId, q).map((resource) => ({
      ...resource,
      notebook_id: resource.notebook_id || resource.chapter_notebook_id,
    }));

    const results = {
      workspace: normalizeWorkspace(folders, notebooks),
      tasks,
      notes,
      chapters,
      resources,
    };

    return {
      status: 200,
      body: {
        query: q,
        ...results,
        recommendations: relatedTodos(userId, results),
      },
    };
  }
}

module.exports = SearchService;
