.PHONY: help dev dev-down build prod prod-down logs backend-shell frontend-shell \
        migrate migrate-create seed test test-backend test-frontend lint clean

help:
	@echo "Memorix — available commands:"
	@echo "  make dev              Start local dev stack (hot reload)"
	@echo "  make dev-down         Stop dev stack"
	@echo "  make build            Build all images"
	@echo "  make prod             Start production stack"
	@echo "  make prod-down        Stop production stack"
	@echo "  make logs             Tail logs from dev stack"
	@echo "  make migrate          Apply latest Alembic migrations"
	@echo "  make migrate-create   Create a new Alembic migration (m='message')"
	@echo "  make seed             Seed the database with demo data"
	@echo "  make test             Run backend + frontend test suites"
	@echo "  make test-backend     Run backend pytest suite"
	@echo "  make test-frontend    Run frontend vitest suite"
	@echo "  make lint             Run frontend ESLint"
	@echo "  make clean            Remove containers, volumes, and build artifacts"

dev:
	docker compose up --build

dev-down:
	docker compose down

build:
	docker compose build

prod:
	docker compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.prod.yml down

logs:
	docker compose logs -f

migrate:
	docker compose exec backend alembic upgrade head

migrate-create:
	docker compose exec backend alembic revision --autogenerate -m "$(m)"

seed:
	docker compose exec backend python -m scripts.seed

test: test-backend test-frontend

test-backend:
	cd backend && python -m pytest tests/ -v

test-frontend:
	cd frontend && npx vitest run

lint:
	cd frontend && npx eslint .

clean:
	docker compose down -v --remove-orphans
	rm -rf frontend/dist frontend/node_modules backend/__pycache__
