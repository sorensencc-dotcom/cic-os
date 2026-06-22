#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let name = process.argv[2];

if (name === "add") {
  name = process.argv[3];
}

if (!name) {
  process.stderr.write("Usage: npm run cic-ui -- button\n");
  process.stderr.write("   or: npm run cic-ui add button\n");
  process.exit(1);
}

const Name = name.charAt(0).toUpperCase() + name.slice(1);

const root = process.cwd();
const configPath = path.join(root, "cic-ui/config.json");

if (!fs.existsSync(configPath)) {
  process.stderr.write(`Config not found at ${configPath}\n`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const templateDir = path.join(__dirname, "templates");

function generate(template, dest) {
  const templatePath = path.join(templateDir, template);
  if (!fs.existsSync(templatePath)) {
    process.stderr.write(`Template not found: ${templatePath}\n`);
    return;
  }

  const content = fs
    .readFileSync(templatePath, "utf8")
    .replace(/{{name}}/g, name)
    .replace(/{{Name}}/g, Name);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

generate("component.tsx", path.join(root, config.componentDir, `${Name}.tsx`));
generate("styles.css", path.join(root, config.styleDir, `${name}.css`));
generate("story.tsx", path.join(root, config.storyDir, `${Name}.stories.tsx`));
generate("test.tsx", path.join(root, config.testDir, `${Name}.test.tsx`));
generate("visual.spec.ts", path.join(root, config.visualDir, `${Name}.spec.ts`));
generate("token-map.md", path.join(root, config.tokenMapDir, `${Name}.md`));

const indexPath = path.join(root, config.componentDir, "index.ts");
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, "utf8");
  if (!indexContent.includes(`export * from "./${Name}"`)) {
    fs.appendFileSync(indexPath, `export * from "./${Name}";\n`);
  }
}
