import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  InsertTable,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  diffSourcePlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  toolbarPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { useEffect, useRef } from 'react'

function toolbarContents() {
  return (
    <DiffSourceToggleWrapper>
      <UndoRedo />
      <Separator />
      <BlockTypeSelect />
      <BoldItalicUnderlineToggles />
      <CodeToggle />
      <Separator />
      <ListsToggle />
      <CreateLink />
      <InsertTable />
      <InsertCodeBlock />
    </DiffSourceToggleWrapper>
  )
}

function editorPlugins(withToolbar) {
  const plugins = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    tablePlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'text' }),
    diffSourcePlugin({ viewMode: 'rich-text' }),
    markdownShortcutPlugin(),
  ]

  if (withToolbar) {
    plugins.push(toolbarPlugin({ toolbarContents }))
  }

  return plugins
}

function MarkdownEditor({
  autoFocus = false,
  className = '',
  onChange,
  placeholder = 'Write with Markdown...',
  readOnly = false,
  value,
}) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (readOnly) {
      editorRef.current?.setMarkdown(value || '')
    }
  }, [readOnly, value])

  return (
    <MDXEditor
      autoFocus={autoFocus}
      className={`markdown-editor ${readOnly ? 'markdown-editor--readonly' : ''} ${className}`.trim()}
      contentEditableClassName="markdown-editor__content"
      markdown={value || ''}
      onChange={(markdown, initialMarkdownNormalize) => {
        if (!readOnly && !initialMarkdownNormalize) {
          onChange?.(markdown)
        }
      }}
      placeholder={placeholder}
      plugins={editorPlugins(!readOnly)}
      readOnly={readOnly}
      ref={editorRef}
    />
  )
}

export default MarkdownEditor
