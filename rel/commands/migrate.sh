#!/bin/sh

release_ctl eval --mfa "Core.DB.ReleaseTasks.seed/1" --argv -- "$@"
