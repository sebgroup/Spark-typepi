import { Import } from './types'

export const formatImports = (imports: Import[]) => {
  const rows: string[] = []

  const importsMap = imports.reduce((map, it) => {
    if (!map[it.file]) map[it.file] = new Set<string>()
    map[it.file].add(it.type)
    return map
  }, {} as Record<string, Set<string>>)

  Object.entries(importsMap).forEach(([file, types]) => {
    rows.push(`import { ${Array.from(types).join(', ')} } from './${file}'`)
  })

  return rows
}
