# Contributing to ClassSync

Thank you for your interest in contributing to ClassSync! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include a clear description of the bug
- Provide steps to reproduce the issue
- Include your environment details (OS, Node.js version, etc.)

### Suggesting Features
- Use the GitHub issue tracker
- Describe the feature and its benefits
- Consider implementation complexity
- Check if similar features have been requested

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Git

### Local Development
```bash
# Clone your fork
git clone https://github.com/yourusername/classsync.git
cd classsync

# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up environment variables
cd ../server
cp env.example .env
# Edit .env with your configuration

# Start development servers
cd ../server && npm run dev
cd ../client && npm run dev
```

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Follow strict type checking
- Use interfaces for object shapes
- Prefer `const` over `let` when possible
- Use meaningful variable and function names

### React Components
- Use functional components with hooks
- Follow the naming convention: `PascalCase`
- Keep components focused and single-purpose
- Use TypeScript interfaces for props

### Backend Code
- Use async/await for asynchronous operations
- Implement proper error handling
- Use middleware for common functionality
- Follow RESTful API conventions

### General
- Write meaningful commit messages
- Keep functions small and focused
- Add comments for complex logic
- Follow existing code patterns

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

### Writing Tests
- Write tests for new features
- Ensure good test coverage
- Use descriptive test names
- Test both success and error cases

## 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use a clear title
   - Describe the changes in detail
   - Reference any related issues
   - Include screenshots for UI changes

### Commit Message Format
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🔍 Code Review Process

1. **Automated Checks**
   - All tests must pass
   - Code linting must pass
   - TypeScript compilation must succeed

2. **Manual Review**
   - At least one maintainer must approve
   - Code follows project guidelines
   - Documentation is updated if needed

3. **Merge**
   - Squash commits if needed
   - Delete feature branch after merge

## 🐛 Bug Fixes

When fixing bugs:
1. Create a test that reproduces the bug
2. Fix the bug
3. Ensure the test now passes
4. Add additional tests if needed

## 🚀 Feature Development

When adding features:
1. Discuss the feature in an issue first
2. Create a detailed implementation plan
3. Implement the feature with tests
4. Update documentation
5. Add examples if applicable

## 📚 Documentation

- Update README.md for user-facing changes
- Update API documentation for backend changes
- Add inline comments for complex code
- Update contributing guidelines if needed

## 🎯 Areas for Contribution

### High Priority
- Bug fixes
- Security improvements
- Performance optimizations
- Accessibility improvements

### Medium Priority
- New features
- UI/UX improvements
- Code refactoring
- Test coverage improvements

### Low Priority
- Documentation updates
- Code style improvements
- Minor UI tweaks

## 🆘 Getting Help

If you need help:
- Check existing issues and pull requests
- Ask questions in GitHub discussions
- Contact maintainers directly
- Join our community chat (if available)

## 📄 License

By contributing to ClassSync, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes
- Community acknowledgments

Thank you for contributing to ClassSync! 🎉 