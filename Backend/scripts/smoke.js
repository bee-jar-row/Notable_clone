const path = require('path')

const root = path.join(__dirname, '..')

const repositories = [
  'userRepository',
  'todoRepository',
  'folderRepository',
  'notebookRepository',
  'chapterRepository',
  'noteRepository',
  'resourceRepository',
  'focusSessionRepository',
  'searchRepository',
]

const routeModules = [
  ['auth', 'auth.routes'],
  ['settings', 'settings.routes'],
  ['todos', 'todos.routes'],
  ['notes', 'notes.routes'],
  ['focus', 'focus.routes'],
  ['workspace', 'workspace.routes'],
  ['notebooks', 'notebooks.routes'],
  ['chapters', 'chapters.routes'],
  ['resources', 'resources.routes'],
  ['calendar', 'calendar.routes'],
  ['search', 'search.routes'],
]

function routeRows(router) {
  return router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) => {
      const methods = Object.keys(layer.route.methods)
        .filter((method) => layer.route.methods[method])
        .map((method) => method.toUpperCase())
        .sort()

      return methods.map((method) => `${method} ${layer.route.path}`)
    })
}

function requireFromRoot(relativePath) {
  return require(path.join(root, relativePath))
}

function main() {
  requireFromRoot('src/db')

  repositories.forEach((repositoryName) => {
    requireFromRoot(`src/repositories/${repositoryName}`)
  })

  console.log('Backend smoke route map:')

  routeModules.forEach(([label, filename]) => {
    const router = requireFromRoot(`src/routes/modules/${filename}`)
    const rows = routeRows(router)

    if (!rows.length) {
      throw new Error(`Route module ${filename} has no registered routes`)
    }

    rows.forEach((row) => {
      console.log(`- ${label}: ${row}`)
    })
  })

  console.log('Backend smoke passed.')
}

main()
