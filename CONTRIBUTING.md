# Contributing to ODUS

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=flat-square)
![PRs](https://img.shields.io/badge/PRs-Open-blue?style=flat-square)

Thank you for your interest in contributing to ODUS! This document provides guidelines and instructions for contributing.

---

## 🌟 Ways to Contribute

- 🐛 **Report Bugs**: Submit detailed bug reports with reproduction steps
- ✨ **Suggest Features**: Propose new features or improvements
- 📝 **Improve Documentation**: Fix typos, clarify explanations, add examples
- 💻 **Submit Code**: Fix bugs, implement features, optimize performance
- 🎨 **Design**: Improve UI/UX, create icons, design mockups
- 🧪 **Testing**: Write tests, perform QA, test edge cases

---

## 🚀 Getting Started

### 1. Fork the Repository
Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/ODUS.git
cd ODUS
```

### 3. Set Up Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `perf/` - Performance improvements
- `test/` - Adding or updating tests

---

## 📋 Development Guidelines

### Code Style

#### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Prefer explicit types over `any`
- Use interfaces for object shapes

**Example:**
```typescript
interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}
```

#### Angular Components
- Use standalone components
- Prefer signals over observables for local state
- Use `@Input()` and `@Output()` for component communication
- Follow Angular style guide

**Example:**
```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule],
  template: `...`
})
export class MyComponent {
  data = signal<Data[]>([]);
  @Output() change = new EventEmitter<string>();
}
```

#### Services
- Use `@Injectable({ providedIn: 'root' })` for singleton services
- Use signals for reactive state
- Document public methods with JSDoc

**Example:**
```typescript
@Injectable({
  providedIn: 'root'
})
export class MyService {
  private dataState = signal<Data[]>([]);
  readonly data = this.dataState.asReadonly();

  /**
   * Adds a new data item
   * @param item Data to add
   */
  addData(item: Data): void {
    this.dataState.update(prev => [...prev, item]);
  }
}
```

### Formatting
- Indent with 2 spaces
- Use single quotes for strings
- Add trailing commas
- Max line length: 120 characters
- Use semicolons

### Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add mind map export functionality
fix: resolve dependency graph rendering issue
docs: update API reference for WorkspaceService
refactor: extract duration calculation to helper
perf: optimize success roadmap rendering
test: add unit tests for ProjectService
```

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

---

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Writing Tests
- Write unit tests for new features
- Ensure tests pass before submitting PR
- Aim for >80% code coverage on new code
- Test edge cases and error handling

---

## 📝 Pull Request Process

### 1. Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] Tests added/updated
- [ ] Build passes (`npm run build`)
- [ ] No console errors or warnings

### 2. Creating the PR

**Title Format:**
```
feat: add keyboard shortcuts to mind board
fix: resolve task dependency calculation bug
docs: improve deployment guide
```

**Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Build passes
```

### 3. Review Process

- Maintainers will review your PR
- Address feedback and requested changes
- Keep PR focused (one feature/fix per PR)
- Be responsive to comments

### 4. After Merge

- Delete your branch (optional)
- Pull latest changes to stay updated
- Celebrate! 🎉

---

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** - Your bug may already be reported
2. **Update to latest version** - Bug might be fixed
3. **Reproduce consistently** - Ensure it's reproducible

### Bug Report Template

```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
If applicable

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- ODUS Version: [e.g., 1.0.0-beta]

**Additional Context:**
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description:**
Clear description of the feature

**Problem Statement:**
What problem does this solve?

**Proposed Solution:**
How should it work?

**Alternatives Considered:**
Other approaches you've thought about

**Additional Context:**
Mockups, examples, references
```

---

## 🎯 Priority Labels

Issues and PRs are labeled by priority:

- `priority: critical` - Security issues, data loss, crashes
- `priority: high` - Major features, important bugs
- `priority: medium` - Enhancements, minor bugs
- `priority: low` - Nice-to-have features, documentation

---

## 📚 Documentation

### Updating Documentation

- Update `/docs` for feature changes
- Update `README.md` for project-level changes
- Update `API Reference` for API changes
- Include code examples where helpful
- Keep language clear and concise

### Documentation Structure

```
docs/
├── getting-started.md    # User onboarding
├── features.md           # Feature descriptions
├── architecture.md       # Technical architecture
├── api-reference.md      # API documentation
└── deployment.md         # Deployment instructions
```

---

## 🤝 Code of Conduct

### Our Standards

- **Be Respectful**: Treat everyone with respect
- **Be Inclusive**: Welcome diverse perspectives
- **Be Constructive**: Provide helpful feedback
- **Be Professional**: Maintain professionalism
- **Be Patient**: Help others learn

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing private information
- Other unprofessional conduct

### Enforcement

Violations may result in temporary or permanent ban from the project.

---

## 📞 Communication

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas
- **Pull Requests**: Code contributions
- **Email**: [For sensitive issues only]

---

## 🏆 Recognition

Contributors will be:
- Listed in project contributors
- Credited in release notes (for significant contributions)
- Acknowledged in documentation (for major features)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions make ODUS better for everyone. We appreciate your time and effort!

---

**Questions?** Open a [GitHub Discussion](https://github.com/amuzetnoM/ODUS/discussions) or comment on a related issue.

---

<div align="center">

**Happy Contributing! 🚀**

[Back to README](./README.md) • [Documentation](./docs) • [API Reference](./docs/api-reference.md)

</div>
