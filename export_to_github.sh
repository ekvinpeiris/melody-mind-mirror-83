
#!/bin/bash

# Ensure the script is executable
chmod +x export_to_github.sh

# Remove any existing git repository to start fresh
rm -rf .git

# Initialize git repository
git init

# Add all files, including hidden files
git add .

# Create an initial commit
git commit -m "Initial commit of Melody Mind Mirror project"

# Add the remote repository (REPLACE THIS WITH YOUR GITHUB REPOSITORY URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push the code to GitHub, forcing it to use the main branch
git push -u origin main --force
