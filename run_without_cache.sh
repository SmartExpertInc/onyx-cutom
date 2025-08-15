#!/bin/bash

# Запуск Python без создания кэшированных файлов
export PYTHONDONTWRITEBYTECODE=1
python -B "$@" 