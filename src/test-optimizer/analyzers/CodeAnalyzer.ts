import { CodeChange } from '../core/types';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Analyzes code changes to identify affected areas and complexity
 */
export class CodeAnalyzer {

  /**
   * Analyze code changes and return affected file paths
   */
  async analyzeChanges(codeChanges: CodeChange[]): Promise<string[]> {
    const affectedAreas: Set<string> = new Set();
    
    for (const change of codeChanges) {
      affectedAreas.add(change.filePath);
      
      // Add related files based on imports/dependencies
      const relatedFiles = await this.findRelatedFiles(change.filePath);
      for (const file of relatedFiles) {
        affectedAreas.add(file);
      }
    }

    return Array.from(affectedAreas);
  }

  /**
   * Calculate code complexity for a given file
   */
  async calculateComplexity(filePath: string): Promise<number> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return this.calculateCyclomaticComplexity(content);
    } catch (error) {
      console.warn(`Error calculating complexity for ${filePath}:`, error);
      return 1; // Default complexity
    }
  }

  /**
   * Identify functions and classes affected by changes
   */
  async identifyAffectedSymbols(change: CodeChange): Promise<{functions: string[], classes: string[]}> {
    try {
      const content = await fs.promises.readFile(change.filePath, 'utf-8');
      const lines = content.split('\n');
      
      const affectedFunctions: Set<string> = new Set();
      const affectedClasses: Set<string> = new Set();

      // Simple pattern matching for TypeScript/JavaScript
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Function patterns
        const functionMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*[=:]/);
        if (functionMatch) {
          affectedFunctions.add(functionMatch[1]);
        }

        // Method patterns
        const methodMatch = line.match(/^\s*(\w+)\s*\(/);
        if (methodMatch) {
          affectedFunctions.add(methodMatch[1]);
        }

        // Class patterns
        const classMatch = line.match(/(?:class|interface)\s+(\w+)/);
        if (classMatch) {
          affectedClasses.add(classMatch[1]);
        }
      }

      return {
        functions: Array.from(affectedFunctions),
        classes: Array.from(affectedClasses)
      };
    } catch (error) {
      console.warn(`Error analyzing symbols in ${change.filePath}:`, error);
      return { functions: [], classes: [] };
    }
  }

  /**
   * Parse Git diff to extract detailed change information
   */
  parseGitDiff(diffContent: string): CodeChange[] {
    const changes: CodeChange[] = [];
    const lines = diffContent.split('\n');
    
    let currentFile = '';
    let linesAdded = 0;
    let linesDeleted = 0;
    let changeType: 'added' | 'modified' | 'deleted' | 'renamed' = 'modified';
    
    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        // Save previous file if exists
        if (currentFile) {
          changes.push({
            filePath: currentFile,
            changeType,
            linesAdded,
            linesDeleted,
            complexity: 1, // Will be calculated separately
            affectedFunctions: [],
            affectedClasses: [],
            diffContent: line
          });
        }
        
        // Start new file
        const fileMatch = line.match(/diff --git a\/(.+) b\/(.+)/);
        if (fileMatch) {
          currentFile = fileMatch[2];
          linesAdded = 0;
          linesDeleted = 0;
          changeType = 'modified';
        }
      } else if (line.startsWith('new file mode')) {
        changeType = 'added';
      } else if (line.startsWith('deleted file mode')) {
        changeType = 'deleted';
      } else if (line.startsWith('rename')) {
        changeType = 'renamed';
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        linesAdded++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        linesDeleted++;
      }
    }
    
    // Save last file
    if (currentFile) {
      changes.push({
        filePath: currentFile,
        changeType,
        linesAdded,
        linesDeleted,
        complexity: 1,
        affectedFunctions: [],
        affectedClasses: [],
        diffContent: diffContent
      });
    }

    return changes;
  }

  /**
   * Get code changes from Git repository
   */
  async getCodeChangesFromGit(commitHash?: string, baseBranch: string = 'main'): Promise<CodeChange[]> {
    try {
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);

      // First, try to get available references
      let command: string;
      try {
        // Check if we can access the base branch
        await execAsync(`git rev-parse ${baseBranch}`);
        command = commitHash 
          ? `git diff ${baseBranch}..${commitHash}`
          : `git diff ${baseBranch}..HEAD`;
      } catch (refError) {
        console.warn(`Base branch ${baseBranch} not available, using alternative approach`);
        // Fallback: try with origin/main
        try {
          await execAsync(`git rev-parse origin/${baseBranch}`);
          command = commitHash 
            ? `git diff origin/${baseBranch}..${commitHash}`
            : `git diff origin/${baseBranch}..HEAD`;
        } catch (originError) {
          console.warn(`origin/${baseBranch} also not available, using HEAD~1 as fallback`);
          // Last resort: compare with previous commit
          command = commitHash 
            ? `git show --name-only ${commitHash}`
            : `git diff HEAD~1..HEAD`;
        }
      }

      const { stdout } = await execAsync(command);
      const changes = this.parseGitDiff(stdout);

      // Enhance with complexity and symbol analysis
      for (const change of changes) {
        if (change.changeType !== 'deleted') {
          change.complexity = await this.calculateComplexity(change.filePath);
          const symbols = await this.identifyAffectedSymbols(change);
          change.affectedFunctions = symbols.functions;
          change.affectedClasses = symbols.classes;
        }
      }

      return changes;
    } catch (error) {
      console.warn('Error getting code changes from Git:', error);
      return [];
    }
  }

  // Private helper methods

  private async findRelatedFiles(filePath: string): Promise<string[]> {
    const relatedFiles: string[] = [];
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      
      // Find import statements
      const importMatches = content.match(/import .+ from ['"`]([^'"`]+)['"`]/g);
      if (importMatches) {
        for (const importMatch of importMatches) {
          const pathMatch = importMatch.match(/from ['"`]([^'"`]+)['"`]/);
          if (pathMatch) {
            const importPath = this.resolveImportPath(pathMatch[1], filePath);
            if (importPath) {
              relatedFiles.push(importPath);
            }
          }
        }
      }

      // Find require statements
      const requireMatches = content.match(/require\(['"`]([^'"`]+)['"`]\)/g);
      if (requireMatches) {
        for (const requireMatch of requireMatches) {
          const pathMatch = requireMatch.match(/require\(['"`]([^'"`]+)['"`]\)/);
          if (pathMatch) {
            const requirePath = this.resolveImportPath(pathMatch[1], filePath);
            if (requirePath) {
              relatedFiles.push(requirePath);
            }
          }
        }
      }
    } catch (error) {
      // File might not exist or be readable
    }

    return relatedFiles;
  }

  private resolveImportPath(importPath: string, currentFile: string): string | null {
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const currentDir = path.dirname(currentFile);
      const resolvedPath = path.resolve(currentDir, importPath);
      
      // Try common extensions
      const extensions = ['.ts', '.js', '.tsx', '.jsx'];
      for (const ext of extensions) {
        const fullPath = resolvedPath + ext;
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
      }
      
      // Try index files
      for (const ext of extensions) {
        const indexPath = path.join(resolvedPath, `index${ext}`);
        if (fs.existsSync(indexPath)) {
          return indexPath;
        }
      }
    }
    
    return null;
  }

  private calculateCyclomaticComplexity(content: string): number {
    let complexity = 1; // Base complexity
    
    // Count decision points that increase complexity
    const patterns = [
      /if\s*\(/g,
      /else if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g // Ternary operator
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }
}