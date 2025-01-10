const checkEditorType = () =>
  figma.ui.postMessage({
    type: 'CHECK_EDITOR_TYPE',
    id: figma.currentUser?.id,
    data: figma.vscode ? 'dev_vscode' : figma.editorType,
  })

export default checkEditorType
