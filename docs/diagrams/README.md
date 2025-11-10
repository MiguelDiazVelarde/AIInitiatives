# PR Validation Workflow Diagrams

This directory contains sequence diagrams for the Pull Request validation workflow.

## 📊 Available Files

### 1. **pr-validation-sequence.md** (Mermaid)

- ✅ **Recommended**: Renders automatically on GitHub
- Includes 4 different diagrams:
  - Complete sequence
  - Line 368 flowchart
  - State diagram
  - AI Optimizer graph
- **View**: Open directly on GitHub

### 2. **pr-validation.puml** (PlantUML)

- For technical documentation
- More detailed than Mermaid
- **View online**: <https://www.plantuml.com/plantuml/uml/>
- **View locally**: Install PlantUML extension in VS Code

### 3. **pr-validation.drawio**

- Editable format in Diagrams.net
- **Open in**: <https://app.diagrams.net/>
- **Or use**: Draw.io Integration extension in VS Code

## 🎯 Focus: Line 368

All diagrams highlight the execution of:

```bash
npx ts-node src/test-optimizer/index.ts execute
```

This is the point where the AI Test Optimizer:

1. Reads the previously generated optimization plan
2. Selects tests based on PR changes
3. Executes tests with Cucumber
4. Generates reports and updates history

## 🚀 How to Use

### View on GitHub (Mermaid)

1. Navigate to `pr-validation-sequence.md` on GitHub
2. Diagrams render automatically

### Edit PlantUML

```bash
# Install extension
code --install-extension jebbs.plantuml

# Or use online
# Copy pr-validation.puml content
# Paste at https://www.plantuml.com/plantuml/uml/
```

### Export to PNG/SVG

#### From Mermaid

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i pr-validation-sequence.md -o output.png
```

#### From PlantUML

```bash
# With Java installed
plantuml pr-validation.puml
```

## 📖 References

- [Mermaid Documentation](https://mermaid.js.org/)
- [PlantUML Guide](https://plantuml.com/)
- [Diagrams.net](https://app.diagrams.net/)

## 🎨 Legend

| Symbol | Meaning |
|--------|---------|
| 🔐 | Priority authentication flow |
| 🤖 | AI Test Optimizer in action |
| 🔥 | Fallback to smoke tests |
| ✅ | Successful operation |
| ❌ | Error / Correction required |
| ⚠️ | Warning / Continues |
