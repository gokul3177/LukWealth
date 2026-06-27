# LukWealth Contributing Guidelines

Thank you for your interest in contributing to LukWealth! 

## Getting Started

1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes using Conventional Commits (`git commit -m 'feat: added amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Coding Standards

- **Backend**: Use `async/await` syntax. Never use raw `SELECT *` in production code. Ensure all database calls use parameterized queries to prevent SQL Injection.
- **Frontend**: Functional components with hooks. Use Tailwind CSS for styling. Keep components small and modular.
- **Security**: Never commit `.env` files or hardcode secrets. 

## Testing

*(Testing suite upcoming)*. For now, ensure you manually verify:
- Registration and Approval flow
- RBAC constraints (users cannot access `/admin` endpoints)
- UI responsiveness on mobile and desktop displays.
