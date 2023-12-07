#!/bin/bash
if [ $(git branch --show-current) != "main" ]; then
	echo "Error: Not on main branch"; 
    exit 1;
fi

npm run check
npm t
