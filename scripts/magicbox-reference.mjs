import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const packageName = '@minifield-labs/magicbox';

/** @returns {Promise<Record<string, string>>} */
export async function magicboxReferences() {
  const options = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
  };
  const importer = fileURLToPath(new URL('../src/content.ts', import.meta.url));
  const resolved = ts.resolveModuleName(packageName, importer, options, ts.sys).resolvedModule;
  if (!resolved) {
    throw new Error(`Cannot resolve ${packageName} declarations. Run npm ci before building the API reference.`);
  }

  const program = ts.createProgram([resolved.resolvedFileName], options);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(resolved.resolvedFileName);
  const module = source && checker.getSymbolAtLocation(source);
  if (!module) throw new Error(`Cannot read public exports from ${resolved.resolvedFileName}.`);
  const exports = checker.getExportsOfModule(module);

  return Object.fromEntries([
    ['magicbox-props', 'MagicBoxProps'],
    ['magicbox-controller', 'MagicBoxController'],
    ['magicbox-span', 'MagicBoxSpan'],
  ].map(([key, name]) => {
    const exported = exports.find((symbol) => symbol.name === name);
    if (!exported) {
      throw new Error(`${packageName} no longer exports ${name}. Update content/magicbox-api.md and its reference generator.`);
    }
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declaration = symbol.declarations?.find(ts.isInterfaceDeclaration);
    if (!declaration) throw new Error(`${packageName}.${name} must be an interface. Update its reference generator for the new declaration.`);
    const properties = checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol));
    if (!properties.length) throw new Error(`${packageName}.${name} has no readable properties.`);

    const typeParameters = declaration.typeParameters?.map((parameter) => parameter.getText()).join(', ');
    const signature = typeParameters ? `${name}<${typeParameters}>` : name;
    const descriptions = [];
    const rows = properties.map((property) => {
      const member = property.valueDeclaration;
      if (!member) throw new Error(`${packageName}.${name}.${property.name} has no declaration.`);
      // Preserve native React aliases on local properties. Resolve inherited generics through the checker.
      const type = member.parent === declaration && ts.isPropertySignature(member) && member.type
        ? member.type.getText()
        : checker.typeToString(checker.getTypeOfSymbolAtLocation(property, declaration), declaration,
          ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
      const description = ts.displayPartsToString(property.getDocumentationComment(checker)).trim();
      if (description) descriptions.push(`- ${code(property.name)}: ${escapeText(description)}`);
      const required = property.flags & ts.SymbolFlags.Optional ? 'No' : 'Yes';
      return `| ${code(property.name)} | ${code(type)} | ${required} |`;
    });

    return [key, [
      code(signature),
      '| Field | Type | Required |\n| --- | --- | --- |\n' + rows.join('\n'),
      descriptions.join('\n'),
    ].filter(Boolean).join('\n\n')];
  }));
}

function code(value) {
  return `<code>${escapeText(value)}</code>`;
}

function escapeText(value) {
  return value.replace(/\s+/g, ' ').replace(/[&<>|`*_[\]\\]/g, (character) => `&#${character.charCodeAt(0)};`);
}
