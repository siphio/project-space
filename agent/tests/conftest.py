"""Shared pytest fixtures for agent tests."""

import pytest
import sys
from pathlib import Path

# Add agent directory to path for imports
agent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(agent_dir))
