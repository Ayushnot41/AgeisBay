.PHONY: up audit verify test graph help clean

PYTHON := python

help:
	@echo "AegisBay Control Automation"
	@echo "  make up      - Launch Trusted Mediator and Web SecOps Console"
	@echo "  make test    - Run 6-fault paired experiment test suite"
	@echo "  make verify  - Run standalone offline Ed25519 & Merkle audit CLI"
	@echo "  make audit   - Run complete paired fault experiments and produce verification receipt"
	@echo "  make graph   - Generate AST architecture dependency graph (graphify)"
	@echo "  make clean   - Purge ephemeral runtime databases and pycache"

up:
	$(PYTHON) -m services.mediator.app

test:
	pytest -v harness/test_paired_faults.py

verify:
	$(PYTHON) -m services.verifier.verify_cli --checkpoint data/latest_checkpoint.json

audit:
	$(PYTHON) harness/run_paired_experiments.py
	$(PYTHON) -m services.verifier.verify_cli --checkpoint data/latest_checkpoint.json

graph:
	$(PYTHON) -m services.mediator.graph_generator

clean:
	rm -rf __pycache__ services/*/__pycache__ harness/__pycache__ .pytest_cache
