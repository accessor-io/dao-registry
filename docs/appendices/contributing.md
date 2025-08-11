# Contributing Guidelines

## How to Contribute

We welcome contributions from the community! This document outlines the process for contributing to the DAO Registry project.

### Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/dao-registry.git
   cd dao-registry
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. **Make your changes**
2. **Write tests** for new functionality
3. **Update documentation** as needed
4. **Run tests and linting**
   ```bash
   npm test
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a pull request**

### Code Style Guidelines

#### JavaScript/TypeScript
- Use **ESLint** and **Prettier**
- Follow **Airbnb style guide**
- Use **TypeScript** for type safety
- Write **JSDoc comments** for functions

#### Solidity
- Use **Solidity Style Guide**
- Follow **OpenZeppelin patterns**
- Write **NatSpec comments**
- Use **Hardhat** for development

#### Git Commit Messages
- Use **Conventional Commits**
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Guidelines

1. **Clear description** of changes
2. **Link to issues** if applicable
3. **Include tests** for new features
4. **Update documentation** as needed
5. **Screenshots** for UI changes
6. **Self-review** before submitting

### Issue Reporting

When reporting issues, please include:
- **Clear description** of the problem
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Environment details** (OS, Node.js version, etc.)
- **Screenshots** if applicable

### Code Review Process

1. **Automated checks** must pass
2. **At least one review** from maintainers
3. **All feedback** must be addressed
4. **Documentation updated** if needed
5. **Tests added** for new features

### Release Process

1. **Version bump** in package.json
2. **Changelog updated**
3. **Documentation updated**
4. **Tests passing**
5. **Code review completed**
6. **Merged to main branch**

### Community Guidelines

- **Be respectful** and inclusive
- **Help others** learn and grow
- **Share knowledge** and best practices
- **Follow the code of conduct**

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Join developer discussions
- **Documentation**: Check technical docs
- **Code Reviews**: Submit pull requests for review

---

*Last updated: July 2024*