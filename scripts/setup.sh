#!/bin/bash

# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Optional: Install development requirements
if [ "$1" = "--dev" ]; then
    pip install -r requirements-dev.txt
fi 