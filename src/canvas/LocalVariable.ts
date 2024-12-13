export default class LocalVariable {
  private variable: Variable | undefined

  constructor(variable?: Variable) {
    this.variable = variable
  }

  makeCollection = (name: string) => {
    const collection = figma.variables.createVariableCollection(name)

    return collection
  }

  makeVariable = (
    name: string,
    collection: VariableCollection,
    description: string
  ) => {
    this.variable = figma.variables.createVariable(name, collection, 'COLOR')
    this.variable.description = description

    return this.variable
  }
}
