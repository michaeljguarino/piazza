#!/bin/sh

release_ctl eval --mfa "Core.DB.ReleaseTasks.drop/1" --argv -- "$@"
